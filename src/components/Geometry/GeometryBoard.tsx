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
  Wand2,
  Search,
  Sparkles
} from 'lucide-react';

import type { GeometryTool } from '../../types';
import { GEOMETRY_PRESETS_CATALOG } from '../../data/geometryPresets';
import {
  setupPresetOnBoard,
  buildTriangleByParams,
  buildTrapezoidByParams,
} from './geometryGenerator';
import { GeometryTaskBuilderModal } from './GeometryTaskBuilderModal';

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
  
  // Modal for problem builder
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Load a preset by ID
  const loadPreset = (presetId: string, targetBoard?: any) => {
    const board = targetBoard || boardRef.current;
    if (!board) return;

    JXG.JSXGraph.freeBoard(board);
    const newBoard = JXG.JSXGraph.initBoard(containerId, {
      boundingbox: [-7, 7, 7, -7],
      axis: showAxes,
      grid: showGrid,
      showNavigation: true,
      showCopyright: false,
    });
    boardRef.current = newBoard;

    const msg = setupPresetOnBoard(presetId, newBoard);
    if (msg) setStatusMessage(msg);
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
      setStatusMessage('Доска очищена. Выберите инструмент или создайте фигуру по задаче.');
    }
  };

  // Custom task builders callbacks
  const handleBuildRightTriangle = (a: number, b: number) => {
    handleClear();
    const msg = buildTriangleByParams(boardRef.current, { type: 'right', a, b });
    if (msg) setStatusMessage(msg);
  };

  const handleBuildIsoscelesTriangle = (base: number, height: number) => {
    handleClear();
    const msg = buildTriangleByParams(boardRef.current, { type: 'isosceles', a: base, h: height });
    if (msg) setStatusMessage(msg);
  };

  const handleBuildTriangleBySides = (a: number, b: number, c: number) => {
    handleClear();
    const msg = buildTriangleByParams(boardRef.current, { type: 'sides', a, b, c });
    if (msg) setStatusMessage(msg);
  };

  const handleBuildTrapezoid = (a: number, b: number, h: number) => {
    handleClear();
    const msg = buildTrapezoidByParams(boardRef.current, a, b, h);
    if (msg) setStatusMessage(msg);
  };

  // Filter presets
  const filteredPresets = GEOMETRY_PRESETS_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = presetSearch.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar: Presets & Tools */}
      <div className="w-full md:w-72 lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 p-3 space-y-3 shadow-sm max-h-[45vh] md:max-h-full">
        {/* Header & Quick Builder Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" /> Геометрия
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {GEOMETRY_PRESETS_CATALOG.length} теорем
            </span>
          </div>

          {/* Quick Problem Builder Launch Button */}
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition transform active:scale-95"
          >
            <Wand2 className="w-4 h-4 text-amber-300" /> Построить по задаче (Мастер)
          </button>
        </div>

        {/* Presets Search & Filter */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
              placeholder="Поиск теоремы или фигуры..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'triangles', label: 'Треугольники' },
              { id: 'quads', label: '4-угольники' },
              { id: 'circles', label: 'Окружности' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Construction Presets List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredPresets.map((item) => (
            <button
              key={item.id}
              onClick={() => loadPreset(item.id)}
              className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
                  {item.title}
                </span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
            </button>
          ))}
        </div>

        {/* View Options */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              Оси
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

          <button
            onClick={handleClear}
            className="p-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 transition"
            title="Очистить всё полотно"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Geometry Canvas Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Top Tools Palette */}
        <div className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 flex-wrap z-10 shadow-sm">
          <button
            onClick={() => setIsBuilderOpen(true)}
            title="Быстрое построение по тексту задачи"
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5 transition mr-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Задать параметры задачи
          </button>

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
            📏 Длина
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
          <span className="font-medium">{statusMessage}</span>
        </div>

        {/* JSXGraph Host Element */}
        <div
          id={containerId}
          className="jxgbox w-full flex-1 relative bg-white dark:bg-slate-900 touch-none"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Task Builder Modal */}
      <GeometryTaskBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onBuildRightTriangle={handleBuildRightTriangle}
        onBuildIsoscelesTriangle={handleBuildIsoscelesTriangle}
        onBuildTriangleBySides={handleBuildTriangleBySides}
        onBuildTrapezoid={handleBuildTrapezoid}
        onLoadPreset={(id) => loadPreset(id)}
      />
    </div>
  );
};
