import { useEffect, useRef, useState, useCallback } from 'react';
import JXG from 'jsxgraph';
import {
  MousePointer,
  Dot,
  Minus,
  Circle,
  Triangle,
  Trash2,
  Compass,
  Info,
} from 'lucide-react';
import type { GeometryTool } from '../../types';

interface GeometryBoardProps {
  isDark?: boolean;
}

export const GeometryBoard: React.FC<GeometryBoardProps> = () => {

  const containerId = 'jsxgraph-container';
  const boardRef = useRef<any>(null);
  const [activeTool, setActiveTool] = useState<GeometryTool>('select');
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Выберите инструмент или перемещайте точки');
  
  // Selection buffer for multi-click tools (e.g. 2 points for segment, 3 for angle)
  const pendingObjects = useRef<any[]>([]);

  // Initialize or re-initialize JSXGraph board
  const initBoard = useCallback(() => {
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
    }

    const board = JXG.JSXGraph.initBoard(containerId, {
      boundingbox: [-7, 7, 7, -7],
      axis: showAxes,
      grid: showGrid,
      showNavigation: true,
      showCopyright: false,
      zoom: {
        factorX: 1.25,
        factorY: 1.25,
        wheel: true,
        needShift: false,
      },
      pan: {
        needTwoFingers: false,
        needShift: false,
      },
    });

    boardRef.current = board;

    // Click handler on board
    board.on('down', (e: any) => {
      const currentTool = (window as any).__geoActiveTool;
      if (currentTool === 'select') return;

      const coords = board.getUsrCoordsOfMouse(e);
      handleBoardClick(coords, currentTool);
    });

    return board;
  }, [showAxes, showGrid]);

  useEffect(() => {
    (window as any).__geoActiveTool = activeTool;
  }, [activeTool]);

  useEffect(() => {
    const board = initBoard();
    loadPreset('circumscribed', board);

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, []);

  // Update status instructions when tool changes
  useEffect(() => {
    pendingObjects.current = [];
    switch (activeTool) {
      case 'select':
        setStatusMessage('Режим выбора: перетаскивайте точки и объекты');
        break;
      case 'point':
        setStatusMessage('Кликните на плоскость, чтобы создать точку');
        break;
      case 'segment':
        setStatusMessage('Отрезок: кликните первую точку, затем вторую');
        break;
      case 'line':
        setStatusMessage('Прямая: кликните две точки');
        break;
      case 'ray':
        setStatusMessage('Луч: кликните начало луча, затем точку направления');
        break;
      case 'circle':
        setStatusMessage('Окружность: кликните центр, затем точку на окружности');
        break;
      case 'polygon':
        setStatusMessage('Многоугольник: кликайте вершины по очереди, затем снова первую вершину');
        break;
      case 'midpoint':
        setStatusMessage('Середина: выберите две точки или отрезок');
        break;
      case 'perpendicular':
        setStatusMessage('Перпендикуляр: выберите прямую/отрезок и точку');
        break;
      case 'parallel':
        setStatusMessage('Параллельная прямая: выберите прямую и точку');
        break;
      case 'bisector':
        setStatusMessage('Биссектриса: выберите 3 точки угла (вершина в центре)');
        break;
      case 'measure_distance':
        setStatusMessage('Измерение расстояния: кликните две точки');
        break;
      case 'measure_angle':
        setStatusMessage('Измерение угла: кликните 3 точки угла (A, B, C)');
        break;
      default:
        setStatusMessage('Выберите инструмент для построения');
    }
  }, [activeTool]);

  // Handle board clicking based on active tool
  const handleBoardClick = (coords: number[], tool: GeometryTool) => {
    const board = boardRef.current;
    if (!board) return;

    const x = coords[0];
    const y = coords[1];

    if (tool === 'point') {
      board.create('point', [x, y], {
        size: 4,
        color: '#4f46e5',
        name: '',
      });
      return;
    }

    if (tool === 'segment' || tool === 'line' || tool === 'ray' || tool === 'circle' || tool === 'measure_distance') {
      const p = board.create('point', [x, y], { size: 3, color: '#4f46e5' });
      pendingObjects.current.push(p);

      if (pendingObjects.current.length === 2) {
        const [p1, p2] = pendingObjects.current;
        if (tool === 'segment') {
          board.create('segment', [p1, p2], { strokeColor: '#3b82f6', strokeWidth: 3 });
        } else if (tool === 'line') {
          board.create('line', [p1, p2], { strokeColor: '#06b6d4', strokeWidth: 2 });
        } else if (tool === 'ray') {
          board.create('line', [p1, p2], { straightFirst: false, strokeColor: '#10b981', strokeWidth: 2.5 });
        } else if (tool === 'circle') {
          board.create('circle', [p1, p2], { strokeColor: '#ec4899', strokeWidth: 2.5, fillColor: 'rgba(236,72,153,0.05)' });
        } else if (tool === 'measure_distance') {
          board.create('segment', [p1, p2], {
            withLabel: true,
            name: () => `d = ${p1.Dist(p2).toFixed(2)}`,
            strokeColor: '#f59e0b',
            strokeWidth: 2,
            dash: 2,
          });
        }
        pendingObjects.current = [];
        setActiveTool('select');
      }
      return;
    }

    if (tool === 'bisector' || tool === 'measure_angle') {
      const p = board.create('point', [x, y], { size: 3, color: '#4f46e5' });
      pendingObjects.current.push(p);

      if (pendingObjects.current.length === 3) {
        const [p1, p2, p3] = pendingObjects.current;
        if (tool === 'bisector') {
          board.create('bisector', [p1, p2, p3], { strokeColor: '#8b5cf6', strokeWidth: 2 });
        } else if (tool === 'measure_angle') {
          board.create('angle', [p1, p2, p3], {
            radius: 1,
            fillColor: 'rgba(245, 158, 11, 0.2)',
            strokeColor: '#f59e0b',
            withLabel: true,
          });
        }
        pendingObjects.current = [];
        setActiveTool('select');
      }
      return;
    }

    if (tool === 'polygon') {
      const p = board.create('point', [x, y], { size: 3, color: '#4f46e5' });
      pendingObjects.current.push(p);

      if (pendingObjects.current.length >= 3) {
        setStatusMessage(`Многоугольник: вершин ${pendingObjects.current.length}. Нажмите дважды для завершения или выберите 'Выбор'`);
      }
    }
  };

  // Preset Demonstrations
  const loadPreset = (presetName: string, targetBoard?: any) => {
    const board = targetBoard || boardRef.current;
    if (!board) return;

    // Clear board
    JXG.JSXGraph.freeBoard(board);
    const newBoard = JXG.JSXGraph.initBoard(containerId, {
      boundingbox: [-7, 7, 7, -7],
      axis: showAxes,
      grid: showGrid,
      showNavigation: true,
      showCopyright: false,
    });
    boardRef.current = newBoard;

    if (presetName === 'circumscribed') {
      // Triangle with incenter & circumcenter
      const A = newBoard.create('point', [-4, -3], { name: 'A', size: 4, color: '#4f46e5' });
      const B = newBoard.create('point', [4, -3], { name: 'B', size: 4, color: '#4f46e5' });
      const C = newBoard.create('point', [0, 4], { name: 'C', size: 4, color: '#4f46e5' });

      newBoard.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      // Circumcircle (Описанная окружность)
      newBoard.create('circumcircle', [A, B, C], {
        strokeColor: '#06b6d4',
        strokeWidth: 2,
        dash: 1,
        center: { name: 'O (Описан.)', color: '#06b6d4', size: 3 },
      });

      // Incircle (Вписанная окружность)
      newBoard.create('incircle', [A, B, C], {
        strokeColor: '#ec4899',
        strokeWidth: 2,
        center: { name: 'I (Вписан.)', color: '#ec4899', size: 3 },
      });
      setStatusMessage('Вписанная (розовая) и описанная (голубая) окружности треугольника ABC. Подвигайте вершины!');
    } else if (presetName === 'pythagoras') {
      // Right triangle with squares
      const A = newBoard.create('point', [0, 0], { name: 'C (90°)', size: 4, color: '#ef4444', fixed: false });
      const B = newBoard.create('point', [4, 0], { name: 'B', size: 4, color: '#3b82f6' });
      const C = newBoard.create('point', [0, 3], { name: 'A', size: 4, color: '#3b82f6' });

      // Right angle indicator
      newBoard.create('angle', [B, A, C], { radius: 0.6, type: 'square' });

      newBoard.create('polygon', [A, B, C], {
        fillColor: 'rgba(59, 130, 246, 0.1)',
        borders: { strokeWidth: 3, strokeColor: '#3b82f6' },
      });

      // Label with hypotenuse formula
      newBoard.create('text', [
        -2,
        5,
        () => {
          const a = A.Dist(B);
          const b = A.Dist(C);
          const c = B.Dist(C);
          return `a = ${a.toFixed(2)}, b = ${b.toFixed(2)}, c = ${c.toFixed(2)}<br>c² = ${(c * c).toFixed(1)} = a² + b² = ${(a * a + b * b).toFixed(1)}`;
        },
      ], { fontSize: 14 });


      setStatusMessage('Теорема Пифагора: a² + b² = c². Потяните за катеты A или B!');
    } else if (presetName === 'medians') {
      // Medians and Centroid
      const A = newBoard.create('point', [-5, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = newBoard.create('point', [5, -2], { name: 'B', size: 4, color: '#4f46e5' });
      const C = newBoard.create('point', [1, 5], { name: 'C', size: 4, color: '#4f46e5' });

      newBoard.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      const M_c = newBoard.create('midpoint', [A, B], { name: 'C1', size: 2, color: '#10b981' });
      const M_a = newBoard.create('midpoint', [B, C], { name: 'A1', size: 2, color: '#10b981' });
      const M_b = newBoard.create('midpoint', [A, C], { name: 'B1', size: 2, color: '#10b981' });

      newBoard.create('segment', [C, M_c], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });
      newBoard.create('segment', [A, M_a], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });
      newBoard.create('segment', [B, M_b], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });

      newBoard.create('intersection', [newBoard.create('line', [C, M_c], { visible: false }), newBoard.create('line', [A, M_a], { visible: false })], {
        name: 'M (Центроид, 2:1)',
        color: '#f59e0b',
        size: 4,
      });

      setStatusMessage('Медианы треугольника пересекаются в одной точке M и делятся ею в отношении 2:1, считая от вершины!');
    }
  };

  const handleClear = () => {
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-7, 7, 7, -7],
        axis: showAxes,
        grid: showGrid,
        showNavigation: true,
        showCopyright: false,
      });
      setStatusMessage('Доска очищена');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar: Presets & Tools */}
      <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 p-3 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" /> Геометрия
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            JSXGraph
          </span>
        </div>

        {/* Construction Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Готовые теоремы:
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => loadPreset('circumscribed')}
              className="w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              🔵 Вписанная и описанная окр.
            </button>
            <button
              onClick={() => loadPreset('pythagoras')}
              className="w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              📐 Теорема Пифагора
            </button>
            <button
              onClick={() => loadPreset('medians')}
              className="w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              🔺 Медианы и Центроид (2:1)
            </button>
          </div>
        </div>

        {/* View Options */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Вид:</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              Оси X/Y
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              Сетка
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-auto mt-auto flex gap-2">
          <button
            onClick={handleClear}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Очистить
          </button>
        </div>
      </div>

      {/* Main Geometry Canvas Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Top Tools Palette */}
        <div className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 flex-wrap z-10 shadow-sm">
          <button
            onClick={() => setActiveTool('select')}
            title="Выбор и перемещение"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'select'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MousePointer className="w-4 h-4" /> Выбор
          </button>

          <button
            onClick={() => setActiveTool('point')}
            title="Точка"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'point'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Dot className="w-4 h-4" /> Точка
          </button>

          <button
            onClick={() => setActiveTool('segment')}
            title="Отрезок"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'segment'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Minus className="w-4 h-4" /> Отрезок
          </button>

          <button
            onClick={() => setActiveTool('line')}
            title="Прямая"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'line'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ↔ Прямая
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            title="Окружность"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'circle'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Circle className="w-4 h-4" /> Окружность
          </button>

          <button
            onClick={() => setActiveTool('polygon')}
            title="Многоугольник"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'polygon'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Triangle className="w-4 h-4" /> Полигон
          </button>

          <button
            onClick={() => setActiveTool('bisector')}
            title="Биссектриса"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'bisector'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📐 Биссектриса
          </button>

          <button
            onClick={() => setActiveTool('measure_distance')}
            title="Измерить расстояние"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'measure_distance'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📏 Расстояние
          </button>

          <button
            onClick={() => setActiveTool('measure_angle')}
            title="Измерить угол"
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition ${
              activeTool === 'measure_angle'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ∠ Угол
          </button>
        </div>

        {/* Dynamic Instructional Banner */}
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>

        {/* JSXGraph Host Element */}
        <div
          id={containerId}
          className="jxgbox w-full flex-1 relative bg-white dark:bg-slate-900 touch-none"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};
