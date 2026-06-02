import json
from pathlib import Path

from PIL import Image


def crop_box(
    size: tuple[int, int],
    panel: int,
    col: int,
    row: int,
    layout: dict,
) -> tuple[int, int, int, int]:
    pw, ph = size
    panels = int(layout.get("panels", 6))
    cols = int(layout.get("cols_per_panel", 3))
    rows = int(layout.get("rows_per_panel", 3))

    panel_w = pw / panels
    header_h = float(layout.get("header_h", 72))
    footer_h = float(layout.get("footer_h", 38))
    pad_x = float(layout.get("pad_x", 6))
    pad_y = float(layout.get("pad_y", 5))

    grid_h = ph - header_h - footer_h
    cell_w = panel_w / cols
    cell_h = grid_h / rows

    x1 = panel * panel_w + col * cell_w + pad_x
    y1 = header_h + row * cell_h + pad_y
    x2 = panel * panel_w + (col + 1) * cell_w - pad_x
    y2 = header_h + (row + 1) * cell_h - pad_y
    return int(x1), int(y1), int(x2), int(y2)


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    config_path = Path(__file__).resolve().parent / "catalogue-crops.json"

    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    src = repo_root / "frontend" / cfg["source"]
    out_dir = repo_root / "frontend" / "public" / "products"
    out_dir.mkdir(parents=True, exist_ok=True)

    layout = cfg.get("layout", {})
    im = Image.open(src).convert("RGBA")

    for p in cfg["products"]:
        slug = p["slug"]
        if "crop" in p:
            box = tuple(int(v) for v in p["crop"])
        else:
            box = crop_box(im.size, p["panel"], p["col"], p["row"], layout)
        crop = im.crop(box)
        crop.save(out_dir / f"{slug}.png")

    print(f"Generated {len(cfg['products'])} cropped images in {out_dir}")


if __name__ == "__main__":
    main()
