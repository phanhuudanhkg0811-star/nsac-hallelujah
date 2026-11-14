import { hailUrl } from '../components/cabin/hailAssets.ts';

const SFX = {
  click: 'PH_SFX_UI_CLICK_V01',
  open: 'PH_SFX_UI_OPEN_V01',
  repair: 'PH_SFX_REPAIR_V01',
  upgrade: 'PH_SFX_UPGRADE_V01',
  radio: 'PH_SFX_RADIO_TRANSMIT_V01',
  alert: 'PH_SFX_ALERT_V01',
  endSol: 'PH_SFX_END_SOL_V01',
  launch: 'PH_SFX_LAUNCH_V01',
} as const;

export type SfxName = keyof typeof SFX;

const audioUrl = (file: string) => hailUrl(`audio/${file}.ogg`);
const loaded = new Map<SfxName, HTMLAudioElement>();

export function playSfx(name: SfxName, volume = 0.6): void {
  if (typeof Audio === 'undefined') return; // SSR / node tests
  let base = loaded.get(name);
  if (!base) {
    base = new Audio(audioUrl(SFX[name]));
    loaded.set(name, base);
  }
  // clone so rapid repeats overlap instead of restarting
  const voice = base.cloneNode() as HTMLAudioElement;
  voice.volume = volume;
  void voice.play().catch(() => {});
}

let ambient: HTMLAudioElement | null = null;

/** Starts the cockpit hum loop; browsers only allow it after a user gesture. */
export function startAmbient(volume = 0.25): void {
  if (ambient || typeof Audio === 'undefined') return;
  ambient = new Audio(audioUrl('PH_AMB_COCKPIT_LOOP_V01'));
  ambient.loop = true;
  ambient.volume = volume;
  void ambient.play().catch(() => {
    ambient = null; // blocked by autoplay policy, retry on the next gesture
  });
}
