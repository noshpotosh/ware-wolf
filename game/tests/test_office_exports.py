"""Protect highlights while removing neutral edge matte artifacts."""

import importlib.util
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

GAME_ROOT = Path(__file__).resolve().parents[1]
EXPORTER_PATH = GAME_ROOT / "tools/export_office_art.py"
SPEC = importlib.util.spec_from_file_location("office_export", EXPORTER_PATH)
EXPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(EXPORTER)
MAGICK = shutil.which("magick")


@unittest.skipUnless(MAGICK, "ImageMagick is required")
class OfficeExportsTest(unittest.TestCase):
    def test_matte_cleanup_preserves_interior_and_colored_highlights(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source"
            output = root / "output"
            source.mkdir()
            output.mkdir()
            subprocess.run([
                MAGICK, "-size", "5x5", "xc:none",
                "-fill", "#443322", "-draw", "rectangle 1,1 3,3",
                "-fill", "white", "-draw", "point 1,2 point 2,2",
                "-fill", "#fff0ca", "-draw", "point 3,2",
                str(source / "fixture.png"),
            ], check=True)
            EXPORTER.SOURCE_ROOT = source
            EXPORTER.OUTPUT_ROOT = output
            recipe = {
                "id": "fixture", "size": [5, 5], "trim": False,
                "remove_edge_matte": True,
            }
            first = EXPORTER.export_asset(MAGICK, recipe)
            image = output / "fixture.png"
            self.assertEqual(self.alpha(image, 1, 2), 0)
            self.assertEqual(self.alpha(image, 2, 2), 1)
            self.assertEqual(self.alpha(image, 3, 2), 1)
            second = EXPORTER.export_asset(MAGICK, recipe)
            self.assertEqual(first["output_sha256"], second["output_sha256"])

    def alpha(self, image, x, y):
        result = subprocess.check_output([
            MAGICK, str(image), "-format", f"%[fx:p{{{x},{y}}}.a]", "info:",
        ], text=True)
        return float(result)


if __name__ == "__main__":
    unittest.main()
