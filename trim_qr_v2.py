import os
from PIL import Image

assets = r"C:\Users\Administrator\WorkBuddy\2026-06-02-00-07-42\factory-website\assets\images"

# ===== WeChat QR: conservative trim with larger quiet zone =====
# QR codes need minimum 4-module quiet zone. For a 120x120 QR,
# we need at least ~16px padding. Use 20px to be safe.
print("=== WeChat QR (2_111.png) ===")
img = Image.open(os.path.join(assets, "2_111.png")).convert("RGB")
gray = img.convert("L")
# threshold: below 248 = content (preserves off-white areas)
bbox = gray.point(lambda p: 0 if p > 248 else 255).getbbox()

if bbox:
    pad = 20  # generous quiet zone
    bbox = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(img.width, bbox[2] + pad),
        min(img.height, bbox[3] + pad),
    )
    trimmed = img.crop(bbox)
    out_path = os.path.join(assets, "2_111_trimmed.png")
    trimmed.save(out_path)
    print(f"  Original: {img.width}x{img.height}")
    print(f"  Content bbox: {gray.point(lambda p: 0 if p > 248 else 255).getbbox()}")
    print(f"  Trimmed (pad={pad}): {trimmed.width}x{trimmed.height}")
    print(f"  Saved to: {out_path}")
else:
    print("  No content bbox found, skipping")

# ===== Instagram QR: single-pass conservative trim only =====
# NO aggressive inverted pass — it risks cutting into QR data
print("\n=== Instagram QR (ig_qr.jpg) ===")
img = Image.open(os.path.join(assets, "ig_qr.jpg")).convert("RGB")
gray = img.convert("L")
# Standard threshold: below 248 = content
bbox = gray.point(lambda p: 0 if p > 248 else 255).getbbox()

if bbox:
    pad = 20  # generous quiet zone
    bbox = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(img.width, bbox[2] + pad),
        min(img.height, bbox[3] + pad),
    )
    trimmed = img.crop(bbox)
    out_path = os.path.join(assets, "ig_qr_trimmed.png")
    trimmed.save(out_path)
    print(f"  Original: {img.width}x{img.height}")
    print(f"  Content bbox: {gray.point(lambda p: 0 if p > 248 else 255).getbbox()}")
    print(f"  Trimmed (pad={pad}): {trimmed.width}x{trimmed.height}")
    print(f"  Saved to: {out_path}")
else:
    print("  No content bbox found, skipping")

print("\n=== Done ===")
