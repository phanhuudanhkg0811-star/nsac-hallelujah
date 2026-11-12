import fs from 'node:fs';
const file = 'src/utils/parsecsAssetResolver.ts';
let text = fs.readFileSync(file, 'utf8');
text = text.replace("export const ASSET_BASE = '/assets/parsecs';", "import { assetUrl } from './parsecsAssetUrl.ts';\nexport { ASSET_BASE } from './parsecsAssetUrl.ts';");
text = text.replace(/`\$\{ASSET_BASE\}\/([^`]+)`/g, (_, name) => `assetUrl(\`${name}\`)`);
fs.writeFileSync(file, text);
