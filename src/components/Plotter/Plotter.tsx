import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as math from 'mathjs';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sliders,
  Play,
  Pause,
  Sparkles,
  Table,
  ZoomIn,
  ZoomOut,
  Search,
  Check
} from 'lucide-react';

import type { PlotFunction, PlotParameter, KeyPoint } from '../../types';
import { PLOTTER_TEMPLATES, type PlotterTemplate } from '../../data/plotterTemplates';

interface PlotterProps {
  isDark: boolean;
  initialFunctions?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Plotter: React.FC<PlotterProps> = ({ isDark, initialFunctions }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Functions list
  const [functions, setFunctions] = useState<PlotFunction[]>(() => {
    if (initialFunctions && initialFunctions.length > 0) {
      return initialFunctions.map((expr, idx) => ({
        id: `fn-${Date.now()}-${idx}`,
        expression: expr,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        visible: true,
        isValid: true,
      }));
    }
    return [
      {
        id: 'fn-1',
        expression: 'x^2 - 4*x + 3',
        color: '#3b82f6',
        visible: true,
        isValid: true,
      },
    ];
  });

  // Parameters / Sliders (e.g., a, b, c, k)
  const [parameters, setParameters] = useState<PlotParameter[]>([
    { name: 'a', value: 1, min: -5, max: 5, step: 0.1, isPlaying: false },
    { name: 'b', value: 0, min: -5, max: 5, step: 0.1, isPlaying: false },
    { name: 'c', value: 0, min: -5, max: 5, step: 0.1, isPlaying: false },
    { name: 'k', value: 1, min: -5, max: 5, step: 0.1, isPlaying: false },
  ]);

  // Coordinate system state (view window)
  const [view, setView] = useState({
    centerX: 0,
    centerY: 0,
    scale: 45, // pixels per math unit
  });

  // Hovered coordinates
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Key Points list & Tab view
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const [activeTab, setActiveTab] = useState<'functions' | 'sliders' | 'templates' | 'table'>('functions');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');

  // Sync when initialFunctions change
  useEffect(() => {
    if (initialFunctions && initialFunctions.length > 0) {
      setFunctions(
        initialFunctions.map((expr, idx) => ({
          id: `fn-${Date.now()}-${idx}`,
          expression: expr,
          color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          visible: true,
          isValid: true,
        }))
      );
    }
  }, [initialFunctions]);

  // Extract detected parameters from expressions
  const detectParameters = useCallback(() => {
    const foundParams = new Set<string>();
    const knownFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'ln', 'exp'];

    functions.forEach((fn) => {
      if (!fn.visible || !fn.expression) return;
      try {
        const parsed = math.parse(fn.expression);
        parsed.traverse((node: any) => {
          if (node.isSymbolNode && node.name !== 'x' && node.name !== 'e' && node.name !== 'pi' && !knownFunctions.includes(node.name)) {
            foundParams.add(node.name);
          }
        });
      } catch (e) {
        // expression syntax error, skip
      }
    });

    if (foundParams.size > 0) {
      setParameters((prev) => {
        const existingNames = new Set(prev.map((p) => p.name));
        const updated = [...prev];
        foundParams.forEach((name) => {
          if (!existingNames.has(name)) {
            updated.push({
              name,
              value: 1,
              min: -5,
              max: 5,
              step: 0.1,
              isPlaying: false,
            });
          }
        });
        return updated;
      });
    }
  }, [functions]);

  useEffect(() => {
    detectParameters();
  }, [detectParameters]);

  // Animation for playing parameters
  useEffect(() => {
    const playingParams = parameters.filter((p) => p.isPlaying);
    if (playingParams.length === 0) return;

    const interval = setInterval(() => {
      setParameters((prev) =>
        prev.map((p) => {
          if (!p.isPlaying) return p;
          let nextVal = p.value + p.step;
          if (nextVal > p.max) nextVal = p.min;
          return { ...p, value: parseFloat(nextVal.toFixed(2)) };
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, [parameters]);

  // Compile functions
  const compiledFunctions = useMemo(() => {
    const scope: Record<string, number> = {};
    parameters.forEach((p) => {
      scope[p.name] = p.value;
    });

    return functions.map((fn) => {
      if (!fn.visible || !fn.expression.trim()) {
        return { ...fn, compiled: null, isValid: false };
      }
      try {
        const cleanExpr = fn.expression;
        const compiled = math.compile(cleanExpr);
        compiled.evaluate({ ...scope, x: 1 });
        return { ...fn, compiled, isValid: true, error: undefined };
      } catch (err: any) {
        return { ...fn, compiled: null, isValid: false, error: err.message || 'Ошибка синтаксиса' };
      }
    });
  }, [functions, parameters]);

  // Calculate Key Points (zeros, y-intercept, vertex, intersections)
  const keyPoints = useMemo<KeyPoint[]>(() => {
    if (!showKeyPoints) return [];
    const points: KeyPoint[] = [];
    const scope: Record<string, number> = {};
    parameters.forEach((p) => {
      scope[p.name] = p.value;
    });

    const activeFns = compiledFunctions.filter((f) => f.isValid && f.compiled);

    // 1. Zeros and Y-intercepts for each function
    activeFns.forEach((fn) => {
      const evalFn = (x: number) => {
        try {
          const res = fn.compiled!.evaluate({ ...scope, x });
          return typeof res === 'number' && isFinite(res) ? res : NaN;
        } catch {
          return NaN;
        }
      };

      // Y-intercept f(0)
      const y0 = evalFn(0);
      if (!isNaN(y0) && Math.abs(y0) < 1000) {
        points.push({
          x: 0,
          y: parseFloat(y0.toFixed(2)),
          label: `(0; ${parseFloat(y0.toFixed(2))})`,
          type: 'y-intercept',
          color: fn.color,
        });
      }

      // Numerical search for roots in [-20, 20]
      const step = 0.2;
      for (let x = -20; x <= 20; x += step) {
        const yA = evalFn(x);
        const yB = evalFn(x + step);

        if (!isNaN(yA) && !isNaN(yB) && (yA * yB <= 0 || Math.abs(yA) < 1e-4)) {
          let left = x;
          let right = x + step;
          for (let iter = 0; iter < 10; iter++) {
            const mid = (left + right) / 2;
            const yMid = evalFn(mid);
            if (Math.abs(yMid) < 1e-6) {
              left = mid;
              break;
            }
            if (evalFn(left) * yMid <= 0) {
              right = mid;
            } else {
              left = mid;
            }
          }
          const rootX = parseFloat(((left + right) / 2).toFixed(2));
          if (!points.some((p) => p.type === 'root' && Math.abs(p.x - rootX) < 0.1)) {
            points.push({
              x: rootX,
              y: 0,
              label: `x = ${rootX}`,
              type: 'root',
              color: fn.color,
            });
          }
        }
      }
    });

    // 2. Intersections between pairs of functions
    if (activeFns.length >= 2) {
      for (let i = 0; i < activeFns.length; i++) {
        for (let j = i + 1; j < activeFns.length; j++) {
          const fn1 = activeFns[i];
          const fn2 = activeFns[j];

          const diff = (x: number) => {
            try {
              const y1 = fn1.compiled!.evaluate({ ...scope, x });
              const y2 = fn2.compiled!.evaluate({ ...scope, x });
              return y1 - y2;
            } catch {
              return NaN;
            }
          };

          const step = 0.25;
          for (let x = -20; x <= 20; x += step) {
            const d1 = diff(x);
            const d2 = diff(x + step);
            if (!isNaN(d1) && !isNaN(d2) && d1 * d2 <= 0) {
              let l = x;
              let r = x + step;
              for (let iter = 0; iter < 10; iter++) {
                const m = (l + r) / 2;
                const dm = diff(m);
                if (Math.abs(dm) < 1e-6) {
                  l = m;
                  break;
                }
                if (diff(l) * dm <= 0) r = m;
                else l = m;
              }
              const intX = parseFloat(((l + r) / 2).toFixed(2));
              try {
                const intY = parseFloat(fn1.compiled!.evaluate({ ...scope, x: intX }).toFixed(2));
                if (!points.some((p) => p.type === 'intersection' && Math.abs(p.x - intX) < 0.1)) {
                  points.push({
                    x: intX,
                    y: intY,
                    label: `(${intX}; ${intY})`,
                    type: 'intersection',
                    color: '#f59e0b',
                  });
                }
              } catch {}
            }
          }
        }
      }
    }

    return points;
  }, [compiledFunctions, parameters, showKeyPoints]);

  // Coordinate Conversion Helpers
  const toScreen = useCallback(
    (mathX: number, mathY: number, width: number, height: number) => {
      const screenX = width / 2 + (mathX - view.centerX) * view.scale;
      const screenY = height / 2 - (mathY - view.centerY) * view.scale;
      return { screenX, screenY };
    },
    [view]
  );

  const toMath = useCallback(
    (screenX: number, screenY: number, width: number, height: number) => {
      const mathX = (screenX - width / 2) / view.scale + view.centerX;
      const mathY = (height / 2 - screenY) / view.scale + view.centerY;
      return { mathX, mathY };
    },
    [view]
  );

  // Redraw Canvas
  const drawPlot = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = rect.width;
    const height = rect.height;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid Settings
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    let unitStep = 1;
    if (view.scale > 80) unitStep = 0.5;
    if (view.scale > 160) unitStep = 0.2;
    if (view.scale < 30) unitStep = 2;
    if (view.scale < 15) unitStep = 5;
    if (view.scale < 6) unitStep = 10;

    const { mathX: minX, mathY: maxY } = toMath(0, 0, width, height);
    const { mathX: maxX, mathY: minY } = toMath(width, height, width, height);

    // Draw Grid Lines & Numbers
    ctx.font = '11px monospace';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical grid lines
    const startX = Math.floor(minX / unitStep) * unitStep;
    for (let x = startX; x <= maxX; x += unitStep) {
      const { screenX } = toScreen(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-4) {
        const { screenY: originY } = toScreen(0, 0, width, height);
        const yPos = Math.min(Math.max(originY + 14, 16), height - 8);
        ctx.fillText(parseFloat(x.toFixed(2)).toString(), screenX - 6, yPos);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(minY / unitStep) * unitStep;
    for (let y = startY; y <= maxY; y += unitStep) {
      const { screenY } = toScreen(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();

      if (Math.abs(y) > 1e-4) {
        const { screenX: originX } = toScreen(0, 0, width, height);
        const xPos = Math.min(Math.max(originX + 6, 8), width - 36);
        ctx.fillText(parseFloat(y.toFixed(2)).toString(), xPos, screenY + 4);
      }
    }

    // Axes
    const origin = toScreen(0, 0, width, height);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, origin.screenY);
    ctx.lineTo(width, origin.screenY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(origin.screenX, 0);
    ctx.lineTo(origin.screenX, height);
    ctx.stroke();

    // Axis Labels
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = axisColor;
    ctx.fillText('X', width - 16, origin.screenY - 8);
    ctx.fillText('Y', origin.screenX + 8, 16);
    ctx.fillText('0', origin.screenX - 12, origin.screenY + 14);

    // Plot Functions
    const scope: Record<string, number> = {};
    parameters.forEach((p) => {
      scope[p.name] = p.value;
    });

    compiledFunctions.forEach((fn) => {
      if (!fn.isValid || !fn.compiled) return;

      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      let isDrawing = false;
      const pixelStep = 2;

      for (let px = 0; px <= width; px += pixelStep) {
        const { mathX } = toMath(px, 0, width, height);
        let mathY: number;

        try {
          const res = fn.compiled.evaluate({ ...scope, x: mathX });
          mathY = typeof res === 'number' && isFinite(res) ? res : NaN;
        } catch {
          mathY = NaN;
        }

        if (isNaN(mathY) || Math.abs(mathY) > 1e5) {
          isDrawing = false;
        } else {
          const { screenY: py } = toScreen(mathX, mathY, width, height);
          if (py < -100 || py > height + 100) {
            isDrawing = false;
          } else {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
      }
      ctx.stroke();
    });

    // Draw Key Points
    keyPoints.forEach((kp) => {
      const { screenX, screenY } = toScreen(kp.x, kp.y, width, height);
      if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
        ctx.fillStyle = kp.color || '#3b82f6';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '11px sans-serif';
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(kp.label, screenX + 7, screenY - 7);
      }
    });

    // Draw Hover Cursor and Point
    if (hoverCoord) {
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(hoverCoord.screenX, 0);
      ctx.lineTo(hoverCoord.screenX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hoverCoord.screenY);
      ctx.lineTo(width, hoverCoord.screenY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [isDark, view, toMath, toScreen, compiledFunctions, parameters, keyPoints, hoverCoord]);

  useEffect(() => {
    drawPlot();
  }, [drawPlot]);

  // Pointer & Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / view.scale;
      const dy = (e.clientY - dragStart.y) / view.scale;
      setView((prev) => ({
        ...prev,
        centerX: prev.centerX - dx,
        centerY: prev.centerY + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const { mathX, mathY } = toMath(screenX, screenY, rect.width, rect.height);
      setHoverCoord({
        x: parseFloat(mathX.toFixed(2)),
        y: parseFloat(mathY.toFixed(2)),
        screenX,
        screenY,
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(Math.max(5, view.scale * zoomFactor), 400);
    setView((prev) => ({ ...prev, scale: newScale }));
  };

  // Add new function
  const addFunction = (initialText: string = '') => {
    const nextColor = DEFAULT_COLORS[functions.length % DEFAULT_COLORS.length];
    setFunctions((prev) => [
      ...prev,
      {
        id: `fn-${Date.now()}`,
        expression: initialText,
        color: nextColor,
        visible: true,
        isValid: true,
      },
    ]);
  };

  // Apply rich template
  const applyTemplate = (tmpl: PlotterTemplate) => {
    const newFns: PlotFunction[] = tmpl.expressions.map((expr, idx) => ({
      id: `fn-${Date.now()}-${idx}`,
      expression: expr,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      visible: true,
      isValid: true,
    }));
    setFunctions(newFns);

    if (tmpl.defaultParams && tmpl.defaultParams.length > 0) {
      setParameters((prev) => {
        const updated = [...prev];
        tmpl.defaultParams!.forEach((dp) => {
          const idx = updated.findIndex((p) => p.name === dp.name);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], value: dp.value };
          } else {
            updated.push({
              name: dp.name,
              value: dp.value,
              min: -5,
              max: 5,
              step: 0.1,
              isPlaying: false,
            });
          }
        });
        return updated;
      });
    }

    setView({ centerX: 0, centerY: 0, scale: 45 });
    setActiveTab('functions');
  };

  // Quick insertion of math symbols
  const insertSymbol = (fnId: string, symbol: string) => {
    setFunctions((prev) =>
      prev.map((fn) => {
        if (fn.id === fnId) {
          return { ...fn, expression: fn.expression + symbol };
        }
        return fn;
      })
    );
  };

  // Filter templates
  const filteredTemplates = PLOTTER_TEMPLATES.filter((tmpl) => {
    const matchesCat = templateCategory === 'all' || tmpl.category === templateCategory;
    const q = templateSearch.toLowerCase();
    const matchesSearch =
      tmpl.title.toLowerCase().includes(q) ||
      tmpl.description.toLowerCase().includes(q) ||
      tmpl.expressions.some((e) => e.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Sidebar: Controls & Functions */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 shadow-sm max-h-[45vh] md:max-h-full">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 p-1 gap-1">
          <button
            onClick={() => setActiveTab('functions')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'functions'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Графики ({functions.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Шаблоны
          </button>
          <button
            onClick={() => setActiveTab('sliders')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
              activeTab === 'sliders'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Ползунки
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
              activeTab === 'table'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Таблица
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeTab === 'functions' && (
            <>
              {/* Function List */}
              {functions.map((fn, idx) => (
                <div
                  key={fn.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fn.color}
                      onChange={(e) =>
                        setFunctions((prev) =>
                          prev.map((f) => (f.id === fn.id ? { ...f, color: e.target.value } : f))
                        )
                      }
                      className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    />

                    <span className="font-mono text-xs font-bold text-slate-500">
                      f{idx + 1}(x) =
                    </span>

                    <input
                      type="text"
                      value={fn.expression}
                      onChange={(e) =>
                        setFunctions((prev) =>
                          prev.map((f) => (f.id === fn.id ? { ...f, expression: e.target.value } : f))
                        )
                      }
                      placeholder="например, x^2 - 4*x + 3"
                      className="flex-1 px-2.5 py-1 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                    />

                    <button
                      onClick={() =>
                        setFunctions((prev) =>
                          prev.map((f) => (f.id === fn.id ? { ...f, visible: !f.visible } : f))
                        )
                      }
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {fn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-40" />}
                    </button>

                    {functions.length > 1 && (
                      <button
                        onClick={() => setFunctions((prev) => prev.filter((f) => f.id !== fn.id))}
                        className="p-1 text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Math Symbols */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['x^2', 'sqrt(', 'abs(', 'sin(', 'cos(', 'pi', ' / '].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => insertSymbol(fn.id, sym)}
                        className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  {!fn.isValid && fn.error && (
                    <div className="text-xs text-rose-500 font-mono">⚠ {fn.error}</div>
                  )}
                </div>
              ))}

              {/* Add Function Button */}
              <button
                onClick={() => addFunction()}
                className="w-full py-2 px-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Добавить график
              </button>
            </>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              {/* Template search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Поиск формулы (парабола, модуль, синус...)"
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'algebra', label: 'Алгебра 7-9' },
                  { id: 'oge_ege', label: 'Модули / ОГЭ' },
                  { id: 'systems', label: 'Системы' },
                  { id: 'trig', label: 'Тригонометрия' },
                  { id: 'advanced', label: 'Степени/Лог' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-md whitespace-nowrap transition ${
                      templateCategory === cat.id
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Templates Cards List */}
              <div className="space-y-2">
                {filteredTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {tmpl.categoryLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {tmpl.expressions.map((e, idx) => (
                        <code
                          key={idx}
                          className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-white dark:bg-slate-900 border text-indigo-600 dark:text-indigo-300"
                        >
                          y = {e}
                        </code>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{tmpl.description}</p>

                    <button
                      onClick={() => applyTemplate(tmpl)}
                      className="w-full mt-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Применить шаблон
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sliders' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Ползунки автоматически связываются с переменными (например, <code>y = a*x^2 + b*x + c</code>).
              </div>
              {parameters.map((param) => (
                <div
                  key={param.name}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {param.name} = {param.value}
                    </span>
                    <button
                      onClick={() =>
                        setParameters((prev) =>
                          prev.map((p) =>
                            p.name === param.name ? { ...p, isPlaying: !p.isPlaying } : p
                          )
                        )
                      }
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition ${
                        param.isPlaying
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      {param.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setParameters((prev) =>
                        prev.map((p) => (p.name === param.name ? { ...p, value: val } : p))
                      );
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{param.min}</span>
                    <span>шаг {param.step}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'table' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">Таблица значений функций от x = -5 до 5:</div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg max-h-80">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2 border-b">x</th>
                      {compiledFunctions.map((fn, i) => (
                        <th key={fn.id} className="p-2 border-b" style={{ color: fn.color }}>
                          f{i + 1}(x)
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((xVal) => (
                      <tr key={xVal} className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="p-2 font-bold">{xVal}</td>
                        {compiledFunctions.map((fn) => {
                          let yVal = '—';
                          if (fn.isValid && fn.compiled) {
                            try {
                              const scope: Record<string, number> = { x: xVal };
                              parameters.forEach((p) => (scope[p.name] = p.value));
                              const res = fn.compiled.evaluate(scope);
                              yVal = typeof res === 'number' && isFinite(res) ? res.toFixed(2) : 'undef';
                            } catch {
                              yVal = 'err';
                            }
                          }
                          return (
                            <td key={fn.id} className="p-2 text-slate-600 dark:text-slate-300">
                              {yVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Key Points Summary Footer in Sidebar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ключевые точки ({keyPoints.length})
            </span>
            <button
              onClick={() => setShowKeyPoints(!showKeyPoints)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showKeyPoints ? 'Скрыть' : 'Показать'}
            </button>
          </div>
          {keyPoints.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {keyPoints.map((kp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-mono rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: kp.color }} />
                  {kp.type === 'root' ? 'Корень: ' : kp.type === 'intersection' ? 'Пересечение: ' : ''}
                  {kp.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">Точки не обнаружены в диапазоне</div>
          )}
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div ref={containerRef} className="flex-1 relative w-full h-full cursor-crosshair overflow-hidden">
        {/* Floating Zoom & Reset controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setView((prev) => ({ ...prev, scale: Math.max(5, prev.scale * 0.8) }))}
            title="Уменьшить масштаб"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView({ centerX: 0, centerY: 0, scale: 45 })}
            title="Сбросить к началу координат"
            className="px-2 py-1 text-xs font-mono font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            (0, 0)
          </button>
          <button
            onClick={() => setView((prev) => ({ ...prev, scale: Math.min(400, prev.scale * 1.25) }))}
            title="Увеличить масштаб"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Live Coordinate Badge */}
        {hoverCoord && (
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200">
            x: <span className="font-bold text-indigo-500">{hoverCoord.x}</span>, y:{' '}
            <span className="font-bold text-indigo-500">{hoverCoord.y}</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
