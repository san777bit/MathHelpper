import { useState } from 'react';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Shuffle,
} from 'lucide-react';
import type { SolverType, SolverResult } from '../../types';

import {
  solveQuadratic,
  solveLinear,
  solveInequality,
  solveSystem2x2,
  solveArithmeticProgression,
  solveGeometricProgression,
} from './solverEngine';
import { MathRenderer } from '../common/MathRenderer';

interface StepSolverProps {
  onOpenInPlotter?: (functions: string[]) => void;
}

export const StepSolver: React.FC<StepSolverProps> = ({ onOpenInPlotter }) => {
  const [topic, setTopic] = useState<SolverType>('quadratic');

  // Quadratic / Inequality inputs
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-4);
  const [quadC, setQuadC] = useState<number>(3);
  const [ineqSign, setIneqSign] = useState<'>' | '>=' | '<' | '<='>('>');

  // Linear inputs (ax + b = 0)
  const [linA, setLinA] = useState<number>(3);
  const [linB, setLinB] = useState<number>(-9);

  // System 2x2 inputs
  const [sysA1, setSysA1] = useState<number>(2);
  const [sysB1, setSysB1] = useState<number>(1);
  const [sysC1, setSysC1] = useState<number>(7);
  const [sysA2, setSysA2] = useState<number>(1);
  const [sysB2, setSysB2] = useState<number>(-1);
  const [sysC2, setSysC2] = useState<number>(2);

  // Progression inputs
  const [progType, setProgType] = useState<'arithmetic' | 'geometric'>('arithmetic');
  const [progFirst, setProgFirst] = useState<number>(3);
  const [progDiff, setProgDiff] = useState<number>(4);
  const [progN, setProgN] = useState<number>(10);

  // Compute result based on current inputs
  let result: SolverResult;
  if (topic === 'quadratic') {
    result = solveQuadratic(quadA, quadB, quadC);
  } else if (topic === 'linear') {
    result = solveLinear(linA, linB);
  } else if (topic === 'inequality') {
    result = solveInequality(quadA, quadB, quadC, ineqSign);
  } else if (topic === 'system') {
    result = solveSystem2x2(sysA1, sysB1, sysC1, sysA2, sysB2, sysC2);
  } else {
    result =
      progType === 'arithmetic'
        ? solveArithmeticProgression(progFirst, progDiff, progN)
        : solveGeometricProgression(progFirst, progDiff, progN);
  }

  // Generate random example
  const handleRandomize = () => {
    if (topic === 'quadratic' || topic === 'inequality') {
      const r1 = Math.floor(Math.random() * 9) - 4; // root 1
      const r2 = Math.floor(Math.random() * 9) - 4; // root 2
      const a = Math.random() > 0.5 ? 1 : 2;
      setQuadA(a);
      setQuadB(-a * (r1 + r2));
      setQuadC(a * r1 * r2);
    } else if (topic === 'linear') {
      const a = Math.floor(Math.random() * 8) + 1;
      const x = Math.floor(Math.random() * 12) - 6;
      setLinA(a);
      setLinB(-a * x);
    } else if (topic === 'system') {
      setSysA1(Math.floor(Math.random() * 4) + 1);
      setSysB1(Math.floor(Math.random() * 4) - 2 || 1);
      setSysC1(Math.floor(Math.random() * 15) - 5);
      setSysA2(Math.floor(Math.random() * 4) - 2 || 1);
      setSysB2(Math.floor(Math.random() * 4) + 1);
      setSysC2(Math.floor(Math.random() * 15) - 5);
    } else if (topic === 'progression') {
      setProgFirst(Math.floor(Math.random() * 10) + 1);
      setProgDiff(Math.floor(Math.random() * 6) + 1);
      setProgN(Math.floor(Math.random() * 10) + 5);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Input Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col overflow-y-auto space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" /> Пошаговый Решатель
          </h2>
          <button
            onClick={handleRandomize}
            title="Случайный пример для отработки"
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 transition"
          >
            <Shuffle className="w-3.5 h-3.5" /> Случайный
          </button>
        </div>

        {/* Topic Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setTopic('quadratic')}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              topic === 'quadratic'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Квадратные
          </button>
          <button
            onClick={() => setTopic('inequality')}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              topic === 'inequality'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Неравенства
          </button>
          <button
            onClick={() => setTopic('linear')}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              topic === 'linear'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Линейные
          </button>
          <button
            onClick={() => setTopic('system')}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              topic === 'system'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Системы 2×2
          </button>
          <button
            onClick={() => setTopic('progression')}
            className={`col-span-2 py-1.5 px-2 rounded-lg text-center transition ${
              topic === 'progression'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Прогрессии (арифм. / геом.)
          </button>
        </div>

        {/* Inputs per Topic */}
        <div className="space-y-3 pt-2">
          {topic === 'quadratic' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
                <MathRenderer math={`${quadA}x^2 + (${quadB})x + (${quadC}) = 0`} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-mono">a (при x²):</label>
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">b (при x):</label>
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">c (число):</label>
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {topic === 'inequality' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
                <MathRenderer
                  math={`${quadA}x^2 + (${quadB})x + (${quadC}) ${
                    ineqSign === '>=' ? '\\ge' : ineqSign === '<=' ? '\\le' : ineqSign
                  } 0`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-mono">a:</label>
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">b:</label>
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">c:</label>
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Знак неравенства:</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['>', '>=', '<', '<='] as const).map((sign) => (
                    <button
                      key={sign}
                      onClick={() => setIneqSign(sign)}
                      className={`py-1.5 rounded-lg font-mono font-bold text-sm transition ${
                        ineqSign === sign
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sign === '>=' ? '≥' : sign === '<=' ? '≤' : sign}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {topic === 'linear' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
                <MathRenderer math={`${linA}x + (${linB}) = 0`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-mono">a (при x):</label>
                  <input
                    type="number"
                    value={linA}
                    onChange={(e) => setLinA(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">b (число):</label>
                  <input
                    type="number"
                    value={linB}
                    onChange={(e) => setLinB(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {topic === 'system' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono text-xs">
                <MathRenderer
                  math={`\\begin{cases} ${sysA1}x + (${sysB1})y = ${sysC1} \\\\ ${sysA2}x + (${sysB2})y = ${sysC2} \\end{cases}`}
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Уравнение 1: a₁x + b₁y = c₁</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <input
                    type="number"
                    placeholder="a1"
                    value={sysA1}
                    onChange={(e) => setSysA1(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="b1"
                    value={sysB1}
                    onChange={(e) => setSysB1(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="c1"
                    value={sysC1}
                    onChange={(e) => setSysC1(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Уравнение 2: a₂x + b₂y = c₂</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <input
                    type="number"
                    placeholder="a2"
                    value={sysA2}
                    onChange={(e) => setSysA2(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="b2"
                    value={sysB2}
                    onChange={(e) => setSysB2(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="c2"
                    value={sysC2}
                    onChange={(e) => setSysC2(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {topic === 'progression' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setProgType('arithmetic')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                    progType === 'arithmetic'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Арифметическая
                </button>
                <button
                  onClick={() => setProgType('geometric')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                    progType === 'geometric'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Геометрическая
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-mono">
                    {progType === 'arithmetic' ? 'a₁' : 'b₁'}:
                  </label>
                  <input
                    type="number"
                    value={progFirst}
                    onChange={(e) => setProgFirst(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">
                    {progType === 'arithmetic' ? 'd (разность)' : 'q (знаменатель)'}:
                  </label>
                  <input
                    type="number"
                    value={progDiff}
                    onChange={(e) => setProgDiff(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono">n (номер):</label>
                  <input
                    type="number"
                    min={1}
                    value={progN}
                    onChange={(e) => setProgN(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 text-sm font-mono bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Graph preview link button */}
        {result.graphFunctions && result.graphFunctions.length > 0 && onOpenInPlotter && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onOpenInPlotter(result.graphFunctions || [])}
              className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Посмотреть на графике
            </button>
          </div>
        )}
      </div>

      {/* Right Area: Step-by-Step Explanation Flow */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Подробное пошаговое решение
          </h3>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            Шагов: {result.steps.length}
          </span>
        </div>

        {/* Step Cards List */}
        <div className="space-y-3">
          {result.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 pl-8 mb-2">
                {step.explanation}
              </p>

              <div className="pl-8 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-x-auto border border-slate-100 dark:border-slate-800">
                <MathRenderer math={step.math} block />
              </div>

              {step.note && (
                <div className="mt-2 ml-8 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg">
                  💡 {step.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final Answer Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/40 dark:border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Итоговый ответ:
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                <MathRenderer math={result.answer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
