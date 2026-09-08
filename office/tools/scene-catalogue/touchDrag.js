function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function moveObject(touch, deltaX, deltaY, sceneSize) {
  const [x, y, width, height] = touch.bounds;
  return {
    ...touch,
    bounds: [
      clamp(x + deltaX, 0, sceneSize[0] - width),
      clamp(y + deltaY, 0, sceneSize[1] - height),
      width,
      height,
    ],
  };
}

function movePoint(touch, deltaX, deltaY, sceneSize) {
  return {
    ...touch,
    position: [
      clamp(touch.position[0] + deltaX, 0, sceneSize[0]),
      clamp(touch.position[1] + deltaY, 0, sceneSize[1]),
    ],
  };
}

function moveSurfaceCorner(
  touch,
  deltaX,
  deltaY,
  sceneSize,
  cornerIndex
) {
  const corners = touch.corners.map(point => [...point]);
  const corner = corners[cornerIndex];
  corner[0] = clamp(corner[0] + deltaX, 0, sceneSize[0]);
  corner[1] = clamp(corner[1] + deltaY, 0, sceneSize[1]);
  return { ...touch, corners };
}

function moveSurface(touch, deltaX, deltaY, sceneSize) {
  const xValues = touch.corners.map(point => point[0]);
  const yValues = touch.corners.map(point => point[1]);
  const minimumX = Math.min(...xValues);
  const maximumX = Math.max(...xValues);
  const minimumY = Math.min(...yValues);
  const maximumY = Math.max(...yValues);
  const safeX = clamp(deltaX, -minimumX, sceneSize[0] - maximumX);
  const safeY = clamp(deltaY, -minimumY, sceneSize[1] - maximumY);
  const corners = touch.corners.map(([x, y]) => [x + safeX, y + safeY]);
  return { ...touch, corners };
}

export function moveTouch(
  touch,
  deltaX,
  deltaY,
  sceneSize,
  cornerIndex = null
) {
  if (touch.kind === "object") {
    return moveObject(touch, deltaX, deltaY, sceneSize);
  }
  if (touch.kind === "point") {
    return movePoint(touch, deltaX, deltaY, sceneSize);
  }
  if (touch.kind === "surface" && cornerIndex !== null) {
    return moveSurfaceCorner(
      touch,
      deltaX,
      deltaY,
      sceneSize,
      cornerIndex
    );
  }
  if (touch.kind === "surface") {
    return moveSurface(touch, deltaX, deltaY, sceneSize);
  }
  throw new Error(`Unknown touch kind: ${touch.kind}`);
}
