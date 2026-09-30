import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Minus,
  MoveRight,
  Square,
  Circle,
  Triangle,
  Move,
  Type,
  RotateCcw,
  RotateCw,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  Hash,
  Copy,
  Check
} from 'lucide-react';
import type { ToolType, GridType, DrawElement, Point } from '../../types';


interface WhiteboardProps {
  isDark: boolean;
}

const PRESET_COLORS = [
  '#ffffff', // White (dark mode friendly)
  '#0f172a', // Slate black
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber/Yellow
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

const STROKE_WIDTHS = [2, 4, 8, 14];

export const Whiteboard: React.FC<WhiteboardProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools & State
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>(isDark ? '#ffffff' : '#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [gridType, setGridType] = useState<GridType>('cells');
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<Point>({ x: 0, y: 0 });

  // Drawing tracking
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  
  // Text Input
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string; show: boolean }>({
    x: 0,
    y: 0,
    text: '',
    show: false,
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Sync default color with theme on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('math_whiteboard_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        }
      } catch (e) {
        console.error('Error loading whiteboard data:', e);
      }
    }
  }, []);

  // Auto-save to LocalStorage
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('math_whiteboard_data', JSON.stringify(elements));
    }
  }, [elements]);

  // Adjust canvas size to window/container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    redraw();
  }, [zoom, pan, elements, isDark, gridType, currentPoints]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Convert screen coordinates to world coordinates
  const toWorld = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Draw Grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (gridType === 'none') return;

    ctx.save();
    const cellSize = 30 * zoom;
    const offsetX = pan.x % cellSize;
    const offsetY = pan.y % cellSize;

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
    const majorGridColor = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    if (gridType === 'dots') {
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      for (let x = offsetX; x < width; x += cellSize) {
        for (let y = offsetY; y < height; y += cellSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridType === 'cells' || gridType === 'graph') {
      ctx.beginPath();
      let indexX = Math.floor(-pan.x / cellSize);
      for (let x = offsetX; x < width; x += cellSize, indexX++) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      let indexY = Math.floor(-pan.y / cellSize);
      for (let y = offsetY; y < height; y += cellSize, indexY++) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid lines for graph paper (every 5 cells)
      if (gridType === 'graph') {
        const majorSize = cellSize * 5;
        const majorOffsetX = pan.x % majorSize;
        const majorOffsetY = pan.y % majorSize;
        ctx.strokeStyle = majorGridColor;
        ctx.beginPath();
        for (let x = majorOffsetX; x < width; x += majorSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = majorOffsetY; y < height; y += majorSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // Draw an individual element
  const renderElement = (ctx: CanvasRenderingContext2D, el: DrawElement) => {
    if (el.points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.type === 'marker') {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = el.width * 2.5;
    } else {
      ctx.globalAlpha = 1.0;
    }

    const p0 = el.points[0];

    if (el.type === 'pen' || el.type === 'marker') {
      if (el.points.length === 1) {
        ctx.fillStyle = el.color;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, el.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < el.points.length; i++) {
          const xc = (el.points[i - 1].x + el.points[i].x) / 2;
          const yc = (el.points[i - 1].y + el.points[i].y) / 2;
          ctx.quadraticCurveTo(el.points[i - 1].x, el.points[i - 1].y, xc, yc);
        }
        const lastP = el.points[el.points.length - 1];
        ctx.lineTo(lastP.x, lastP.y);
        ctx.stroke();
      }
    } else if (el.type === 'line' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    } else if (el.type === 'arrow' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(pEnd.y - p0.y, pEnd.x - p0.x);
      const headlen = Math.max(12, el.width * 3);
      ctx.beginPath();
      ctx.moveTo(pEnd.x, pEnd.y);
      ctx.lineTo(pEnd.x - headlen * Math.cos(angle - Math.PI / 6), pEnd.y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(pEnd.x, pEnd.y);
      ctx.lineTo(pEnd.x - headlen * Math.cos(angle + Math.PI / 6), pEnd.y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (el.type === 'rect' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      const x = Math.min(p0.x, pEnd.x);
      const y = Math.min(p0.y, pEnd.y);
      const w = Math.abs(pEnd.x - p0.x);
      const h = Math.abs(pEnd.y - p0.y);
      ctx.strokeRect(x, y, w, h);
    } else if (el.type === 'circle' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      const radius = Math.hypot(pEnd.x - p0.x, pEnd.y - p0.y);
      ctx.beginPath();
      ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'triangle' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      const topX = (p0.x + pEnd.x) / 2;
      const topY = p0.y;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.lineTo(p0.x, pEnd.y);
      ctx.closePath();
      ctx.stroke();
    } else if (el.type === 'axes' && el.points.length >= 2) {
      const pEnd = el.points[el.points.length - 1];
      const originX = (p0.x + pEnd.x) / 2;
      const originY = (p0.y + pEnd.y) / 2;

      // X Axis
      ctx.beginPath();
      ctx.moveTo(p0.x, originY);
      ctx.lineTo(pEnd.x, originY);
      // Arrow X
      ctx.lineTo(pEnd.x - 8, originY - 5);
      ctx.moveTo(pEnd.x, originY);
      ctx.lineTo(pEnd.x - 8, originY + 5);

      // Y Axis
      ctx.moveTo(originX, pEnd.y);
      ctx.lineTo(originX, p0.y);
      // Arrow Y
      ctx.lineTo(originX - 5, p0.y + 8);
      ctx.moveTo(originX, p0.y);
      ctx.lineTo(originX + 5, p0.y + 8);
      ctx.stroke();

      // Tick marks and Labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = el.color;
      ctx.fillText('X', pEnd.x + 6, originY + 4);
      ctx.fillText('Y', originX - 4, p0.y - 8);
      ctx.fillText('0', originX - 12, originY + 14);
    } else if (el.type === 'text' && el.text) {
      ctx.font = `${Math.max(16, el.width * 5)}px 'Inter', sans-serif`;
      ctx.fillStyle = el.color;
      ctx.fillText(el.text, p0.x, p0.y);
    }

    ctx.restore();
  };

  // Full Redraw of Canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    drawGrid(ctx, width, height);

    // Apply World Transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render Elements
    for (const el of elements) {
      renderElement(ctx, el);
    }

    // Render active drawing shape
    if (isDrawing && currentPoints.length > 0) {
      renderElement(ctx, {
        id: 'current',
        type: tool,
        points: currentPoints,
        color: tool === 'eraser' ? (isDark ? '#0f172a' : '#ffffff') : color,
        width: tool === 'eraser' ? strokeWidth * 4 : strokeWidth,
      });
    }

    ctx.restore();
    ctx.restore();
  }, [isDark, gridType, pan, zoom, elements, isDrawing, currentPoints, tool, color, strokeWidth]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Pointer Events Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Pan with middle click or 'pan' tool or spacebar held
    if (e.button === 1 || tool === 'pan') {
      setIsPanning(true);
      setStartPan({ x: screenX - pan.x, y: screenY - pan.y });
      return;
    }

    const worldPoint = toWorld(screenX, screenY);

    if (tool === 'text') {
      setTextInput({
        x: screenX,
        y: screenY,
        text: '',
        show: true,
      });
      return;
    }

    setIsDrawing(true);
    setCurrentPoints([worldPoint]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isPanning) {
      setPan({
        x: screenX - startPan.x,
        y: screenY - startPan.y,
      });
      return;
    }

    if (!isDrawing) return;

    const worldPoint = toWorld(screenX, screenY);

    if (tool === 'eraser') {
      // Erase strokes intersecting world point
      const threshold = 18 / zoom;
      const filtered = elements.filter((el) => {
        return !el.points.some((p) => Math.hypot(p.x - worldPoint.x, p.y - worldPoint.y) < threshold);
      });
      if (filtered.length !== elements.length) {
        setElements(filtered);
      }
      return;
    }

    if (tool === 'pen' || tool === 'marker') {
      setCurrentPoints((prev) => [...prev, worldPoint]);
    } else {
      // Shapes keep start point and update current end point
      setCurrentPoints((prev) => [prev[0], worldPoint]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 0 && tool !== 'eraser') {
      const newEl: DrawElement = {
        id: Date.now().toString(),
        type: tool,
        points: currentPoints,
        color,
        width: strokeWidth,
      };

      const updated = [...elements, newEl];
      setElements(updated);

      // Add to Undo History
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updated);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setCurrentPoints([]);
  };

  // Zooming with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(0.2, zoom * zoomFactor), 5);

    // Zoom centered around mouse cursor
    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setElements([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.text.trim()) {
      setTextInput({ ...textInput, show: false });
      return;
    }

    const worldPoint = toWorld(textInput.x, textInput.y);
    const newEl: DrawElement = {
      id: Date.now().toString(),
      type: 'text',
      points: [worldPoint],
      color,
      width: strokeWidth,
      text: textInput.text,
    };

    const updated = [...elements, newEl];
    setElements(updated);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setTextInput({ x: 0, y: 0, text: '', show: false });
  };

  // Export to PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `MathHelpper-Доска-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm('Очистить всю доску?')) {
      setElements([]);
      const newHistory = [...history, []];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      localStorage.removeItem('math_whiteboard_data');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900 select-none">
      {/* Top Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-[95vw]">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTool('pen')}
            title="Перо (P)"
            className={`p-2 rounded-xl transition ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Pen className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('marker')}
            title="Маркер / Выделитель"
            className={`p-2 rounded-xl transition ${
              tool === 'marker'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Highlighter className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            title="Ластик (E)"
            className={`p-2 rounded-xl transition ${
              tool === 'eraser'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* Geometric Shapes */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTool('line')}
            title="Отрезок / Прямая"
            className={`p-2 rounded-xl transition ${
              tool === 'line'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            title="Вектор / Стрелка"
            className={`p-2 rounded-xl transition ${
              tool === 'arrow'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <MoveRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('rect')}
            title="Прямоугольник"
            className={`p-2 rounded-xl transition ${
              tool === 'rect'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Square className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('circle')}
            title="Окружность"
            className={`p-2 rounded-xl transition ${
              tool === 'circle'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Circle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('triangle')}
            title="Треугольник"
            className={`p-2 rounded-xl transition ${
              tool === 'triangle'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Triangle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('axes')}
            title="Координатные оси X/Y"
            className={`p-2 rounded-xl transition text-xs font-semibold ${
              tool === 'axes'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            X/Y
          </button>

          <button
            onClick={() => setTool('text')}
            title="Текст и формулы"
            className={`p-2 rounded-xl transition ${
              tool === 'text'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Type className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('pan')}
            title="Перемещение полотна (Рука)"
            className={`p-2 rounded-xl transition ${
              tool === 'pan'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Move className="w-5 h-5" />
          </button>
        </div>

        {/* Colors Palette */}
        <div className="flex items-center gap-1.5 px-1 pr-1.5 border-r border-slate-200 dark:border-slate-700">
          {PRESET_COLORS.slice(0, 6).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${
                color === c ? 'border-indigo-500 scale-110 shadow-sm' : 'border-slate-300 dark:border-slate-600'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded-full cursor-pointer border-none bg-transparent"
            title="Выбрать цвет"
          />
        </div>

        {/* Thickness */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200 dark:border-slate-700">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                strokeWidth === w ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={`Толщина ${w}px`}
            >
              <div
                className="rounded-full bg-slate-800 dark:bg-slate-200"
                style={{ width: `${Math.min(18, w * 1.5 + 2)}px`, height: `${Math.min(18, w * 1.5 + 2)}px` }}
              />
            </button>
          ))}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0 && elements.length === 0}
            title="Отменить (Ctrl+Z)"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Повторить (Ctrl+Y)"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Bar (Grid, Zoom, Export, Clear) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        {/* Grid Style Toggle */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setGridType('cells')}
            title="Сетка: Клетка 5мм"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition ${
              gridType === 'cells'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Клетка
          </button>
          <button
            onClick={() => setGridType('graph')}
            title="Сетка: Миллиметровка"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition ${
              gridType === 'graph'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Граф
          </button>
          <button
            onClick={() => setGridType('none')}
            title="Чистый лист"
            className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
              gridType === 'none'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Лист
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              const newZ = Math.max(0.2, zoom * 0.85);
              setZoom(newZ);
            }}
            title="Уменьшить масштаб"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Сбросить масштаб (100%)"
            className="text-xs font-mono font-medium px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => {
              const newZ = Math.min(5, zoom * 1.15);
              setZoom(newZ);
            }}
            title="Увеличить масштаб"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyImage}
            title="Копировать в буфер"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportPNG}
            title="Сохранить как PNG"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" /> Экспорт PNG
          </button>

          <button
            onClick={handleClear}
            title="Очистить доску"
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Text Input Overlay */}
      {textInput.show && (
        <form
          onSubmit={handleTextSubmit}
          className="absolute z-30"
          style={{ left: textInput.x, top: textInput.y }}
        >
          <input
            autoFocus
            type="text"
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onBlur={handleTextSubmit}
            placeholder="Введите текст или формулу..."
            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-indigo-500 rounded-lg shadow-lg outline-none text-base font-medium min-w-[200px]"
          />
        </form>
      )}

      {/* Main Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full h-full block touch-none ${
          tool === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
      />
    </div>
  );
};
