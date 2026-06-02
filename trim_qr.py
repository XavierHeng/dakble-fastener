import os
from PIL import Image, ImageOps

assets = r"C:\Users\Administrator\WorkBuddy\2026-06-02-00-07-42\factory-website\assets\images"

for fname, suffix in [("2_111.png", "_trimmed"), ("ig_qr.jpg", "_trimmed")]:
    path = os.path.join(assets, fname)
    img = Image.open(path).convert("RGBA" if fname.endswith("png") else "RGB")
    
    # Convert white/close-to-white pixels to transparent (PNG) or detect bounds
    if fname.endswith("png"):
        # Auto-crop by finding non-white bounding box
        gray = img.convert("L")
        # threshold: anything below 250 is content
        bbox = gray.point(lambda p: 0 if p > 250 else 255).getbbox()
    else:
        gray = img.convert("L")
        bbox = gray.point(lambda p: 0 if p > 248 else 255).getbbox()
    
    if bbox:
        # Add 8px padding
        pad = 8
        bbox = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(img.width, bbox[2] + pad),
            min(img.height, bbox[3] + pad),
        )
        trimmed = img.crop(bbox)
        out_path = os.path.join(assets, f"{os.path.splitext(fname)[0]}{suffix}.png")
        trimmed.save(out_path)
        print(f"{fname}: original {img.width}x{img.height} -> trimmed {trimmed.width}x{trimmed.height} -> saved to {out_path}")
    else:
        print(f"{fname}: no bbox found, skipping")

# Also re-crop the IG QR more aggressively if still too much white
ig_path = os.path.join(assets, "ig_qr.jpg")
ig = Image.open(ig_path).convert("RGB")
gray = ig.convert("L")
# Find central QR content by looking for the actual QR block
# The QR code is dark, so invert and find bbox
inv = gray.point(lambda p: 255 - p)
bbox = inv.point(lambda p: 0 if p < 30 else 255).getbbox()
if bbox:
    pad = 10
    bbox = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(ig.width, bbox[2] + pad),
        min(ig.height, bbox[3] + pad),
    )
    trimmed = ig.crop(bbox)
    out_path = os.path.join(assets, "ig_qr_trimmed.png")
    trimmed.save(out_path)
    print(f"ig_qr.jpg aggressive trim: {ig.width}x{ig.height} -> {trimmed.width}x{trimmed.height}")
