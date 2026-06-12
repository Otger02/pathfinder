/**
 * scripts/generate-dossier.ts
 *
 * Generates the institutional dossier PDF: what Pathfinder is, what it
 * contributes, how it works, legal coverage, compliance posture, and a
 * summary of terms. Written in Spanish (the working language for Spanish
 * institutions and partner NGOs).
 *
 * Output: public/pathfinder-dossier.pdf — publicly downloadable, linked
 * from /privacy and /terms.
 *
 * Run: npx tsx scripts/generate-dossier.ts
 * Re-run whenever the product or legal posture changes materially.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { writeFileSync } from "fs";
import { join } from "path";

// ── Layout constants (A4) ─────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 64;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.12, 0.14, 0.13);
const INK_SOFT = rgb(0.35, 0.38, 0.36);
const SAGE = rgb(0.36, 0.46, 0.40);
const SAGE_DARK = rgb(0.22, 0.32, 0.27);
const LINE = rgb(0.8, 0.83, 0.81);

class DossierBuilder {
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
      // running footer
      this.page.drawText("Pathfinder — Dossier institucional", {
        x: MARGIN, y: 30, size: 8, font: this.font, color: INK_SOFT,
      });
      this.page.drawText(String(this.pageNum), {
        x: PAGE_W - MARGIN - 10, y: 30, size: 8, font: this.font, color: INK_SOFT,
      });
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
      const candidate = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(candidate, size) > width && line) {
        lines.push(line);
        line = w;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  heading(text: string) {
    this.ensure(60);
    this.y -= 18;
    this.page.drawText(text, {
      x: MARGIN, y: this.y, size: 15, font: this.bold, color: SAGE_DARK,
    });
    this.y -= 8;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + CONTENT_W, y: this.y },
      thickness: 0.8,
      color: LINE,
    });
    this.y -= 14;
  }

  sub(text: string) {
    this.ensure(34);
    this.y -= 8;
    this.page.drawText(text, {
      x: MARGIN, y: this.y, size: 11.5, font: this.bold, color: SAGE,
    });
    this.y -= 16;
  }

  para(text: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number } = {}) {
    const size = opts.size ?? 10;
    const font = opts.font ?? this.font;
    const color = opts.color ?? INK;
    const indent = opts.indent ?? 0;
    const lines = this.wrap(text, font, size, CONTENT_W - indent);
    for (const line of lines) {
      this.ensure(size + 6);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color });
      this.y -= size + 4;
    }
    this.y -= 4;
  }

  bullet(text: string, opts: { boldLead?: string } = {}) {
    const size = 10;
    this.ensure(size + 6);
    this.page.drawText("•", { x: MARGIN + 4, y: this.y, size, font: this.bold, color: SAGE });
    const indent = 16;
    if (opts.boldLead) {
      const leadW = this.bold.widthOfTextAtSize(opts.boldLead + " ", size);
      const rest = text;
      // Lead in bold, rest wrapped with hanging indent
      const firstAvail = CONTENT_W - indent - leadW;
      const restLines = this.wrap(rest, this.font, size, firstAvail);
      const first = restLines.shift() ?? "";
      this.page.drawText(opts.boldLead + " ", { x: MARGIN + indent, y: this.y, size, font: this.bold, color: INK });
      this.page.drawText(first, { x: MARGIN + indent + leadW, y: this.y, size, font: this.font, color: INK });
      this.y -= size + 4;
      const remainder = restLines.join(" ");
      if (remainder) {
        for (const line of this.wrap(remainder, this.font, size, CONTENT_W - indent)) {
          this.ensure(size + 6);
          this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font: this.font, color: INK });
          this.y -= size + 4;
        }
      }
    } else {
      const lines = this.wrap(text, this.font, size, CONTENT_W - indent);
      let firstLine = true;
      for (const line of lines) {
        if (!firstLine) this.ensure(size + 6);
        this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font: this.font, color: INK });
        this.y -= size + 4;
        firstLine = false;
      }
    }
    this.y -= 2;
  }

  spacer(h = 8) {
    this.y -= h;
  }
}

async function main() {
  const b = new DossierBuilder();
  await b.init();

  // ── Cover ───────────────────────────────────────────────────────
  b.y = PAGE_H - 200;
  b.page.drawText("PATHFINDER", {
    x: MARGIN, y: b.y, size: 40, font: b.bold, color: SAGE_DARK,
  });
  b.y -= 30;
  b.page.drawText("Navegación legal asistida por IA para personas migrantes en España", {
    x: MARGIN, y: b.y, size: 13, font: b.font, color: INK,
  });
  b.y -= 60;
  b.page.drawLine({
    start: { x: MARGIN, y: b.y }, end: { x: MARGIN + CONTENT_W, y: b.y },
    thickness: 1.2, color: SAGE,
  });
  b.y -= 40;
  for (const line of [
    "Dossier institucional",
    "Fundació Tierra Digna · Vloggin SAS",
    "Versión: junio de 2026 — producto en fase de pilotaje",
  ]) {
    b.page.drawText(line, { x: MARGIN, y: b.y, size: 11, font: b.font, color: INK_SOFT });
    b.y -= 18;
  }
  b.y = 120;
  b.para(
    "Este documento describe la actividad de Pathfinder, su funcionamiento, su cobertura legal y su marco de cumplimiento. No constituye asesoramiento jurídico.",
    { size: 9, font: b.italic, color: INK_SOFT }
  );

  // ── 1. Qué es y qué aporta ──────────────────────────────────────
  b.newPage();
  b.heading("1. Qué es Pathfinder y qué aporta");
  b.para(
    "Pathfinder es una herramienta digital gratuita de orientación en extranjería. Acompaña a personas migrantes en España a identificar la vía de regularización que corresponde a su situación, reunir la documentación necesaria y preparar los formularios oficiales — en su propio idioma y en lenguaje sencillo."
  );
  b.sub("El problema");
  b.para(
    "El sistema de extranjería español es complejo: decenas de vías de autorización, requisitos que cambian con cada reforma, formularios técnicos en español y un acceso desigual a asesoramiento. Las personas en situación más vulnerable — recién llegadas, con barreras de idioma o baja alfabetización — son las que menos acceso tienen a orientación de calidad, y las que más consecuencias sufren por un trámite mal presentado."
  );
  b.sub("La aportación");
  b.bullet("orientación guiada que cubre el Reglamento de Extranjería vigente, con un árbol de decisión validado de 78 nodos que conduce a la vía correcta.", { boldLead: "Cobertura amplia:" });
  b.bullet("disponible en catalán, castellano, inglés, francés y árabe (interfaz), con portugués, suajili y urdu en preparación. Entrada y salida por voz para personas con baja alfabetización.", { boldLead: "Multilingüe y accesible:" });
  b.bullet("el asistente conversacional recoge los datos una sola vez y rellena automáticamente los formularios oficiales EX (15 modelos cubiertos, incluidos EX-31 y EX-32 de la regularización extraordinaria 2026).", { boldLead: "Formularios rellenados:" });
  b.bullet("la persona puede fotografiar su pasaporte, padrón o una carta oficial: el sistema extrae los datos, explica el documento en su idioma y detecta los plazos que contiene.", { boldLead: "Lectura de documentos:" });
  b.bullet("listas de documentos por trámite, indicación de quién debe obtener cada uno, avisos prácticos por provincia (diferencias entre lo que dice la norma y cómo se aplica) y directorio de consulados y entidades de apoyo.", { boldLead: "Acompañamiento práctico:" });
  b.bullet("modo de emergencia con recursos inmediatos (112, 016, entidades especializadas) y materiales sobre derechos ante una detención.", { boldLead: "Protección:" });
  b.sub("Qué NO es Pathfinder");
  b.para(
    "Pathfinder no es un despacho de abogados ni sustituye el asesoramiento jurídico profesional. Es una herramienta de orientación e información que prepara a la persona para su trámite y la deriva a entidades especializadas (CEAR, Cáritas, sindicatos, colegios de abogados) cuando el caso lo requiere. Esta distinción se comunica de forma visible en la propia aplicación."
  );

  // ── 2. Cómo funciona ────────────────────────────────────────────
  b.heading("2. Cómo funciona");
  b.bullet("la persona responde preguntas sencillas (situación, tiempo en España, vínculos) y el árbol de decisión identifica la vía de autorización aplicable, citando la base legal.", { boldLead: "1. Orientación:" });
  b.bullet("un asistente de inteligencia artificial, apoyado en una base de conocimiento jurídica verificada (técnica RAG), responde dudas citando la fuente legal y recoge los datos personales necesarios de forma conversacional, previa solicitud de consentimiento explícito.", { boldLead: "2. Conversación:" });
  b.bullet("con los datos recogidos se genera el formulario oficial EX correspondiente ya rellenado, un resumen del expediente y un borrador de correo para solicitar cita, listos para revisar y presentar.", { boldLead: "3. Documentos:" });
  b.bullet("la persona puede guardar su proceso, consultar el estado de su documentación y recibir los recursos de apoyo de su provincia.", { boldLead: "4. Seguimiento:" });
  b.sub("Tecnología");
  b.para(
    "Aplicación web (compatible con móvil, instalable como PWA) construida sobre infraestructura europea (alojamiento en Fráncfort). Los modelos de lenguaje empleados (Anthropic Claude) operan bajo contrato de no retención de datos. La capa de conocimiento jurídico se construye exclusivamente a partir de fuentes oficiales (BOE, Ministerio de Inclusión) y se versiona con cada reforma normativa."
  );

  // ── 3. Cobertura legal ──────────────────────────────────────────
  b.heading("3. Cobertura legal del contenido");
  b.para("La base de conocimiento y el árbol de decisión cubren, a fecha de este dossier:");
  b.bullet("Ley Orgánica 4/2000 (LOEx) y su Reglamento vigente, RD 1155/2024 (en vigor desde el 20/05/2025).");
  b.bullet("RD 316/2026, de 14 de abril, que modifica el RD 1155/2024 (en vigor desde el 16/04/2026).");
  b.bullet("Proceso de regularización extraordinaria 2026 (DA 20.ª y 21.ª): ambas vías, con los formularios EX-31 y EX-32 y sus listas de documentación, incluida la acreditación de vulnerabilidad (Anexo II).");
  b.bullet("Vías ordinarias: arraigos (social, sociolaboral, socioformativo, familiar, segunda oportunidad), reagrupación familiar, residencias de trabajo por cuenta ajena y propia, estancias por estudios, larga duración, familiares de ciudadanos españoles y de la UE, menores, razones humanitarias y protección de víctimas.");
  b.bullet("Formularios oficiales cubiertos con relleno automático: EX-00, EX-01, EX-02, EX-03, EX-04, EX-06, EX-07, EX-09, EX-10, EX-11, EX-19, EX-24, EX-25, EX-31 y EX-32.");
  b.para(
    "Además del texto legal, Pathfinder mantiene una capa de \"notas de aplicación práctica\" verificadas por personal social y jurídico colaborador, que documenta las diferencias de criterio entre oficinas de extranjería. Cada nota registra su fuente y quién la ha verificado.",
    { font: b.italic, size: 9.5, color: INK_SOFT }
  );

  // ── 4. Cumplimiento normativo ───────────────────────────────────
  b.heading("4. Cumplimiento normativo");
  b.sub("Protección de datos (RGPD / LOPDGDD)");
  b.bullet("los datos personales se utilizan únicamente para generar los documentos del trámite. No se venden, no se ceden a terceros y no se usan con fines publicitarios.", { boldLead: "Finalidad única:" });
  b.bullet("ningún dato personal se recoge sin consentimiento explícito previo, solicitado en la propia conversación.", { boldLead: "Consentimiento:" });
  b.bullet("los datos de sesiones anónimas se eliminan automáticamente a las 24 horas. Los usuarios registrados pueden eliminar sus procesos en cualquier momento.", { boldLead: "Minimización y plazos:" });
  b.bullet("cifrado en tránsito, aislamiento por usuario a nivel de base de datos (políticas RLS), registros sin datos personales, acceso administrativo restringido y auditado.", { boldLead: "Medidas técnicas:" });
  b.bullet("las fotografías de documentos se procesan en memoria y no se almacenan; solo se conservan los datos extraídos, bajo el mismo consentimiento.", { boldLead: "Imágenes:" });
  b.bullet("responsable del tratamiento: Fundació Tierra Digna. Los derechos de acceso, rectificación, supresión y retirada del consentimiento pueden ejercerse contactando con la Fundación; cabe reclamación ante la AEPD.", { boldLead: "Responsable y derechos:" });
  b.sub("Reglamento europeo de IA (EU AI Act)");
  b.bullet("conforme al artículo 50, la aplicación informa de manera clara y permanente de que la persona interactúa con un sistema de inteligencia artificial y no con un abogado.", { boldLead: "Transparencia:" });
  b.bullet("Pathfinder orienta e informa; no adopta decisiones con efectos jurídicos sobre las personas. La presentación del trámite y cualquier decisión la realiza siempre la persona o la administración.", { boldLead: "Posición funcional:" });
  b.bullet("los documentos generados indican expresamente que deben revisarse antes de su presentación oficial.", { boldLead: "Revisión humana:" });
  b.sub("Evaluación de impacto");
  b.para(
    "El proyecto mantiene una evaluación de impacto de protección de datos (DPIA) viva que documenta categorías de datos, riesgos y mitigaciones, pendiente de validación jurídica externa antes del despliegue a gran escala."
  );

  // ── 5. Términos de uso (resumen) ────────────────────────────────
  b.heading("5. Términos y condiciones (resumen)");
  b.para("El texto completo está disponible en la aplicación (/terms). Puntos esenciales:");
  b.bullet("el servicio es gratuito y está dirigido a personas migrantes en España y a las entidades que las acompañan.", { boldLead: "Gratuidad:" });
  b.bullet("Pathfinder ofrece orientación e información general, generada con asistencia de IA. No constituye asesoramiento jurídico ni crea relación letrado-cliente.", { boldLead: "Naturaleza del servicio:" });
  b.bullet("la información puede contener errores o quedar desactualizada tras cambios normativos. La persona debe revisar todos los documentos antes de presentarlos y, en casos complejos, acudir a un profesional o entidad especializada.", { boldLead: "Límites de exactitud:" });
  b.bullet("la Fundación no se hace responsable de las decisiones administrativas que recaigan sobre los trámites de los usuarios, ni de los daños derivados de información incorrecta, sin perjuicio de los derechos que la ley reconoce al usuario.", { boldLead: "Responsabilidad:" });
  b.bullet("queda prohibido el uso del servicio con fines fraudulentos, para fines comerciales no autorizados o para introducir datos de terceros sin su consentimiento.", { boldLead: "Uso aceptable:" });
  b.bullet("el tratamiento de datos personales se rige por la política de privacidad (/privacy).", { boldLead: "Privacidad:" });
  b.bullet("legislación española; los conflictos se someterán a los juzgados y tribunales competentes conforme a la normativa de consumidores.", { boldLead: "Ley aplicable:" });

  // ── 6. Estado y contacto ────────────────────────────────────────
  b.heading("6. Estado del producto y contacto");
  b.bullet("producto operativo en fase de pilotaje con usuarios acompañados por personal social. Auditoría de seguridad interna completada; suite de pruebas automatizadas y monitorización de errores en producción.", { boldLead: "Estado:" });
  b.bullet("validación jurídica externa del contenido y de la documentación de cumplimiento; ampliación del directorio de entidades por provincia; canal WhatsApp.", { boldLead: "En curso:" });
  b.bullet("Fundació Tierra Digna (entidad responsable) — proyecto desarrollado con el apoyo de Vloggin SAS.", { boldLead: "Contacto:" });
  b.spacer(20);
  b.para(
    "Documento generado en junio de 2026. La información refleja el estado del producto y del marco normativo en esa fecha.",
    { size: 9, font: b.italic, color: INK_SOFT }
  );

  const bytes = await b.doc.save();
  const out = join(process.cwd(), "public", "pathfinder-dossier.pdf");
  writeFileSync(out, bytes);
  console.log(`✓ ${out} (${Math.round(bytes.length / 1024)} KB, ${b.pageNum} pages)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
