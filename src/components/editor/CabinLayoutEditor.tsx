import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CabinLayoutBox, ViewMode, BoxCategory } from './types.ts';
import { AEROMATTE_SPRITES_CATALOGUE } from './types.ts';
import { INITIAL_CABIN_LAYOUT } from './defaultLayout.ts';
import './editor.css';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Download,
  Upload,
  Grid,
  Maximize2,
  Move,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';

const STORAGE_KEY = 'project_hail_cabin_layout_v1';

export function CabinLayoutEditor() {
  // --- States ---
  const [boxes, setBoxes] = useState<CabinLayoutBox[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved layout', e);
    }
    return INITIAL_CABIN_LAYOUT;
  });

  const [selectedId, setSelectedId] = useState<string | null>('box_fabricator');
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [showGrid, setShowGrid] = useState(true);
  const [snapStep, setSnapStep] = useState<number>(0.5); // 0.5% snap
  const [sidebarTab, setSidebarTab] = useState<'inspector' | 'layers' | 'presets'>('inspector');
  
  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  // Undo / Redo history
  const historyRef = useRef<CabinLayoutBox[][]>([]);
  const historyIndexRef = useRef<number>(-1);

  const pushHistory = useCallback((newBoxes: CabinLayoutBox[]) => {
    const history = historyRef.current.slice(0, historyIndexRef.current + 1);
    history.push(JSON.parse(JSON.stringify(newBoxes)));
    if (history.length > 30) history.shift();
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
  }, []);

  const saveBoxes = useCallback((updater: (prev: CabinLayoutBox[]) => CabinLayoutBox[]) => {
    setBoxes(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Storage error', e);
      }
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Initial history push
  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [JSON.parse(JSON.stringify(boxes))];
      historyIndexRef.current = 0;
    }
  }, []);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prev = historyRef.current[historyIndexRef.current];
      setBoxes(JSON.parse(JSON.stringify(prev)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const next = historyRef.current[historyIndexRef.current];
      setBoxes(JSON.parse(JSON.stringify(next)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  // --- Drag & Resize Handling ---
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    active: boolean;
    type: 'drag' | 'resize';
    handle?: string;
    boxId: string;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  const applySnap = (val: number) => {
    if (snapStep <= 0) return Number(val.toFixed(2));
    return Number((Math.round(val / snapStep) * snapStep).toFixed(2));
  };

  const selectedBox = boxes.find(b => b.id === selectedId) || null;

  const handlePointerDownBox = (e: React.PointerEvent, box: CabinLayoutBox) => {
    if (box.locked || viewMode === 'preview') {
      setSelectedId(box.id);
      return;
    }
    e.stopPropagation();
    setSelectedId(box.id);

    dragRef.current = {
      active: true,
      type: 'drag',
      boxId: box.id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: box.left,
      initialTop: box.top,
      initialWidth: box.width,
      initialHeight: box.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownHandle = (e: React.PointerEvent, box: CabinLayoutBox, handle: string) => {
    e.stopPropagation();
    if (box.locked || viewMode === 'preview') return;

    dragRef.current = {
      active: true,
      type: 'resize',
      handle,
      boxId: box.id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: box.left,
      initialTop: box.top,
      initialWidth: box.width,
      initialHeight: box.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !dragRef.current.active || !canvasRef.current) return;
    const { type, handle, boxId, startX, startY, initialLeft, initialTop, initialWidth, initialHeight } = dragRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = ((e.clientX - startX) / rect.width) * 100;
    const deltaY = ((e.clientY - startY) / rect.height) * 100;

    if (type === 'drag') {
      const nextLeft = applySnap(Math.max(0, Math.min(100 - initialWidth, initialLeft + deltaX)));
      const nextTop = applySnap(Math.max(0, Math.min(100 - initialHeight, initialTop + deltaY)));

      setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, left: nextLeft, top: nextTop } : b));
    } else if (type === 'resize' && handle) {
      let nextLeft = initialLeft;
      let nextTop = initialTop;
      let nextWidth = initialWidth;
      let nextHeight = initialHeight;

      if (handle.includes('e')) {
        nextWidth = Math.max(1, Math.min(100 - initialLeft, initialWidth + deltaX));
      }
      if (handle.includes('s')) {
        nextHeight = Math.max(1, Math.min(100 - initialTop, initialHeight + deltaY));
      }
      if (handle.includes('w')) {
        const potentialWidth = initialWidth - deltaX;
        if (potentialWidth >= 1 && initialLeft + deltaX >= 0) {
          nextLeft = initialLeft + deltaX;
          nextWidth = potentialWidth;
        }
      }
      if (handle.includes('n')) {
        const potentialHeight = initialHeight - deltaY;
        if (potentialHeight >= 1 && initialTop + deltaY >= 0) {
          nextTop = initialTop + deltaY;
          nextHeight = potentialHeight;
        }
      }

      setBoxes(prev =>
        prev.map(b =>
          b.id === boxId
            ? {
                ...b,
                left: applySnap(nextLeft),
                top: applySnap(nextTop),
                width: applySnap(nextWidth),
                height: applySnap(nextHeight),
              }
            : b
        )
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current && dragRef.current.active) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      dragRef.current = null;
      // Persist state to storage and history
      setBoxes(current => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch (_) {}
        pushHistory(current);
        return current;
      });
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is editing an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (!selectedId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteBox(selectedId);
        return;
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }

      const step = e.shiftKey ? 2.0 : 0.5;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSelected(b => ({ ...b, left: applySnap(Math.max(0, b.left - step)) }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSelected(b => ({ ...b, left: applySnap(Math.min(100 - b.width, b.left + step)) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelected(b => ({ ...b, top: applySnap(Math.max(0, b.top - step)) }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSelected(b => ({ ...b, top: applySnap(Math.min(100 - b.height, b.top + step)) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, snapStep]);

  // Box Operations
  const updateSelected = (updater: (b: CabinLayoutBox) => CabinLayoutBox) => {
    if (!selectedId) return;
    saveBoxes(prev => prev.map(b => (b.id === selectedId ? updater(b) : b)));
  };

  const deleteBox = (id: string) => {
    const target = boxes.find(b => b.id === id);
    if (!target) return;
    if (target.locked) {
      alert(`Khối "${target.name}" đang bị khóa. Hãy mở khóa trước khi xóa!`);
      return;
    }
    saveBoxes(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBox = (id: string) => {
    const target = boxes.find(b => b.id === id);
    if (!target) return;
    const newBox: CabinLayoutBox = {
      ...target,
      id: `box_custom_${Date.now()}`,
      name: `${target.name} (Bản sao)`,
      left: applySnap(Math.min(90, target.left + 3)),
      top: applySnap(Math.min(90, target.top + 3)),
      zIndex: target.zIndex + 1,
      locked: false,
    };
    saveBoxes(prev => [...prev, newBox]);
    setSelectedId(newBox.id);
  };

  const addPresetBox = (preset: typeof AEROMATTE_SPRITES_CATALOGUE[0]) => {
    const newBox: CabinLayoutBox = {
      id: `box_${preset.category}_${Date.now()}`,
      name: preset.name,
      category: preset.category,
      left: 50 - preset.defaultWidth / 2,
      top: 50 - preset.defaultHeight / 2,
      width: preset.defaultWidth,
      height: preset.defaultHeight,
      zIndex: preset.defaultZIndex,
      spriteUrl: preset.path,
      color: preset.color,
      locked: false,
      visible: true,
    };
    saveBoxes(prev => [...prev, newBox]);
    setSelectedId(newBox.id);
    setSidebarTab('inspector');
  };

  const addCustomEmptyBox = () => {
    const newBox: CabinLayoutBox = {
      id: `box_custom_${Date.now()}`,
      name: 'Khối Tùy Chọn Mới',
      category: 'custom',
      left: 40,
      top: 40,
      width: 20,
      height: 20,
      zIndex: 25,
      color: '#38BDF8',
      locked: false,
      visible: true,
    };
    saveBoxes(prev => [...prev, newBox]);
    setSelectedId(newBox.id);
    setSidebarTab('inspector');
  };

  const resetToDefaultLayout = () => {
    if (confirm('Khôi phục toàn bộ bố cục về vị trí chuẩn ban đầu của AeroMatte? Dữ liệu tùy chỉnh hiện tại sẽ bị ghi đè.')) {
      saveBoxes(() => INITIAL_CABIN_LAYOUT);
      setSelectedId('box_fabricator');
    }
  };

  // Layer management
  const adjustZIndex = (delta: number) => {
    if (!selectedBox) return;
    const nextZ = Math.max(0, selectedBox.zIndex + delta);
    updateSelected(b => ({ ...b, zIndex: nextZ }));
  };

  const bringToFront = () => {
    if (!selectedBox) return;
    const maxZ = Math.max(...boxes.map(b => b.zIndex), 0);
    updateSelected(b => ({ ...b, zIndex: maxZ + 1 }));
  };

  const sendToBack = () => {
    if (!selectedBox) return;
    const minZ = Math.min(...boxes.map(b => b.zIndex), 0);
    updateSelected(b => ({ ...b, zIndex: Math.max(0, minZ - 1) }));
  };

  // Export handlers
  const generateExportJson = () => {
    return JSON.stringify(boxes, null, 2);
  };

  const generateExportReactCss = () => {
    return `// Tọa độ trạm buồng tàu (Xuất từ Project Hail Marry Editor)
export const CABIN_LAYOUT_STYLES = {
${boxes
  .map(
    b => `  '${b.id}': {
    position: 'absolute',
    left: '${b.left.toFixed(2)}%',
    top: '${b.top.toFixed(2)}%',
    width: '${b.width.toFixed(2)}%',
    height: '${b.height.toFixed(2)}%',
    zIndex: ${b.zIndex},
  },`
  )
  .join('\n')}
};`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
        saveBoxes(() => parsed);
        setShowImportModal(false);
        setImportText('');
        alert('Nhập dữ liệu bố cục thành công!');
      } else {
        alert('Dữ liệu JSON không đúng cấu trúc CabinLayoutBox[]!');
      }
    } catch (e) {
      alert('Lỗi cú pháp JSON: ' + (e as Error).message);
    }
  };

  // Sorted boxes for rendering (by z-index)
  const sortedBoxes = [...boxes].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="editor-root" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Top Navigation & Toolbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-50">
        {/* Left: Branding & View Modes */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
              HM
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Project Hail Marry <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Layout Stage Designer</span>
              </h1>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700" />

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('wireframe')}
              className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                viewMode === 'wireframe' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chỉ hiển thị các khối màu và tiêu đề"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Khối Wireframe</span>
            </button>
            <button
              onClick={() => setViewMode('hybrid')}
              className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                viewMode === 'hybrid' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hiển thị khối và lồng ghép sprite AeroMatte bên trong"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Lồng Ảnh (Hybrid)</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
                viewMode === 'preview' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ẩn toàn bộ viền wireframe, render hoàn chỉnh buồng tàu"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Render Buồng Tàu</span>
            </button>
          </div>
        </div>

        {/* Center: Grid & Snap Tools */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1.5 rounded border flex items-center gap-1.5 transition ${
              showGrid ? 'bg-slate-800 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Bật / Tắt lưới tọa độ"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới 5%</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
            <span>Snap:</span>
            <select
              value={snapStep}
              onChange={e => setSnapStep(Number(e.target.value))}
              className="bg-transparent text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900 text-slate-200">Tắt</option>
              <option value="0.25" className="bg-slate-900 text-slate-200">0.25%</option>
              <option value="0.5" className="bg-slate-900 text-slate-200">0.5%</option>
              <option value="1" className="bg-slate-900 text-slate-200">1.0%</option>
              <option value="2.5" className="bg-slate-900 text-slate-200">2.5%</option>
              <option value="5" className="bg-slate-900 text-slate-200">5.0%</option>
            </select>
          </div>

          <div className="h-5 w-px bg-slate-700" />

          {/* Quick Selected Actions */}
          {selectedBox && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => updateSelected(b => ({ ...b, locked: !b.locked }))}
                className={`p-1.5 rounded border transition ${
                  selectedBox.locked ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={selectedBox.locked ? 'Mở khóa khối' : 'Khóa vị trí khối'}
              >
                {selectedBox.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => duplicateBox(selectedBox.id)}
                className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                title="Nhân bản khối (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteBox(selectedBox.id)}
                disabled={selectedBox.locked}
                className="p-1.5 rounded bg-red-950/40 border border-red-800/80 text-red-400 hover:bg-red-900 hover:text-red-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Xóa khối đang chọn (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions & Export/Import */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setSidebarTab('presets')}
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Thành Phần</span>
          </button>

          <button
            onClick={resetToDefaultLayout}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Đặt lại bố cục ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-cyan-500 text-slate-200 transition flex items-center gap-1.5"
            title="Xuất cấu hình JSON / CSS"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xuất Tọa Độ</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Nhập cấu hình JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Workspace Canvas */}
        <main
          className="editor-workspace"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          <div
            ref={canvasRef}
            className="editor-canvas-wrapper"
            onClick={e => {
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
          >
            {/* Grid Overlay */}
            {showGrid && viewMode !== 'preview' && (
              <>
                <div className="editor-grid-pattern" />
                <div className="editor-grid-crosshair" />
              </>
            )}

            {/* Boxes Stage */}
            {sortedBoxes.map(box => {
              if (box.visible === false) return null;
              const isSelected = box.id === selectedId;

              return (
                <div
                  key={box.id}
                  id={box.id}
                  className={`cabin-box ${box.locked ? 'is-locked' : ''} ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    left: `${box.left}%`,
                    top: `${box.top}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    zIndex: isSelected ? 999 : box.zIndex,
                  }}
                  onPointerDown={e => handlePointerDownBox(e, box)}
                >
                  {/* Sprite Layer (In Hybrid and Preview modes) */}
                  {(viewMode === 'hybrid' || viewMode === 'preview') && box.spriteUrl && (
                    <img
                      src={box.spriteUrl}
                      alt={box.name}
                      className="box-sprite-layer"
                      draggable={false}
                    />
                  )}

                  {/* Wireframe Box UI */}
                  {viewMode !== 'preview' && (
                    <div
                      className="box-wireframe"
                      style={{
                        borderColor: box.color || '#38BDF8',
                        backgroundColor:
                          viewMode === 'wireframe'
                            ? `${box.color}20` // 12% opacity tint
                            : 'transparent',
                      }}
                    >
                      {/* Top Header Label Badge */}
                      <div className="flex items-center justify-between gap-1 overflow-hidden pointer-events-none">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded truncate max-w-full shadow-sm text-slate-950 uppercase tracking-wider"
                          style={{ backgroundColor: box.color || '#38BDF8' }}
                        >
                          {box.name}
                        </span>
                        {box.locked && (
                          <span className="bg-black/60 p-0.5 rounded text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Bottom Info Coordinates Badge */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 bg-black/70 px-1 py-0.5 rounded self-start mt-auto pointer-events-none border border-white/10">
                        <span>
                          {box.left.toFixed(1)}%, {box.top.toFixed(1)}%
                        </span>
                        <span className="mx-1 text-slate-500">|</span>
                        <span>
                          {box.width.toFixed(1)}% × {box.height.toFixed(1)}%
                        </span>
                        <span className="ml-1 text-cyan-400 font-bold">z:{box.zIndex}</span>
                      </div>
                    </div>
                  )}

                  {/* Resize Handles (Only for selected & unlocked in edit modes) */}
                  {isSelected && !box.locked && viewMode !== 'preview' && (
                    <>
                      <div className="resize-handle handle-nw" onPointerDown={e => handlePointerDownHandle(e, box, 'nw')} />
                      <div className="resize-handle handle-n"  onPointerDown={e => handlePointerDownHandle(e, box, 'n')} />
                      <div className="resize-handle handle-ne" onPointerDown={e => handlePointerDownHandle(e, box, 'ne')} />
                      <div className="resize-handle handle-e"  onPointerDown={e => handlePointerDownHandle(e, box, 'e')} />
                      <div className="resize-handle handle-se" onPointerDown={e => handlePointerDownHandle(e, box, 'se')} />
                      <div className="resize-handle handle-s"  onPointerDown={e => handlePointerDownHandle(e, box, 's')} />
                      <div className="resize-handle handle-sw" onPointerDown={e => handlePointerDownHandle(e, box, 'sw')} />
                      <div className="resize-handle handle-w"  onPointerDown={e => handlePointerDownHandle(e, box, 'w')} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Sidebar: Inspector / Layers / Presets */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-40">
          {/* Tab Navigation */}
          <div className="h-10 border-b border-slate-800 flex text-xs font-medium">
            <button
              onClick={() => setSidebarTab('inspector')}
              className={`flex-1 flex items-center justify-center gap-1.5 border-b-2 transition ${
                sidebarTab === 'inspector'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/40 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Thuộc Tính</span>
            </button>
            <button
              onClick={() => setSidebarTab('layers')}
              className={`flex-1 flex items-center justify-center gap-1.5 border-b-2 transition ${
                sidebarTab === 'layers'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/40 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers ({boxes.length})</span>
            </button>
            <button
              onClick={() => setSidebarTab('presets')}
              className={`flex-1 flex items-center justify-center gap-1.5 border-b-2 transition ${
                sidebarTab === 'presets'
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/40 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thư Viện</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 text-xs">
            {/* TAB 1: INSPECTOR */}
            {sidebarTab === 'inspector' && (
              <>
                {selectedBox ? (
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">Đang chọn</div>
                        <input
                          type="text"
                          value={selectedBox.name}
                          onChange={e => updateSelected(b => ({ ...b, name: e.target.value }))}
                          className="mt-1 font-semibold text-slate-100 bg-slate-950 border border-slate-800 rounded px-2 py-1 w-full text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div
                        className="w-5 h-5 rounded border border-white/20 shrink-0 self-end mb-1"
                        style={{ backgroundColor: selectedBox.color }}
                      />
                    </div>

                    {/* Category & Accent Color */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Phân loại</label>
                        <select
                          value={selectedBox.category}
                          onChange={e => updateSelected(b => ({ ...b, category: e.target.value as BoxCategory }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="background">Background</option>
                          <option value="structure">Structure</option>
                          <option value="equipment">Equipment</option>
                          <option value="seats">Seats</option>
                          <option value="props">Props</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Màu nhận diện</label>
                        <input
                          type="color"
                          value={selectedBox.color || '#38BDF8'}
                          onChange={e => updateSelected(b => ({ ...b, color: e.target.value }))}
                          className="w-full h-7 bg-slate-950 border border-slate-800 rounded cursor-pointer p-0.5"
                        />
                      </div>
                    </div>

                    {/* Associated Sprite Selector */}
                    <div>
                      <label className="text-slate-400 block mb-1">Hình ảnh liên kết (AeroMatte)</label>
                      <select
                        value={selectedBox.spriteUrl || ''}
                        onChange={e => updateSelected(b => ({ ...b, spriteUrl: e.target.value || undefined }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="">-- Không dùng ảnh (Chỉ Box Wireframe) --</option>
                        {AEROMATTE_SPRITES_CATALOGUE.map(sprite => (
                          <option key={sprite.path} value={sprite.path}>
                            {sprite.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Position & Size Grid */}
                    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-3">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>TỌA ĐỘ & KÍCH THƯỚC (%)</span>
                        <span className="text-[10px] text-cyan-400">Tỷ lệ 4:3 (1600×1200)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block text-[11px] mb-0.5">Left (%)</label>
                          <input
                            type="number"
                            step={snapStep || 0.1}
                            value={selectedBox.left}
                            onChange={e => updateSelected(b => ({ ...b, left: applySnap(Number(e.target.value)) }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block text-[11px] mb-0.5">Top (%)</label>
                          <input
                            type="number"
                            step={snapStep || 0.1}
                            value={selectedBox.top}
                            onChange={e => updateSelected(b => ({ ...b, top: applySnap(Number(e.target.value)) }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block text-[11px] mb-0.5">Width (%)</label>
                          <input
                            type="number"
                            step={snapStep || 0.1}
                            value={selectedBox.width}
                            onChange={e => updateSelected(b => ({ ...b, width: applySnap(Number(e.target.value)) }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block text-[11px] mb-0.5">Height (%)</label>
                          <input
                            type="number"
                            step={snapStep || 0.1}
                            value={selectedBox.height}
                            onChange={e => updateSelected(b => ({ ...b, height: applySnap(Number(e.target.value)) }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Pixel Equivalent info */}
                      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
                        <span>Pixel quy đổi:</span>
                        <span className="font-mono text-slate-300">
                          {Math.round(selectedBox.left * 16)}px, {Math.round(selectedBox.top * 12)}px | {Math.round(selectedBox.width * 16)} × {Math.round(selectedBox.height * 12)}px
                        </span>
                      </div>
                    </div>

                    {/* Layer & Z-Index Controls */}
                    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">THỨ TỰ LAYER (Z-INDEX)</span>
                        <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {selectedBox.zIndex}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={() => adjustZIndex(-1)}
                          className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition"
                          title="Hạ 1 lớp"
                        >
                          <ArrowDown className="w-3 h-3" /> -1
                        </button>
                        <button
                          onClick={() => adjustZIndex(1)}
                          className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition"
                          title="Tăng 1 lớp"
                        >
                          <ArrowUp className="w-3 h-3" /> +1
                        </button>
                        <button
                          onClick={sendToBack}
                          className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition"
                          title="Xuống đáy cùng"
                        >
                          <ChevronsDown className="w-3 h-3" /> Đáy
                        </button>
                        <button
                          onClick={bringToFront}
                          className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition"
                          title="Lên trên đỉnh"
                        >
                          <ChevronsUp className="w-3 h-3" /> Đỉnh
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-slate-400 block mb-1">Ghi chú thiết kế</label>
                      <textarea
                        value={selectedBox.notes || ''}
                        onChange={e => updateSelected(b => ({ ...b, notes: e.target.value }))}
                        rows={2}
                        placeholder="Mô tả công năng của khối..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Move className="w-8 h-8 mx-auto opacity-30" />
                    <p>Chưa chọn khối nào trên sân khấu.</p>
                    <p className="text-[11px] text-slate-600">Click vào một khối trên canvas để chỉnh sửa thông số.</p>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: LAYERS LIST */}
            {sidebarTab === 'layers' && (
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 pb-1 flex justify-between">
                  <span>DANH SÁCH KHỐI ({boxes.length})</span>
                  <span>(Sắp theo z-index)</span>
                </div>

                {[...boxes]
                  .sort((a, b) => b.zIndex - a.zIndex) // Top layers first
                  .map(box => {
                    const isSelected = box.id === selectedId;
                    return (
                      <div
                        key={box.id}
                        onClick={() => setSelectedId(box.id)}
                        className={`p-2 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 text-slate-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: box.color }}
                          />
                          <div className="truncate">
                            <div className="font-medium truncate text-xs">{box.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">
                              z:{box.zIndex} | {box.width.toFixed(0)}%×{box.height.toFixed(0)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              saveBoxes(prev => prev.map(b => (b.id === box.id ? { ...b, locked: !b.locked } : b)));
                            }}
                            className={`p-1 rounded ${box.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                            title={box.locked ? 'Khóa' : 'Mở khóa'}
                          >
                            {box.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              saveBoxes(prev => prev.map(b => (b.id === box.id ? { ...b, visible: b.visible === false ? true : false } : b)));
                            }}
                            className={`p-1 rounded ${box.visible === false ? 'text-slate-600' : 'text-slate-400 hover:text-slate-200'}`}
                            title={box.visible === false ? 'Hiện' : 'Ẩn'}
                          >
                            {box.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 3: PRESETS & ADD NEW */}
            {sidebarTab === 'presets' && (
              <div className="space-y-4">
                <button
                  onClick={addCustomEmptyBox}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Khối Trống Tùy Ý</span>
                </button>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Thành Phần Sẵn Có (AeroMatte)
                  </div>

                  <div className="space-y-1.5">
                    {AEROMATTE_SPRITES_CATALOGUE.map(sprite => (
                      <button
                        key={sprite.path}
                        onClick={() => addPresetBox(sprite)}
                        className="w-full p-2 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition group"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={sprite.path}
                            alt=""
                            className="w-7 h-7 object-contain rounded bg-slate-900 border border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-slate-200 group-hover:text-cyan-300 transition text-xs">
                              {sprite.name}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">{sprite.category}</div>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer of Sidebar */}
          <footer className="h-10 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-500 shrink-0 bg-slate-950">
            <span>Dùng phím mũi tên để dịch chuyển</span>
            <span>Shift + mũi tên: x4</span>
          </footer>
        </aside>
      </div>

      {/* MODAL 1: EXPORT JSON & REACT CSS */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Xuất Tọa Độ Buồng Tàu</span>
              </h2>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300 font-semibold">1. Mã JSON Layout (Dùng để Lưu Trữ / Import)</label>
                  <button
                    onClick={() => copyToClipboard(generateExportJson(), 'Đã sao chép JSON!')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép JSON</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-44 custom-scrollbar">
                  {generateExportJson()}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300 font-semibold">2. Mã React CSS Styles (Dùng cho Game Component)</label>
                  <button
                    onClick={() => copyToClipboard(generateExportReactCss(), 'Đã sao chép CSS!')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép CSS</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-44 custom-scrollbar">
                  {generateExportReactCss()}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
              <span className="text-xs text-emerald-400 font-medium">
                {copyFeedback && <Check className="w-3.5 h-3.5 inline mr-1" />}
                {copyFeedback}
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT JSON */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Nhập Dữ Liệu Bố Cục (Import JSON)</span>
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 space-y-3">
              <p className="text-xs text-slate-400">
                Dán chuỗi JSON cấu hình mảng <code>CabinLayoutBox[]</code> đã xuất từ trước để khôi phục lại bố cục:
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Dán mã JSON vào đây..."
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none custom-scrollbar"
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/50">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleImportJson}
                disabled={!importText.trim()}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs disabled:opacity-40"
              >
                Nhập & Tải Lên Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
