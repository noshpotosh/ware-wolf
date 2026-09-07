"""Export the founder kit deterministically with ImageMagick."""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess

GAME_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = GAME_ROOT / "art-source/office"
OUTPUT_ROOT = GAME_ROOT / "assets/office"

# ImageMagick evaluates these predicates against the unmodified source.
MATTE_MIN_BRIGHTNESS = 0.84
MATTE_MAX_COLOR_SPREAD = 0.08
TRANSPARENT_ALPHA_CUTOFF = 0.5
DARKEST_CHANNEL = "min(r,min(g,b))"
BRIGHTEST_CHANNEL = "max(r,max(g,b))"
NEIGHBOR_ALPHA_MIN = (
    "min(p[-1,0].a,min(p[1,0].a,min(p[0,-1].a,p[0,1].a)))"
)
IS_BRIGHT = f"{DARKEST_CHANNEL}>{MATTE_MIN_BRIGHTNESS}"
IS_NEUTRAL = (
    f"{BRIGHTEST_CHANNEL}-{DARKEST_CHANNEL}<{MATTE_MAX_COLOR_SPREAD}"
)
TOUCHES_TRANSPARENCY = f"{NEIGHBOR_ALPHA_MIN}<{TRANSPARENT_ALPHA_CUTOFF}"
EDGE_MATTE_ALPHA = (
    f"{IS_BRIGHT} && {IS_NEUTRAL} && {TOUCHES_TRANSPARENCY} ? 0 : a"
)


def export_asset(command, asset):
    source = SOURCE_ROOT / asset.get("source", f"{asset['id']}.png")
    output = OUTPUT_ROOT / f"{asset['id']}.png"
    width, height = asset["size"]
    arguments = [command, str(source)]
    if asset.get("trim", True):
        arguments.extend(["-trim", "+repage"])
    arguments.extend([
        "-filter", "Point", "-resize", f"{width}x{height}!",
        "-channel", "A", "-threshold", "50%", "+channel",
    ])
    if asset.get("remove_edge_matte", False):
        arguments.extend(["-channel", "A", "-fx", EDGE_MATTE_ALPHA,
                          "+channel"])
    arguments.extend(["-strip", f"PNG32:{output}"])
    subprocess.run(arguments, check=True)
    return {
        "id": asset["id"],
        "source": source.name,
        "edge_matte_removed": asset.get("remove_edge_matte", False),
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "output_sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "size": asset["size"],
    }


def main():
    command = shutil.which("magick") or shutil.which("convert")
    if not command:
        raise SystemExit("ImageMagick is required to rebuild the office kit")
    recipes = json.loads((SOURCE_ROOT / "exports.json").read_text())
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    results = [export_asset(command, asset) for asset in recipes["assets"]]
    provenance = {"version": 1, "filter": "Point", "assets": results}
    (OUTPUT_ROOT / "provenance.json").write_text(
        json.dumps(provenance, indent=2) + "\n"
    )
    print(f"OFFICE_ART_OK {len(results)} assets")


if __name__ == "__main__":
    main()
