// Generator for JSXGraph dynamic geometry constructions and problem presets

export function createManagedAngle(board: any, points: any[], attributes: Record<string, any> = {}) {
  const settings = board.__geometryAngleSettings ?? { showValues: true, radius: 0.8 };
  const labelAngle = () => {
    const [start, vertex, end] = points;
    const firstX = start.X() - vertex.X();
    const firstY = start.Y() - vertex.Y();
    const secondX = end.X() - vertex.X();
    const secondY = end.Y() - vertex.Y();
    const firstLength = Math.hypot(firstX, firstY);
    const secondLength = Math.hypot(secondX, secondY);
    if (!firstLength || !secondLength) return '0.0°';

    const cosine = (firstX * secondX + firstY * secondY) / (firstLength * secondLength);
    const radians = Math.acos(Math.max(-1, Math.min(1, cosine)));
    return `${(radians * 180 / Math.PI).toFixed(1)}°`;
  };
  const getLabelPosition = () => {
    const [start, vertex, end] = points;
    const firstX = start.X() - vertex.X();
    const firstY = start.Y() - vertex.Y();
    const secondX = end.X() - vertex.X();
    const secondY = end.Y() - vertex.Y();
    const firstLength = Math.hypot(firstX, firstY);
    const secondLength = Math.hypot(secondX, secondY);
    const bisectorX = firstX / firstLength + secondX / secondLength;
    const bisectorY = firstY / firstLength + secondY / secondLength;
    const bisectorLength = Math.hypot(bisectorX, bisectorY);
    if (!bisectorLength) return [vertex.X(), vertex.Y()];

    const labelRadius = (board.__geometryAngleSettings?.radius ?? settings.radius) * 0.58;
    return [
      vertex.X() + (bisectorX / bisectorLength) * labelRadius,
      vertex.Y() + (bisectorY / bisectorLength) * labelRadius,
    ];
  };
  const angle = board.create('angle', points, {
    ...attributes,
    radius: settings.radius,
    withLabel: false,
  });
  angle.__angleValueLabel = board.create(
    'text',
    [() => getLabelPosition()[0], () => getLabelPosition()[1], labelAngle],
    {
      anchorX: 'middle',
      anchorY: 'middle',
      fixed: true,
      fontSize: 12,
      highlight: false,
      strokeColor: attributes.strokeColor ?? '#334155',
      visible: settings.showValues,
    }
  );
  return angle;
}

export function setBoardAngleSettings(board: any, showValues: boolean, radius: number) {
  if (!board) return;

  board.__geometryAngleSettings = { showValues, radius };
  Object.values(board.objects ?? {}).forEach((element: any) => {
    if (element.elType === 'angle') {
      element.setAttribute({ radius, withLabel: false });
      element.__angleValueLabel?.setAttribute({ visible: showValues });
    }
  });
  board.update();
}

function createAxisRay(board: any, origin: any, horizontal: boolean, directionSign = 1) {
  const directionPoint = board.create(
    'point',
    [
      () => origin.X() + (horizontal ? directionSign : 0),
      () => origin.Y() + (horizontal ? 0 : directionSign),
    ],
    { visible: false, fixed: true }
  );
  return board.create('line', [origin, directionPoint], { visible: false, straightFirst: false });
}

function createForwardRay(board: any, origin: any, direction: any) {
  const endpoint = board.create(
    'point',
    [() => origin.X() + direction[0](), () => origin.Y() + direction[1]()],
    { visible: false, fixed: true }
  );
  return board.create('line', [origin, endpoint], { visible: false, straightFirst: false });
}

function createRightTriangleVertices(board: any, cPosition: [number, number], bPosition: [number, number], aPosition: [number, number]) {
  const C = board.create('point', cPosition, { name: 'C (90°)', size: 4, color: '#ef4444' });
  const baseLine = createAxisRay(board, C, true);
  const perpendicular = createAxisRay(board, C, false);
  const B = board.create('glider', [...bPosition, baseLine], { name: 'B', size: 4, color: '#3b82f6' });
  const A = board.create('glider', [...aPosition, perpendicular], { name: 'A', size: 4, color: '#3b82f6' });
  return { A, B, C };
}

export function setupPresetOnBoard(presetId: string, board: any): string {
  if (!board) return '';

  switch (presetId) {
    case 'circumscribed': {
      const A = board.create('point', [-4, -3], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [4, -3], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [0, 4], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      board.create('circumcircle', [A, B, C], {
        strokeColor: '#06b6d4',
        strokeWidth: 2,
        dash: 1,
        center: { name: 'O (Описан.)', color: '#06b6d4', size: 3 },
      });

      board.create('incircle', [A, B, C], {
        strokeColor: '#ec4899',
        strokeWidth: 2,
        center: { name: 'I (Вписан.)', color: '#ec4899', size: 3 },
      });
      return 'Вписанная (розовая) и описанная (голубая) окружности треугольника ABC. Подвигайте вершины!';
    }

    case 'pythagoras': {
      const { A, B, C } = createRightTriangleVertices(board, [0, 0], [4, 0], [0, 3]);

      createManagedAngle(board, [B, C, A], { radius: 0.6, type: 'square' });

      board.create('polygon', [C, B, A], {
        fillColor: 'rgba(59, 130, 246, 0.1)',
        borders: { strokeWidth: 3, strokeColor: '#3b82f6' },
      });

      board.create(
        'text',
        [
          -2,
          5,
          () => {
            const a = C.Dist(B);
            const b = C.Dist(A);
            const c = B.Dist(A);
            return `Катеты: a = ${a.toFixed(2)}, b = ${b.toFixed(2)}<br>Гипотенуза: c = ${c.toFixed(2)}<br>c² = ${(c * c).toFixed(1)}, a² + b² = ${(a * a + b * b).toFixed(1)}`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Теорема Пифагора: квадрат гипотенузы равен сумме квадратов катетов (c² = a² + b²).';
    }

    case 'right_triangle_height': {
      const { A, B, C } = createRightTriangleVertices(board, [0, 0], [5, 0], [0, 4]);

      createManagedAngle(board, [B, C, A], { radius: 0.6, type: 'square' });
      board.create('polygon', [C, B, A], {
        fillColor: 'rgba(59, 130, 246, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#3b82f6' },
      });

      // Hypotenuse line
      const hyp = board.create('line', [A, B], { visible: false });
      // Perpendicular from C to AB
      const perp = board.create('perpendicular', [hyp, C], { visible: false });
      const H = board.create('intersection', [hyp, perp], { name: 'H', size: 3, color: '#10b981' });
      board.create('segment', [C, H], { strokeColor: '#10b981', strokeWidth: 2.5, dash: 2 });
      createManagedAngle(board, [B, H, C], { radius: 0.5, type: 'square' });

      board.create(
        'text',
        [
          -3,
          5,
          () => {
            const h = C.Dist(H);
            const ah = A.Dist(H);
            const hb = H.Dist(B);
            return `Высота к гипотенузе CH = ${h.toFixed(2)}<br>Проекции: AH = ${ah.toFixed(2)}, HB = ${hb.toFixed(2)}<br>CH² = ${(h * h).toFixed(1)}, AH · HB = ${(ah * hb).toFixed(1)}`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Свойство высоты прямоугольного треугольника: CH² = AH · HB.';
    }

    case 'isosceles_triangle': {
      const A = board.create('point', [-3.5, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [3.5, -2], { name: 'B', size: 4, color: '#4f46e5' });
      // C is on perpendicular bisector of AB
      board.create('segment', [A, B], { visible: false });
      const mid = board.create('midpoint', [A, B], { name: 'H', size: 3, color: '#10b981' });
      const baseLine = board.create('line', [A, B], { visible: false });
      const perpendicular = board.create('perpendicular', [baseLine, mid], { visible: false });
      const C = board.create('glider', [0, 4, perpendicular], { name: 'C', size: 4, color: '#ec4899' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(236, 72, 153, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#ec4899' },
      });

      // Altitude CH
      board.create('segment', [C, mid], { strokeColor: '#10b981', strokeWidth: 2.5, dash: 2 });
      createManagedAngle(board, [B, mid, C], { radius: 0.5, type: 'square' });

      board.create(
        'text',
        [
          -3,
          5,
          () => {
            const ac = A.Dist(C);
            const bc = B.Dist(C);
            return `Боковые стороны: AC = ${ac.toFixed(2)}, BC = ${bc.toFixed(2)}<br>Высота CH делит основание пополам: AH = ${(A.Dist(mid)).toFixed(2)}, HB = ${(B.Dist(mid)).toFixed(2)}`;
          },
        ],
        { fontSize: 13 }
      );
      return 'В равнобедренном треугольнике высота, проведенная к основанию, является медианой и биссектрисой!';
    }

    case 'equilateral_triangle': {
      const A = board.create('point', [-3, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [3, -2], { name: 'B', size: 4, color: '#4f46e5' });
      const mid = board.create('midpoint', [A, B], { visible: false });
      const heightPoint = board.create(
        'point',
        [
          () => mid.X() - ((B.Y() - A.Y()) * Math.sqrt(3)) / 2,
          () => mid.Y() + ((B.X() - A.X()) * Math.sqrt(3)) / 2,
        ],
        { visible: false, fixed: true }
      );
      const locus = board.create('circle', [mid, heightPoint], { visible: false });
      const C = board.create('glider', [0, -2 + 3 * Math.sqrt(3), locus], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.1)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      // Angles
      createManagedAngle(board, [B, A, C], { radius: 0.8 });
      createManagedAngle(board, [C, B, A], { radius: 0.8 });
      createManagedAngle(board, [A, C, B], { radius: 0.8 });

      return 'Правильный треугольник: все 3 стороны равны, все 3 угла равны 60°.';
    }

    case 'midline_triangle': {
      const A = board.create('point', [-4, -3], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [4, -3], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [-1, 4], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      const M = board.create('midpoint', [A, C], { name: 'M', size: 3, color: '#f59e0b' });
      const N = board.create('midpoint', [B, C], { name: 'N', size: 3, color: '#f59e0b' });
      board.create('segment', [M, N], { strokeColor: '#f59e0b', strokeWidth: 3 });

      board.create(
        'text',
        [
          -3,
          5,
          () => {
            const mn = M.Dist(N);
            const ab = A.Dist(B);
            return `Средняя линия MN = ${mn.toFixed(2)}<br>Основание AB = ${ab.toFixed(2)}<br>Отношение: AB / MN = ${(ab / mn).toFixed(2)} (строго 2.00)`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Средняя линия треугольника параллельна основанию и равна его половине: MN = ½ AB.';
    }

    case 'medians': {
      const A = board.create('point', [-5, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [5, -2], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [1, 5], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      const M_c = board.create('midpoint', [A, B], { name: 'C1', size: 2, color: '#10b981' });
      const M_a = board.create('midpoint', [B, C], { name: 'A1', size: 2, color: '#10b981' });
      const M_b = board.create('midpoint', [A, C], { name: 'B1', size: 2, color: '#10b981' });

      board.create('segment', [C, M_c], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });
      board.create('segment', [A, M_a], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });
      board.create('segment', [B, M_b], { strokeColor: '#10b981', dash: 2, strokeWidth: 2 });

      const l1 = board.create('line', [C, M_c], { visible: false });
      const l2 = board.create('line', [A, M_a], { visible: false });
      const M = board.create('intersection', [l1, l2], {
        name: 'M (Центроид, 2:1)',
        color: '#f59e0b',
        size: 4,
      });

      board.create(
        'text',
        [
          -4,
          -4,
          () => {
            const cm = C.Dist(M);
            const mc1 = M.Dist(M_c);
            return `CM = ${cm.toFixed(2)}, MC1 = ${mc1.toFixed(2)}<br>Отношение CM / MC1 = ${(cm / mc1).toFixed(2)} (равно 2:1)`;
          },
        ],
        { fontSize: 13 }
      );

      return 'Медианы треугольника пересекаются в одной точке M и делятся ею в отношении 2:1 от вершины.';
    }

    case 'altitudes_orthocenter': {
      const A = board.create('point', [-4, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [4, -2], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [0, 4], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      const lAB = board.create('line', [A, B], { visible: false });
      const lBC = board.create('line', [B, C], { visible: false });
      const lAC = board.create('line', [A, C], { visible: false });

      const hC = board.create('perpendicular', [lAB, C], { strokeColor: '#ef4444', strokeWidth: 2, dash: 2 });
      const hA = board.create('perpendicular', [lBC, A], { strokeColor: '#ef4444', strokeWidth: 2, dash: 2 });
      board.create('perpendicular', [lAC, B], { strokeColor: '#ef4444', strokeWidth: 2, dash: 2 });


      board.create('intersection', [hC, hA], {
        name: 'H (Ортоцентр)',
        color: '#ef4444',
        size: 4,
      });
      return 'Высоты треугольника всегда пересекаются в одной точке — ортоцентре H.';
    }

    case 'bisectors_incenter': {
      const A = board.create('point', [-4, -3], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [4, -3], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [-0.5, 4], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      board.create('bisector', [B, A, C], { strokeColor: '#8b5cf6', strokeWidth: 2, dash: 2 });
      board.create('bisector', [A, B, C], { strokeColor: '#8b5cf6', strokeWidth: 2, dash: 2 });
      board.create('bisector', [A, C, B], { strokeColor: '#8b5cf6', strokeWidth: 2, dash: 2 });

      board.create('incircle', [A, B, C], {
        strokeColor: '#ec4899',
        strokeWidth: 2,
        center: { name: 'I (Инцентр)', color: '#ec4899', size: 4 },
      });
      return 'Биссектрисы углов треугольника пересекаются в центре вписанной окружности (инцентре I).';
    }

    case 'trapezoid_midline': {
      const A = board.create('point', [-4, -2.5], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [4, -2.5], { name: 'B', size: 4, color: '#4f46e5' });
      const D = board.create('point', [-2.5, 2.5], { name: 'D', size: 4, color: '#4f46e5' });
      const parallel = createForwardRay(board, D, [() => B.X() - A.X(), () => B.Y() - A.Y()]);
      const C = board.create('glider', [2.5, 2.5, parallel], { name: 'C', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C, D], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      const M = board.create('midpoint', [A, D], { name: 'M', size: 3, color: '#f59e0b' });
      const N = board.create('midpoint', [B, C], { name: 'N', size: 3, color: '#f59e0b' });
      board.create('segment', [M, N], { strokeColor: '#f59e0b', strokeWidth: 3 });

      board.create(
        'text',
        [
          -3,
          4,
          () => {
            const mn = M.Dist(N);
            const ab = A.Dist(B);
            const cd = D.Dist(C);
            return `Нижнее основание AB = ${ab.toFixed(2)}, Верхнее CD = ${cd.toFixed(2)}<br>Средняя линия MN = ${mn.toFixed(2)}<br>Полусумма оснований (AB + CD)/2 = ${((ab + cd) / 2).toFixed(2)}`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Средняя линия трапеции параллельна основаниям и равна их полусумме: MN = (AB + CD) / 2.';
    }

    case 'parallelogram_diagonals': {
      const A = board.create('point', [-4, -2], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('point', [2, -2], { name: 'B', size: 4, color: '#4f46e5' });
      const D = board.create('point', [-2, 2], { name: 'D', size: 4, color: '#4f46e5' });
      // C determined to preserve parallelogram
      const C = board.create(
        'point',
        [() => B.X() + (D.X() - A.X()), () => B.Y() + (D.Y() - A.Y())],
        { name: 'C', size: 4, color: '#4f46e5' }
      );

      board.create('polygon', [A, B, C, D], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      // Diagonals AC and BD
      board.create('segment', [A, C], { strokeColor: '#ec4899', strokeWidth: 2, dash: 2 });
      board.create('segment', [B, D], { strokeColor: '#06b6d4', strokeWidth: 2, dash: 2 });

      const O = board.create('midpoint', [A, C], { name: 'O (Центр)', size: 3, color: '#f59e0b' });


      board.create(
        'text',
        [
          -4,
          4,
          () => {
            const ao = A.Dist(O);
            const oc = O.Dist(C);
            const bo = B.Dist(O);
            const od = O.Dist(D);
            return `AO = ${ao.toFixed(2)}, OC = ${oc.toFixed(2)}<br>BO = ${bo.toFixed(2)}, OD = ${od.toFixed(2)}<br>Диагонали точкой O делятся строго пополам!`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Диагонали параллелограмма пересекаются и точкой пересечения делятся пополам (AO = OC, BO = OD).';
    }

    case 'rhombus_diagonals': {
      const O = board.create('point', [0, 0], { name: 'O', size: 3, color: '#94a3b8' });
      const horizontal = createAxisRay(board, O, true, -1);
      const vertical = createAxisRay(board, O, false);
      const A = board.create('glider', [-4, 0, horizontal], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('glider', [0, 2.5, vertical], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('point', [() => 2 * O.X() - A.X(), () => 2 * O.Y() - A.Y()], { name: 'C', size: 4, color: '#4f46e5' });
      const D = board.create('point', [() => 2 * O.X() - B.X(), () => 2 * O.Y() - B.Y()], { name: 'D', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C, D], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
      });

      board.create('segment', [A, C], { strokeColor: '#ef4444', strokeWidth: 2 });
      board.create('segment', [B, D], { strokeColor: '#ef4444', strokeWidth: 2 });
      createManagedAngle(board, [C, O, B], { radius: 0.6, type: 'square' });

      return 'Диагонали ромба взаимно перпендикулярны (AC ⊥ BD) и делят его углы пополам.';
    }

    case 'inscribed_central_angle': {
      const O = board.create('point', [0, 0], { name: 'O (Центр)', size: 4, color: '#f59e0b' });
      const circle = board.create('circle', [O, 4], { strokeColor: '#3b82f6', strokeWidth: 2.5 });


      const A = board.create('glider', [4 * Math.cos(-0.6), 4 * Math.sin(-0.6), circle], { name: 'A', size: 3, color: '#4f46e5' });
      const B = board.create('glider', [4 * Math.cos(1.2), 4 * Math.sin(1.2), circle], { name: 'B', size: 3, color: '#4f46e5' });
      const allowedArc = board.create('arc', [O, B, A], { visible: false });
      const C = board.create('glider', [4 * Math.cos(2.8), 4 * Math.sin(2.8), allowedArc], { name: 'C (Вписанный)', size: 4, color: '#ec4899' });

      // Central angle AOB
      board.create('segment', [O, A], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });
      board.create('segment', [O, B], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });
      const angleCentral = createManagedAngle(board, [A, O, B], {
        fillColor: 'rgba(245, 158, 11, 0.25)',
        strokeColor: '#f59e0b',
      });

      // Inscribed angle ACB
      board.create('segment', [C, A], { strokeColor: '#ec4899', strokeWidth: 2.5 });
      board.create('segment', [C, B], { strokeColor: '#ec4899', strokeWidth: 2.5 });
      const angleInscribed = createManagedAngle(board, [A, C, B], {
        fillColor: 'rgba(236, 72, 153, 0.25)',
        strokeColor: '#ec4899',
      });

      board.create(
        'text',
        [
          -4,
          5,
          () => {
            const radInsc = angleInscribed.Value();
            const radCent = angleCentral.Value();
            const degInsc = (radInsc * 180 / Math.PI).toFixed(1);
            const degCent = (radCent * 180 / Math.PI).toFixed(1);
            return `Вписанный угол ∠ACB = ${degInsc}°<br>Центральный угол ∠AOB = ${degCent}°<br>∠AOB = 2 · ∠ACB (ровно в 2 раза больше!)`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Теорема о вписанном угле: вписанный угол равен половине центрального угла, опирающегося на ту же дугу.';
    }

    case 'tangent_radius': {
      const O = board.create('point', [0, 0], { name: 'O', size: 4, color: '#f59e0b' });
      const circle = board.create('circle', [O, 3.5], { strokeColor: '#3b82f6', strokeWidth: 2.5 });
      const T = board.create('glider', [0, 3.5, circle], { name: 'T (Точка касания)', size: 4, color: '#ec4899' });


      // Radius OT
      board.create('segment', [O, T], { strokeColor: '#f59e0b', strokeWidth: 2.5 });

      // Tangent line at T
      const lineOT = board.create('line', [O, T], { visible: false });
      board.create('perpendicular', [lineOT, T], {
        name: 'Касательная',
        strokeColor: '#10b981',
        strokeWidth: 3,
        withLabel: true,
      });


      const P = board.create(
        'point',
        [() => T.X() + T.Y() - O.Y(), () => T.Y() - T.X() + O.X()],
        { visible: false, fixed: true }
      );
      createManagedAngle(board, [P, T, O], { radius: 0.6, type: 'square' });

      return 'Касательная к окружности всегда строго перпендикулярна радиусу, проведенному в точку касания (R ⊥ l).';
    }

    case 'two_tangents': {
      const O = board.create('point', [0, 0], { name: 'O', size: 4, color: '#f59e0b' });
      const circ = board.create('circle', [O, 3], { strokeColor: '#3b82f6', strokeWidth: 2.5 });
      const exteriorCircle = board.create('circle', [O, 5], { visible: false });
      const M = board.create('glider', [5, 0, exteriorCircle], { name: 'M', size: 4, color: '#4f46e5' });

      // Tangent points from M
      board.create('segment', [O, M], { strokeColor: '#94a3b8', strokeWidth: 2, dash: 2 });
      const midOM = board.create('midpoint', [O, M], { visible: false });

      const thalesCirc = board.create('circle', [midOM, () => O.Dist(M) / 2], { visible: false });

      const inters = board.create('intersection', [circ, thalesCirc, 0], { name: 'A', size: 3, color: '#ec4899' });
      const inters2 = board.create('intersection', [circ, thalesCirc, 1], { name: 'B', size: 3, color: '#ec4899' });

      board.create('segment', [M, inters], { strokeColor: '#10b981', strokeWidth: 2.5 });
      board.create('segment', [M, inters2], { strokeColor: '#10b981', strokeWidth: 2.5 });
      board.create('segment', [O, inters], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });
      board.create('segment', [O, inters2], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });

      board.create(
        'text',
        [
          -4,
          4,
          () => {
            const ma = M.Dist(inters);
            const mb = M.Dist(inters2);
            return `Отрезки касательных:<br>MA = ${ma.toFixed(2)}, MB = ${mb.toFixed(2)}<br>MA = MB (отрезки равны!)`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Отрезки касательных к окружности, проведенных из одной точки, равны (MA = MB).';
    }

    case 'cyclic_quad': {
      const O = board.create('point', [0, 0], { name: 'O', size: 3, color: '#f59e0b' });
      const circle = board.create('circle', [O, 4], { strokeColor: '#3b82f6', strokeWidth: 2 });

      const A = board.create('glider', [-3.8, -1.2, circle], { name: 'A', size: 4, color: '#4f46e5' });
      const B = board.create('glider', [1.5, -3.7, circle], { name: 'B', size: 4, color: '#4f46e5' });
      const C = board.create('glider', [3.9, 0.9, circle], { name: 'C', size: 4, color: '#4f46e5' });
      const D = board.create('glider', [-1.2, 3.8, circle], { name: 'D', size: 4, color: '#4f46e5' });

      board.create('polygon', [A, B, C, D], {
        fillColor: 'rgba(79, 70, 229, 0.08)',
        borders: { strokeWidth: 2.5, strokeColor: '#4f46e5' },
      });

      const angA = createManagedAngle(board, [D, A, B], { radius: 0.8 });
      const angC = createManagedAngle(board, [B, C, D], { radius: 0.8 });

      board.create(
        'text',
        [
          -4,
          -4.5,
          () => {
            const aDeg = (angA.Value() * 180 / Math.PI).toFixed(1);
            const cDeg = (angC.Value() * 180 / Math.PI).toFixed(1);
            return `∠A = ${aDeg}°, ∠C = ${cDeg}°<br>Сумма ∠A + ∠C = ${(parseFloat(aDeg) + parseFloat(cDeg)).toFixed(1)}° (строго 180°)`;
          },
        ],
        { fontSize: 13 }
      );
      return 'В любом вписанном четырехугольнике сумма противоположных углов равна 180°: ∠A + ∠C = 180°.';
    }

    case 'thales_theorem': {
      const O = board.create('point', [-5, -2], { name: 'O (Вершина)', size: 4, color: '#4f46e5' });
      const R1 = board.create('point', [5, 4], { name: 'Луч 1', size: 3, visible: false });
      const R2 = board.create('point', [5, -4], { name: 'Луч 2', size: 3, visible: false });

      board.create('line', [O, R1], { straightFirst: false, strokeColor: '#475569', strokeWidth: 2 });
      board.create('line', [O, R2], { straightFirst: false, strokeColor: '#475569', strokeWidth: 2 });

      // Parallel lines
      const ray1 = board.create('line', [O, R1], { visible: false, straightFirst: false });
      const ray2 = board.create('line', [O, R2], { visible: false, straightFirst: false });
      const A1 = board.create('glider', [-1.5, 0.45, ray1], { name: 'A1', size: 3, color: '#ec4899' });
      const B1 = board.create('glider', [-1.5, -3.0, ray2], { name: 'B1', size: 3, color: '#ec4899' });
      const l1 = board.create('line', [A1, B1], { strokeColor: '#ec4899', strokeWidth: 2.5 });

      const A2 = board.create('glider', [2, 2.2, ray1], { name: 'A2', size: 3, color: '#10b981' });
      const l2 = board.create('parallel', [l1, A2], { strokeColor: '#10b981', strokeWidth: 2.5 });
      const B2 = board.create('intersection', [l2, ray2], { name: 'B2', size: 3, color: '#10b981' });

      board.create(
        'text',
        [
          -4,
          4,
          () => {
            const oa1 = O.Dist(A1);
            const a1a2 = A1.Dist(A2);
            const ob1 = O.Dist(B1);
            const b1b2 = B1.Dist(B2);
            return `OA1 = ${oa1.toFixed(2)}, A1A2 = ${a1a2.toFixed(2)}<br>OB1 = ${ob1.toFixed(2)}, B1B2 = ${b1b2.toFixed(2)}<br>OA1 / A1A2 = ${(oa1 / a1a2).toFixed(2)}, OB1 / B1B2 = ${(ob1 / b1b2).toFixed(2)}`;
          },
        ],
        { fontSize: 13 }
      );
      return 'Теорема Фалеса: параллельные прямые отсекают на сторонах угла пропорциональные отрезки.';
    }

    default:
      return '';
  }
}

// BUILDERS FOR PROBLEM SOLVING (Параметрические конструкторы)
export function buildTriangleByParams(
  board: any,
  params: {
    type: 'right' | 'isosceles' | 'equilateral' | 'sides';
    a?: number;
    b?: number;
    c?: number;
    h?: number;
  }
): string {
  if (!board) return '';

  if (params.type === 'right') {
    const a = params.a || 6;
    const b = params.b || 8;
    // Scale down if large so fits in [-7, 7]
    const maxVal = Math.max(a, b);
    const scale = maxVal > 6 ? 6 / maxVal : 1;
    const scA = a * scale;
    const scB = b * scale;

    const { A, B, C } = createRightTriangleVertices(
      board,
      [-scB / 2, -scA / 2],
      [scB / 2, -scA / 2],
      [-scB / 2, scA / 2]
    );

    createManagedAngle(board, [B, C, A], { radius: 0.6, type: 'square' });
    board.create('polygon', [C, B, A], {
      fillColor: 'rgba(59, 130, 246, 0.08)',
      borders: { strokeWidth: 3, strokeColor: '#3b82f6' },
    });

    const hyp = Math.hypot(a, b);
    board.create(
      'text',
      [
        -5,
        5,
        `Прямоугольный треугольник ABC:<br>Катет BC = ${a}, Катет AC = ${b}<br>Гипотенуза AB = √( ${a}² + ${b}² ) = ${hyp.toFixed(2)}<br>Площадь S = ½ · ${a} · ${b} = ${(0.5 * a * b).toFixed(1)}`,
      ],
      { fontSize: 13 }
    );
    return `Построен прямоугольный треугольник с катетами ${a} и ${b}. Гипотенуза равна ${hyp.toFixed(2)}.`;
  }

  if (params.type === 'isosceles') {
    const base = params.a || 6;
    const height = params.h || 4;
    const scale = Math.max(base, height) > 6 ? 6 / Math.max(base, height) : 1;
    const scBase = base * scale;
    const scH = height * scale;

    const A = board.create('point', [-scBase / 2, -scH / 2], { name: 'A', size: 4, color: '#4f46e5' });
    const B = board.create('point', [scBase / 2, -scH / 2], { name: 'B', size: 4, color: '#4f46e5' });
    const H = board.create('midpoint', [A, B], { name: 'H', size: 3, color: '#10b981' });
    const baseLine = board.create('line', [A, B], { visible: false });
    const perpendicular = board.create('perpendicular', [baseLine, H], { visible: false });
    const C = board.create('glider', [0, scH / 2, perpendicular], { name: 'C', size: 4, color: '#ec4899' });

    board.create('polygon', [A, B, C], {
      fillColor: 'rgba(236, 72, 153, 0.08)',
      borders: { strokeWidth: 3, strokeColor: '#ec4899' },
    });

    board.create('segment', [C, H], { strokeColor: '#10b981', strokeWidth: 2.5, dash: 2 });
    createManagedAngle(board, [B, H, C], { radius: 0.5, type: 'square' });

    const side = Math.hypot(base / 2, height);
    board.create(
      'text',
      [
        -5,
        5,
        `Равнобедренный треугольник ABC:<br>Основание AB = ${base}, Высота CH = ${height}<br>Боковая сторона AC = BC = ${side.toFixed(2)}<br>Площадь S = ½ · ${base} · ${height} = ${(0.5 * base * height).toFixed(1)}`,
      ],
      { fontSize: 13 }
    );
    return `Построен равнобедренный треугольник с основанием ${base} и высотой ${height}.`;
  }

  if (params.type === 'sides') {
    const a = params.a || 5;
    const b = params.b || 6;
    const c = params.c || 7;

    if (a + b <= c || a + c <= b || b + c <= a) {
      alert('Неравенство треугольника нарушено: сумма любых двух сторон должна быть строго больше третьей!');
      return '';
    }

    const scale = Math.max(a, b, c) > 6 ? 6 / Math.max(a, b, c) : 1;
    const scaledA = a * scale;
    const scaledB = b * scale;
    const scaledC = c * scale;
    const A = board.create('point', [-scaledC / 2, -1], { name: 'A', size: 4, color: '#4f46e5' });
    const basePoint = board.create('point', [() => A.X() + scaledC, () => A.Y()], { visible: false, fixed: true });
    const baseCircle = board.create('circle', [A, basePoint], { visible: false });
    const B = board.create('glider', [scaledC / 2, -1, baseCircle], { name: 'B', size: 4, color: '#4f46e5' });
    const circleA = board.create('circle', [A, scaledB], { visible: false });
    const circleB = board.create('circle', [B, scaledA], { visible: false });
    const C = board.create('intersection', [circleA, circleB, 0], { name: 'C', size: 4, color: '#4f46e5' });

    board.create('polygon', [A, B, C], {
      fillColor: 'rgba(79, 70, 229, 0.08)',
      borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
    });

    // Heron's formula for area
    const p = (a + b + c) / 2;
    const S = Math.sqrt(p * (p - a) * (p - b) * (p - c));
    board.create(
      'text',
      [
        -5,
        5,
        `Треугольник по 3 сторонам:<br>a = ${a}, b = ${b}, c = ${c}<br>Полупериметр p = ${p}<br>Площадь по Герону S = ${S.toFixed(2)}`,
      ],
      { fontSize: 13 }
    );
    return `Построен треугольник со сторонами a = ${a}, b = ${b}, c = ${c}.`;
  }

  return '';
}

export function buildTrapezoidByParams(board: any, a: number, b: number, h: number): string {
  if (!board) return '';
  const scale = Math.max(a, b, h) > 6 ? 6 / Math.max(a, b, h) : 1;
  const scA = a * scale;
  const scB = b * scale;
  const scH = h * scale;

  const A = board.create('point', [-scA / 2, -scH / 2], { name: 'A', size: 4, color: '#4f46e5' });
  const B = board.create('point', [scA / 2, -scH / 2], { name: 'B', size: 4, color: '#4f46e5' });
  const D = board.create('point', [-scB / 2, scH / 2], { name: 'D', size: 4, color: '#4f46e5' });
  const parallel = createForwardRay(board, D, [() => B.X() - A.X(), () => B.Y() - A.Y()]);
  const C = board.create('glider', [scB / 2, scH / 2, parallel], { name: 'C', size: 4, color: '#4f46e5' });

  board.create('polygon', [A, B, C, D], {
    fillColor: 'rgba(79, 70, 229, 0.08)',
    borders: { strokeWidth: 3, strokeColor: '#4f46e5' },
  });

  const M = board.create('midpoint', [A, D], { name: 'M', size: 3, color: '#f59e0b' });
  const N = board.create('midpoint', [B, C], { name: 'N', size: 3, color: '#f59e0b' });
  board.create('segment', [M, N], { strokeColor: '#f59e0b', strokeWidth: 3 });

  const midline = (a + b) / 2;
  const S = midline * h;

  board.create(
    'text',
    [
      -5,
      5,
      `Трапеция ABCD:<br>Основания: a = ${a}, b = ${b}, высота h = ${h}<br>Средняя линия MN = (a + b)/2 = ${midline.toFixed(1)}<br>Площадь S = MN · h = ${S.toFixed(1)}`,
    ],
    { fontSize: 13 }
  );

  return `Построена трапеция с основаниями ${a} и ${b}, высотой ${h} и средней линией ${midline.toFixed(1)}.`;
}
