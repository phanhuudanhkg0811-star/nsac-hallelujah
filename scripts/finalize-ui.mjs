import fs from 'node:fs';
const base = 'src/components';
let assets = fs.readFileSync(`${base}/cabin/assets.ts`, 'utf8');
assets = assets.replace("export const ASSET_BASE = '/assets/parsecs';", `import optimizedSprites from '../../data/optimized-sprites.json';
export const ASSET_BASE = '/assets/parsecs';
const optimized = new Set(optimizedSprites);
export function assetUrl(filename: string): string {
  return ASSET_BASE + '/' + (optimized.has(filename) ? 'optimized/' : '') + filename;
}
const SITTING_KEYS: Record<string, string> = { char_aa: 'April', char_bb: 'Baby', char_dd: 'DeeDee', char_ee: 'Emmet', char_mm: 'Maegan', char_tt: 'Tom', cmd: 'April', eng: 'Baby', doc: 'DeeDee', geo: 'Emmet' };
export function getSittingCrewSprite(id: string, alive = true): string {
  return assetUrl('Srv' + (SITTING_KEYS[id] ?? 'April') + (alive ? '' : 'Dead') + 'Sitting.webp');
}`);
fs.writeFileSync(`${base}/cabin/assets.ts`, assets);
const files = [`${base}/ParsecsGameViewport.tsx`, ...['cabin','modals'].flatMap(dir => fs.readdirSync(`${base}/${dir}`).filter(f => /\.tsx?$/.test(f)).map(f => `${base}/${dir}/${f}`))];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replace(/`\$\{ASSET_BASE\}\/([^`]+)`/g, (_, name) => `assetUrl(\`${name}\`)`)
    .replace(/ASSET_BASE \+ '\/' \+ icon/g, 'assetUrl(icon)')
    .replace(/ASSET_BASE \+ '\/([^']+)'/g, (_, name) => `assetUrl('${name}')`);
  if (text !== before && !file.endsWith('assets.ts')) {
    text = text.replace(/import \{ ([^}]+) \} from ('[^']*assets.ts');/, (_, names, path) => `import { ${names}, assetUrl } from ${path};`);
  }
  if (file.endsWith('CrewCabinSeats.tsx')) text = text.replace('getCrewFigureSprite', 'getSittingCrewSprite').replace('getSittingCrewSprite(referenceMode ? member : { ...member, isAlive: true })', 'getSittingCrewSprite(id, referenceMode ? member.isAlive : true)');
  if (file.endsWith('ViewportPorthole.tsx')) text = text.replace('Vue extérieure de la planète', 'Ngoại cảnh ngoài cửa sổ trạm');
  if (file.endsWith('EndOfDayModal.tsx')) text = text.replace('gameState, parsecsState, parsecsToggleRation', 'gameState, parsecsState, dailyDecision, parsecsToggleRation').replace('type="checkbox" checked={member.plannedSoup}', 'type="checkbox" aria-label={`Cấp súp cho ${member.firstName}`} checked={member.plannedSoup}').replace('type="checkbox" checked={member.plannedMedkit}', 'type="checkbox" aria-label={`Cấp thuốc cho ${member.firstName}`} checked={member.plannedMedkit}').replaceAll('useGameStore.getState().dailyDecision', 'dailyDecision');
  fs.writeFileSync(file, text);
}
let html = fs.readFileSync('index.html', 'utf8').replace('lang="en"', 'lang="vi"');
fs.writeFileSync('index.html', html);
