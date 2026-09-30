export interface PlotterTemplate {
  id: string;
  title: string;
  category: 'algebra' | 'oge_ege' | 'trig' | 'advanced' | 'systems';
  categoryLabel: string;
  expressions: string[];
  description: string;
  defaultParams?: { name: string; value: number }[];
}

export const PLOTTER_TEMPLATES: PlotterTemplate[] = [
  // АЛГЕБРА 7-9 КЛАСС
  {
    id: 'linear-params',
    title: 'Линейная функция с параметрами',
    category: 'algebra',
    categoryLabel: 'Линейные',
    expressions: ['k * x + b'],
    description: 'Исследование влияния углового коэффициента k и свободного члена b.',
    defaultParams: [
      { name: 'k', value: 1.5 },
      { name: 'b', value: 2 },
    ],
  },
  {
    id: 'parallel-lines',
    title: 'Параллельные и пересекающиеся прямые',
    category: 'algebra',
    categoryLabel: 'Линейные',
    expressions: ['2 * x + 1', '2 * x - 3', '-0.5 * x + 2'],
    description: 'Прямые с одинаковым угловым коэффициентом параллельны, а с k1 * k2 = -1 — перпендикулярны.',
  },
  {
    id: 'quadratic-params',
    title: 'Парабола ax² + bx + c',
    category: 'algebra',
    categoryLabel: 'Квадратичные',
    expressions: ['a * x^2 + b * x + c'],
    description: 'Классическая парабола с динамическими ползунками вершины и ветвей.',
    defaultParams: [
      { name: 'a', value: 1 },
      { name: 'b', value: -4 },
      { name: 'c', value: 3 },
    ],
  },
  {
    id: 'quadratic-vertex',
    title: 'Смещение параболы (вершина (x₀, y₀))',
    category: 'algebra',
    categoryLabel: 'Квадратичные',
    expressions: ['a * (x - x0)^2 + y0'],
    description: 'Канонический вид y = a(x - x₀)² + y₀, где (x₀; y₀) — координаты вершины.',
    defaultParams: [
      { name: 'a', value: 1 },
      { name: 'x0', value: 2 },
      { name: 'y0', value: -1 },
    ],
  },
  {
    id: 'hyperbola-params',
    title: 'Гипербола (обратная пропорциональность)',
    category: 'algebra',
    categoryLabel: 'Дроби',
    expressions: ['k / x'],
    description: 'Ветви гиперболы в 1 и 3 четвертях при k > 0, во 2 и 4 — при k < 0.',
    defaultParams: [{ name: 'k', value: 4 }],
  },
  {
    id: 'fractional-linear',
    title: 'Дробно-линейная функция с асимптотами',
    category: 'algebra',
    categoryLabel: 'Дроби',
    expressions: ['(2 * x + 1) / (x - 2)'],
    description: 'Гипербола с вертикальной асимптотой x = 2 и горизонтальной y = 2.',
  },
  {
    id: 'sqrt-function',
    title: 'Функция квадратного корня',
    category: 'algebra',
    categoryLabel: 'Корни',
    expressions: ['sqrt(x)', 'sqrt(x + 3) - 1'],
    description: 'Область определения x ≥ 0 и параллельный перенос графика корня.',
  },
  {
    id: 'cubic-parabola',
    title: 'Кубическая парабола с экстремумами',
    category: 'algebra',
    categoryLabel: 'Степени',
    expressions: ['x^3 - 3 * x'],
    description: 'Локальный максимум в x = -1 и локальный минимум в x = 1.',
  },

  // ОГЭ / ЕГЭ (МОДУЛИ И ПАРАМЕТРЫ)
  {
    id: 'abs-basic',
    title: 'Модуль аргумента y = |x|',
    category: 'oge_ege',
    categoryLabel: 'Модули ОГЭ',
    expressions: ['abs(x)', 'abs(x - 2) - 3'],
    description: '«Уголок» с вершиной в точке (2; -3).',
  },
  {
    id: 'abs-quadratic',
    title: 'Модуль квадратичной y = |x² - 4|',
    category: 'oge_ege',
    categoryLabel: 'Модули ОГЭ',
    expressions: ['abs(x^2 - 4)'],
    description: 'Типовое задание №22 ОГЭ: отрицательная часть параболы зеркально отражается вверх.',
  },
  {
    id: 'abs-sum',
    title: 'Сумма модулей (метод «корыта»)',
    category: 'oge_ege',
    categoryLabel: 'Модули ОГЭ',
    expressions: ['abs(x - 1) + abs(x + 2)'],
    description: 'Классический график с горизонтальным дном на отрезке [-2; 1].',
  },
  {
    id: 'rational-punctured',
    title: 'Дробь с выколотой точкой (ОГЭ №22)',
    category: 'oge_ege',
    categoryLabel: 'Задачи с параметром',
    expressions: ['(x^2 - 4*x + 3) / (x - 1)'],
    description: 'Упрощается до прямой y = x - 3 с выколотой точкой x = 1.',
  },

  // СИСТЕМЫ УРАВНЕНИЙ (ГРАФИЧЕСКИЙ МЕТОД)
  {
    id: 'sys-parabola-line',
    title: 'Система: Парабола и прямая',
    category: 'systems',
    categoryLabel: 'Системы',
    expressions: ['x^2 - 2*x - 3', 'x + 1'],
    description: 'Нахождение точек пересечения параболы и прямой (корни x = -1 и x = 4).',
  },
  {
    id: 'sys-hyperbola-line',
    title: 'Система: Гипербола и прямая',
    category: 'systems',
    categoryLabel: 'Системы',
    expressions: ['4 / x', 'x'],
    description: 'Пересечение y = 4/x и y = x в точках (-2; -2) и (2; 2).',
  },
  {
    id: 'sys-two-parabolas',
    title: 'Система: Две параболы',
    category: 'systems',
    categoryLabel: 'Системы',
    expressions: ['x^2 - 2', '-x^2 + 6'],
    description: 'Ветви одной параболы вверх, другой вниз; пересечение в x = ±2.',
  },

  // ТРИГОНОМЕТРИЯ
  {
    id: 'trig-sin-cos',
    title: 'Синус и косинус (сдвиг фаз на π/2)',
    category: 'trig',
    categoryLabel: 'Тригонометрия',
    expressions: ['sin(x)', 'cos(x)'],
    description: 'Периодичность с периодом 2π, амплитуда от -1 до 1.',
  },
  {
    id: 'trig-harmonic',
    title: 'Гармонические колебания A·sin(ωx + φ)',
    category: 'trig',
    categoryLabel: 'Тригонометрия',
    expressions: ['a * sin(w * x)'],
    description: 'Исследование влияния амплитуды a и циклической частоты w.',
    defaultParams: [
      { name: 'a', value: 2 },
      { name: 'w', value: 2 },
    ],
  },
  {
    id: 'trig-tan',
    title: 'Тангенс с асимптотами',
    category: 'trig',
    categoryLabel: 'Тригонометрия',
    expressions: ['tan(x)'],
    description: 'Периодическая функция с периодом π и вертикальными разрывами в π/2 + πk.',
  },

  // ПОКАЗАТЕЛЬНЫЕ И ЛОГАРИФМИЧЕСКИЕ
  {
    id: 'exp-growth-decay',
    title: 'Экспоненциальный рост и убывание',
    category: 'advanced',
    categoryLabel: 'Экспоненты',
    expressions: ['2^x', '0.5^x'],
    description: 'Показательные функции при основании a > 1 (рост) и 0 < a < 1 (убывание).',
  },
  {
    id: 'logarithm-natural',
    title: 'Натуральный логарифм y = ln(x)',
    category: 'advanced',
    categoryLabel: 'Логарифмы',
    expressions: ['log(x)', 'exp(x)'],
    description: 'Взаимно обратные функции y = ln(x) и y = e^x, симметричные относительно y = x.',
  },
];
