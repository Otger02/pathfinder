/**
 * scripts/build-plantilla-flux.cjs
 *
 * Builds the 11-slide walkthrough TEMPLATE deck with Pathfinder's brand.
 * Slides 2-9 carry a phone-frame placeholder where Otger drops his screen
 * recordings (in Canva, after importing this PPTX).
 *
 * Run:
 *   NODE_PATH="C:\Users\otger\AppData\Roaming\npm\node_modules" node scripts/build-plantilla-flux.cjs
 *
 * Output: public/plantilla-flux-pathfinder.pptx
 */

const PptxGenJS = require("pptxgenjs");
const path = require("path");

// ── Brand ──────────────────────────────────────────────────────────
const CREAM = "F5EFE3";
const SURFACE = "FBF7EE";
const WHITE = "FFFFFF";
const INK = "1F2A26";
const INK_SOFT = "3D4D47";
const INK_MUTED = "6B7A74";
const SAGE = "2F6A5F";
const SAGE_DARK = "245247";
const GOLD = "E0B85B";
const LINE = "E4DCC9";

const SERIF = "Georgia";
const SANS = "Calibri";

const W = 13.333;
const H = 7.5;

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: W, height: H });
pptx.layout = "WIDE";
pptx.author = "Pathfinder · Fundació Tierra Digna";
pptx.title = "Pathfinder — Recorregut complet de l'app";

// ── Helpers ────────────────────────────────────────────────────────

/** Gold numbered chip */
function chip(slide, n, x, y) {
  slide.addShape("ellipse", {
    x, y, w: 0.55, h: 0.55, fill: { color: GOLD }, line: { type: "none" },
  });
  slide.addText(String(n), {
    x, y: y - 0.02, w: 0.55, h: 0.55, align: "center", valign: "middle",
    fontFace: SANS, fontSize: 20, bold: true, color: INK, margin: 0,
  });
}

/** Phone-frame placeholder (9:19.5) with drop hint */
function phone(slide, cx, cy, h) {
  const w = h * (9 / 19.5);
  const x = cx - w / 2;
  const y = cy - h / 2;
  // soft shadow plate
  slide.addShape("roundRect", {
    x: x + 0.06, y: y + 0.08, w, h, rectRadius: 0.28,
    fill: { color: "D9CFB8" }, line: { type: "none" },
  });
  // frame
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.28,
    fill: { color: WHITE }, line: { color: SAGE, width: 2.5 },
  });
  // notch
  slide.addShape("roundRect", {
    x: cx - 0.45, y: y + 0.12, w: 0.9, h: 0.12, rectRadius: 0.06,
    fill: { color: LINE }, line: { type: "none" },
  });
  // drop hint
  slide.addText("Insereix aquí\nla teva gravació", {
    x, y: cy - 0.6, w, h: 1.2, align: "center", valign: "middle",
    fontFace: SANS, fontSize: 13, italic: true, color: INK_MUTED, margin: 0,
  });
  return { x, y, w, h };
}

/** Bullet block with small gold dots */
function bullets(slide, items, x, y, w) {
  let cy = y;
  for (const it of items) {
    slide.addShape("ellipse", {
      x, y: cy + 0.10, w: 0.14, h: 0.14, fill: { color: GOLD }, line: { type: "none" },
    });
    slide.addText(it, {
      x: x + 0.30, y: cy - 0.05, w: w - 0.30, h: 0.9,
      fontFace: SANS, fontSize: 14, color: INK_SOFT, valign: "top", margin: 0,
      lineSpacing: 18,
    });
    cy += 0.88;
  }
}

/**
 * Standard flow slide: alternating phone side.
 * n = step number, title, kicker (small label), items = bullets.
 */
function flowSlide(n, kicker, title, items, phoneRight) {
  const s = pptx.addSlide();
  s.background = { color: CREAM };
  const phoneH = 5.4;
  const phoneCx = phoneRight ? W - 2.6 : 2.6;
  const textX = phoneRight ? 0.9 : 5.2;
  const textW = 7.2;

  phone(s, phoneCx, H / 2 + 0.15, phoneH);

  chip(s, n, textX, 0.85);
  s.addText(kicker.toUpperCase(), {
    x: textX + 0.75, y: 0.85, w: textW - 0.75, h: 0.55,
    fontFace: SANS, fontSize: 12, bold: true, color: SAGE, charSpacing: 2,
    valign: "middle", margin: 0,
  });
  s.addText(title, {
    x: textX, y: 1.55, w: textW, h: 1.5,
    fontFace: SERIF, fontSize: 33, bold: true, color: INK, margin: 0, valign: "top",
  });
  bullets(s, items, textX + 0.05, 3.35, textW - 0.4);

  // footer
  s.addText("Pathfinder · Fundació Tierra Digna", {
    x: 0.9, y: H - 0.55, w: 6, h: 0.35, fontFace: SANS, fontSize: 9,
    color: INK_MUTED, margin: 0,
  });
  return s;
}

// ── Slide 1 — Cover (dark sage) ────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: SAGE_DARK };
  // gold orb motif
  s.addShape("ellipse", { x: W - 3.4, y: -1.6, w: 4.6, h: 4.6, fill: { color: SAGE }, line: { type: "none" } });
  s.addShape("ellipse", { x: W - 2.1, y: -0.9, w: 2.4, h: 2.4, fill: { color: GOLD }, line: { type: "none" } });

  s.addText("PATHFINDER", {
    x: 0.9, y: 2.0, w: 11.5, h: 1.3, fontFace: SERIF, fontSize: 60, bold: true,
    color: WHITE, margin: 0,
  });
  s.addText("El camí cap als teus papers", {
    x: 0.9, y: 3.3, w: 11.5, h: 0.8, fontFace: SERIF, fontSize: 28, italic: true,
    color: GOLD, margin: 0,
  });
  s.addText("Navegació legal assistida per IA per a persones migrants a Espanya", {
    x: 0.9, y: 4.35, w: 10.5, h: 0.6, fontFace: SANS, fontSize: 17, color: "DFEAE3", margin: 0,
  });
  s.addText("Fundació Tierra Digna  ·  Vloggin SAS", {
    x: 0.9, y: 6.4, w: 8, h: 0.45, fontFace: SANS, fontSize: 13, color: "B9CDC2", margin: 0,
  });
}

// ── Slides 2-9 — Flow with phone placeholders ──────────────────────
flowSlide(1, "Pantalla d'inici", "Benvinguda per veu", [
  "L'usuari diu el seu idioma i l'app respon a l'instant.",
  "5 idiomes: català, castellà, anglès, francès i àrab.",
  "Pensat per a persones amb baixa alfabetització.",
], true);

flowSlide(2, "Orientació guiada", "L'arbre de decisió", [
  "Preguntes senzilles que porten a la via legal correcta.",
  "78 nodes validats amb el Reglament d'Estrangeria vigent.",
  "Cada resultat cita la seva base legal.",
], false);

flowSlide(3, "El xat amb IA", "Consentiment i conversa", [
  "Consentiment explícit abans de recollir cap dada.",
  "L'assistent respon citant la font legal.",
  "Avís permanent: és una IA, no un advocat.",
], true);

flowSlide(4, "Lectura de documents", "Foto del document → dades extretes", [
  "Fotografia el passaport o el padró: el sistema n'extreu les dades.",
  "També llegeix cartes oficials i en detecta els terminis.",
  "La imatge no s'emmagatzema mai.",
], false);

flowSlide(5, "Documents PDF", "Pujar un PDF (contracte, carta)", [
  "Llegeix contractes i resolucions senceres.",
  "Extreu les dades de l'empresa per a l'arraigo sociolaboral.",
  "Un contracte + un passaport ≈ expedient complet.",
], true);

flowSlide(6, "Acompanyament pràctic", "Checklist de documents", [
  "Llista personalitzada de documents per al tràmit.",
  "Indica qui ha d'obtenir cada document i la seva validesa.",
  "Marca'ls a mesura que els aconsegueixes.",
], false);

flowSlide(7, "El resultat", "El formulari oficial, emplenat", [
  "Formulari EX emplenat automàticament amb les dades de la conversa.",
  "15 models coberts, inclosos EX-31 i EX-32 (regularització 2026).",
  "Llest per revisar, signar i presentar.",
], true);

flowSlide(8, "Dashboard i seguiment", "El teu procés, sempre desat", [
  "Processos desats i represa de la conversa en qualsevol moment.",
  "Recursos de la teva província i consolats del teu país.",
  "Notes personals i avisos pràctics per zona.",
], false);

// ── Slide 10 — Privacitat (2x2 cards) ──────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: CREAM };
  s.addText("Privacitat i transparència", {
    x: 0.9, y: 0.7, w: 11.5, h: 0.9, fontFace: SERIF, fontSize: 36, bold: true,
    color: INK, margin: 0,
  });
  const cards = [
    ["Consentiment explícit", "Cap dada es recull sense permís previ. Les sessions anònimes s'esborren a les 24 h."],
    ["IA transparent", "Avís permanent que parles amb una IA, no amb un advocat (Reglament europeu d'IA, art. 50)."],
    ["RGPD de debò", "Xifratge, aïllament per usuari, registres sense dades personals i dret a eliminar-ho tot."],
    ["Dossier institucional", "Tota l'activitat, cobertura legal i compliment, documentats en un PDF públic."],
  ];
  const cw = 5.65, ch = 2.15, gx = 0.9, gy = 1.95, gap = 0.35;
  cards.forEach(([t, d], i) => {
    const x = gx + (i % 2) * (cw + gap);
    const y = gy + Math.floor(i / 2) * (ch + gap);
    s.addShape("roundRect", {
      x, y, w: cw, h: ch, rectRadius: 0.16,
      fill: { color: SURFACE }, line: { color: LINE, width: 1 },
    });
    s.addShape("ellipse", { x: x + 0.3, y: y + 0.32, w: 0.4, h: 0.4, fill: { color: GOLD }, line: { type: "none" } });
    s.addText(t, {
      x: x + 0.9, y: y + 0.22, w: cw - 1.2, h: 0.6, fontFace: SANS, fontSize: 17,
      bold: true, color: SAGE_DARK, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: x + 0.32, y: y + 0.95, w: cw - 0.64, h: ch - 1.15, fontFace: SANS, fontSize: 12.5,
      color: INK_SOFT, margin: 0, valign: "top", lineSpacing: 16,
    });
  });
}

// ── Slide 11 — Closing (dark sage) ─────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: SAGE_DARK };
  s.addShape("ellipse", { x: -1.8, y: H - 2.8, w: 4.6, h: 4.6, fill: { color: SAGE }, line: { type: "none" } });

  s.addText("Prova-ho", {
    x: 0.9, y: 1.5, w: 8, h: 1.1, fontFace: SERIF, fontSize: 48, bold: true, color: WHITE, margin: 0,
  });
  s.addText("pathfinder-inky-nine.vercel.app", {
    x: 0.9, y: 2.9, w: 8.6, h: 0.8, fontFace: SANS, fontSize: 26, bold: true, color: GOLD, margin: 0,
  });
  s.addText("Gratuït · 5 idiomes · Cap dada sense el teu consentiment", {
    x: 0.9, y: 3.8, w: 8.6, h: 0.5, fontFace: SANS, fontSize: 15, color: "DFEAE3", margin: 0,
  });
  s.addText("Fundació Tierra Digna  ·  Vloggin SAS", {
    x: 0.9, y: 6.4, w: 8, h: 0.45, fontFace: SANS, fontSize: 13, color: "B9CDC2", margin: 0,
  });
  // QR placeholder
  const q = 2.3;
  s.addShape("roundRect", {
    x: W - q - 1.0, y: H / 2 - q / 2, w: q, h: q, rectRadius: 0.12,
    fill: { color: WHITE }, line: { type: "none" },
  });
  s.addText("QR\n(substitueix-me)", {
    x: W - q - 1.0, y: H / 2 - q / 2, w: q, h: q, align: "center", valign: "middle",
    fontFace: SANS, fontSize: 13, color: INK_MUTED, margin: 0,
  });
}

const out = path.join(__dirname, "..", "public", "plantilla-flux-pathfinder.pptx");
pptx.writeFile({ fileName: out }).then(() => console.log("OK " + out));
