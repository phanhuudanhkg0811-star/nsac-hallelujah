"""Convert the extracted cabin PNGs to WebP without replacing any source asset.

Requires Pillow with libwebp support (already available on the development machine).
Usage: python scripts/optimize-cabin-sprites.py [--quality 82] [--method 6]
       python scripts/optimize-cabin-sprites.py --lossless

The default output is a separate `public/assets/parsecs/optimized` directory.
PNG originals and existing WebPs are never modified. Only generated destinations
and this script's JSON manifest are replaced when rerunning the command.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageStat, features


ROOT = Path(__file__).resolve().parents[1]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def encode(source: Path, destination: Path, quality: int, method: int, lossless: bool) -> dict:
    temporary = destination.with_suffix(".webp.tmp")
    with Image.open(source) as input_image:
        image = input_image.convert("RGBA")
        dimensions = image.size
        # WebP stores alpha losslessly. exact=True retains invisible RGB when
        # supported; correctness is checked against decoded alpha, not metadata.
        image.save(temporary, format="WEBP", quality=quality, method=method,
                   lossless=lossless, exact=True)
        with Image.open(temporary) as encoded:
            decoded = encoded.convert("RGBA")
            if encoded.format != "WEBP" or decoded.size != dimensions:
                raise RuntimeError(f"Format/dimension verification failed: {destination}")
            alpha_exact = image.getchannel("A").tobytes() == decoded.getchannel("A").tobytes()
            if not alpha_exact:
                raise RuntimeError(f"Alpha changed: {destination}")
            # Composite onto neutral grey so invisible RGB does not distort the
            # quality metric; alpha preservation is independently verified above.
            backdrop = Image.new("RGBA", dimensions, (128, 128, 128, 255))
            expected = Image.alpha_composite(backdrop, image).convert("RGB")
            actual = Image.alpha_composite(backdrop, decoded).convert("RGB")
            diff = ImageChops.difference(expected, actual)
            average_error = sum(ImageStat.Stat(diff).mean) / 3
            if lossless and expected.tobytes() != actual.tobytes():
                raise RuntimeError(f"Lossless pixel verification failed: {destination}")
        temporary.replace(destination)
        source_bytes, output_bytes = source.stat().st_size, destination.stat().st_size
        return {
            "name": source.stem,
            "source": source.relative_to(ROOT).as_posix(),
            "output": destination.relative_to(ROOT).as_posix(),
            "url": "/" + destination.relative_to(ROOT / "public").as_posix(),
            "width": dimensions[0], "height": dimensions[1],
            "sourceBytes": source_bytes, "webpBytes": output_bytes,
            "savedPercent": round((1 - output_bytes / source_bytes) * 100, 2),
            "alphaExact": alpha_exact,
            "alphaExtrema": image.getchannel("A").getextrema(),
            "compositedMeanAbsoluteError": round(average_error, 4),
            "sourceSha256": digest(source), "webpSha256": digest(destination),
        }


def create_preview(source_dir: Path, output_dir: Path, quality: int) -> Path:
    """Write a side-by-side QA contact sheet outside deployable public assets."""
    names = ["SpaceshipConsole", "SpaceshipEvent", "SrvAprilSitting"]
    sheet = Image.new("RGB", (1024, 1060), "#18202a")
    draw = ImageDraw.Draw(sheet)
    draw.text((18, 14), f"PNG originals (left) / WebP q{quality} (right). Same dimensions; exact alpha.", fill="#eee8d6")
    for row, name in enumerate(names):
        top = 50 + row * 334
        draw.text((18, top), name, fill="#eee8d6")
        for col, path in enumerate([source_dir / f"{name}.png", output_dir / f"{name}.webp"]):
            image = Image.open(path).convert("RGBA")
            image.thumbnail((470, 298), Image.Resampling.LANCZOS)
            tile = Image.new("RGBA", (480, 300), "#c0c2b6")
            checker = ImageDraw.Draw(tile)
            for y in range(0, 300, 16):
                for x in range(0, 480, 16):
                    if (x // 16 + y // 16) % 2:
                        checker.rectangle((x, y, x + 15, y + 15), fill="#d3d3c9")
            tile.alpha_composite(image, ((480 - image.width) // 2, (300 - image.height) // 2))
            sheet.paste(tile.convert("RGB"), (18 + col * 508, top + 20))
    destination = ROOT / ".hail-research/sprite-optimization-preview.jpg"
    sheet.save(destination, quality=94, subsampling=0)
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quality", type=int, default=82, choices=range(0, 101), metavar="0..100")
    parser.add_argument("--method", type=int, default=6, choices=range(7), metavar="0..6")
    parser.add_argument("--lossless", action="store_true")
    parser.add_argument("--workers", type=int, default=4, choices=range(1, 17), metavar="1..16")
    parser.add_argument("--input", type=Path, default=ROOT / "public/assets/parsecs")
    parser.add_argument("--output", type=Path, default=ROOT / "public/assets/parsecs/optimized")
    args = parser.parse_args()
    if not features.check("webp"):
        raise RuntimeError("This Pillow installation does not support WebP; install Pillow with libwebp.")
    source_dir, output_dir = args.input.resolve(), args.output.resolve()
    public_root = (ROOT / "public").resolve()
    if not source_dir.is_relative_to(public_root) or not output_dir.is_relative_to(public_root):
        raise ValueError("Input and output directories must be inside this project's public directory.")
    if source_dir == output_dir:
        raise ValueError("Use a separate output directory to preserve existing WebP assets.")
    sources = sorted(source_dir.glob("*.png"))
    if not sources:
        raise RuntimeError(f"No PNGs found in {source_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    assets = []
    with ThreadPoolExecutor(max_workers=args.workers) as workers:
        results = workers.map(lambda source: encode(source, output_dir / f"{source.stem}.webp",
                                                   args.quality, args.method, args.lossless), sources)
        for index, item in enumerate(results, 1):
            assets.append(item)
            if index % 20 == 0 or index == len(sources):
                print(f"Verified {index}/{len(sources)} sprites", flush=True)
    source_total = sum(item["sourceBytes"] for item in assets)
    output_total = sum(item["webpBytes"] for item in assets)
    manifest = {
        "generator": "scripts/optimize-cabin-sprites.py",
        "encoder": {"name": "Pillow/libwebp", "webpVersion": features.version("webp"),
                    "quality": args.quality, "method": args.method, "lossless": args.lossless,
                    "resize": False, "alphaVerifiedPixelExact": True},
        "count": len(assets), "sourceBytes": source_total, "webpBytes": output_total,
        "savedPercent": round((1 - output_total / source_total) * 100, 2),
        "under2_5MB": output_total <= 2_500_000,
        "budgetNote": "This total counts only converted image files, not JS/CSS, other images or source PNGs.",
        "assets": assets,
    }
    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # The application needs only this filename list, not hashes or QA metrics.
    # Keep detailed metadata outside the JS bundle.
    runtime_manifest = ROOT / "src/data/optimized-sprites.json"
    runtime_manifest.write_text(json.dumps([f"{item['name']}.webp" for item in assets],
                                          ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: manifest[key] for key in ("count", "sourceBytes", "webpBytes", "savedPercent", "under2_5MB")}, indent=2))
    print(f"Manifest: {manifest_path}")
    print(f"QA preview: {create_preview(source_dir, output_dir, args.quality)}")


if __name__ == "__main__":
    main()
