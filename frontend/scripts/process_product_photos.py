"""Process user-provided product photos into HD square shop images that fill the card."""
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "frontend" / "public" / "products"
SIZE = 1200
FILL_RATIO = 0.94  # product occupies ~94% of the square


def _bg_color(rgb: Image.Image) -> tuple[int, int, int]:
    w, h = rgb.size
    samples = [
        rgb.getpixel((1, 1)),
        rgb.getpixel((w - 2, 1)),
        rgb.getpixel((1, h - 2)),
        rgb.getpixel((w - 2, h - 2)),
    ]
    return (
        sum(c[0] for c in samples) // 4,
        sum(c[1] for c in samples) // 4,
        sum(c[2] for c in samples) // 4,
    )


def trim_to_content(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    if max(w, h) > 1400:
        scale = 1400 / max(w, h)
        rgb = rgb.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        w, h = rgb.size
    bg = _bg_color(rgb)
    mask = Image.new("1", (w, h), 0)
    px = rgb.load()
    mpx = mask.load()
    threshold = 38
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            dist = sum(abs(p[i] - bg[i]) for i in range(3))
            if dist > threshold:
                mpx[x, y] = 255
    bbox = mask.getbbox()
    if not bbox:
        gray = ImageOps.grayscale(rgb)
        bw = gray.point(lambda p: 0 if p > 232 else 255, mode="1")
        bbox = bw.getbbox()
    if not bbox:
        return rgb
    x0, y0, x1, y1 = bbox
    pad = int(max(x1 - x0, y1 - y0) * 0.015)
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad)
    y1 = min(h, y1 + pad)
    return rgb.crop((x0, y0, x1, y1))


def to_hd_product(im: Image.Image) -> Image.Image:
    im = trim_to_content(im)
    im = ImageOps.exif_transpose(im)
    w, h = im.size
    fill = int(SIZE * FILL_RATIO)
    scale = fill / max(w, h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (SIZE, SIZE), (248, 245, 240))
    canvas.paste(im, ((SIZE - new_w) // 2, (SIZE - new_h) // 2))
    canvas = ImageEnhance.Sharpness(canvas).enhance(1.15)
    canvas = ImageEnhance.Contrast(canvas).enhance(1.05)
    return canvas


def process(src: Path, slug: str) -> None:
    im = Image.open(src)
    out = to_hd_product(im)
    OUT.mkdir(parents=True, exist_ok=True)
    out.save(OUT / f"{slug}.png", format="PNG", optimize=True)
    print(f"  {slug}.png")


def assets_dir() -> Path:
    candidates = [
        Path(r"C:\Users\hp\.cursor\projects\f-Programming-Projects-Crochet\assets"),
        REPO / "assets" / "product-uploads",
        REPO / "assets",
    ]
    for p in candidates:
        if p.is_dir() and any(p.glob("c__Users_hp_*image-*.png")):
            return p
    for p in candidates:
        if p.is_dir():
            return p
    raise FileNotFoundError("assets directory not found")


# (filename, slug)
BATCH_1 = [
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-d9dc5a82-2c56-4679-80f9-0b32e79c99ee.png", "frilled-scrunchie-orange"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-a01b8ae5-e7fa-4c05-9916-145f612c2ac3.png", "frilled-scrunchie-maroon"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-63c98f86-ae97-436e-9820-71f57c0567b8.png", "small-hair-elastics-set-3"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-a1b42241-600b-4087-a196-953375ab7f4a.png", "rose-brooch-red"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-718c2098-6c21-41d9-b46e-39b7e5eea753.png", "sunflower-pin-decor"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-7cba27a2-3f20-400f-9ac7-8bf7e47836e3.png", "rose-applique-white"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-4cd1d4e2-82a8-4139-a2b0-1519c21b9cf3.png", "crochet-flower-garland"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-bf2c96ec-3b2a-45c0-81a7-41a101dcce62.png", "crochet-toran-maroon-gold"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-cf62fa8a-c235-4425-85bd-7c97031f7b68.png", "crochet-bead-garland-brown"),
]

BATCH_2 = [
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-d975a9f1-c975-492d-a495-e96234ce9b38.png", "crochet-gajra-white"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-9b52be49-4950-443d-9c38-7f73bcaf699e.png", "rose-hair-bun-pink-white"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-aadad2fb-144d-4314-9018-4ea70773920e.png", "rose-hair-bun-red"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-e5d863e3-f1bf-4ab7-93b1-57797b5a0120.png", "ruffled-doily-white-orange"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-86f09cd4-5ff0-476e-bcb0-93d53ddd0e5e.png", "round-crochet-mat-brown-border"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-688d624f-30c3-4b5a-af99-01e1779c9fed.png", "ruffled-doily-white-maroon"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-ff7eb652-f973-4c40-b413-ba9ca614ce4b.png", "mini-flower-coasters-set-3"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-ee9909bc-dea7-4887-81ce-b443c97d0973.png", "mini-flower-coasters-mixed"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-00ace0aa-f3f6-4768-a2b3-83a8543354c5.png", "mini-flower-coasters-set-4"),
    ("c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_63961a1b5ca23dd3e5954747409b7579_images_image-f30003c6-5d2c-4d49-a476-128cffb25b7c.png", "mini-rose-coasters-set-2"),
]


def main() -> None:
    assets = assets_dir()
    mapping = BATCH_1 + BATCH_2
    print(f"Writing {len(mapping)} HD images to {OUT}")
    for filename, slug in mapping:
        src = assets / filename
        if not src.is_file():
            raise FileNotFoundError(src)
        process(src, slug)
    print("Done.")


if __name__ == "__main__":
    main()
