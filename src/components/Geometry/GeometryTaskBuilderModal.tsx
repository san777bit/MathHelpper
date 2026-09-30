import React, { useState } from 'react';
import { X, Sparkles, Wand2, Compass, Layers, Check } from 'lucide-react';

interface GeometryTaskBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildRightTriangle: (a: number, b: number) => void;
  onBuildIsoscelesTriangle: (base: number, height: number) => void;
  onBuildTriangleBySides: (a: number, b: number, c: number) => void;
  onBuildTrapezoid: (a: number, b: number, h: number) => void;
  onLoadPreset: (presetId: string) => void;
}

export const GeometryTaskBuilderModal: React.FC<GeometryTaskBuilderModalProps> = ({
  isOpen,
  onClose,
  onBuildRightTriangle,
  onBuildIsoscelesTriangle,
  onBuildTriangleBySides,
  onBuildTrapezoid,
  onLoadPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'presets'>('custom');
  const [figureType, setFigureType] = useState<'right' | 'isosceles' | 'sides' | 'trapezoid'>('right');

  // Input states
  const [rtA, setRtA] = useState(6);
  const [rtB, setRtB] = useState(8);

  const [isoBase, setIsoBase] = useState(6);
  const [isoH, setIsoH] = useState(4);

  const [sideA, setSideA] = useState(5);
  const [sideB, setSideB] = useState(6);
  const [sideC, setSideC] = useState(7);

  const [trapA, setTrapA] = useState(8);
  const [trapB, setTrapB] = useState(4);
  const [trapH, setTrapH] = useState(4);

  if (!isOpen) return null;

  const handleBuild = () => {
    if (figureType === 'right') {
      onBuildRightTriangle(rtA, rtB);
    } else if (figureType === 'isosceles') {
      onBuildIsoscelesTriangle(isoBase, isoH);
    } else if (figureType === 'sides') {
      onBuildTriangleBySides(sideA, sideB, sideC);
    } else if (figureType === 'trapezoid') {
      onBuildTrapezoid(trapA, trapB, trapH);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Конструктор геометрической задачи
              </h3>
              <p className="text-[11px] text-slate-500">
                Мгновенное точное построение чертежа по условию из учебника
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Ввести параметры задачи
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Быстрые шаблоны теорем
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'custom' ? (
            <>
              {/* Figure Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Выберите тип геометрической фигуры:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFigureType('right')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      figureType === 'right'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-bold text-xs">📐 Прямоугольный треугольник</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">по двум катетам a и b</div>
                  </button>

                  <button
                    onClick={() => setFigureType('isosceles')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      figureType === 'isosceles'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-bold text-xs">🔺 Равнобедренный треугольник</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">основание и высота</div>
                  </button>

                  <button
                    onClick={() => setFigureType('sides')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      figureType === 'sides'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-bold text-xs">📏 Треугольник по 3 сторонам</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">стороны a, b, c</div>
                  </button>

                  <button
                    onClick={() => setFigureType('trapezoid')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      figureType === 'trapezoid'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-bold text-xs">🪜 Трапеция со средней линией</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">основания a, b и высота h</div>
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs according to figureType */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                {figureType === 'right' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Параметры катетов:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Катет a:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={rtA}
                          onChange={(e) => setRtA(parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Катет b:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={rtB}
                          onChange={(e) => setRtB(parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg">
                      💡 Будет построена гипотенуза c = √( {rtA}² + {rtB}² ) = {Math.hypot(rtA, rtB).toFixed(2)}, угол 90° и формулы!
                    </div>
                  </div>
                )}

                {figureType === 'isosceles' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Основание и высота:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Основание:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={isoBase}
                          onChange={(e) => setIsoBase(parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Высота к основанию:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={isoH}
                          onChange={(e) => setIsoH(parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {figureType === 'sides' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Длины трех сторон (a, b, c):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Сторона a:</label>
                        <input
                          type="number"
                          min={1}
                          value={sideA}
                          onChange={(e) => setSideA(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Сторона b:</label>
                        <input
                          type="number"
                          min={1}
                          value={sideB}
                          onChange={(e) => setSideB(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Сторона c:</label>
                        <input
                          type="number"
                          min={1}
                          value={sideC}
                          onChange={(e) => setSideC(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {figureType === 'trapezoid' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Основания и высота трапеции:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Нижнее осн. a:</label>
                        <input
                          type="number"
                          min={1}
                          value={trapA}
                          onChange={(e) => setTrapA(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Верхнее осн. b:</label>
                        <input
                          type="number"
                          min={1}
                          value={trapB}
                          onChange={(e) => setTrapB(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-mono block mb-1">Высота h:</label>
                        <input
                          type="number"
                          min={1}
                          value={trapH}
                          onChange={(e) => setTrapH(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Presets list */
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Выберите готовую теорему для урока:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'circumscribed', title: '🔵 Вписанная и описанная окружности', desc: 'Центры I и O треугольника' },
                  { id: 'pythagoras', title: '📐 Теорема Пифагора', desc: 'a² + b² = c² с живыми числами' },
                  { id: 'right_triangle_height', title: '📐 Высота к гипотенузе', desc: 'Свойство h² = a_c · b_c' },
                  { id: 'medians', title: '🔺 Медианы и Центроид (2:1)', desc: 'Точка деления медиан 2:1' },
                  { id: 'altitudes_orthocenter', title: '🔺 Высоты и ортоцентр', desc: 'Пересечение трех высот' },
                  { id: 'bisectors_incenter', title: '📐 Биссектрисы и инцентр', desc: 'Пересечение биссектрис' },
                  { id: 'midline_triangle', title: '📏 Средняя линия треугольника', desc: 'MN = ½ AB и параллельность' },
                  { id: 'trapezoid_midline', title: '🪜 Трапеция и средняя линия', desc: 'MN = (a+b)/2' },
                  { id: 'parallelogram_diagonals', title: '🔷 Параллелограмм', desc: 'Диагонали делятся пополам' },
                  { id: 'rhombus_diagonals', title: '💠 Ромб: диагонали 90°', desc: 'Взаимно перпендикулярны' },
                  { id: 'inscribed_central_angle', title: '⭕ Вписанный и центральный угол', desc: '∠впис = ½ ∠центр' },
                  { id: 'two_tangents', title: '⭕ Отрезки касательных MA = MB', desc: 'Равенство отрезков касательных' },
                  { id: 'cyclic_quad', title: '⭕ Вписанный четырехугольник', desc: 'Сумма противоположных углов 180°' },
                  { id: 'thales_theorem', title: '📏 Теорема Фалеса', desc: 'Пропорциональные отрезки' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onLoadPreset(item.id);
                      onClose();
                    }}
                    className="p-3 text-left rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <Check className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === 'custom' && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Отмена
            </button>
            <button
              onClick={handleBuild}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" /> Построить на чертеже
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
