/**
 * scripts/generate-test-specimens.ts
 *
 * Generates the two FICTITIOUS test documents used to demo/test the
 * vision intake feature, with mutually consistent data:
 *
 *   1. public/especimen-passaport.png  — fake Moroccan passport (image path)
 *   2. public/especimen-contracte.pdf  — fake work contract for arraigo
 *      sociolaboral (PDF path), with the employer block + the personal
 *      fields the passport doesn't carry (address, phone, civil status,
 *      parents) so the two docs together complete the EX-10 data set.
 *
 * Both are watermarked ESPECIMEN / DADES FICTÍCIES. The person and the
 * company do not exist. Run: npx tsx scripts/generate-test-specimens.ts
 */

import { createCanvas } from "canvas";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { writeFileSync } from "fs";
import { join } from "path";

// ── Shared fictitious persona (keep both documents consistent) ────
const PERSONA = {
  nombre: "AMINA",
  apellido: "EL KHAYAT",
  pasaporte: "ZX9842215",
  nacimiento: "14/05/1993",
  lugar: "CASABLANCA",
  pais: "MARRUECOS",
  nacionalidad: "MARROQUÍ",
  sexo: "F",
  // Fields the passport does NOT carry — they live in the contract:
  domicilio: "Carrer Acadèmia, 14, 2n",
  localidad: "LLEIDA",
  cp: "25002",
  provincia: "LLEIDA",
  telefono: "632 775 889",
  email: "amina.elkhayat@example.com",
  estadoCivil: "SOLTERA",
  padre: "HASSAN",
  madre: "NAIMA",
};

const EMPRESA = {
  nombre: "RESTAURANT CAL JORDI SL",
  nif: "B25876543",
  actividad: "Hostelería — Restauración (CNAE 5610)",
  domicilio: "Carrer Major, 22",
  localidad: "LLEIDA",
  cp: "25007",
  provincia: "LLEIDA",
  telefono: "973 201 540",
  email: "gestio@caljordi.example",
  representante: "JORDI VILALTA PONS",
  repDni: "43712889K",
};

// ── 1. Passport PNG ────────────────────────────────────────────────
function renderPassport(): Buffer {
  const W = 1400;
  const H = 980;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Burgundy cover-ish background frame + inner page
  ctx.fillStyle = "#7a1f2b";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(28, 28, W - 56, H - 56);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 30px Arial";
  ctx.fillText("ROYAUME DU MAROC — KINGDOM OF MOROCCO", 70, 100);
  ctx.font = "26px Arial";
  ctx.fillText("PASSEPORT / PASSPORT / PASAPORTE", 70, 140);

  // Photo placeholder
  ctx.fillStyle = "#c9c2b4";
  ctx.fillRect(70, 180, 300, 380);
  ctx.fillStyle = "#8a8374";
  ctx.beginPath();
  ctx.arc(220, 310, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(140, 400, 160, 160);

  // Data fields
  const fields: Array<[string, string]> = [
    ["Type / Tipo", "P"],
    ["Passport No / N.º pasaporte", PERSONA.pasaporte],
    ["Surname / Apellidos", PERSONA.apellido],
    ["Given names / Nombre", PERSONA.nombre],
    ["Nationality / Nacionalidad", "MAROCAINE / " + PERSONA.nacionalidad],
    ["Date of birth / F. nacimiento", PERSONA.nacimiento],
    ["Place of birth / Lugar", `${PERSONA.lugar}, ${PERSONA.pais}`],
    ["Sex / Sexo", PERSONA.sexo],
    ["Date of issue / F. expedición", "02/03/2021"],
    ["Date of expiry / F. caducidad", "01/03/2031"],
  ];
  let y = 210;
  for (const [label, value] of fields) {
    ctx.fillStyle = "#6b6557";
    ctx.font = "20px Arial";
    ctx.fillText(label, 420, y);
    ctx.fillStyle = "#111111";
    ctx.font = "bold 28px Arial";
    ctx.fillText(value, 420, y + 32);
    y += 70;
  }

  // MRZ-style lines (visually plausible, not a valid checksum)
  ctx.fillStyle = "#111111";
  ctx.font = "bold 30px Courier New";
  ctx.fillText("P<MAREL<KHAYAT<<AMINA<<<<<<<<<<<<<<<<<<<<<<<", 70, 850);
  ctx.fillText("ZX9842215<2MAR9305149F3103012<<<<<<<<<<<<<04", 70, 890);

  // SPECIMEN watermark
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 8);
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#a00000";
  ctx.font = "bold 130px Arial";
  ctx.textAlign = "center";
  ctx.fillText("ESPECIMEN", 0, 0);
  ctx.font = "bold 44px Arial";
  ctx.fillText("DOCUMENT DE PROVA — DADES FICTÍCIES", 0, 80);
  ctx.restore();

  return canvas.toBuffer("image/png");
}

// ── 2. Work-contract PDF ───────────────────────────────────────────
async function renderContract(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  const M = 60;
  let y = 780;

  const text = (s: string, opts: { size?: number; b?: boolean; x?: number } = {}) => {
    page.drawText(s, {
      x: opts.x ?? M,
      y,
      size: opts.size ?? 10,
      font: opts.b ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= (opts.size ?? 10) + 6;
  };
  const gap = (h = 8) => { y -= h; };

  text("CONTRATO DE TRABAJO", { size: 16, b: true });
  text("(condicionado a la concesión de la autorización de residencia y trabajo —", { size: 9 });
  text("arraigo sociolaboral, art. 127.b RD 1155/2024)", { size: 9 });
  gap(10);

  text("REUNIDOS", { size: 11, b: true });
  gap(2);
  text("DE UNA PARTE — LA EMPRESA:", { b: true });
  text(`Razón social: ${EMPRESA.nombre}`);
  text(`NIF: ${EMPRESA.nif}`);
  text(`Actividad: ${EMPRESA.actividad}`);
  text(`Domicilio social: ${EMPRESA.domicilio}, ${EMPRESA.cp} ${EMPRESA.localidad} (${EMPRESA.provincia})`);
  text(`Teléfono: ${EMPRESA.telefono}   ·   Email: ${EMPRESA.email}`);
  text(`Representante legal: ${EMPRESA.representante}, DNI ${EMPRESA.repDni}, en calidad de Administrador`);
  gap(8);

  text("DE OTRA PARTE — LA PERSONA TRABAJADORA:", { b: true });
  text(`Nombre y apellidos: ${PERSONA.nombre} ${PERSONA.apellido}`);
  text(`Pasaporte: ${PERSONA.pasaporte} (${PERSONA.nacionalidad})`);
  text(`Fecha de nacimiento: ${PERSONA.nacimiento} — ${PERSONA.lugar}, ${PERSONA.pais}`);
  text(`Estado civil: ${PERSONA.estadoCivil}`);
  text(`Hija de ${PERSONA.padre} y de ${PERSONA.madre}`);
  text(`Domicilio: ${PERSONA.domicilio}, ${PERSONA.cp} ${PERSONA.localidad} (${PERSONA.provincia})`);
  text(`Teléfono: ${PERSONA.telefono}   ·   Email: ${PERSONA.email}`);
  gap(8);

  text("CLÁUSULAS", { size: 11, b: true });
  gap(2);
  text("1.ª OBJETO — La empresa contrata a la persona trabajadora como AYUDANTE DE COCINA.");
  text("2.ª JORNADA — 30 horas semanales, de lunes a sábado según cuadrante.");
  text("3.ª SALARIO — 1.350 € brutos mensuales en 12 pagas, conforme al convenio de hostelería de Lleida.");
  text("4.ª DURACIÓN — Contrato indefinido. La eficacia del presente contrato queda condicionada a la");
  text("     concesión de la autorización de residencia y trabajo por arraigo sociolaboral.");
  text("5.ª CENTRO DE TRABAJO — " + `${EMPRESA.domicilio}, ${EMPRESA.localidad}.`);
  gap(14);

  text(`En ${EMPRESA.localidad}, a 5 de junio de 2026`, {});
  gap(28);
  text("La empresa                                          La persona trabajadora", { size: 10 });
  text(`${EMPRESA.representante}                            ${PERSONA.nombre} ${PERSONA.apellido}`, { size: 9 });

  // Watermark on top
  page.drawText("ESPECIMEN", {
    x: 110, y: 360, size: 72, font: bold,
    color: rgb(0.85, 0.1, 0.1), opacity: 0.16, rotate: degrees(30),
  });
  page.drawText("DOCUMENT DE PROVA — DADES FICTÍCIES", {
    x: 110, y: 320, size: 20, font: bold,
    color: rgb(0.85, 0.1, 0.1), opacity: 0.2, rotate: degrees(30),
  });

  return doc.save();
}

async function main() {
  const png = renderPassport();
  const pngPath = join(process.cwd(), "public", "especimen-passaport.png");
  writeFileSync(pngPath, png);
  console.log(`✓ ${pngPath} (${Math.round(png.length / 1024)} KB)`);

  const pdf = await renderContract();
  const pdfPath = join(process.cwd(), "public", "especimen-contracte.pdf");
  writeFileSync(pdfPath, pdf);
  console.log(`✓ ${pdfPath} (${Math.round(pdf.length / 1024)} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
