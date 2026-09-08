import { createServer } from "node:http";
import {
  mkdir, readFile, rename, writeFile,
} from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSceneAnnotations } from "../../js/sceneAnnotations.js";
import { validateSceneCatalog } from "./sceneCatalog.js";

const OFFICE_ROOT = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const CATALOG_PATH = resolve(OFFICE_ROOT, "data/scene-catalog.json");
const PORT = Number(process.env.WAREWOLF_CATALOGUE_PORT ?? 8766);
const MAX_REQUEST_BYTES = 20 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function insideOffice(relativePath) {
  const path = resolve(OFFICE_ROOT, relativePath.replace(/^\/+/, ""));
  const isInside = path === OFFICE_ROOT
    || path.startsWith(`${OFFICE_ROOT}${sep}`);
  if (!isInside) throw new Error("Path leaves the office directory.");
  return path;
}

function slug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "")) {
    throw new Error("IDs use lowercase letters, numbers, and hyphens.");
  }
  return value;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

function pngSize(bytes) {
  const signature = bytes.subarray(0, PNG_SIGNATURE.length);
  if (!signature.equals(PNG_SIGNATURE) || bytes.length < 24) {
    throw new Error("Mask must be a PNG image.");
  }
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

function decodePng(dataUrl) {
  const match = /^data:image\/png;base64,([a-zA-Z0-9+/=]+)$/.exec(
    String(dataUrl ?? "")
  );
  if (!match) throw new Error("Mask must be a base64 PNG data URL.");
  const bytes = Buffer.from(match[1], "base64");
  pngSize(bytes);
  return bytes;
}

function sceneReferences(scene) {
  return (scene.effectBindings ?? []).map(binding => ({
    id: binding.annotation,
    kind: binding.kind,
    owner: `Effect binding ${binding.id}`,
  }));
}

function validateScene(scene) {
  validateSceneAnnotations(
    scene,
    scene.hotspots ?? [],
    sceneReferences(scene)
  );
}

async function workspace() {
  const catalog = validateSceneCatalog(await readJson(CATALOG_PATH));
  const scenes = await Promise.all(catalog.scenes.map(async entry => ({
    entry,
    definition: await readJson(insideOffice(entry.definition)),
  })));
  return { catalog, scenes };
}

async function catalogEntry(sceneId) {
  const catalog = validateSceneCatalog(await readJson(CATALOG_PATH));
  const entry = catalog.scenes.find(scene => scene.id === sceneId);
  if (!entry) throw new Error(`Unknown scene: ${sceneId}`);
  return entry;
}

async function saveScene(payload) {
  const entry = await catalogEntry(payload.sceneId);
  validateScene(payload.definition);
  await writeJson(insideOffice(entry.definition), payload.definition);
  return { saved: entry.definition };
}

async function saveMask(payload) {
  const entry = await catalogEntry(payload.sceneId);
  const annotationId = slug(payload.annotationId);
  const bounds = payload.bounds?.map(Number);
  const validBounds = bounds?.length === 4
    && bounds.every(Number.isFinite)
    && bounds[0] >= 0
    && bounds[1] >= 0
    && bounds[2] > 0
    && bounds[3] > 0;
  if (!validBounds) throw new Error("Mask bounds must be positive numbers.");

  const bytes = decodePng(payload.image);
  const size = pngSize(bytes);
  if (size[0] !== bounds[2] || size[1] !== bounds[3]) {
    throw new Error("Mask PNG dimensions must match its width and height.");
  }

  const folder = `assets/interaction-masks/${slug(entry.id)}`;
  const relativePath = `${folder}/${annotationId}.png`;
  const path = insideOffice(relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);

  const definitionPath = insideOffice(entry.definition);
  const definition = await readJson(definitionPath);
  definition.annotations ??= {};
  definition.annotations[annotationId] = {
    kind: "object",
    mask: relativePath,
    bounds,
  };
  validateScene(definition);
  await writeJson(definitionPath, definition);
  return { definition, saved: relativePath };
}

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, { "content-type": type });
  response.end(body);
}

function sendJson(response, status, value) {
  send(response, status, JSON.stringify(value), TYPES[".json"]);
}

async function requestJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sameOrigin(request) {
  if (!request.headers.origin) return true;
  return new URL(request.headers.origin).host === request.headers.host;
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/workspace") {
    sendJson(response, 200, await workspace());
    return true;
  }
  if (request.method !== "POST") return false;
  if (!sameOrigin(request)) {
    send(response, 403, "Cross-origin writes are not allowed.");
    return true;
  }
  const handlers = new Map([
    ["/api/scene", saveScene],
    ["/api/mask", saveMask],
  ]);
  const handler = handlers.get(url.pathname);
  if (!handler) return false;
  sendJson(response, 200, await handler(await requestJson(request)));
  return true;
}

async function handleStatic(response, url) {
  let relativePath = decodeURIComponent(url.pathname);
  if (relativePath === "/") {
    relativePath = "/tools/scene-catalogue/index.html";
  }
  const path = insideOffice(relativePath);
  const type = TYPES[extname(path)] ?? "application/octet-stream";
  send(response, 200, await readFile(path), type);
}

export const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (await handleApi(request, response, url)) return;
    await handleStatic(response, url);
  } catch (error) {
    send(response, error.code === "ENOENT" ? 404 : 400, error.message);
  }
});

const isMain = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Scene catalogue: http://127.0.0.1:${PORT}/`);
  });
}
