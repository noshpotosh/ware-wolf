import { drawSprite } from "./sprites.js";

export function drawPortrait(canvas, staffId) {
  const portraitSize = 192;

  canvas.width = portraitSize;
  canvas.height = portraitSize;
  drawSprite(
    canvas.getContext("2d"),
    `${staffId}-portrait`,
    0,
    0,
    portraitSize,
    portraitSize
  );
}
