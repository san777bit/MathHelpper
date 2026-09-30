import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Lightbulb,
  Compass
} from 'lucide-react';
import { CHEAT_SHEET_DATA } from '../../data/cheatSheetData';
import { MathRenderer } from '../common/MathRenderer';

interface CheatSheetProps {
  onOpenInPlotter?: (functions: string[]) => void;
  onOpenInGeometry?: (preset: string) => void;
}

export const CheatSheet: React.FC<CheatSheetProps> = ({ onOpenInPlotter, onOpenInGeometry }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'algebra' | 'geometry'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(CHEAT_SHEET_DATA[0].id);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return CHEAT_SHEET_DATA.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.formulas.some((f) => f.name.toLowerCase().includes(q) || f.latex.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Search & Category Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Все разделы ({CHEAT_SHEET_DATA.length})
          </button>
          <button
            onClick={() => setSelectedCategory('algebra')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'algebra'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📗 Алгебра
          </button>
          <button
            onClick={() => setSelectedCategory('geometry')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'geometry'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📘 Геометрия
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по теме или формуле..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Cards Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Ничего не найдено по запросу «{search}»</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition"
              >
                {/* Header Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition"
                >
                  <div className="space-y-1 flex-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {item.subcategory}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.category === 'algebra' ? 'Алгебра' : 'Геометрия'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action button if has plot */}
                    {item.plotFunctions && onOpenInPlotter && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInPlotter(item.plotFunctions!);
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> График
                      </button>
                    )}

                    {/* Action button if has geometry preset */}
                    {item.geometryPreset && onOpenInGeometry && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInGeometry(item.geometryPreset!);
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 transition"
                      >
                        <Compass className="w-3 h-3" /> Чертеж
                      </button>
                    )}

                    <div className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    {/* Formulas Grid */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Формулы:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {item.formulas.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1"
                          >
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {f.name}
                            </span>
                            <div className="py-1">
                              <MathRenderer math={f.latex} block />
                            </div>
                            {f.explanation && (
                              <p className="text-[11px] text-slate-500">{f.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Examples Section */}
                    {item.examples.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Примеры применения:
                        </h4>
                        <div className="space-y-2">
                          {item.examples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                            >
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Задача: {ex.task}
                              </div>
                              <div className="text-indigo-600 dark:text-indigo-400 font-mono py-1">
                                <MathRenderer math={ex.solution} block />
                              </div>
                              {ex.explanation && (
                                <p className="text-[11px] text-slate-500">{ex.explanation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Mistakes / Exam Traps */}
                    {item.commonMistakes.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5">
                          <AlertTriangle className="w-4 h-4" /> Частые ошибки на ОГЭ / ЕГЭ:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {item.commonMistakes.map((mistake, mIdx) => (
                            <li key={mIdx}>{mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
