const EPSILON = 1e-8;

export function fitScene(
  sceneWidth,
  sceneHeight,
  viewportWidth,
  viewportHeight,
  fit = "contain"
) {
  const widthScale = viewportWidth / sceneWidth;
  const heightScale = viewportHeight / sceneHeight;
  const scale = fit === "cover"
    ? Math.max(widthScale, heightScale)
    : Math.min(widthScale, heightScale);
  const width = sceneWidth * scale;
  const height = sceneHeight * scale;

  return {
    scale,
    x: (viewportWidth - width) / 2,
    y: (viewportHeight - height) / 2,
    width,
    height,
  };
}

function solveLinearSystem(matrix, values) {
  const size = values.length;
  const rows = matrix.map((row, index) => [...row, values[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
        pivot = row;
      }
    }
    if (Math.abs(rows[pivot][column]) < EPSILON) {
      throw new Error("Surface corners form a degenerate quadrilateral.");
    }

    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let index = column; index <= size; index += 1) {
      rows[column][index] /= divisor;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let index = column; index <= size; index += 1) {
        rows[row][index] -= factor * rows[column][index];
      }
    }
  }

  return rows.map(row => row[size]);
}

export function surfaceHomography(width, height, corners) {
  if (width <= 0 || height <= 0 || corners.length !== 4) {
    throw new Error("A surface needs a positive size and four corners.");
  }

  const sources = [[0, 0], [width, 0], [width, height], [0, height]];
  const matrix = [];
  const values = [];

  for (let index = 0; index < sources.length; index += 1) {
    const [x, y] = sources[index];
    const [targetX, targetY] = corners[index];
    matrix.push([x, y, 1, 0, 0, 0, -x * targetX, -y * targetX]);
    values.push(targetX);
    matrix.push([0, 0, 0, x, y, 1, -x * targetY, -y * targetY]);
    values.push(targetY);
  }

  const [a, b, c, d, e, f, g, h] = solveLinearSystem(matrix, values);
  return { a, b, c, d, e, f, g, h };
}

export function projectPoint(homography, x, y) {
  const { a, b, c, d, e, f, g, h } = homography;
  const denominator = g * x + h * y + 1;
  if (Math.abs(denominator) < EPSILON) {
    throw new Error("Surface projection reached an invalid point.");
  }
  return [
    (a * x + b * y + c) / denominator,
    (d * x + e * y + f) / denominator,
  ];
}

export function cssMatrix3d(homography) {
  const { a, b, c, d, e, f, g, h } = homography;
  return [
    a, d, 0, g,
    b, e, 0, h,
    0, 0, 1, 0,
    c, f, 0, 1,
  ].join(",");
}
