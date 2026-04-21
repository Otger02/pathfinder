import { fillExForm } from "../lib/pdf/form-filler";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

async function main() {
  const OUT = join(process.cwd(), "output");
  mkdirSync(OUT, { recursive: true });

  const sample = {
    pasaporte: "AB123456",
    nie: "X1234567Z",
    primerApellido: "García",
    segundoApellido: "López",
    nombre: "Mohamed",
    fechaNacimiento: "1990-05-15",
    lugarNacimiento: "Casablanca",
    paisNacimiento: "Marruecos",
    nacionalidad: "Marroquí",
    sexo: "H" as const,
    estadoCivil: "soltero" as const,
    nombrePadre: "Ahmed García",
    nombreMadre: "Fátima López",
    domicilio: "Calle Mayor",
    numeroDomicilio: "10",
    pisoDomicilio: "2A",
    localidad: "Barcelona",
    codigoPostal: "08001",
    provincia: "Barcelona",
    telefono: "612345678",
    email: "mohamed@example.com",

    familiar_pasaporte: "CD789012",
    familiar_nie: "Y7654321B",
    familiar_primerApellido: "García",
    familiar_segundoApellido: "Martín",
    familiar_nombre: "Aicha",
    familiar_fechaNacimiento: "1992-03-20",
    familiar_lugarNacimiento: "Rabat",
    familiar_paisNacimiento: "Marruecos",
    familiar_nacionalidad: "Marroquí",
    familiar_sexo: "M" as const,
    familiar_estadoCivil: "casado" as const,
    familiar_nombrePadre: "Omar García",
    familiar_nombreMadre: "Khadija Martín",
    familiar_domicilio: "Calle Mayor",
    familiar_numeroDomicilio: "10",
    familiar_pisoDomicilio: "2A",
    familiar_localidad: "Barcelona",
    familiar_codigoPostal: "08001",
    familiar_provincia: "Barcelona",
    familiar_vinculo: "Cónyuge",

    representanteLegal: "Ana Martínez",
    representanteDniNiePas: "Y9876543X",
    representanteTitulo: "Abogada",

    repPresentacion_nombre: "Ana Martínez Abogados SLP",
    repPresentacion_dniNiePas: "Y9876543X",
    repPresentacion_domicilio: "Carrer de Balmes",
    repPresentacion_numero: "45",
    repPresentacion_piso: "2n 1a",
    repPresentacion_localidad: "Barcelona",
    repPresentacion_codigoPostal: "08007",
    repPresentacion_provincia: "Barcelona",
    repPresentacion_telefono: "932109876",
    repPresentacion_email: "ana@martinezabogados.es",
    repPresentacion_repLegal: "Ana Martínez",
    repPresentacion_repDniNiePas: "Y9876543X",
    repPresentacion_repTitulo: "Abogada",

    notif_nombre: "Ana Martínez Abogados SLP",
    notif_dniNiePas: "Y9876543X",
    notif_domicilio: "Carrer de Balmes",
    notif_numero: "45",
    notif_piso: "2n 1a",
    notif_localidad: "Barcelona",
    notif_codigoPostal: "08007",
    notif_provincia: "Barcelona",
    notif_telefono: "932109876",
    notif_email: "ana@martinezabogados.es",
  };

  try {
    console.log("\n📄 Generando EX-02 con datos de prueba...\n");
    const bytes = await fillExForm("EX-02", sample, "reagrupacio_familiar");

    if (!bytes) {
      console.error("❌ Error: No se pudo generar el PDF (template o field map no disponible)");
      process.exit(1);
    }

    const outputPath = join(OUT, "EX-02-test-filled.prueba2.pdf");
    writeFileSync(outputPath, bytes);

    console.log("✅ PDF generado correctamente\n");
    console.log("📊 Información del resultado:");
    console.log(`   Tamaño: ${(bytes.length / 1024).toFixed(1)} KB`);
    console.log(`   Ubicación: ${outputPath}\n`);
    console.log("🎯 Próximo paso: Abre el PDF con un lector PDF para validar el mapping visualmente");

  } catch (e: any) {
    console.error("❌ Error durante la generación:", e.message);
    process.exit(1);
  }
}

main().catch(console.error);
