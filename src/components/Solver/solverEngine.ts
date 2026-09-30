import type { SolverResult, SolverStep } from '../../types';

// Helper to format numbers nicely (e.g. 3, -2.5, 1/3)
export function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(3)).toString();
}

// 1. QUADRATIC EQUATION SOLVER
export function solveQuadratic(a: number, b: number, c: number): SolverResult {
  if (a === 0) {
    return solveLinear(b, -c);
  }

  const steps: SolverStep[] = [];
  steps.push({
    title: 'Шаг 1: Выделение коэффициентов',
    explanation: 'Квадратное уравнение имеет стандартный вид: ax² + bx + c = 0.',
    math: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`,
  });

  const d = b * b - 4 * a * c;
  const bSq = b * b;
  const fourAC = 4 * a * c;

  steps.push({
    title: 'Шаг 2: Вычисление дискриминанта',
    explanation: 'Вычисляем дискриминант по формуле D = b² - 4ac:',
    math: `D = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${bSq} - (${fourAC}) = ${d}`,
  });

  let answer = '';
  let roots: string[] = [];
  const graphFunctions = [`${a}*x^2 + (${b})*x + (${c})`];

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const isSquareInt = Number.isInteger(sqrtD);
    const sqrtDStr = isSquareInt ? sqrtD.toString() : `\\sqrt{${d}}`;

    steps.push({
      title: 'Шаг 3: Анализ знака дискриминанта',
      explanation: `Так как D = ${d} > 0, уравнение имеет два различных действительных корня:`,
      math: `x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{-(${b}) \\pm ${sqrtDStr}}{2 \\cdot (${a})}`,
    });

    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    steps.push({
      title: 'Шаг 4: Нахождение корней',
      explanation: 'Раздельно вычисляем первый и второй корень:',
      math: `x_1 = \\frac{${-b} + ${sqrtDStr}}{${2 * a}} = ${formatNum(x1)}, \\quad x_2 = \\frac{${-b} - ${sqrtDStr}}{${2 * a}} = ${formatNum(x2)}`,
    });

    // Vieta check
    const sum = x1 + x2;
    const prod = x1 * x2;
    steps.push({
      title: 'Шаг 5: Проверка по теореме Виета',
      explanation: 'Для проверки корней используем соотношения Виета (x₁ + x₂ = -b/a, x₁ · x₂ = c/a):',
      math: `x_1 + x_2 = ${formatNum(sum)} = -\\frac{${b}}{${a}}, \\quad x_1 \\cdot x_2 = ${formatNum(prod)} = \\frac{${c}}{${a}}`,
      note: 'Проверка подтверждает правильность решения!',
    });

    // Factoring
    steps.push({
      title: 'Шаг 6: Разложение квадратного трехчлена на множители',
      explanation: 'Формула разложения: ax² + bx + c = a(x - x₁)(x - x₂):',
      math: `${a !== 1 ? a : ''}(x - ${formatNum(x1)})(x - ${formatNum(x2)}) = 0`,
    });

    roots = [formatNum(x1), formatNum(x2)];
    answer = `x_1 = ${formatNum(x1)}, \\quad x_2 = ${formatNum(x2)}`;
  } else if (d === 0) {
    const x = -b / (2 * a);
    steps.push({
      title: 'Шаг 3: Единственный корень',
      explanation: 'Так как D = 0, уравнение имеет один корень (два совпадающих):',
      math: `x = \\frac{-b}{2a} = \\frac{-(${b})}{2 \\cdot (${a})} = ${formatNum(x)}`,
    });

    steps.push({
      title: 'Шаг 4: Разложение в полный квадрат',
      explanation: 'Трехчлен сворачивается в формулу квадрата:',
      math: `${a !== 1 ? a : ''}(x - ${formatNum(x)})^2 = 0`,
    });

    roots = [formatNum(x)];
    answer = `x = ${formatNum(x)}`;
  } else {
    steps.push({
      title: 'Шаг 3: Действительных корней нет',
      explanation: `Так как D = ${d} < 0, извлечь действительный квадратный корень невозможно.`,
      math: `D = ${d} < 0 \\implies x \\in \\varnothing`,
      note: 'График параболы не пересекает ось OX.',
    });
    answer = 'Действительных корней нет (x \\in \\varnothing)';
  }

  return {
    solutionFound: true,
    roots,
    steps,
    answer,
    graphFunctions,
  };
}

// 2. LINEAR EQUATION SOLVER (ax + b = 0)
export function solveLinear(a: number, b: number): SolverResult {
  const steps: SolverStep[] = [];

  steps.push({
    title: 'Шаг 1: Исходное уравнение',
    explanation: 'Линейное уравнение стандартного вида ax + b = 0:',
    math: `${a}x + (${b}) = 0`,
  });

  if (a === 0) {
    if (b === 0) {
      steps.push({
        title: 'Шаг 2: Тождество',
        explanation: '0 = 0 верно при любых значениях x.',
        math: 'x \\in \\mathbb{R}',
      });
      return {
        solutionFound: true,
        steps,
        answer: 'x \\in \\mathbb{R} \\text{ (бесконечно много решений)}',
      };
    } else {
      steps.push({
        title: 'Шаг 2: Противоречие',
        explanation: `Получили равенство ${b} = 0, которое ложно.`,
        math: 'x \\in \\varnothing',
      });
      return {
        solutionFound: false,
        steps,
        answer: 'Решений нет (x \\in \\varnothing)',
      };
    }
  }

  steps.push({
    title: 'Шаг 2: Перенос свободного слагаемого',
    explanation: 'Переносим свободное число в правую часть со сменой знака:',
    math: `${a}x = ${-b}`,
  });

  const root = -b / a;
  steps.push({
    title: 'Шаг 3: Деление на коэффициент при x',
    explanation: `Делим обе части уравнения на ${a}:`,
    math: `x = \\frac{${-b}}{${a}} = ${formatNum(root)}`,
  });

  return {
    solutionFound: true,
    roots: [formatNum(root)],
    steps,
    answer: `x = ${formatNum(root)}`,
    graphFunctions: [`${a}*x + (${b})`],
  };
}

// 3. QUADRATIC INEQUALITY SOLVER (ax^2 + bx + c > 0, >= 0, < 0, <= 0)
export function solveInequality(
  a: number,
  b: number,
  c: number,
  sign: '>' | '>=' | '<' | '<='
): SolverResult {
  const steps: SolverStep[] = [];

  steps.push({
    title: 'Шаг 1: Нахождение нулей функции',
    explanation: 'Сначала найдем корни соответствующего уравнения ax² + bx + c = 0:',
    math: `${a}x^2 + (${b})x + (${c}) = 0`,
  });

  const d = b * b - 4 * a * c;
  let answer = '';

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    let x1 = (-b - sqrtD) / (2 * a);
    let x2 = (-b + sqrtD) / (2 * a);
    if (x1 > x2) {
      const temp = x1;
      x1 = x2;
      x2 = temp;
    }

    const openBracket = sign === '>' || sign === '<' ? '(' : '[';
    const closeBracket = sign === '>' || sign === '<' ? ')' : ']';

    steps.push({
      title: 'Шаг 2: Метод интервалов и расстановка знаков',
      explanation: `Корни: x₁ = ${formatNum(x1)}, x₂ = ${formatNum(x2)}. Парабола ветвями ${a > 0 ? 'вверх' : 'вниз'}.`,
      math: `x_1 = ${formatNum(x1)}, \\quad x_2 = ${formatNum(x2)}`,
    });

    if (a > 0) {
      if (sign === '>' || sign === '>=') {
        answer = `x \\in (-\\infty; ${formatNum(x1)}${closeBracket} \\cup ${openBracket}${formatNum(x2)}; +\\infty)`;
      } else {
        answer = `x \\in ${openBracket}${formatNum(x1)}; ${formatNum(x2)}${closeBracket}`;
      }
    } else {
      if (sign === '>' || sign === '>=') {
        answer = `x \\in ${openBracket}${formatNum(x1)}; ${formatNum(x2)}${closeBracket}`;
      } else {
        answer = `x \\in (-\\infty; ${formatNum(x1)}${closeBracket} \\cup ${openBracket}${formatNum(x2)}; +\\infty)`;
      }
    }

    steps.push({
      title: 'Шаг 3: Выбор промежутков',
      explanation: `Смотрим на знак исходного неравенства (${sign}) и выбираем нужные интервалы:`,
      math: answer,
    });
  } else if (d === 0) {
    const x0 = -b / (2 * a);
    if (a > 0) {
      if (sign === '>=') answer = 'x \\in \\mathbb{R}';
      else if (sign === '>') answer = `x \\in (-\\infty; ${formatNum(x0)}) \\cup (${formatNum(x0)}; +\\infty)`;
      else if (sign === '<=') answer = `x = ${formatNum(x0)}`;
      else answer = 'x \\in \\varnothing';
    } else {
      if (sign === '<=') answer = 'x \\in \\mathbb{R}';
      else if (sign === '<') answer = `x \\in (-\\infty; ${formatNum(x0)}) \\cup (${formatNum(x0)}; +\\infty)`;
      else if (sign === '>=') answer = `x = ${formatNum(x0)}`;
      else answer = 'x \\in \\varnothing';
    }
  } else {
    // D < 0: no roots
    if (a > 0) {
      if (sign === '>' || sign === '>=') answer = 'x \\in \\mathbb{R} \\text{ (верно при любом x)}';
      else answer = 'x \\in \\varnothing \\text{ (нет решений)}';
    } else {
      if (sign === '<' || sign === '<=') answer = 'x \\in \\mathbb{R} \\text{ (верно при любом x)}';
      else answer = 'x \\in \\varnothing \\text{ (нет решений)}';
    }
    steps.push({
      title: 'Шаг 2: График параболы не пересекает ось OX',
      explanation: `D < 0, коэффициент при старшей степени a = ${a} ${a > 0 ? '> 0' : '< 0'}, поэтому знак трехчлена всегда постоянный.`,
      math: answer,
    });
  }

  return {
    solutionFound: true,
    steps,
    answer,
    graphFunctions: [`${a}*x^2 + (${b})*x + (${c})`],
  };
}

// 4. SYSTEM OF TWO LINEAR EQUATIONS
// { a1*x + b1*y = c1
// { a2*x + b2*y = c2
export function solveSystem2x2(
  a1: number,
  b1: number,
  c1: number,
  a2: number,
  b2: number,
  c2: number
): SolverResult {
  const steps: SolverStep[] = [];

  steps.push({
    title: 'Шаг 1: Исходная система уравнений',
    explanation: 'Дана система двух линейных уравнений:',
    math: `\\begin{cases} ${a1}x + (${b1})y = ${c1} \\\\ ${a2}x + (${b2})y = ${c2} \\end{cases}`,
  });

  const det = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  steps.push({
    title: 'Шаг 2: Метод определителей (Крамера / сложения)',
    explanation: 'Вычисляем главный определитель системы Δ = a₁b₂ - a₂b₁:',
    math: `\\Delta = ${a1} \\cdot (${b2}) - (${a2}) \\cdot (${b1}) = ${det}`,
  });

  if (det === 0) {
    if (detX === 0 && detY === 0) {
      return {
        solutionFound: true,
        steps,
        answer: 'Бесконечно много решений (прямые совпадают)',
      };
    } else {
      return {
        solutionFound: false,
        steps,
        answer: 'Решений нет (прямые параллельны)',
      };
    }
  }

  const x = detX / det;
  const y = detY / det;

  steps.push({
    title: 'Шаг 3: Вычисление переменных x и y',
    explanation: 'Находим переменные делением:',
    math: `x = \\frac{\\Delta_x}{\\Delta} = \\frac{${detX}}{${det}} = ${formatNum(x)}, \\quad y = \\frac{\\Delta_y}{\\Delta} = \\frac{${detY}}{${det}} = ${formatNum(y)}`,
  });

  // Verify
  steps.push({
    title: 'Шаг 4: Проверка подстановкой',
    explanation: 'Подставляем полученные значения в оба исходных уравнения:',
    math: `\\begin{cases} ${a1} \\cdot (${formatNum(x)}) + ${b1} \\cdot (${formatNum(y)}) = ${formatNum(a1 * x + b1 * y)} = ${c1} \\\\ ${a2} \\cdot (${formatNum(x)}) + ${b2} \\cdot (${formatNum(y)}) = ${formatNum(a2 * x + b2 * y)} = ${c2} \\end{cases}`,
    note: 'Оба тождества верны!',
  });

  // Format line functions for graph plotter: y = (c - a*x) / b
  const graphFunctions: string[] = [];
  if (b1 !== 0) graphFunctions.push(`(${c1} - (${a1})*x) / (${b1})`);
  if (b2 !== 0) graphFunctions.push(`(${c2} - (${a2})*x) / (${b2})`);

  return {
    solutionFound: true,
    roots: [`x = ${formatNum(x)}`, `y = ${formatNum(y)}`],
    steps,
    answer: `(x; y) = (${formatNum(x)}; ${formatNum(y)})`,
    graphFunctions,
  };
}

// 5. PROGRESSIONS SOLVER
export function solveArithmeticProgression(a1: number, d: number, n: number): SolverResult {
  const an = a1 + (n - 1) * d;
  const sn = ((a1 + an) / 2) * n;

  const steps: SolverStep[] = [
    {
      title: 'Шаг 1: Исходные данные',
      explanation: 'Арифметическая прогрессия с параметрами:',
      math: `a_1 = ${a1}, \\quad d = ${d}, \\quad n = ${n}`,
    },
    {
      title: 'Шаг 2: Нахождение n-го члена',
      explanation: 'Используем формулу общего члена an = a1 + (n - 1)d:',
      math: `a_{${n}} = ${a1} + (${n} - 1) \\cdot (${d}) = ${a1} + ${(n - 1) * d} = ${formatNum(an)}`,
    },
    {
      title: 'Шаг 3: Нахождение суммы первых n членов',
      explanation: 'Формула суммы: Sn = (a1 + an) / 2 * n:',
      math: `S_{${n}} = \\frac{${a1} + ${formatNum(an)}}{2} \\cdot ${n} = ${formatNum(sn)}`,
    },
  ];

  return {
    solutionFound: true,
    steps,
    answer: `a_{${n}} = ${formatNum(an)}, \\quad S_{${n}} = ${formatNum(sn)}`,
  };
}

export function solveGeometricProgression(b1: number, q: number, n: number): SolverResult {
  const bn = b1 * Math.pow(q, n - 1);
  const sn = q === 1 ? b1 * n : (b1 * (Math.pow(q, n) - 1)) / (q - 1);

  const steps: SolverStep[] = [
    {
      title: 'Шаг 1: Исходные данные',
      explanation: 'Геометрическая прогрессия с параметрами:',
      math: `b_1 = ${b1}, \\quad q = ${q}, \\quad n = ${n}`,
    },
    {
      title: 'Шаг 2: Нахождение n-го члена',
      explanation: 'Используем формулу bn = b1 * q^(n - 1):',
      math: `b_{${n}} = ${b1} \\cdot (${q})^{${n - 1}} = ${formatNum(bn)}`,
    },
    {
      title: 'Шаг 3: Нахождение суммы первых n членов',
      explanation: q === 1 ? 'При q = 1: Sn = b1 * n' : 'Формула суммы: Sn = b1 * (q^n - 1) / (q - 1):',
      math: `S_{${n}} = ${formatNum(sn)}`,
    },
  ];

  return {
    solutionFound: true,
    steps,
    answer: `b_{${n}} = ${formatNum(bn)}, \\quad S_{${n}} = ${formatNum(sn)}`,
  };
}
