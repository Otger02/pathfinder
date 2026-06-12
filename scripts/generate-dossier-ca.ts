/**
 * scripts/generate-dossier-ca.ts
 *
 * Catalan VISUAL dossier — same substance as the Spanish one but with
 * real app screenshots embedded (docs/screenshots/*.png, captured by
 * scripts/capture-screenshots.ts with the dev server running).
 *
 * Output: public/pathfinder-dossier-ca.pdf
 *
 * Full regeneration:
 *   npm run dev                                   # terminal 1
 *   npx tsx scripts/capture-screenshots.ts        # terminal 2
 *   npx tsx scripts/generate-dossier-ca.ts
 *   npx tsx scripts/generate-dossier.ts           # Spanish twin
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFImage } from "pdf-lib";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 64;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.12, 0.14, 0.13);
const INK_SOFT = rgb(0.35, 0.38, 0.36);
const SAGE = rgb(0.36, 0.46, 0.40);
const SAGE_DARK = rgb(0.22, 0.32, 0.27);
const LINE = rgb(0.8, 0.83, 0.81);

class B {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  bold!: PDFFont;
  italic!: PDFFont;
  y = 0;
  pageNum = 0;

  async init() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.italic = await this.doc.embedFont(StandardFonts.HelveticaOblique);
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pageNum++;
    this.y = PAGE_H - MARGIN;
    if (this.pageNum > 1) {
      this.page.drawText("Pathfinder — Dossier institucional", { x: MARGIN, y: 30, size: 8, font: this.font, color: INK_SOFT });
      this.page.drawText(String(this.pageNum), { x: PAGE_W - MARGIN - 10, y: 30, size: 8, font: this.font, color: INK_SOFT });
    }
  }
  ensure(space: number) {
    if (this.y - space < MARGIN + 20) this.newPage();
  }
  wrap(text: string, font: PDFFont, size: number, width = CONTENT_W): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const c = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(c, size) > width && line) { lines.push(line); line = w; }
      else line = c;
    }
    if (line) lines.push(line);
    return lines;
  }
  heading(text: string) {
    this.ensure(60);
    this.y -= 18;
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 15, font: this.bold, color: SAGE_DARK });
    this.y -= 8;
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: MARGIN + CONTENT_W, y: this.y }, thickness: 0.8, color: LINE });
    this.y -= 14;
  }
  sub(text: string) {
    this.ensure(34);
    this.y -= 8;
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 11.5, font: this.bold, color: SAGE });
    this.y -= 16;
  }
  para(text: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {}) {
    const size = opts.size ?? 10;
    const font = opts.font ?? this.font;
    const color = opts.color ?? INK;
    for (const line of this.wrap(text, font, size)) {
      this.ensure(size + 6);
      this.page.drawText(line, { x: MARGIN, y: this.y, size, font, color });
      this.y -= size + 4;
    }
    this.y -= 4;
  }
  bullet(text: string, boldLead?: string) {
    const size = 10;
    this.ensure(size + 6);
    this.page.drawText("•", { x: MARGIN + 4, y: this.y, size, font: this.bold, color: SAGE });
    const indent = 16;
    const full = boldLead ? `${boldLead} ${text}` : text;
    const lines = this.wrap(full, this.font, size, CONTENT_W - indent);
    let first = true;
    for (const line of lines) {
      if (!first) this.ensure(size + 6);
      if (first && boldLead) {
        const leadW = this.bold.widthOfTextAtSize(boldLead + " ", size);
        this.page.drawText(boldLead, { x: MARGIN + indent, y: this.y, size, font: this.bold, color: INK });
        this.page.drawText(line.slice(boldLead.length + 1), { x: MARGIN + indent + leadW, y: this.y, size, font: this.font, color: INK });
      } else {
        this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font: this.font, color: INK });
      }
      this.y -= size + 4;
      first = false;
    }
    this.y -= 2;
  }
  /** Row of phone screenshots with captions, bordered. */
  screenshotRow(images: Array<{ img: PDFImage; caption: string }>) {
    const gap = 10;
    const w = (CONTENT_W - gap * (images.length - 1)) / images.length;
    // keep aspect (shots are 780x1580 px → ratio ~2.0256)
    const ratio = images[0].img.height / images[0].img.width;
    const h = w * ratio;
    this.ensure(h + 30);
    const top = this.y;
    images.forEach(({ img, caption }, i) => {
      const x = MARGIN + i * (w + gap);
      this.page.drawRectangle({ x: x - 1.5, y: top - h - 1.5, width: w + 3, height: h + 3, borderColor: LINE, borderWidth: 1, color: rgb(1, 1, 1) });
      this.page.drawImage(img, { x, y: top - h, width: w, height: h });
      const capW = this.font.widthOfTextAtSize(caption, 8);
      this.page.drawText(caption, { x: x + (w - capW) / 2, y: top - h - 14, size: 8, font: this.italic, color: INK_SOFT });
    });
    this.y = top - h - 26;
  }
}

async function main() {
  const b = new B();
  await b.init();

  // ── Coberta ─────────────────────────────────────────────────────
  b.y = PAGE_H - 200;
  b.page.drawText("PATHFINDER", { x: MARGIN, y: b.y, size: 40, font: b.bold, color: SAGE_DARK });
  b.y -= 30;
  b.page.drawText("Navegació legal assistida per IA per a persones migrants a Espanya", { x: MARGIN, y: b.y, size: 13, font: b.font, color: INK });
  b.y -= 60;
  b.page.drawLine({ start: { x: MARGIN, y: b.y }, end: { x: MARGIN + CONTENT_W, y: b.y }, thickness: 1.2, color: SAGE });
  b.y -= 40;
  for (const line of [
    "Dossier institucional",
    "Fundació Tierra Digna · Vloggin SAS",
    "Versió: juny de 2026 — producte en fase de pilotatge",
  ]) {
    b.page.drawText(line, { x: MARGIN, y: b.y, size: 11, font: b.font, color: INK_SOFT });
    b.y -= 18;
  }
  b.y = 120;
  b.para("Aquest document descriu l'activitat de Pathfinder, el seu funcionament, la cobertura legal i el marc de compliment. No constitueix assessorament jurídic.", { size: 9, font: b.italic, color: INK_SOFT });

  // ── 1. Què és i què aporta ──────────────────────────────────────
  b.newPage();
  b.heading("1. Què és Pathfinder i què aporta");
  b.para("Pathfinder és una eina digital gratuïta d'orientació en estrangeria. Acompanya persones migrants a Espanya a identificar la via de regularització que correspon a la seva situació, reunir la documentació necessària i preparar els formularis oficials — en el seu propi idioma i en llenguatge senzill.");
  b.sub("El problema");
  b.para("El sistema d'estrangeria espanyol és complex: desenes de vies d'autorització, requisits que canvien amb cada reforma, formularis tècnics en castellà i un accés desigual a l'assessorament. Les persones en situació més vulnerable — nouvingudes, amb barreres d'idioma o baixa alfabetització — són les que menys accés tenen a orientació de qualitat, i les que més conseqüències pateixen per un tràmit mal presentat.");
  b.sub("L'aportació");
  b.bullet("orientació guiada que cobreix el Reglament d'Estrangeria vigent, amb un arbre de decisió validat de 78 nodes que condueix a la via correcta.", "Cobertura àmplia:");
  b.bullet("disponible en català, castellà, anglès, francès i àrab (interfície), amb portuguès, suahili i urdú en preparació. Entrada i sortida per veu per a persones amb baixa alfabetització.", "Multilingüe i accessible:");
  b.bullet("l'assistent conversacional recull les dades una sola vegada i emplena automàticament els formularis oficials EX (15 models coberts, inclosos EX-31 i EX-32 de la regularització extraordinària 2026).", "Formularis emplenats:");
  b.bullet("la persona pot fotografiar el passaport, el padró o una carta oficial: el sistema n'extreu les dades, explica el document en el seu idioma i detecta els terminis que conté.", "Lectura de documents:");
  b.bullet("llistes de documents per tràmit, indicació de qui ha d'obtenir cada un, avisos pràctics per província i directori de consolats i entitats de suport.", "Acompanyament pràctic:");
  b.bullet("mode d'emergència amb recursos immediats (112, 016, entitats especialitzades) i materials sobre drets davant una detenció.", "Protecció:");
  b.sub("Què NO és Pathfinder");
  b.para("Pathfinder no és un despatx d'advocats ni substitueix l'assessorament jurídic professional. És una eina d'orientació i informació que prepara la persona per al seu tràmit i la deriva a entitats especialitzades (CEAR, Càritas, sindicats, col·legis d'advocats) quan el cas ho requereix. Aquesta distinció es comunica de manera visible a la mateixa aplicació.");

  // ── 2. L'aplicació (visual) ─────────────────────────────────────
  b.newPage();
  b.heading("2. L'aplicació");
  const shotsDir = join(process.cwd(), "docs", "screenshots");
  const tryLoad = async (name: string): Promise<PDFImage | null> => {
    const p = join(shotsDir, name);
    if (!existsSync(p)) return null;
    return b.doc.embedPng(readFileSync(p));
  };
  const landing = await tryLoad("landing.png");
  const tree = await tryLoad("tree.png");
  const privacy = await tryLoad("privacy.png");
  const shots = [
    landing && { img: landing, caption: "Pantalla d'inici — entrada per veu" },
    tree && { img: tree, caption: "Arbre de decisió amb avís d'IA" },
    privacy && { img: privacy, caption: "Privacitat i transparència" },
  ].filter(Boolean) as Array<{ img: PDFImage; caption: string }>;
  if (shots.length > 0) {
    b.para("Captures reals de l'aplicació (versió mòbil, juny de 2026):", { size: 9.5, font: b.italic, color: INK_SOFT });
    b.screenshotRow(shots);
  }
  b.sub("Com funciona");
  b.bullet("la persona respon preguntes senzilles i l'arbre de decisió identifica la via d'autorització aplicable, citant la base legal.", "1. Orientació:");
  b.bullet("un assistent d'IA, recolzat en una base de coneixement jurídica verificada (tècnica RAG), respon dubtes citant la font i recull les dades personals de manera conversacional, amb consentiment explícit previ.", "2. Conversa:");
  b.bullet("es generen el formulari oficial EX ja emplenat, un resum de l'expedient i un esborrany de correu per demanar cita, llestos per revisar i presentar.", "3. Documents:");
  b.bullet("la persona pot desar el procés, consultar l'estat de la documentació i rebre els recursos de suport de la seva província.", "4. Seguiment:");
  b.sub("Tecnologia");
  b.para("Aplicació web (compatible amb mòbil, instal·lable com a PWA) sobre infraestructura europea (allotjament a Frankfurt). Els models de llenguatge (Anthropic Claude) operen sota contracte de no retenció de dades. La capa jurídica es construeix exclusivament amb fonts oficials (BOE, Ministeri d'Inclusió) i es versiona amb cada reforma.");

  // ── 3. Cobertura legal ──────────────────────────────────────────
  b.heading("3. Cobertura legal del contingut");
  b.para("La base de coneixement i l'arbre de decisió cobreixen, a data d'aquest dossier:");
  b.bullet("Llei Orgànica 4/2000 (LOEx) i el Reglament vigent, RD 1155/2024 (en vigor des del 20/05/2025).");
  b.bullet("RD 316/2026, de 14 d'abril, que modifica el RD 1155/2024 (en vigor des del 16/04/2026).");
  b.bullet("Procés de regularització extraordinària 2026 (DA 20a i 21a): les dues vies, amb els formularis EX-31 i EX-32, les llistes de documentació i l'acreditació de vulnerabilitat (Annex II).");
  b.bullet("Vies ordinàries: arrelaments (social, sociolaboral, socioformatiu, familiar, segona oportunitat), reagrupació familiar, residències de treball, estades per estudis, llarga durada, familiars de ciutadans espanyols i de la UE, menors, raons humanitàries i protecció de víctimes.");
  b.bullet("Formularis oficials amb emplenat automàtic: EX-00 a EX-11, EX-19, EX-24, EX-25, EX-31 i EX-32 (15 models).");
  b.para("A més del text legal, Pathfinder manté una capa de \"notes d'aplicació pràctica\" verificades per personal social i jurídic col·laborador, que documenta les diferències de criteri entre oficines d'estrangeria. Cada nota registra la font i qui l'ha verificada.", { font: b.italic, size: 9.5, color: INK_SOFT });

  // ── 4. Compliment normatiu ──────────────────────────────────────
  b.heading("4. Compliment normatiu");
  b.sub("Protecció de dades (RGPD / LOPDGDD)");
  b.bullet("les dades personals s'usen únicament per generar els documents del tràmit. No es venen, no se cedeixen a tercers i no s'usen amb finalitats publicitàries.", "Finalitat única:");
  b.bullet("cap dada personal no es recull sense consentiment explícit previ, demanat a la mateixa conversa.", "Consentiment:");
  b.bullet("les dades de sessions anònimes s'eliminen automàticament al cap de 24 hores. Els usuaris registrats poden eliminar els seus processos en qualsevol moment.", "Minimització i terminis:");
  b.bullet("xifratge en trànsit, aïllament per usuari a la base de dades (polítiques RLS), registres sense dades personals, accés administratiu restringit i auditat.", "Mesures tècniques:");
  b.bullet("les fotografies de documents es processen en memòria i no s'emmagatzemen; només es conserven les dades extretes, sota el mateix consentiment.", "Imatges:");
  b.bullet("responsable del tractament: Fundació Tierra Digna. Drets d'accés, rectificació, supressió i retirada del consentiment exercibles contactant amb la Fundació; reclamació possible davant l'AEPD.", "Responsable i drets:");
  b.sub("Reglament europeu d'IA (EU AI Act)");
  b.bullet("d'acord amb l'article 50, l'aplicació informa de manera clara i permanent que la persona interactua amb un sistema d'IA i no amb un advocat.", "Transparència:");
  b.bullet("Pathfinder orienta i informa; no pren decisions amb efectes jurídics sobre les persones. La presentació del tràmit i qualsevol decisió la fa sempre la persona o l'administració.", "Posició funcional:");
  b.bullet("els documents generats indiquen expressament que cal revisar-los abans de la presentació oficial.", "Revisió humana:");
  b.sub("Avaluació d'impacte");
  b.para("El projecte manté una avaluació d'impacte de protecció de dades (DPIA) viva que documenta categories de dades, riscos i mitigacions, pendent de validació jurídica externa abans del desplegament a gran escala.");

  // ── 5. Termes i condicions (resum) ──────────────────────────────
  b.heading("5. Termes i condicions (resum)");
  b.para("El text complet és a l'aplicació (/terms). Punts essencials:");
  b.bullet("el servei és gratuït i s'adreça a persones migrants a Espanya i a les entitats que les acompanyen.", "Gratuïtat:");
  b.bullet("Pathfinder ofereix orientació i informació general, generada amb assistència d'IA. No constitueix assessorament jurídic ni crea relació advocat-client.", "Naturalesa del servei:");
  b.bullet("la informació pot contenir errors o quedar desactualitzada després de canvis normatius. Cal revisar tots els documents abans de presentar-los i, en casos complexos, acudir a un professional o entitat especialitzada.", "Límits d'exactitud:");
  b.bullet("la Fundació no es fa responsable de les decisions administratives sobre els tràmits dels usuaris ni dels danys derivats d'informació incorrecta, sense perjudici dels drets que la llei reconeix a l'usuari.", "Responsabilitat:");
  b.bullet("queda prohibit l'ús del servei amb finalitats fraudulentes, per a usos comercials no autoritzats o per introduir dades de tercers sense el seu consentiment.", "Ús acceptable:");
  b.bullet("el tractament de dades personals es regeix per la política de privacitat (/privacy).", "Privacitat:");
  b.bullet("legislació espanyola; els conflictes se sotmetran als jutjats i tribunals competents conforme a la normativa de consumidors.", "Llei aplicable:");

  // ── 6. Estat i contacte ─────────────────────────────────────────
  b.heading("6. Estat del producte i contacte");
  b.bullet("producte operatiu en fase de pilotatge amb usuaris acompanyats per personal social. Auditoria de seguretat interna completada; proves automatitzades i monitorització d'errors en producció.", "Estat:");
  b.bullet("validació jurídica externa del contingut i de la documentació de compliment; ampliació del directori d'entitats per província; canal WhatsApp.", "En curs:");
  b.bullet("Fundació Tierra Digna (entitat responsable) — projecte desenvolupat amb el suport de Vloggin SAS.", "Contacte:");
  b.y -= 20;
  b.para("Document generat el juny de 2026. La informació reflecteix l'estat del producte i del marc normatiu en aquesta data.", { size: 9, font: b.italic, color: INK_SOFT });

  const bytes = await b.doc.save();
  const out = join(process.cwd(), "public", "pathfinder-dossier-ca.pdf");
  writeFileSync(out, bytes);
  console.log(`✓ ${out} (${Math.round(bytes.length / 1024)} KB, ${b.pageNum} pages)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
