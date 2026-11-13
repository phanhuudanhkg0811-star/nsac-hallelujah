import { useEffect, useRef, type ReactNode } from 'react';
import { HAIL_SVG } from '../cabin/hailAssets.ts';

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
  dockSide?: 'left' | 'right' | 'center';
  onClose: () => void;
  children: ReactNode;
}

export function MissionDialog({
  title,
  eyebrow,
  art,
  panelType = 'generic',
  dockSide = 'right',
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
      className={`mission-dialog hail-dialog hail-dialog--dock-${dockSide} mission-dialog--${panelType}`}
      aria-labelledby="mission-dialog-title"
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="mission-dialog-frame hail-dialog-frame">
        <header className="mission-dialog-header hail-dialog-header">
          {art && (
            <div className="mission-dialog-art-wrap hail-dialog-art-wrap">
              <img
                src={art}
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
            className="mission-close-btn hail-close-btn"
            aria-label="Đóng cửa sổ"
            onClick={onClose}
          >
            <img
              src={HAIL_SVG.navClose}
              alt="✕"
              className="w-5 h-5 object-contain pointer-events-none"
            />
          </button>
        </header>

        <div className="mission-dialog-body custom-parsecs-scroll">
          {children}
        </div>
      </div>
    </dialog>
  );
}
