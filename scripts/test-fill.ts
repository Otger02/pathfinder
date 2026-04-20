import { fillExForm } from "../lib/pdf/form-filler";
import { writeFileSync } from "fs";

async function main() {
  try {
    console.log("Loading form filler...");
    const result = await fillExForm(
      "EX-10",
      {
        nombre: "Juan",
        primerApellido: "Garcia",
        segundoApellido: "Lopez",
        nie: "Y1234567",
        nacionalidad: "Colombia",
        fechaNacimiento: "1990-05-15",
        sexo: "H",
        estadoCivil: "soltero",
        domicilio: "Calle Mayor 10",
        localidad: "Madrid",
        codigoPostal: "28001",
        provincia: "Madrid",
        telefono: "612345678",
        email: "juan@example.com",
      },
      "arraigo_social"
    );
    if (result) {
      writeFileSync("test-filled.pdf", result);
      console.log("OK — wrote test-filled.pdf (" + result.length + " bytes)");
    } else {
      console.log("fillExForm returned null");
    }
  } catch (e: any) {
    console.error("Error:", e.message);
    console.error(e.stack);
  }
}
main();
