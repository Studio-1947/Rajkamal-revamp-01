"""Re-frame the author photos as one set: 4:5 portrait, eyes on the same line, heads the same size, one warm
monochrome tone. Sources: authors/photos/original/<id>.jpg (untouched). Output: authors/photos/<id>.jpg (480x600).
FACES = by-eye marks on each original: (centre x, eye line y, top of head y, chin y) as fractions of the image."""
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import sys
FACES = {
 'dinkar': (.50,.30,.03,.62), 'gulzar': (.565,.27,.05,.45), 'hazariprasad-dwivedi': (.49,.40,.07,.68),
 'jaishankar-prasad': (.50,.40,.07,.70), 'kaifi-azmi': (.53,.43,.03,.83), 'krishna-sobti': (.45,.34,.08,.62),
 'mahadevi-verma': (.50,.51,.09,.85), 'mohan-rakesh': (.50,.37,.03,.67), 'mridula-garg': (.50,.41,.05,.75),
 'muktibodh': (.50,.35,.11,.65), 'nagarjun': (.44,.33,.04,.59), 'nirala': (.47,.39,.09,.79),
 'nirmal-verma': (.48,.31,.06,.52), 'phanishwarnath-renu': (.55,.45,.00,.93), 'piyush-mishra': (.57,.45,.01,.75),
 'premchand': (.50,.41,.07,.75), 'rahul-sankrityayan': (.50,.35,.14,.62), 'ravish-kumar': (.49,.26,.16,.37),
 'sahir-ludhianvi': (.40,.34,.07,.61), 'shrilal-shukla': (.48,.39,.01,.75),
}
OUT_W, OUT_H = 480, 600
HEAD = 0.60   # head (top of hair to chin) as a share of the frame's height
EYES = 0.43   # eye line, from the top of the frame
def frame(im, f):
    W, H = im.size; cx, ey, top, chin = f
    fh = (chin - top) * H / HEAD; fw = fh * OUT_W / OUT_H
    x0 = cx * W - fw / 2; y0 = ey * H - EYES * fh
    box = (round(x0), round(y0), round(x0 + fw), round(y0 + fh))
    # where the frame runs past the photo, extend the photo's own edges (mirrored + blurred) rather than leave a gap
    pad = max(0, -box[0], -box[1], box[2] - W, box[3] - H)
    if pad:
        # stretch the photo's outermost rows / columns outward, soften that band, then lay the photo back on top
        e = max(2, min(W, H) // 40)   # sample a thin band at each edge (averages out noise)
        big = Image.new('L', (W + 2 * pad, H + 2 * pad))
        big.paste(im.crop((0, 0, W, e)).resize((W, 1), Image.BOX).resize((W, pad), Image.NEAREST), (pad, 0))
        big.paste(im.crop((0, H - e, W, H)).resize((W, 1), Image.BOX).resize((W, pad), Image.NEAREST), (pad, pad + H))
        big.paste(im.crop((0, 0, e, H)).resize((1, H), Image.BOX).resize((pad, H), Image.NEAREST), (0, pad))
        big.paste(im.crop((W - e, 0, W, H)).resize((1, H), Image.BOX).resize((pad, H), Image.NEAREST), (pad + W, pad))
        for (cx0, cy0, px, py) in ((0, 0, 0, 0), (W - e, 0, pad + W, 0), (0, H - e, 0, pad + H), (W - e, H - e, pad + W, pad + H)):
            big.paste(im.crop((cx0, cy0, cx0 + e, cy0 + e)).resize((1, 1), Image.BOX).resize((pad, pad)), (px, py))
        big.paste(im, (pad, pad))
        soft = big.filter(ImageFilter.GaussianBlur(max(4, pad / 5)))
        m = max(2, min(W, H) // 30)
        mask = Image.new('L', big.size, 0); mask.paste(Image.new('L', (W - 2 * m, H - 2 * m), 255), (pad + m, pad + m)); mask = mask.filter(ImageFilter.GaussianBlur(m))
        soft.paste(im, (pad, pad), mask.crop((pad, pad, pad + W, pad + H)))
        im = soft; box = tuple(v + pad for v in box)
    return im.crop(box)
def tone(g):
    g = ImageOps.autocontrast(g, cutoff=(1, 1))
    g = ImageEnhance.Contrast(g).enhance(1.06)
    # warm monochrome: deep brown shadows -> cream highlights
    return ImageOps.colorize(g, black=(34, 15, 9), mid=(150, 104, 78), white=(250, 236, 218))
for k, f in FACES.items():
    src = Image.open(f'authors/photos/original/{k}.jpg').convert('L')
    c = frame(src, f)
    up = OUT_H / c.height
    c = c.resize((OUT_W, OUT_H), Image.LANCZOS)
    if up > 1.6: c = c.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    tone(c).save(f'authors/photos/{k}.jpg', quality=86, optimize=True, progressive=True)
    print(k, src.size, 'scale %.1f' % up)
