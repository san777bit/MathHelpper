export interface GeometryPresetInfo {
  id: string;
  title: string;
  category: 'triangles' | 'quads' | 'circles' | 'theorems';
  categoryLabel: string;
  description: string;
  badge?: string;
}

export const GEOMETRY_PRESETS_CATALOG: GeometryPresetInfo[] = [
  // ТРЕУГОЛЬНИКИ
  {
    id: 'pythagoras',
    title: 'Теорема Пифагора (квадраты на сторонах)',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Прямоугольный треугольник с живым вычислением a² + b² = c².',
    badge: '8 класс',
  },
  {
    id: 'right_triangle_height',
    title: 'Высота прямоугольного треугольника к гипотенузе',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Свойство высоты: h² = a_c · b_c и подобие трех треугольников.',
    badge: '8 класс',
  },
  {
    id: 'isosceles_triangle',
    title: 'Равнобедренный треугольник с высотой/медианой',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Высота, проведенная к основанию, является медианой и биссектрисой.',
    badge: '7 класс',
  },
  {
    id: 'equilateral_triangle',
    title: 'Правильный (равносторонний) треугольник',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Все стороны равны, все углы по 60°, центры вписанной и описанной окружностей совпадают.',
    badge: '7 класс',
  },
  {
    id: 'midline_triangle',
    title: 'Средняя линия треугольника',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Параллельна третьей стороне и равна её половине: MN = ½ AC.',
    badge: '8 класс',
  },
  {
    id: 'medians',
    title: 'Медианы треугольника и центроид (2 : 1)',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Медианы пересекаются в одной точке и делятся ею в отношении 2:1 от вершины.',
    badge: '8 класс',
  },
  {
    id: 'altitudes_orthocenter',
    title: 'Высоты треугольника и ортоцентр',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Три высоты треугольника всегда пересекаются в одной точке (ортоцентре H).',
    badge: '8 класс',
  },
  {
    id: 'bisectors_incenter',
    title: 'Биссектрисы углов и вписанная окружность',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Точка пересечения биссектрис — центр вписанной окружности (инцентр I).',
    badge: '8 класс',
  },
  {
    id: 'circumscribed',
    title: 'Вписанная и описанная окружности',
    category: 'triangles',
    categoryLabel: 'Треугольники',
    description: 'Одновременное построение обеих окружностей с их центрами I и O.',
    badge: '8–9 класс',
  },

  // ЧЕТЫРЕХУГОЛЬНИКИ
  {
    id: 'trapezoid_midline',
    title: 'Трапеция и её средняя линия',
    category: 'quads',
    categoryLabel: 'Четырехугольники',
    description: 'Средняя линия трапеции параллельна основаниям и равна их полусумме: m = (a + b) / 2.',
    badge: '8 класс',
  },
  {
    id: 'parallelogram_diagonals',
    title: 'Параллелограмм: свойства диагоналей',
    category: 'quads',
    categoryLabel: 'Четырехугольники',
    description: 'Диагонали параллелограмма пересекаются и точкой пересечения делятся пополам.',
    badge: '8 класс',
  },
  {
    id: 'rhombus_diagonals',
    title: 'Ромб: перпендикулярные диагонали',
    category: 'quads',
    categoryLabel: 'Четырехугольники',
    description: 'Диагонали ромба взаимно перпендикулярны и являются биссектрисами его углов.',
    badge: '8 класс',
  },

  // ОКРУЖНОСТИ
  {
    id: 'inscribed_central_angle',
    title: 'Вписанный и центральный углы',
    category: 'circles',
    categoryLabel: 'Окружности',
    description: 'Вписанный угол равен половине центрального угла, опирающегося на ту же дугу (∠впис = ½ ∠центр).',
    badge: '8–9 класс',
  },
  {
    id: 'tangent_radius',
    title: 'Касательная и радиус в точку касания',
    category: 'circles',
    categoryLabel: 'Окружности',
    description: 'Касательная к окружности перпендикулярна радиусу, проведенному в точку касания (R ⊥ l).',
    badge: '8 класс',
  },
  {
    id: 'two_tangents',
    title: 'Отрезки касательных из одной точки',
    category: 'circles',
    categoryLabel: 'Окружности',
    description: 'Отрезки касательных MA и MB, проведенных из одной точки, равны, а луч MO делит угол пополам.',
    badge: '8 класс',
  },
  {
    id: 'cyclic_quad',
    title: 'Вписанный четырехугольник (сумма 180°)',
    category: 'circles',
    categoryLabel: 'Окружности',
    description: 'В любом вписанном четырехугольнике сумма противоположных углов равна 180° (∠A + ∠C = 180°).',
    badge: '9 класс',
  },

  // ТЕОРЕМЫ
  {
    id: 'parallel_transversal',
    title: 'Параллельные прямые и секущая (углы)',
    category: 'theorems',
    categoryLabel: 'Теоремы',
    description: 'Накрест лежащие, соответственные и односторонние углы при пересечении секущей.',
    badge: '7 класс',
  },
  {
    id: 'thales_theorem',
    title: 'Теорема Фалеса (пропорциональные отрезки)',
    category: 'theorems',
    categoryLabel: 'Теоремы',
    description: 'Параллельные прямые отсекают на сторонах угла пропорциональные отрезки.',
    badge: '8 класс',
  },
];

