# Guion de testeo beta — Pathfinder (TràmitIA)

**Para quién es este documento:** cualquier persona que vaya a probar la app, sin necesidad de conocer el código.

**Qué es Pathfinder:** un asistente legal-administrativo para personas migrantes en España. Incluye: árbol de decisión guiado, chat con inteligencia artificial, lectura de documentos por foto, autorrelleno de formularios EX en PDF, recursos de emergencia (SOS) y guardado de progreso con cuenta.

**Dispositivo recomendado para el test:** un Android de gama baja/media con Chrome actualizado. Si puedes, prueba también con datos móviles (no solo wifi).

**URL de pruebas:** ___________________________ (la facilita el equipo; debe ser HTTPS).

Apunta para cada escenario: PASA / FALLA + capturas si algo falla + modelo de móvil y versión de Android.

---

## A. Checklist de instalación PWA (Android + Chrome)

1. Abre la URL de pruebas en Chrome (Android).
2. Navega un poco (entra en el chat) y vuelve a la portada.
3. Abre el menú de Chrome (⋮) → debería aparecer **"Añadir a pantalla de inicio"** o **"Instalar aplicación"**. En algunos móviles Chrome muestra un aviso de instalación automáticamente.
4. Instala la app.
5. Cierra Chrome del todo y abre la app desde el icono **Pathfinder** de la pantalla de inicio.

**Criterio PASA:**
- [ ] Chrome ofrece la opción de instalar (no solo "crear acceso directo").
- [ ] El icono en la pantalla de inicio es la brújula de Pathfinder (no un icono genérico ni recortado: la brújula debe verse entera aunque el móvil use iconos redondos).
- [ ] Al abrirla desde el icono, la app se abre **sin la barra de direcciones de Chrome** (pantalla completa, modo standalone).
- [ ] La barra de estado / cabecera usa el color verde de la app, no blanco/negro genérico.

**FALLA si:** no aparece la opción de instalar, el icono sale recortado, o la app se abre como una pestaña normal de Chrome.

---

## B. Checklist de modo offline

> Importante: el modo offline solo funciona en producción y después de haber visitado la app al menos una vez con conexión.

1. Con conexión, abre la app instalada y entra al chat **una vez** (esto descarga y guarda el árbol de decisión). Puedes salir.
2. Activa el **modo avión**.
3. Cierra la app y vuelve a abrirla desde el icono.
4. Intenta navegar a la portada y al chat.
5. **Recorre el árbol de decisión completo, sin conexión**: elige idioma, responde varias preguntas hasta llegar a un resultado (p. ej. el flujo de arraigo).
6. Intenta enviar un mensaje al asistente (esto SÍ necesita conexión).
7. Intenta entrar en una página que NO hayas visitado antes (p. ej. escribe la URL `/privacy` si no la habías abierto).
8. Desactiva el modo avión y reintenta.

**Criterio PASA:**
- [ ] Con modo avión, la app abre y muestra la portada o el chat (versión guardada), no el dinosaurio de Chrome.
- [ ] **El árbol de decisión funciona entero sin conexión**: preguntas, opciones traducidas y resultados se ven, aunque estés en modo avión. (Solo el botón "Hablar con el asistente" requiere conexión.)
- [ ] Al enviar un mensaje sin conexión aparece un error controlado (no se queda colgada para siempre).
- [ ] Al entrar en una página no visitada sin conexión, aparece la página **"Sin conexión a internet"** en castellano, con el teléfono 112 y un botón de reintentar.
- [ ] Al recuperar la conexión y pulsar "Reintentar", la app vuelve a funcionar sin tener que reinstalarla.

**FALLA si:** aparece el error de red del navegador, la app se queda en blanco, o tras recuperar conexión sigue mostrando contenido roto.

---

## C. Escenarios end-to-end

### Escenario 1 — Selección de idioma y árabe (RTL)

1. Abre la portada en un navegador en modo incógnito (sin sesión).
2. Observa la rueda de idiomas / la cuadrícula manual de idiomas.
3. Selecciona **العربية (árabe)** y entra al chat.
4. Vuelve atrás y repite con **français**.

**PASA si:** el chat carga en el idioma elegido; en árabe el texto se alinea a la derecha (RTL) y la tipografía árabe se lee bien; los botones del árbol de decisión están traducidos.
**FALLA si:** textos mezclados en varios idiomas, árabe alineado a la izquierda o caracteres rotos.

### Escenario 2 — Árbol de decisión hasta resultado (arraigo)

1. Entra en el chat en **castellano** sin iniciar sesión.
2. Acepta el consentimiento si aparece.
3. Responde el árbol de decisión simulando este perfil: persona sin papeles, más de 2 años en España, con medios de vida / oferta de trabajo (elige las opciones que se acerquen más).
4. Llega hasta una pantalla de **resultado** (debería orientarte hacia un arraigo).
5. Observa las "migas" del camino recorrido (chips con tus respuestas) y el botón para volver a empezar.
6. Pulsa **"Hablar con el asistente"**.

**PASA si:** cada respuesta lleva a la siguiente pregunta sin recargar la página; el resultado es coherente con el perfil (alguna modalidad de arraigo); el botón lleva al chat con el contexto del resultado.
**FALLA si:** el árbol se queda colgado, salta a un resultado incoherente, o "Hablar con el asistente" pierde el contexto.

### Escenario 3 — Chat con el asistente (RAG) + lectura en voz alta (TTS)

1. Desde el resultado del escenario 2, ya en fase chat, pregunta: *"¿Qué documentos necesito para el arraigo social?"*
2. Espera la respuesta (debería ir apareciendo poco a poco, en streaming).
3. Haz una segunda pregunta de seguimiento: *"¿Y si no tengo contrato de trabajo?"*
4. En una respuesta del asistente, pulsa el botón de **altavoz/escuchar** de la burbuja del mensaje.

**PASA si:** la respuesta aparece progresivamente (no toda de golpe tras una espera larga); el contenido habla de documentos concretos del arraigo; la segunda respuesta tiene en cuenta la conversación; el móvil lee el mensaje en voz alta y se puede parar.
**FALLA si:** error al responder, respuesta genérica sin relación con extranjería, o el TTS no suena / no se puede detener.

### Escenario 4 — Entrada de voz (dictado al chat)

1. En el chat, pulsa el botón de **micrófono**.
2. Concede el permiso de micrófono cuando lo pida el navegador.
3. Dicta una pregunta corta (p. ej. *"cuánto tiempo tarda el arraigo"*) y detén la grabación.

**PASA si:** el audio se transcribe y aparece como texto en el chat (o en el campo de entrada) y el asistente responde a lo dictado.
**FALLA si:** el permiso no se solicita, la app se cuelga al grabar, o la transcripción no llega nunca.

### Escenario 5 — Foto de un documento (visión)

1. En el chat, pulsa el botón de **adjuntar/cámara** y sube una foto de un documento de prueba (NO uses un documento real con datos personales reales: usa un pasaporte de muestra impreso o una imagen de prueba que te facilite el equipo).
2. Espera el análisis.

**PASA si:** la app acepta JPG/PNG/WebP, muestra un análisis del documento con los campos detectados (nombre, números, fechas…) y, si detecta plazos, los destaca; indica que los datos se han guardado para el expediente.
**FALLA si:** la subida falla con fotos hechas con la cámara del móvil (tamaño grande), o el análisis no devuelve nada.

### Escenario 6 — Autorrelleno de formulario EX y PDF

1. Continúa la conversación del escenario 2/3 hasta que el asistente proponga preparar el formulario, o usa el banner de **regularización (EX-31/EX-32)** de la portada si está visible.
2. Llega a la pantalla de **datos personales** (formulario por secciones: identidad, documentos, dirección, contacto).
3. Rellena los campos con datos ficticios (nombre inventado, NIE de prueba, una provincia real del desplegable).
4. Pulsa **generar PDF**.
5. Abre el PDF descargado en el móvil.

**PASA si:** el formulario indica qué campos faltan; el desplegable de provincias funciona; el PDF generado es el modelo EX correcto y los datos escritos aparecen en las casillas correctas del PDF oficial.
**FALLA si:** el PDF sale vacío, con campos descolocados, o la generación da error.

### Escenario 7 — Resumen del caso y borrador de email

1. Con una conversación avanzada (escenarios 2-6), pide o localiza la opción de **resumen** del caso (tarjeta de resumen / PDF de resumen).
2. Si el flujo lo ofrece, genera también el **borrador de email** (p. ej. para pedir cita o contactar con una entidad).

**PASA si:** el resumen refleja lo dicho en la conversación (vía elegida, documentos, datos); el borrador de email está en castellano correcto, listo para copiar/enviar.
**FALLA si:** el resumen contiene datos que nunca diste, o la generación falla.

### Escenario 8 — SOS desde el chat (palabra clave) y pantalla policía

> Avisa antes al equipo: este escenario puede iniciar una grabación de evidencias.

1. En el chat, escribe un mensaje que describa una emergencia (p. ej. *"la policía me ha parado y me quieren detener"*).
2. Debería aparecer el **overlay SOS** encima del chat.
3. Revisa las tres vistas: **emergencia** (teléfonos: 112, etc., con enlaces de llamada), **derechos**, y **"mostrar a la policía"**.
4. Si se ofrece, inicia la **grabación** y verifica que aparece el aviso legal y el indicador de grabación; detenla después.
5. Cierra el overlay y comprueba que el chat sigue donde estaba.

**PASA si:** el overlay aparece automáticamente al detectar la frase; los teléfonos son pulsables (`tel:`); la vista policía muestra el mensaje multilingüe; la grabación se puede iniciar y detener con aviso visible.
**FALLA si:** el overlay no salta, no se puede cerrar, o la grabación se inicia sin indicador.

### Escenario 9 — SOS con conexión intermitente (cola de subida)

> Requiere coordinarse con el equipo para verificar la parte de servidor.

1. Repite el inicio de grabación SOS del escenario 8.
2. A mitad de grabación, activa el **modo avión** 30-60 segundos y luego desactívalo.
3. Detén la grabación y espera 1-2 minutos con conexión.

**PASA si:** la app no pierde la grabación: los trozos pendientes se reenvían solos al volver la conexión (el equipo lo confirma en el panel de administración de grabaciones).
**FALLA si:** la grabación se corta de forma irrecuperable o la app se cuelga al perder la red.

### Escenario 10 — Guardar progreso, cuenta y panel

1. En el chat anónimo, localiza el banner **"guardar progreso"** y púlsalo.
2. Crea una cuenta / inicia sesión (email de prueba).
3. Tras volver al chat, verifica que la conversación sigue ahí.
4. Visita el **panel** (`/dashboard`): debería mostrar tu proceso (p. ej. "Arraigo social") y su estado.
5. Visita **documentos** (`/documents`): deberían aparecer los formularios EX asociados a tu vía y el resumen, regenerables al pulsarlos.
6. Visita el **historial** (`/chat/history`).
7. Cierra sesión (o abre incógnito) e intenta entrar directamente en `/chat/history` → debería redirigirte a la pantalla de acceso.

**PASA si:** el progreso no se pierde al registrarse; panel, documentos e historial muestran datos coherentes con la conversación; las rutas protegidas redirigen a `/auth` sin sesión.
**FALLA si:** la conversación desaparece tras crear la cuenta, o se puede acceder al historial sin sesión.

---

## D. Pruebas adicionales rápidas (si hay tiempo)

- **Red lenta:** en Chrome de escritorio, DevTools → Network → "Slow 3G". Las páginas ya visitadas deberían cargar desde caché en pocos segundos (el service worker deja de esperar a la red pasados ~5 s en navegaciones).
- **Actualización de la app:** tras un despliegue nuevo, cierra y reabre la app dos veces; debería verse la versión nueva sin reinstalar.
- **Botón SOS flotante:** con sesión iniciada, en `/dashboard` o `/cases` debe verse el botón rojo SOS flotante con los teléfonos de emergencia.
- **Accesibilidad básica:** sube el tamaño de fuente del sistema al máximo y revisa que el chat y el árbol siguen siendo usables.

---

## E. Qué reportar

Para cada fallo: escenario y paso, qué esperabas, qué pasó, captura de pantalla, modelo de móvil, versión de Android y de Chrome, y tipo de conexión (wifi / datos / modo avión).
