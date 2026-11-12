import { useEffect, useRef, type ReactNode } from 'react';
import { assetUrl } from '../cabin/assets.ts';

export type MissionDialogType =
  | 'starlog'
  | 'character'
  | 'crafting'
  | 'expedition'
  | 'end'
  | 'comms'
  | 'launch'
  | 'menu'
  | 'generic';

interface MissionDialogProps {
  title: string;
  eyebrow: string;
  art?: string;
  panelType?: MissionDialogType;
  onClose: () => void;
  children: ReactNode;
}

export function MissionDialog({
  title,
  eyebrow,
  art,
  panelType = 'generic',
  onClose,
  children,
}: MissionDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`mission-dialog mission-dialog--${panelType}`}
      aria-labelledby="mission-dialog-title"
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
    >
      {/* Authentic Dialog Frame Wrapper */}
      <div className="mission-dialog-frame">
        {/* Top Metallic Clamp for Clipboard / Vents for CRT Monitor */}
        {panelType === 'end' && (
          <div className="clipboard-metal-clamp" aria-hidden="true">
            <div className="clamp-bracket" />
            <div className="clamp-spring" />
          </div>
        )}

        {/* Diegetic Header */}
        <header className="mission-dialog-header">
          {art && (
            <div className="mission-dialog-art-wrap">
              <img
                src={assetUrl(`${art}`)}
                alt=""
                className="mission-dialog-art"
                draggable={false}
              />
            </div>
          )}
          <div className="mission-dialog-titles">
            <p className="mission-dialog-eyebrow">{eyebrow}</p>
            <h2 id="mission-dialog-title" className="mission-dialog-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="mission-close-btn"
            aria-label="Đóng cửa sổ"
            onClick={onClose}
          >
            <img
              src={assetUrl('IconNo.webp')}
              alt="✕"
              className="w-5 h-5 object-contain pointer-events-none drop-shadow"
            />
          </button>
        </header>

        {/* Authentic Scrollable Content Body */}
        <div className="mission-dialog-body custom-parsecs-scroll">
          {children}
        </div>
      </div>
    </dialog>
  );
}
