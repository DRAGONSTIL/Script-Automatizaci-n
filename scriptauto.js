/***********************************************************
 * SISTEMA UNIFICADO · EXPEDIENTE + CREDENCIAL + IA + REPORTES
 * v7.6 — Desarrollado por Guillermo Elizalde
 *
 * © 2025 Guillermo Elizalde. Todos los derechos reservados.
 * Este sistema fue diseñado y programado por Guillermo Elizalde.
 * Redistribución o remoción de créditos sin autorización
 * del autor original queda prohibida.
 ***********************************************************/

/* ═══════════════════════════════════════════════════════
   AUTORÍA — NO MODIFICAR · DO NOT MODIFY
   Removing or altering these constants will break the system.
═══════════════════════════════════════════════════════ */
const AUTOR         = "Guillermo Elizalde";
const AUTOR_TAG     = "GE-v7.6";
const AUTOR_LI      = "https://www.linkedin.com/in/guillermo-san-juan-elizalde-032930211?utm_source=share_via&utm_content=profile&utm_medium=member_ios";
const _FIRMA_HEX_   = "4775696c6c65726d6f20456c697a616c6465";
const _FIRMA_CHECK_ = "GE2025-7260696c6c65726d6f";

function verificarAutoria_() {
  const calc = AUTOR.split("").map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join("");
  if (calc !== _FIRMA_HEX_) {
    throw new Error(
      "🔒 SISTEMA BLOQUEADO\n\n" +
      "Se detectó una modificación no autorizada de la firma del autor.\n" +
      "Este sistema fue desarrollado por Guillermo Elizalde.\n" +
      "Para soporte y licencia: contacta al desarrollador original."
    );
  }
  if (!_FIRMA_CHECK_.startsWith("GE2025")) {
    throw new Error("🔒 Firma secundaria inválida. Sistema bloqueado.");
  }
}

function selloGE_() {
  return `\n\n─────────────────────────────\n⚡ Sistema desarrollado por ${AUTOR} [${AUTOR_TAG}]\n🔗 ${AUTOR_LI}`;
}


/* ═══════════════════════════════════════════════════════
   CONFIGURACIÓN BASE
═══════════════════════════════════════════════════════ */
const CONFIG = {
  ROOT_FOLDER_ID:     "",
  TEMPLATE_SLIDES_ID: "",

  REPORTES_ROOT_FOLDER_ID:  "",
  TEMPLATE_REPORTE_ID:      "",
  INSTRUCCIONES_REPORTE_ID: "",

  GEMINI_MODEL:      "gemini-2.5-flash",
  GEMINI_REINTENTOS: 5,
  GEMINI_ESPERA_MS:  3000,
  AI_PROVIDER:       "gemini",   // "gemini" | "groq" | "mistral"
  GROQ_MODEL:        "meta-llama/llama-4-scout-17b-16e-instruct",
  MISTRAL_OCR_MODEL: "mistral-ocr-latest",
  MISTRAL_CHAT_MODEL: "mistral-small-latest",

  VIGENCIA_MESES: 6,
  SKIP_COMPLETED: true,

  EMPRESA:  "Mi Empresa",
  EMAIL_RH: "",

  CAMPOS: {
    NOMBRE:        { campo: "NOMBRE COMPLETO" },
    SUCURSAL:      { campo: "SUCURSAL EN LA QUE REALIZARAS TU ESTADIA." },
    AREA:          { campo: "Área de Estadía" },
    FECHA_INGRESO: { campo: "Fecha de Ingreso" },
    CORREO:        { campo: "Dirección de correo electrónico" },
    INE:           { campo: "Identificación Oficial (INE)",           destino: "01_Documentos_Adjuntos/INE",                       prefijo: "INE"      },
    CURP_DOC:      { campo: "Documento CURP",                         destino: "01_Documentos_Adjuntos/CURP_Documento",             prefijo: "CURP_DOC" },
    DOMICILIO:     { campo: "Comprobante de Domicilio",               destino: "01_Documentos_Adjuntos/Comprobante_Domicilio",     prefijo: "DOMICILIO"},
    CV:            { campo: "Historial Académico y Currículum Vitae", destino: "01_Documentos_Adjuntos/Historial_Academico_y_CV",  prefijo: "CV"       },
    IMSS:          { campo: "Seguro (IMSS o Facultativo)",            destino: "01_Documentos_Adjuntos/Seguro_IMSS_o_Facultativo", prefijo: "SEGURO"   },
    FOTO:          { campo: "Fotografía con Fondo Blanco",            destino: "01_Documentos_Adjuntos/Foto_Fondo_Blanco",         prefijo: "FOTO"     },
    CARTA:         { campo: "Carta de Presentación",                  destino: "02_Cartas/Carta_de_Presentacion",                  prefijo: "CARTA"    }
  },

  STRUCTURE: {
    "01_Documentos_Adjuntos": [
      "INE", "CURP_Documento", "Comprobante_Domicilio",
      "Historial_Academico_y_CV", "Seguro_IMSS_o_Facultativo", "Foto_Fondo_Blanco"
    ],
    "02_Cartas":      ["Carta_de_Presentacion"],
    "03_Seguimiento": [],
    "04_Credencial":  []
  },

  PH: {
    NOMBRE: "{{NOMBRE}}", VIGENCIA: "{{VIGENCIA}}", SUCURSAL: "{{SUCURSAL}}",
    ID: "{{ID}}", CURP: "{{CURP}}", NSS: "{{NSS}}", FOTO: "{{FOTO}}"
  }
};

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

/* ── Esquemas de hojas ─────────────────────────────────── */
const CONFIG_ESQUEMA_ = [
  ["EMPRESA",                   "Nombre de la empresa (aparece en correos y reportes)"],
  ["EMAIL_RH",                  "Correo de RH — recibe copia de cada correo de onboarding"],
  ["VIGENCIA_MESES",            "Meses de vigencia de la credencial (número)"],
  ["ROOT_FOLDER_ID",            "ID de la carpeta raíz de expedientes en Drive"],
  ["REPORTES_ROOT_FOLDER_ID",   "ID de la carpeta raíz de reportes en Drive"],
  ["TEMPLATE_SLIDES_ID",        "ID de la plantilla de credencial (Google Slides)"],
  ["TEMPLATE_REPORTE_ID",       "ID de la plantilla del reporte diario"],
  ["INSTRUCCIONES_REPORTE_ID",  "ID del archivo de instrucciones del reporte"],
  ["GEMINI_MODEL",              "Modelo de Gemini (ej: gemini-2.5-flash)"],
  ["GEMINI_REINTENTOS",         "Reintentos automáticos si Gemini falla (recomendado: 3)"],
  ["GEMINI_ESPERA_MS",          "Espera base entre reintentos (ms)"],
  ["AI_PROVIDER",               "Proveedor de IA: gemini | groq | mistral"],
  ["GROQ_MODEL",                "Modelo de Groq (ej: meta-llama/llama-4-scout-17b-16e-instruct)"],
  ["MISTRAL_OCR_MODEL",         "Modelo OCR de Mistral (ej: mistral-ocr-latest)"],
  ["MISTRAL_CHAT_MODEL",        "Modelo chat de Mistral para extracción (ej: mistral-small-latest)"],
  ["SKIP_COMPLETED",            "TRUE = omitir filas ✅ al procesar toda la hoja"]
];

const CORREO_ESQUEMA_ = [
  ["ASUNTO",              "Asunto del correo. Variables: {NOMBRE} {SUCURSAL} {AREA} {EMPRESA}"],
  ["SALUDO",              "Primera línea. Ej: Hola {NOMBRE},"],
  ["TEXTO_PRINCIPAL",     "Párrafo principal del correo"],
  ["TEXTO_BOTON",         "Texto del botón"],
  ["PIE",                 "Texto del pie. Ej: Recursos Humanos · {EMPRESA}"],
  ["COLOR_PRINCIPAL",     "Color principal hex. Ej: #1a237e"],
  ["ARCHIVO_EXTRA_1_ID",     "ID Drive del archivo extra 1 (opcional)"],
  ["ARCHIVO_EXTRA_1_NOMBRE", "Nombre del archivo extra 1"],
  ["ARCHIVO_EXTRA_2_ID",     "ID Drive del archivo extra 2 (opcional)"],
  ["ARCHIVO_EXTRA_2_NOMBRE", "Nombre del archivo extra 2"],
  ["ARCHIVO_EXTRA_3_ID",     "ID Drive del archivo extra 3 (opcional)"],
  ["ARCHIVO_EXTRA_3_NOMBRE", "Nombre del archivo extra 3"],
  ["MODO_EDITOR",           "simple | bloques | wysiwyg. Default: simple"],
  ["BLOQUES_JSON",          "JSON de bloques del correo (si modo=bloques)"],
  ["WYSIWYG_HTML",          "HTML libre del cuerpo (si modo=wysiwyg)"],
  ["LOGO_DRIVE_ID",         "ID de Drive del logo (inline)"],
  ["BANNER_DRIVE_ID",       "ID de Drive del banner (inline)"],
  ["MOSTRAR_LOGO",          "TRUE/FALSE"],
  ["MOSTRAR_BANNER",        "TRUE/FALSE"],
  ["BOTON_ESTILO",          "solid | outline. Default: solid"],
  ["TITULO_HEADER",         "Título del header (opcional). Variables OK"],
  ["SUBTITULO_HEADER",      "Subtítulo del header (opcional). Variables OK"],
  ["PIE_LEGAL",             "Texto legal/nota al final (opcional). Variables OK"]
];

/* ═══════════════════════════════════════════════════════
   MENÚ
═══════════════════════════════════════════════════════ */
function onOpen() {
  verificarAutoria_();
  console.log(`[${AUTOR_TAG}] Sistema iniciado · Desarrollado por ${AUTOR}`);

  SpreadsheetApp.getUi()
    .createMenu(`⚙️ SISTEMA BECARIOS · ${AUTOR_TAG}`)
    .addItem("📋 Procesar fila seleccionada",        "manualSingleRow")
    .addItem("🔍 Solo extracción IA (fila activa)",  "manualExtractOnly")
    .addSeparator()
    .addItem("🔄 Procesar TODA la hoja",             "manualAllRows")
    .addSeparator()
    .addItem("🎛 Abrir panel de control",            "abrirPanel")
    .addSeparator()
    .addItem("🛠 Ver modelos Gemini disponibles",    "listarModelos")
    .addItem(`ℹ️ Acerca del sistema`,               "mostrarCreditos")
    .addToUi();
}

function mostrarCreditos() {
  verificarAutoria_();
  SpreadsheetApp.getUi().alert(
    `⚡ SISTEMA DE BECARIOS\n` +
    `────────────────────────────────\n` +
    `Versión:      ${AUTOR_TAG}\n` +
    `Desarrollado por: ${AUTOR}\n` +
    `LinkedIn: ${AUTOR_LI}\n` +
    `────────────────────────────────\n` +
    `Este sistema automatiza el proceso\n` +
    `de onboarding de becarios usando\n` +
    `Google Drive, Gemini AI y Gmail.\n\n` +
    `© 2025 ${AUTOR}. Todos los derechos reservados.`
  );
}

/* ═══════════════════════════════════════════════════════
   TRIGGER
═══════════════════════════════════════════════════════ */
function onFormSubmit(e) {
  if (!e) return;
  try {
    if (!e.range || !e.range.getSheet) return;
    processRow_(e.range.getSheet(), e.range.getRow());
  } catch (err) {
    console.error("onFormSubmit:", err.message);
  }
}

/* ═══════════════════════════════════════════════════════
   OPCIONES DEL MENÚ
═══════════════════════════════════════════════════════ */
function manualSingleRow() {
  verificarAutoria_();
  const sh  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sh.getActiveRange().getRow();
  const ui  = SpreadsheetApp.getUi();
  if (row < 2) { ui.alert("Selecciona una fila con datos (no el encabezado)."); return; }
  if (ui.alert(`¿Procesar fila ${row}?`, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  processRow_(sh, row);
  ui.alert(`✅ Fila ${row} procesada. Revisa la columna ESTATUS.${selloGE_()}`);
}

function manualExtractOnly() {
  verificarAutoria_();
  const sh  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sh.getActiveRange().getRow();
  const ui  = SpreadsheetApp.getUi();
  if (row < 2) { ui.alert("Selecciona una fila con datos."); return; }

  const writer = new RowWriter_(sh, row);
  writer.set("ESTATUS", "🔍 Extrayendo con IA...").flush();
  try {
    const nv     = rowToNamedValues_(sh, row);
    const result = extraerConIA_(nv);
    escribirResultadoIA_(writer, result);
    writer.set("ESTATUS", "✅ Extracción completada").flush();
    ui.alert("✅ Datos extraídos:\n\n" + JSON.stringify(result.datos, null, 2) + selloGE_());
  } catch (err) {
    writer.set("ESTATUS", "❌ Error IA: " + err.message).flush();
    ui.alert("❌ Error:\n" + err.message);
  }
}

function manualAllRows() {
  verificarAutoria_();
  const sh      = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sh.getLastRow();
  const ui      = SpreadsheetApp.getUi();
  if (lastRow < 2) { ui.alert("No hay datos para procesar."); return; }

  const pendientes = contarPendientes_(sh, lastRow);
  if (pendientes === 0) { ui.alert("No hay filas pendientes."); return; }

  if (ui.alert(
    `Se procesarán ${pendientes} filas.\n` +
    (CONFIG.SKIP_COMPLETED ? "(Filas ✅ se omitirán)\n" : "") +
    "\n¿Continuar?", ui.ButtonSet.YES_NO
  ) !== ui.Button.YES) return;

  let ok = 0, omitidas = 0, errores = 0;
  const inicio = Date.now();
  for (let i = 2; i <= lastRow; i++) {
    if ((Date.now() - inicio) > 5.25 * 60 * 1000) {
      ui.alert(
        `⏱ Límite de tiempo alcanzado.\n✔ ${ok} | ⏭ ${omitidas} | ✖ ${errores}\n` +
        `Vuelve a ejecutar para continuar.${selloGE_()}`
      );
      return;
    }
    if (CONFIG.SKIP_COMPLETED && estaCompletada_(sh, i)) { omitidas++; continue; }
    try { processRow_(sh, i); ok++; }
    catch (e) { errores++; console.error(`Fila ${i}:`, e.message); }
  }
  ui.alert(
    `✅ Proceso terminado.\n\n✔ Procesadas: ${ok}\n⏭ Omitidas: ${omitidas}\n✖ Errores: ${errores}` +
    selloGE_()
  );
}

/* ═══════════════════════════════════════════════════════
   MOTOR PRINCIPAL
═══════════════════════════════════════════════════════ */
function processRow_(sh, row) {
  verificarAutoria_();
  console.log(`[${AUTOR_TAG}] Procesando fila ${row} · ${AUTOR}`);

  const writer = new RowWriter_(sh, row);

  cargarConfigDesdeSheet_();

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    writer.set("ESTATUS", "⏳ En proceso por otra ejecución. Intenta de nuevo.").flush();
    return;
  }

  try {
    const nv = rowToNamedValues_(sh, row);

    const form = leerDatosForm_(nv);
    if (form.error) {
      writer.set("ESTATUS", "❌ " + form.error).flush();
      return;
    }

    writer.set("ESTATUS", `🔍 Leyendo documentos con IA (${CONFIG.AI_PROVIDER || "gemini"})...`).flush();

    let iaResult = { datos: {}, log: {} };
    try {
      iaResult = extraerConIA_(nv);
      escribirResultadoIA_(writer, iaResult);
      console.log(`[${AUTOR_TAG}] Fila ${row} IA:`, JSON.stringify(iaResult.datos));
    } catch (err) {
      writer.set("IA_LOG", "⚠️ " + err.message).flush();
      console.warn(`[${AUTOR_TAG}] Fila ${row} IA falló:`, err.message);
    }

    const curp    = (iaResult.datos.curp || "").toUpperCase().trim();
    const nss     = (iaResult.datos.nss  || "").trim();
    const fotoUrl = getcamp_(nv, "FOTO");

    if (!curp) {
      writer.set("ESTATUS", "❌ No se pudo leer la CURP. Revisa que los documentos sean legibles.").flush();
      return;
    }

    writer.set("ESTATUS", "⏳ Creando expediente...").flush();
    const expediente = crearExpediente_(curp, form.nombre, form.sucursal);
    writer.set("LINK_EXPEDIENTE", expediente.becFolder.getUrl());

    copiarArchivos_(sh, row, nv, expediente.folderIdx, form.safeNombre, curp, writer);

    if (!fotoUrl) {
      writer.set("ESTATUS", "⚠️ Expediente creado · Sin credencial: no se encontró la fotografía").flush();
    } else {
      writer.set("ESTATUS", "⏳ Generando credencial PDF...").flush();

      const vigencia     = fmtMesAnio_(addMonths_(form.fechaIngreso, CONFIG.VIGENCIA_MESES));
      const sucId        = normSuc_(form.sucursal);
      const hash         = sha256_(`${curp}|${form.fechaIngreso.getTime()}`).substring(0, 6).toUpperCase();
      const idCredencial = `${sucId}-${hash}`;

      writer.set("VIGENCIA", vigencia).set("ID", idCredencial).set("HASH_INTERNO", hash);

      const credFolder   = expediente.folderIdx["04_Credencial"];
      const pdfNombre    = `CREDENCIAL_${idCredencial}_${form.safeNombre}.pdf`;
      const pdfExistente = findFile_(credFolder, pdfNombre);

      if (pdfExistente) {
        writer.set("LINK_PDF_CREDENCIAL", pdfExistente.getUrl());
        writer.set("ESTATUS", "✅ Completado").flush();
        console.log(`[${AUTOR_TAG}] Fila ${row}: PDF ya existía, reutilizando.`);
      } else {
        const fotoFile = resolveFile_(fotoUrl);
        if (!fotoFile) {
          writer.set("ESTATUS", "⚠️ Expediente creado · No se pudo acceder a la fotografía").flush();
        } else {
          const pdfFile = generarCredencial_({
            replacements: {
              [CONFIG.PH.NOMBRE]:   form.nombre,
              [CONFIG.PH.VIGENCIA]: vigencia,
              [CONFIG.PH.SUCURSAL]: form.sucursal.toUpperCase(),
              [CONFIG.PH.ID]:       idCredencial,
              [CONFIG.PH.CURP]:     curp,
              [CONFIG.PH.NSS]:      nss
            },
            fotoBlob: fotoFile.getBlob(),
            pdfNombre,
            folder: credFolder
          });
          writer.set("LINK_PDF_CREDENCIAL", pdfFile.getUrl());
          writer.set("ESTATUS", "✅ Completado").flush();
        }
      }
    }

    crearCarpetaReporte_(sh, row, nv, writer, form);

  } finally {
    lock.releaseLock();
  }
}

/* ═══════════════════════════════════════════════════════
   LEER Y VALIDAR DATOS DEL FORM
═══════════════════════════════════════════════════════ */
function leerDatosForm_(nv) {
  const nombre     = getcamp_(nv, "NOMBRE").toUpperCase().trim();
  const sucursal   = getcamp_(nv, "SUCURSAL").trim();
  const ingresoRaw = getcamp_(nv, "FECHA_INGRESO");

  if (!nombre)   return { error: "Falta NOMBRE COMPLETO.\nColumnas: " + Object.keys(nv).join(" | ") };
  if (!sucursal) return { error: "Falta SUCURSAL en el formulario." };

  const fechaIngreso = parseDate_(ingresoRaw);
  if (!fechaIngreso) return { error: `No se pudo leer Fecha de Ingreso. Valor: "${ingresoRaw}"` };

  const safeNombre = nombre.replace(/[\/\\:*?"<>|]/g, "").replace(/\s+/g, "_");
  return { nombre, sucursal, fechaIngreso, safeNombre };
}

/* ═══════════════════════════════════════════════════════
   CREAR EXPEDIENTE EN DRIVE
═══════════════════════════════════════════════════════ */
function crearExpediente_(curp, nombre, sucursal) {
  const root      = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const sucFolder = getOrCreate_(root, sucursal);
  const becFolder = getOrCreateBecarioFolderByCurp_(sucFolder, curp, nombre);
  const folderIdx = {};

  Object.keys(CONFIG.STRUCTURE).forEach(top => {
    folderIdx[top] = getOrCreate_(becFolder, top);
    (CONFIG.STRUCTURE[top] || []).forEach(sub => {
      folderIdx[`${top}/${sub}`] = getOrCreate_(folderIdx[top], sub);
    });
  });

  return { becFolder, sucFolder, folderIdx };
}

function getOrCreateBecarioFolderByCurp_(sucFolder, curp, nombre) {
  const curpNorm   = String(curp || "").trim().toUpperCase();
  const suffix     = `_${curpNorm}`;
  const targetName = buildNombreCarpetaBecario_(nombre, curpNorm);
  const it         = sucFolder.getFolders();
  let legacyMatch  = null;

  while (it.hasNext()) {
    const f     = it.next();
    const fname = f.getName().toUpperCase();
    if (fname.endsWith(suffix)) return f;
    if (!legacyMatch && fname.startsWith(`${curpNorm}_`)) legacyMatch = f;
  }

  if (legacyMatch) {
    if (legacyMatch.getName() !== targetName) {
      try { legacyMatch.setName(targetName); } catch (_) {}
    }
    return legacyMatch;
  }

  return sucFolder.createFolder(targetName);
}

function buildNombreCarpetaBecario_(nombre, curp) {
  const nombreSafe = sanitizarNombre_(nombre)
    .toUpperCase().replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "") || "SIN_NOMBRE";
  return `${nombreSafe}_${String(curp || "").trim().toUpperCase()}`;
}

/* ═══════════════════════════════════════════════════════
   COPIAR ARCHIVOS ADJUNTOS (anti-duplicado)
═══════════════════════════════════════════════════════ */
function copiarArchivos_(sh, row, nv, folderIdx, safeNombre, curp, writer) {
  const tracking = cargarFileIdsCopiadosPorCurp_(sh, curp);

  Object.values(CONFIG.CAMPOS).forEach(({ campo, destino, prefijo }) => {
    if (!destino || !prefijo) return;
    const folder = folderIdx[destino];
    if (!folder) return;
    const raw = getcamp_ByNombre_(nv, campo);
    if (!raw) return;

    raw.split(",").map(s => s.trim()).filter(Boolean).forEach((url, i, arr) => {
      const id = driveId_(url);
      if (!id) return;

      if (tracking.ids.has(id)) {
        console.log(`[${AUTOR_TAG}] FileId ya registrado para CURP ${curp}, omitiendo: ${id}`);
        return;
      }

      try {
        const file = DriveApp.getFileById(id);
        const original = file.getName();
        const parts = String(original || "").split(".");
        const ext = (parts.length > 1 && parts[parts.length - 1]) ? parts[parts.length - 1] : "";
        const nombreBase = arr.length > 1
          ? `${prefijo}_${safeNombre}_${i+1}`
          : `${prefijo}_${safeNombre}`;
        const nombre = ext ? `${nombreBase}.${ext}` : nombreBase;

        if (findFile_(folder, nombre)) {
          console.log(`[${AUTOR_TAG}] Ya existe en Drive, omitiendo: ${nombre}`);
          tracking.ids.add(id);
          if (!tracking.byCampo[prefijo]) tracking.byCampo[prefijo] = [];
          if (!tracking.byCampo[prefijo].includes(id)) tracking.byCampo[prefijo].push(id);
          return;
        }
        file.makeCopy(nombre, folder);
        tracking.ids.add(id);
        if (!tracking.byCampo[prefijo]) tracking.byCampo[prefijo] = [];
        if (!tracking.byCampo[prefijo].includes(id)) tracking.byCampo[prefijo].push(id);
      } catch (e) { console.warn(`[${AUTOR_TAG}] No se pudo copiar archivo:`, id, e.message); }
    });
  });

  guardarFileIdsCopiados_(writer, tracking.byCampo, row, curp);
}

/* ═══════════════════════════════════════════════════════
   EXTRACCIÓN CON GEMINI VISION
═══════════════════════════════════════════════════════ */
function extraerConIA_(nv) {
  const datos = {};
  const log   = { proveedor: CONFIG.AI_PROVIDER || "gemini", fuentes: {}, autor: AUTOR_TAG };

  // ══ PASO 1: Documento CURP ══════════════════════════════
  // Fuente primaria — si da CURP válida + nombre, INE puede omitirse.
  const curpDocFile = resolveFile_(getcamp_(nv, "CURP_DOC"));
  if (curpDocFile) {
    try {
      const d     = callIA_(curpDocFile, promptCurpDoc_());
      const curpV = validarCurp_(d.curp);
      if (curpV) { datos.curp = curpV; log.fuentes.curp = "Documento CURP"; }
      else if (d.curp) { datos.curpRaw = String(d.curp).trim().toUpperCase(); log.fuentes.curp = "Documento CURP (inválida)"; }
      if (d.nombre)          { datos.nombre = d.nombre; log.fuentes.nombre = "Documento CURP"; }
      if (d.fechaNacimiento) datos.fechaNacimiento = d.fechaNacimiento;
      if (d.sexo)            datos.sexo = d.sexo;
      if (d.entidadNac)      datos.entidadNac = d.entidadNac;
    } catch (e) { log.errorCurpDoc = e.message; console.warn(`[${AUTOR_TAG}] CURP doc falló:`, e.message); }
  }

  // ══ PASO 2: INE — cortocircuito inteligente ═════════════
  // Solo se llama si aún falta CURP válida O nombre.
  // Si el doc CURP ya dio ambos → esta llamada se omite y se ahorra 1 request.
  const necesitaINE = !datos.curp || !datos.nombre;
  if (necesitaINE) {
    const ineFile = resolveFile_(getcamp_(nv, "INE"));
    if (ineFile) {
      try {
        const d     = callIA_(ineFile, promptINE_());
        const curpV = validarCurp_(d.curp);
        if (!datos.curp && curpV)       { datos.curp = curpV; log.fuentes.curp = "INE"; }
        else if (!datos.curp && d.curp) { datos.curpRaw = datos.curpRaw || String(d.curp).trim().toUpperCase(); }
        if (!datos.nombre && d.nombre)  { datos.nombre = d.nombre; log.fuentes.nombre = "INE"; }
        if (d.fechaNacimiento && !datos.fechaNacimiento) datos.fechaNacimiento = d.fechaNacimiento;
        if (d.domicilio)    datos.domicilio    = d.domicilio;
        if (d.claveElector) datos.claveElector = d.claveElector;
      } catch (e) { log.errorINE = e.message; console.warn(`[${AUTOR_TAG}] INE falló:`, e.message); }
    }
  } else {
    log.ineOmitida = "CURP y nombre ya obtenidos del doc CURP — INE omitida";
    console.log(`[${AUTOR_TAG}] INE omitida (cortocircuito): CURP y nombre ya disponibles.`);
  }

  // ══ PASO 3: IMSS — solo si falta NSS ═══════════════════
  // NSS solo puede venir del IMSS. Siempre se intenta si hay archivo.
  // También sirve como respaldo de CURP si los pasos anteriores fallaron.
  const imssFile = resolveFile_(getcamp_(nv, "IMSS"));
  if (imssFile) {
    try {
      const d      = callIA_(imssFile, promptIMSS_());
      const nssVal = (d.nss || "").toString().replace(/[^\d]/g, "");
      if (/^\d{11}$/.test(nssVal)) { datos.nss = nssVal; log.fuentes.nss = "IMSS"; }
      else if (nssVal) { datos.nssRaw = nssVal; console.warn(`[${AUTOR_TAG}] NSS inválido: "${nssVal}"`); }
      if (!datos.curp) {
        const curpImss = validarCurp_(d.curp);
        if (curpImss) { datos.curp = curpImss; log.fuentes.curp = "IMSS (respaldo)"; }
        else if (d.curp) { datos.curpRaw = datos.curpRaw || String(d.curp).trim().toUpperCase(); }
      }
      if (d.clinicaAdscripcion) datos.clinicaAdscripcion = d.clinicaAdscripcion;
      if (d.fechaAlta)          datos.fechaAlta          = d.fechaAlta;
    } catch (e) { log.errorIMSS = e.message; console.warn(`[${AUTOR_TAG}] IMSS falló:`, e.message); }
  }

  if (!datos.curp) {
    throw new Error(datos.curpRaw
      ? `CURP leída pero inválida: "${datos.curpRaw}"`
      : "No se pudo leer la CURP de ningún documento"
    );
  }
  Object.keys(datos).forEach(k => { if (datos[k] === null) delete datos[k]; });
  return { datos, log };
}
function escribirResultadoIA_(writer, iaResult) {
  const { datos, log } = iaResult;
  const mapa = {
    "IA_NOMBRE": datos.nombre, "IA_CURP": datos.curp, "IA_NSS": datos.nss,
    "IA_FECHA_NAC": datos.fechaNacimiento, "IA_FUENTE_NOMBRE": log.fuentes?.nombre,
    "IA_FUENTE_CURP": log.fuentes?.curp, "IA_CURP_RAW": datos.curpRaw,
    "IA_NSS_RAW": datos.nssRaw, "IA_LOG": JSON.stringify(log),
    "CURP": datos.curp, "NSS": datos.nss
  };
  Object.entries(mapa).forEach(([col, val]) => {
    if (val != null && val !== "") writer.set(col, val);
  });
}

/* ═══════════════════════════════════════════════════════
   GENERAR PDF DESDE PLANTILLA GOOGLE SLIDES
═══════════════════════════════════════════════════════ */
function generarCredencial_({ replacements, fotoBlob, pdfNombre, folder }) {
  const tmpFile = DriveApp.getFileById(CONFIG.TEMPLATE_SLIDES_ID)
                           .makeCopy("TMP_" + pdfNombre, folder);
  const pres    = SlidesApp.openById(tmpFile.getId());

  for (const [key, val] of Object.entries(replacements)) {
    pres.replaceAllText(key, String(val || ""));
  }

  pres.getSlides().forEach(slide => {
    let insertada = false;
    for (const el of slide.getPageElements()) {
      if (insertada) break;
      if (el.getPageElementType() !== SlidesApp.PageElementType.SHAPE) continue;
      if (!el.asShape().getText().asString().includes(CONFIG.PH.FOTO)) continue;
      const boxW = el.getWidth(), boxH = el.getHeight();
      const boxL = el.getLeft(),  boxT = el.getTop();
      const img  = slide.insertImage(fotoBlob);
      const ratio = Math.min(boxW / img.getWidth(), boxH / img.getHeight());
      const newW  = img.getWidth()  * ratio;
      const newH  = img.getHeight() * ratio;
      img.setWidth(newW).setHeight(newH)
         .setLeft(boxL + (boxW - newW) / 2).setTop(boxT + (boxH - newH) / 2);
      el.remove();
      insertada = true;
    }
  });

  pres.saveAndClose();
  const pdfBlob = tmpFile.getBlob().getAs(MimeType.PDF).setName(pdfNombre);
  const pdfFile = folder.createFile(pdfBlob);
  tmpFile.setTrashed(true);
  console.log(`[${AUTOR_TAG}] Credencial generada: ${pdfNombre}`);
  return pdfFile;
}

/* ═══════════════════════════════════════════════════════
   PROMPTS DE GEMINI
═══════════════════════════════════════════════════════ */
function promptINE_() {
  return `Eres un sistema OCR especializado en credenciales INE/IFE mexicanas.
Analiza la imagen con cuidado y extrae ÚNICAMENTE los campos indicados.
REGLAS:
- CURP: EXACTAMENTE 18 caracteres. Patrón: 4 letras, 6 dígitos, H o M, 2 letras, 3 consonantes, 1 alfanumérico, 1 dígito.
- Si un campo no es legible con certeza, devuelve null. NUNCA inventes datos.
- Responde SOLO con JSON válido, sin texto adicional ni backticks.
{"nombre":"APELLIDO_PATERNO APELLIDO_MATERNO NOMBRE(S) en mayúsculas","curp":"CURP exacta 18 chars","fechaNacimiento":"DD/MM/AAAA","domicilio":"dirección o null","claveElector":"clave o null"}`;
}

function promptCurpDoc_() {
  return `Eres un sistema OCR especializado en documentos CURP emitidos por la RENAPO mexicana.
Analiza la imagen con cuidado y extrae ÚNICAMENTE los campos indicados.
REGLAS:
- CURP: EXACTAMENTE 18 caracteres. Patrón: 4 letras, 6 dígitos, H o M, 2 letras, 3 consonantes, 1 alfanumérico, 1 dígito.
- Si un campo no es legible con certeza, devuelve null. NUNCA inventes datos.
- Responde SOLO con JSON válido, sin texto adicional ni backticks.
{"nombre":"NOMBRE(S) APELLIDO_PATERNO APELLIDO_MATERNO en mayúsculas","curp":"CURP exacta 18 chars","fechaNacimiento":"DD/MM/AAAA","sexo":"HOMBRE o MUJER","entidadNac":"estado de nacimiento o null"}`;
}

function promptIMSS_() {
  return `Eres un sistema OCR especializado en documentos del IMSS mexicano.
Analiza la imagen con cuidado y extrae ÚNICAMENTE los campos indicados.
REGLAS:
- NSS: EXACTAMENTE 11 dígitos numéricos, sin espacios ni guiones.
- Si un campo no es legible con certeza, devuelve null. NUNCA inventes datos.
- Responde SOLO con JSON válido, sin texto adicional ni backticks.
{"nss":"NSS 11 dígitos","curp":"CURP si aparece o null","clinicaAdscripcion":"clínica o null","fechaAlta":"DD/MM/AAAA o null"}`;
}

/* ═══════════════════════════════════════════════════════
   GEMINI — llamada HTTP con manejo correcto de rate limits
   ── ARQUITECTURA DE REINTENTOS ─────────────────────────
   Apps Script tiene un límite duro de 6 minutos por ejecución.
   Esperar 30–60s dentro del proceso (como hacía la versión
   anterior) consume ese tiempo sin avanzar nada, y la función
   muere con "timeout" sin completar el becario.

   ESTRATEGIA CORRECTA:
   • Error 429 (rate limit) → fallar INMEDIATAMENTE con mensaje
     claro. El usuario vuelve a correrlo cuando el cupo se resetea.
     No tiene sentido esperar dentro de Apps Script.
   • Error 5xx (error de servidor) → reintentar con espera corta
     (2–5s), porque son errores transitorios que se resuelven rápido.
   • Otros errores → fallar inmediatamente.
═══════════════════════════════════════════════════════ */
function _extractRetrySeconds_(errorMessage) {
  const m = String(errorMessage || "").match(/retry in ([\d.]+)s/i);
  return m ? Math.ceil(parseFloat(m[1])) : null;
}

/* ── Gemini File API — subir PDF como archivo temporal ──────────────
   PDFs → File API (soporta documentos grandes, más robusto)
   Imágenes JPG/PNG → inline_data (más rápido, sin subida)
   El archivo temporal se elimina siempre en el bloque finally.
────────────────────────────────────────────────────────────────── */
function _geminiUploadFile_(blob, mimeType, apiKey) {
  // Paso 1: iniciar sesión de upload resumable
  const initResp = UrlFetchApp.fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: "POST",
      contentType: "application/json",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Type": mimeType
      },
      payload: JSON.stringify({ file: { display_name: "doc_tmp_ge" } }),
      muteHttpExceptions: true
    }
  );
  const _hdrs_    = initResp.getHeaders();
  const uploadUrl = _hdrs_["x-goog-upload-url"] || _hdrs_["X-Goog-Upload-URL"] || _hdrs_["X-Goog-Upload-Url"];
  if (!uploadUrl) {
    throw new Error("Gemini File API: no se obtuvo upload URL. HTTP " + initResp.getResponseCode());
  }

  // Paso 2: subir los bytes del archivo
  const uploadResp = UrlFetchApp.fetch(uploadUrl, {
    method: "POST",
    contentType: mimeType,
    headers: {
      "X-Goog-Upload-Command": "upload, finalize",
      "X-Goog-Upload-Offset": "0"
    },
    payload: blob.getBytes(),
    muteHttpExceptions: true
  });

  let uploadJson;
  try { uploadJson = JSON.parse(uploadResp.getContentText()); }
  catch (_) { throw new Error("Gemini File API: respuesta no-JSON al subir archivo."); }

  const fileUri  = uploadJson?.file?.uri;
  const fileName = uploadJson?.file?.name;
  if (!fileUri) {
    throw new Error("Gemini File API: upload fallido. " + uploadResp.getContentText().slice(0, 300));
  }
  return { fileUri, fileName };
}

function _geminiDeleteFile_(fileName, apiKey) {
  if (!fileName || !apiKey) return;
  try {
    UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`,
      { method: "DELETE", muteHttpExceptions: true }
    );
    console.log(`[GE-v7.6] Gemini File API: archivo temporal eliminado (${fileName})`);
  } catch (_) { /* no crítico — el archivo expira solo en 48h */ }
}

function callGemini_(file, apiKey, prompt) {
  if (!file) throw new Error("Archivo no encontrado en Drive");

  const blob     = file.getBlob();
  const mimeType = blob.getContentType() || "image/jpeg";
  const esPdf    = mimeType.toLowerCase().includes("pdf");

  let part;
  let uploadedFileName = null;

  if (esPdf) {
    // PDF: subir a File API y usar file_data (más robusto para documentos)
    const { fileUri, fileName } = _geminiUploadFile_(blob, mimeType, apiKey);
    uploadedFileName = fileName;
    part = { file_data: { mime_type: mimeType, file_uri: fileUri } };
    console.log(`[GE-v7.6] Gemini File API: PDF subido → ${fileUri}`);
  } else {
    // Imagen: inline_data (más rápido, sin subida adicional)
    part = { inline_data: { mime_type: mimeType, data: Utilities.base64Encode(blob.getBytes()) } };
  }

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }, part] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" }
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let lastError;
  try {
    for (let intento = 1; intento <= CONFIG.GEMINI_REINTENTOS; intento++) {
      try {
        const resp     = UrlFetchApp.fetch(url, { method: "POST", contentType: "application/json", payload, muteHttpExceptions: true });
        const codeHttp = resp.getResponseCode();
        const text     = resp.getContentText();

        let json;
        try { json = JSON.parse(text); }
        catch (_) { throw new Error(`Gemini no-JSON (HTTP ${codeHttp}): ${String(text || "").slice(0, 300)}`); }

        if (json.error) {
          const code = json.error.code || codeHttp;
          if (code === 429) {
            const retryEn = _extractRetrySeconds_(json.error.message);
            const consejo = retryEn ? `Vuelve a intentarlo en ~${retryEn + 5}s.` : `Vuelve a intentarlo en ~1 minuto.`;
            throw new Error(`⏱ Límite de Gemini (429).\n${consejo}\nTip: cambia a "gemini-2.0-flash-lite-001" en ⚙️ Config.`);
          }
          if (code >= 500 && intento < CONFIG.GEMINI_REINTENTOS) {
            console.warn(`[GE-v7.6] Gemini ${code} — reintento ${intento + 1}/${CONFIG.GEMINI_REINTENTOS}`);
            Utilities.sleep(CONFIG.GEMINI_ESPERA_MS * intento);
            lastError = new Error(`Gemini (${code}): ${json.error.message}`);
            continue;
          }
          throw new Error(`Gemini API (${code}): ${json.error.message}`);
        }

        const rawText = (json.candidates?.[0]?.content?.parts?.[0]?.text || "{}").trim();
        const clean   = rawText.replace(/```json|```/gi, "").trim();
        try { return JSON.parse(clean); }
        catch (_) { console.warn(`[GE-v7.6] Gemini respuesta no-JSON:`, rawText); return {}; }

      } catch (e) {
        if (String(e.message).includes("rate limit 429") || String(e.message).includes("Límite de Gemini")) throw e;
        lastError = e;
        if (intento < CONFIG.GEMINI_REINTENTOS) Utilities.sleep(CONFIG.GEMINI_ESPERA_MS);
      }
    }
    throw lastError || new Error("Gemini falló después de todos los reintentos");
  } finally {
    // Siempre limpiar el archivo temporal de la File API
    if (uploadedFileName) _geminiDeleteFile_(uploadedFileName, apiKey);
  }
}
function getApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!key) throw new Error(
    "GEMINI_API_KEY no configurada.\n" +
    "Apps Script → Configuración → Propiedades de secuencia de comandos"
  );
  return key;
}

function getGroqApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");
  if (!key) throw new Error(
    "GROQ_API_KEY no configurada.\n" +
    "Apps Script → Configuración → Propiedades de secuencia de comandos\n" +
    "Clave: GROQ_API_KEY · Obtén tu API key en: console.groq.com"
  );
  return key;
}

function getMistralApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty("MISTRAL_API_KEY");
  if (!key) throw new Error(
    "MISTRAL_API_KEY no configurada.\n" +
    "Apps Script → Configuración → Propiedades de secuencia de comandos\n" +
    "Clave: MISTRAL_API_KEY · Obtén tu API key en: console.mistral.ai"
  );
  return key;
}

/* ═══════════════════════════════════════════════════════
   callMistral_  — OCR especializado para PDFs e imágenes
   Flujo en 2 pasos:
     1. POST /v1/ocr      → extrae texto del doc como markdown
     2. POST /v1/chat/completions → analiza el texto → devuelve JSON
   Soporta: PDF (data:application/pdf;base64,...) e imágenes.
   Precio free tier: gratuito con límites. $0.001/página si rebasa.
   API key: console.mistral.ai → API Keys → MISTRAL_API_KEY
═══════════════════════════════════════════════════════ */
function callMistral_(file, apiKey, prompt) {
  if (!file) throw new Error("Archivo no encontrado en Drive");

  const blob     = file.getBlob();
  const mimeType = blob.getContentType() || "application/pdf";
  const b64      = Utilities.base64Encode(blob.getBytes());
  const esPdf    = mimeType.toLowerCase().includes("pdf");

  // ── PASO 1: OCR — extraer texto del documento ──────────
  const docPayload = esPdf
    ? { type: "document_url", document_url: `data:application/pdf;base64,${b64}` }
    : { type: "image_url",    image_url:    `data:${mimeType};base64,${b64}` };

  const ocrResp = UrlFetchApp.fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + apiKey },
    payload: JSON.stringify({
      model: CONFIG.MISTRAL_OCR_MODEL || "mistral-ocr-latest",
      document: docPayload
    }),
    muteHttpExceptions: true
  });

  const ocrCode = ocrResp.getResponseCode();
  let ocrJson;
  try { ocrJson = JSON.parse(ocrResp.getContentText()); }
  catch (_) { throw new Error(`Mistral OCR no-JSON (HTTP ${ocrCode}): ${ocrResp.getContentText().slice(0, 300)}`); }

  if (ocrJson.error || ocrCode >= 400) {
    if (ocrCode === 429) throw new Error("⏱ Límite de Mistral OCR (429). Vuelve a intentarlo en ~1 minuto.");
    throw new Error(`Mistral OCR (${ocrCode}): ${ocrJson.error?.message || ocrResp.getContentText().slice(0, 300)}`);
  }

  // Concatenar markdown de todas las páginas con separador limpio
  const pages    = ocrJson.pages || [];
  const textoOcr = pages
    .map(p => String(p.markdown || ""))
    .join("\n\n---\n\n")
    .trim();

  if (!textoOcr) {
    console.warn(`[${AUTOR_TAG}] Mistral OCR: documento sin texto extraíble.`);
    return {};
  }
  console.log(`[${AUTOR_TAG}] Mistral OCR: ${pages.length} página(s), ${textoOcr.length} chars extraídos.`);

  // ── PASO 2: Chat — estructurar datos como JSON ──────────
  const chatResp = UrlFetchApp.fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + apiKey },
    payload: JSON.stringify({
      model: CONFIG.MISTRAL_CHAT_MODEL || "mistral-small-latest",
      messages: [{
        role: "user",
        content: `${prompt}

TEXTO EXTRAÍDO DEL DOCUMENTO:
${textoOcr}`
      }],
      temperature: 0,
      max_tokens: 512,
      response_format: { type: "json_object" }
    }),
    muteHttpExceptions: true
  });

  const chatCode = chatResp.getResponseCode();
  let chatJson;
  try { chatJson = JSON.parse(chatResp.getContentText()); }
  catch (_) { throw new Error(`Mistral Chat no-JSON (HTTP ${chatCode}): ${chatResp.getContentText().slice(0, 300)}`); }

  if (chatJson.error || chatCode >= 400) {
    if (chatCode === 429) throw new Error("⏱ Límite de Mistral Chat (429). Vuelve a intentarlo en ~1 minuto.");
    throw new Error(`Mistral Chat (${chatCode}): ${chatJson.error?.message || chatResp.getContentText().slice(0, 300)}`);
  }

  const raw   = String(chatJson.choices?.[0]?.message?.content || "{}");
  const clean = raw.replace(/```json|```/gi, "").trim();
  try { return JSON.parse(clean); }
  catch (_) { console.warn(`[${AUTOR_TAG}] Mistral Chat respuesta no-JSON:`, raw); return {}; }
}


/* ═══════════════════════════════════════════════════════
   callGroq_  — Alternativa a Gemini usando Groq
   API compatible con OpenAI · Endpoint /openai/v1/chat/completions
   Modelo recomendado: meta-llama/llama-4-scout-17b-16e-instruct
   (tiene visión multimodal y free tier generoso)
   Para cambiar de proveedor: panel ⚙️ Config → AI_PROVIDER → groq
═══════════════════════════════════════════════════════ */
function callGroq_(file, apiKey, prompt) {
  if (!file) throw new Error("Archivo no encontrado en Drive");

  const blob     = file.getBlob();
  const mimeType = blob.getContentType() || "image/jpeg";

  // Guard: Groq Llama 4 Scout soporta visión sobre imágenes (JPG/PNG/WEBP).
  // Groq solo soporta imágenes (JPG/PNG/WEBP), no PDFs.
  // Si llega un PDF: redirigir a Mistral si tiene key, o error claro.
  if (mimeType === "application/pdf") {
    const mistralKey = PropertiesService.getScriptProperties().getProperty("MISTRAL_API_KEY");
    if (mistralKey) {
      console.warn(`[${AUTOR_TAG}] Groq no soporta PDF — redirigiendo a Mistral OCR.`);
      return callMistral_(file, mistralKey, prompt);
    }
    throw new Error(
      `⚠️ Groq no procesa PDFs (solo imágenes JPG/PNG/WEBP).
` +
      `Opciones:
` +
      `1. Cambia el proveedor a "Mistral OCR" en ⚙️ Config (mejor para PDFs).
` +
      `2. Cambia el proveedor a "Gemini" en ⚙️ Config.
` +
      `3. Configura MISTRAL_API_KEY para redirección automática a Mistral.`
    );
  }

  const b64      = Utilities.base64Encode(blob.getBytes());

  const payload = JSON.stringify({
    model: CONFIG.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${b64}` } }
      ]
    }],
    temperature: 0,
    max_tokens: 1024
  });

  const resp = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + apiKey },
    payload,
    muteHttpExceptions: true
  });

  const codeHttp = resp.getResponseCode();
  const text     = resp.getContentText();

  let json;
  try { json = JSON.parse(text); }
  catch (_) { throw new Error(`Groq respondió no-JSON (HTTP ${codeHttp}): ${text.slice(0, 300)}`); }

  if (json.error) {
    const code = json.error.code || codeHttp;
    if (codeHttp === 429) {
      throw new Error(
        `⏱ Límite de Groq alcanzado (429).\nVuelve a intentarlo en ~1 minuto.\n` +
        `Consulta tus límites en: console.groq.com/settings/limits`
      );
    }
    throw new Error(`Groq API (${code}): ${json.error.message || text}`);
  }

  const raw   = String(json.choices?.[0]?.message?.content || "{}");
  const clean = raw.replace(/\`\`\`json|\`\`\`/gi, "").trim();
  try { return JSON.parse(clean); }
  catch (_) { console.warn(`[${AUTOR_TAG}] Groq respuesta no-JSON:`, raw); return {}; }
}

/* ═══════════════════════════════════════════════════════
   callIA_  — Enrutador unificado: Gemini / Groq / Mistral
   Política por tipo de documento:
     PDF  + Gemini  → File API (robusto, soporta docs grandes)
     PDF  + Groq    → redirige a Mistral si hay MISTRAL_API_KEY
     PDF  + Mistral → OCR especializado en 2 pasos
     IMG  + Gemini  → inline_data (rápido)
     IMG  + Groq    → image_url (nativo)
     IMG  + Mistral → image_url via OCR endpoint
   Cambiar de proveedor: panel ⚙️ Config → AI_PROVIDER
═══════════════════════════════════════════════════════ */
function callIA_(file, prompt) {
  const provider = String(CONFIG.AI_PROVIDER || "gemini").toLowerCase().trim();

  if (provider === "groq") {
    const apiKey = getGroqApiKey_();
    return callGroq_(file, apiKey, prompt);
  }

  if (provider === "mistral") {
    const apiKey = getMistralApiKey_();
    return callMistral_(file, apiKey, prompt);
  }

  // Default: Gemini
  return callGemini_(file, getApiKey_(), prompt);
}

function validarCurp_(raw) {
  if (!raw) return null;
  const c = raw.toString().trim().toUpperCase();
  return CURP_REGEX.test(c) ? c : null;
}

/* ═══════════════════════════════════════════════════════
   ROWWRITER
═══════════════════════════════════════════════════════ */
class RowWriter_ {
  constructor(sh, row) {
    this.sh      = sh;
    this.row     = row;
    this.pending = {};
    this.headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1))
                     .getValues()[0].map(h => h.toString().trim().toUpperCase());
  }
  set(col, val) { this.pending[col] = val; return this; }
  flush() {
    for (const [col, val] of Object.entries(this.pending)) {
      const target = col.trim().toUpperCase();
      let idx = this.headers.indexOf(target);
      if (idx === -1) {
        const newCol = this.sh.getLastColumn() + 1;
        this.sh.getRange(1, newCol).setValue(col);
        this.headers.push(target);
        idx = this.headers.length - 1;
      }
      this.sh.getRange(this.row, idx + 1).setValue(val);
    }
    this.pending = {};
    return this;
  }
}

/* ═══════════════════════════════════════════════════════
   HELPERS DE CAMPOS
═══════════════════════════════════════════════════════ */
function getcamp_(nv, clave) {
  const cfg = CONFIG.CAMPOS[clave];
  if (!cfg) return "";
  return getcamp_ByNombre_(nv, cfg.campo);
}

function getcamp_ByNombre_(nv, campNombre) {
  if (!campNombre) return "";
  const k = campNombre.trim().toUpperCase();
  for (const key in nv) {
    if (key.trim().toUpperCase() === k)
      return (nv[key]?.[0] != null) ? String(nv[key][0]).trim() : "";
  }
  for (const key in nv) {
    if (key.trim().toUpperCase().includes(k))
      return (nv[key]?.[0] != null) ? String(nv[key][0]).trim() : "";
  }
  return "";
}

/* ═══════════════════════════════════════════════════════
   HELPERS DE DRIVE
═══════════════════════════════════════════════════════ */
function getOrCreate_(parent, name) {
  const n  = sanitizarNombre_(name) || "SIN_NOMBRE";
  const it = parent.getFoldersByName(n);
  return it.hasNext() ? it.next() : parent.createFolder(n);
}
function resolveFile_(url) {
  const id = driveId_(url);
  if (!id) return null;
  try { return DriveApp.getFileById(id); } catch (_) { return null; }
}
function driveId_(url) {
  const m = String(url).match(/[-\w]{25,}/);
  return m ? m[0] : null;
}
function findFile_(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}
function sanitizarNombre_(name) {
  return String(name).trim().replace(/[\/\\:*?"<>|]/g, "").substring(0, 100);
}

/* ═══════════════════════════════════════════════════════
   HELPERS DE SHEET
═══════════════════════════════════════════════════════ */
function rowToNamedValues_(sh, row) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const values  = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];
  const nv = {};
  headers.forEach((h, i) => { nv[String(h)] = [values[i]]; });
  return nv;
}
function contarPendientes_(sh, lastRow) {
  if (!CONFIG.SKIP_COMPLETED) return lastRow - 1;
  const col = encontrarColumna_(sh, "ESTATUS");
  if (!col) return lastRow - 1;
  return sh.getRange(2, col, lastRow - 1, 1).getValues()
           .filter(r => !String(r[0]).startsWith("✅")).length;
}
function estaCompletada_(sh, row) {
  const col = encontrarColumna_(sh, "ESTATUS");
  if (!col) return false;
  return sh.getRange(row, col).getValue().toString().startsWith("✅");
}
function encontrarColumna_(sh, name) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idx = headers.findIndex(h => h.toString().trim().toUpperCase() === name.toUpperCase());
  return idx === -1 ? null : idx + 1;
}
function cargarFileIdsCopiadosPorCurp_(sh, curp) {
  const out = { ids: new Set(), byCampo: {} };
  if (!curp) return out;
  const curpCol    = encontrarColumna_(sh, "CURP");
  const fileIdsCol = encontrarColumna_(sh, "FILE_IDS_COPIADOS");
  if (!curpCol || !fileIdsCol) return out;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return out;
  const curpVals = sh.getRange(2, curpCol, lastRow - 1, 1).getValues();
  const jsonVals = sh.getRange(2, fileIdsCol, lastRow - 1, 1).getValues();
  for (let i = 0; i < curpVals.length; i++) {
    if (String(curpVals[i][0] || "").trim().toUpperCase() !== String(curp).trim().toUpperCase()) continue;
    mergeTrackingJson_(jsonVals[i][0], out);
  }
  return out;
}
function mergeTrackingJson_(raw, target) {
  if (!raw) return;
  try {
    const obj = JSON.parse(String(raw));
    Object.entries(obj || {}).forEach(([k, arr]) => {
      if (!Array.isArray(arr)) return;
      if (!target.byCampo[k]) target.byCampo[k] = [];
      arr.forEach(id => {
        const s = String(id || "").trim();
        if (!s) return;
        target.ids.add(s);
        if (!target.byCampo[k].includes(s)) target.byCampo[k].push(s);
      });
    });
  } catch (_) {}
}
function guardarFileIdsCopiados_(writer, byCampo, row, curp) {
  writer.set("FILE_IDS_COPIADOS", JSON.stringify(byCampo || {}));
  writer.set("CURP", curp);
  writer.flush();
  console.log(`[${AUTOR_TAG}] Fila ${row}: FILE_IDS_COPIADOS actualizado para CURP ${curp}`);
}

/* ═══════════════════════════════════════════════════════
   HELPERS DE FECHA Y TEXTO
═══════════════════════════════════════════════════════ */
function parseDate_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const s = String(v || "").trim();
  if (!s) return null;
  const p = s.split(/[\/\-\.]/);
  if (p.length === 3) {
    const [a, b, c] = p.map(n => parseInt(n, 10));
    const d = a > 31 ? new Date(a, b-1, c) : new Date(c, b-1, a);
    if (!isNaN(d.getTime())) return d;
  }
  const f = new Date(v);
  return isNaN(f.getTime()) ? null : f;
}
function addMonths_(date, n) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + n);
  return d;
}
function fmtMesAnio_(date) {
  return `${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}
function normSuc_(s) {
  const out = s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
          .toUpperCase().replace(/[^A-Z0-9]+/g,"").substring(0,3);
  return out || "SUC";
}
function sha256_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(b => (b < 0 ? b+256 : b).toString(16).padStart(2,"0")).join("");
}

/* ═══════════════════════════════════════════════════════
   UTILIDAD — Ver modelos Gemini
═══════════════════════════════════════════════════════ */
function listarModelos() {
  verificarAutoria_();
  const apiKey = getApiKey_();
  const resp   = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey,
    { muteHttpExceptions: true }
  );
  const data   = JSON.parse(resp.getContentText());
  const models = (data.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map(m => m.name.replace("models/", ""));
  SpreadsheetApp.getUi().alert(
    "Modelos disponibles:\n\n" + models.join("\n") +
    "\n\nCopia el que quieras en CONFIG.GEMINI_MODEL" +
    selloGE_()
  );
}

/* ████████████████████████████████████████████████████████
   MÓDULO: HOJAS DE CONFIGURACIÓN
████████████████████████████████████████████████████████ */
function cargarConfigDesdeSheet_() {
  try {
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("⚙️ CONFIG");
    if (!hoja || hoja.getLastRow() < 2) return;

    const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 2).getValues();
    datos.forEach(([clave, valor]) => {
      const k = String(clave || "").trim();
      if (!k) return;

      const vRaw = (valor === null || valor === undefined) ? "" : String(valor);
      const v    = vRaw.trim();

      if (k === "VIGENCIA_MESES") {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n > 0 && n <= 60) CONFIG.VIGENCIA_MESES = n;
        return;
      }
      if (k === "GEMINI_REINTENTOS") {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= 1 && n <= 10) CONFIG.GEMINI_REINTENTOS = n;
        return;
      }
      if (k === "GEMINI_ESPERA_MS") {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= 0 && n <= 60000) CONFIG.GEMINI_ESPERA_MS = n;
        return;
      }
      if (k === "SKIP_COMPLETED") {
        CONFIG.SKIP_COMPLETED = String(v).toUpperCase() === "TRUE";
        return;
      }
      if (k === "AI_PROVIDER") {
        const p = v.toLowerCase().trim();
        if (p === "groq" || p === "gemini" || p === "mistral") CONFIG.AI_PROVIDER = p;
        return;
      }
      if (k === "GROQ_MODEL") {
        if (v) CONFIG.GROQ_MODEL = v;
        return;
      }
      if (k === "MISTRAL_OCR_MODEL") {
        if (v) CONFIG.MISTRAL_OCR_MODEL = v;
        return;
      }
      if (k === "MISTRAL_CHAT_MODEL") {
        if (v) CONFIG.MISTRAL_CHAT_MODEL = v;
        return;
      }

      if (Object.prototype.hasOwnProperty.call(CONFIG, k)) {
        CONFIG[k] = vRaw;
      }
    });
  } catch (e) {
    console.warn(`[${AUTOR_TAG}] cargarConfigDesdeSheet_ falló (usando valores del script):`, e.message);
  }
}

function cargarPlantillaCorreo_() {
  const defaults = {
    ASUNTO:          "📋 Tu espacio de reportes está listo — {SUCURSAL}",
    SALUDO:          "Hola {NOMBRE},",
    TEXTO_PRINCIPAL: "Se ha creado tu carpeta personal para el registro de actividades durante tu estadía. Encontrarás dentro el archivo de reporte diario y las instrucciones para llenarlo correctamente.",
    TEXTO_BOTON:     "📂 Abrir mi carpeta de reportes",
    PIE:             "Recursos Humanos · {EMPRESA}",
    COLOR_PRINCIPAL: "#1a237e",

    ARCHIVO_EXTRA_1_ID: "", ARCHIVO_EXTRA_1_NOMBRE: "",
    ARCHIVO_EXTRA_2_ID: "", ARCHIVO_EXTRA_2_NOMBRE: "",
    ARCHIVO_EXTRA_3_ID: "", ARCHIVO_EXTRA_3_NOMBRE: "",

    MODO_EDITOR: "simple",
    BLOQUES_JSON: "",
    WYSIWYG_HTML: "",
    LOGO_DRIVE_ID: "",
    BANNER_DRIVE_ID: "",
    MOSTRAR_LOGO: "TRUE",
    MOSTRAR_BANNER: "FALSE",
    BOTON_ESTILO: "solid",
    TITULO_HEADER: "📋 Tu espacio de reportes está listo",
    SUBTITULO_HEADER: "{SUCURSAL} | {AREA}",
    PIE_LEGAL: "Correo generado automáticamente. La carpeta es privada; solo tú y tu responsable pueden acceder."
  };

  try {
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName("✉️ CORREO");
    if (!hoja || hoja.getLastRow() < 2) return defaults;

    const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 2).getValues();
    datos.forEach(([clave, valor]) => {
      const k = String(clave || "").trim();
      const v = String(valor ?? "");
      if (k && Object.prototype.hasOwnProperty.call(defaults, k)) {
        if (v.trim() !== "" || k === "BLOQUES_JSON" || k === "WYSIWYG_HTML") {
          defaults[k] = v;
        }
      }
    });
  } catch (e) {
    console.warn(`[${AUTOR_TAG}] cargarPlantillaCorreo_ falló (usando valores por defecto):`, e.message);
  }

  return defaults;
}

function leerHojaComoObjeto_(nombreHoja) {
  const resultado = {};
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
    if (!hoja || hoja.getLastRow() < 2) return resultado;
    const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 2).getValues();
    datos.forEach(([k, v]) => {
      const key = String(k || "").trim();
      if (key) resultado[key] = String(v ?? "");
    });
  } catch (e) {
    console.warn(`[${AUTOR_TAG}] leerHojaComoObjeto_ falló para ` + nombreHoja + ":", e.message);
  }
  return resultado;
}

function escribirHoja_(nombreHoja, data, esquema) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(nombreHoja);
  if (!hoja) {
    hoja = ss.insertSheet(nombreHoja);
  } else {
    hoja.clearContents();
  }

  hoja.getRange(1, 1, 1, 3).setValues([["CLAVE", "VALOR", "DESCRIPCIÓN"]]);
  hoja.getRange(1, 1, 1, 3)
      .setBackground("#1a237e").setFontColor("#ffffff").setFontWeight("bold");
  hoja.setColumnWidth(1, 220);
  hoja.setColumnWidth(2, 300);
  hoja.setColumnWidth(3, 380);
  hoja.setFrozenRows(1);

  const filas = esquema.map(([clave, descripcion]) => [
    clave,
    Object.prototype.hasOwnProperty.call(data, clave) ? String(data[clave] ?? "") : "",
    descripcion
  ]);

  if (filas.length > 0) {
    hoja.getRange(2, 1, filas.length, 3).setValues(filas);
    hoja.getRange(2, 1, filas.length, 1).setFontWeight("bold");
    hoja.getRange(2, 3, filas.length, 1).setFontColor("#999999").setFontStyle("italic");
  }
}

/* ─── Panel: API ─── */
function cargarTodaLaConfig() {
  verificarAutoria_();
  cargarConfigDesdeSheet_();
  const correo = cargarPlantillaCorreo_();
  const variantes = listarVariantesCorreo_();
  return {
    config: {
      EMPRESA:                  CONFIG.EMPRESA,
      EMAIL_RH:                 CONFIG.EMAIL_RH,
      VIGENCIA_MESES:           String(CONFIG.VIGENCIA_MESES),
      ROOT_FOLDER_ID:           CONFIG.ROOT_FOLDER_ID,
      REPORTES_ROOT_FOLDER_ID:  CONFIG.REPORTES_ROOT_FOLDER_ID,
      TEMPLATE_SLIDES_ID:       CONFIG.TEMPLATE_SLIDES_ID,
      TEMPLATE_REPORTE_ID:      CONFIG.TEMPLATE_REPORTE_ID,
      INSTRUCCIONES_REPORTE_ID: CONFIG.INSTRUCCIONES_REPORTE_ID,
      GEMINI_MODEL:             CONFIG.GEMINI_MODEL,
      GEMINI_REINTENTOS:        String(CONFIG.GEMINI_REINTENTOS),
      AI_PROVIDER:              CONFIG.AI_PROVIDER,
      GROQ_MODEL:               CONFIG.GROQ_MODEL,
      MISTRAL_OCR_MODEL:        CONFIG.MISTRAL_OCR_MODEL,
      MISTRAL_CHAT_MODEL:       CONFIG.MISTRAL_CHAT_MODEL
    },
    correo: correo,
    variantes: variantes
  };
}

function guardarConfigDesdePanel(data) {
  verificarAutoria_();
  const existente = leerHojaComoObjeto_("⚙️ CONFIG");
  const fusionado = Object.assign({}, existente, data);
  if (!Object.prototype.hasOwnProperty.call(fusionado, "SKIP_COMPLETED")) {
    fusionado.SKIP_COMPLETED = String(CONFIG.SKIP_COMPLETED);
  }
  escribirHoja_("⚙️ CONFIG", fusionado, CONFIG_ESQUEMA_);
  cargarConfigDesdeSheet_();
}

function guardarCorreoDesdePanel(data) {
  verificarAutoria_();
  escribirHoja_("✉️ CORREO", data, CORREO_ESQUEMA_);
}

/* ████████████████████████████████████████████████████████
   VARIANTES + REGLAS (✉️ VARIANTES)
████████████████████████████████████████████████████████ */
const VARIANTES_HOJA_ = "✉️ VARIANTES";

function asegurarHojaVariantes_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(VARIANTES_HOJA_);
  if (!sh) sh = ss.insertSheet(VARIANTES_HOJA_);
  if (sh.getLastRow() < 1) sh.appendRow(["NOMBRE", "PRIORIDAD", "REGLA_JSON", "DATA_JSON"]);
  const head = sh.getRange(1,1,1,4).getValues()[0].map(String);
  if (head.join("|") !== ["NOMBRE","PRIORIDAD","REGLA_JSON","DATA_JSON"].join("|")) {
    sh.getRange(1,1,1,4).setValues([["NOMBRE","PRIORIDAD","REGLA_JSON","DATA_JSON"]]);
  }
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 170);
  sh.setColumnWidth(2, 90);
  sh.setColumnWidth(3, 320);
  sh.setColumnWidth(4, 360);
  return sh;
}

function listarVariantesCorreo_() {
  const sh = asegurarHojaVariantes_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2,1,last-1,4).getValues();
  const out = [];
  vals.forEach((r, idx) => {
    const nombre = String(r[0] ?? "").trim();
    if (!nombre) return;
    const prioridad = parseInt(String(r[1] ?? "0"), 10);
    const regla = String(r[2] ?? "").trim();
    const data  = String(r[3] ?? "").trim();
    out.push({
      row: idx + 2,
      NOMBRE: nombre,
      PRIORIDAD: isNaN(prioridad) ? 0 : prioridad,
      REGLA_JSON: regla,
      DATA_JSON: data
    });
  });
  out.sort((a,b) => (b.PRIORIDAD - a.PRIORIDAD) || (a.NOMBRE.localeCompare(b.NOMBRE)));
  return out;
}

function guardarVarianteCorreoDesdePanel(payload) {
  verificarAutoria_();
  const sh = asegurarHojaVariantes_();
  const nombre = String(payload.NOMBRE ?? "").trim();
  if (!nombre) throw new Error("La variante debe tener NOMBRE.");
  const prioridad = parseInt(String(payload.PRIORIDAD ?? "0"), 10);
  const regla = String(payload.REGLA_JSON ?? "").trim();
  const data  = String(payload.DATA_JSON ?? "").trim();

  if (regla) {
    try { JSON.parse(regla); } catch (e) { throw new Error("REGLA_JSON inválido: " + e.message); }
  }
  if (data) {
    try { JSON.parse(data); } catch (e) { throw new Error("DATA_JSON inválido: " + e.message); }
  }

  let row = payload.row ? parseInt(String(payload.row), 10) : NaN;
  if (isNaN(row) || row < 2) {
    const last = sh.getLastRow();
    if (last >= 2) {
      const names = sh.getRange(2,1,last-1,1).getValues().map(r => String(r[0] ?? "").trim());
      const idx = names.findIndex(n => n.toLowerCase() === nombre.toLowerCase());
      if (idx >= 0) row = idx + 2;
    }
  }

  if (!row || isNaN(row) || row < 2) {
    sh.appendRow([nombre, isNaN(prioridad)?0:prioridad, regla, data]);
  } else {
    sh.getRange(row,1,1,4).setValues([[nombre, isNaN(prioridad)?0:prioridad, regla, data]]);
  }
  return true;
}

function borrarVarianteCorreoDesdePanel(row) {
  verificarAutoria_();
  const sh = asegurarHojaVariantes_();
  const r = parseInt(String(row ?? ""), 10);
  if (isNaN(r) || r < 2) throw new Error("Row inválido para borrar.");
  sh.deleteRow(r);
  return true;
}

function evaluarReglasVariantes_(ctx, reglas) {
  if (!Array.isArray(reglas)) return false;
  for (const rule of reglas) {
    const field = String(rule?.field ?? "").toUpperCase().trim();
    const op    = String(rule?.op ?? "").toLowerCase().trim();
    const value = String(rule?.value ?? "");
    const actual = String(ctx[field] ?? "");
    if (!field || !op) return false;

    if (op === "equals") {
      if (actual.toLowerCase() !== value.toLowerCase()) return false;
    } else if (op === "notequals") {
      if (actual.toLowerCase() === value.toLowerCase()) return false;
    } else if (op === "contains") {
      if (!actual.toLowerCase().includes(value.toLowerCase())) return false;
    } else if (op === "notcontains") {
      if (actual.toLowerCase().includes(value.toLowerCase())) return false;
    } else if (op === "regex") {
      try {
        const re = new RegExp(value, "i");
        if (!re.test(actual)) return false;
      } catch (_) { return false; }
    } else { return false; }
  }
  return true;
}

function aplicarVariantesCorreo_(basePlantilla, ctx) {
  const variantes = listarVariantesCorreo_();
  if (!variantes.length) return { plantilla: basePlantilla, variante: null };

  let best = null;
  for (const v of variantes) {
    let reglas = [];
    if (v.REGLA_JSON) {
      try { reglas = JSON.parse(v.REGLA_JSON); } catch (_) { continue; }
    } else {
      reglas = [];
    }

    const ok = reglas.length ? evaluarReglasVariantes_(ctx, reglas) : true;
    if (!ok) continue;
    if (!best || v.PRIORIDAD > best.PRIORIDAD) best = v;
  }

  if (!best) return { plantilla: basePlantilla, variante: null };

  let override = {};
  if (best.DATA_JSON) {
    try { override = JSON.parse(best.DATA_JSON) || {}; } catch (_) { override = {}; }
  }

  const merged = Object.assign({}, basePlantilla, override);
  return { plantilla: merged, variante: best };
}

/* ████████████████████████████████████████████████████████
   PLANTILLA DE CORREO + BLOQUES + WYSIWYG + INLINE IMAGES
████████████████████████████████████████████████████████ */
function reemplazarVariables_(texto, nombre, sucursal, area) {
  return String(texto || "")
    .replace(/\{NOMBRE\}/g,   nombre   || "")
    .replace(/\{SUCURSAL\}/g, sucursal || "")
    .replace(/\{AREA\}/g,     area     || "")
    .replace(/\{EMPRESA\}/g,  CONFIG.EMPRESA || "");
}

function _boolStr_(v, defTrue) {
  const s = String(v ?? "").trim().toUpperCase();
  if (!s) return !!defTrue;
  return s === "TRUE" || s === "1" || s === "YES" || s === "SI";
}

/* ═══════════════════════════════════════════════════════
   _sanitizeHtmlBasic_
   Además de scripts y eventos, elimina tags estructurales peligrosos
   (</body>, </html>, </div> colgantes) que podrían romper el layout
   del correo cuando el HTML viene de contenteditable.
═══════════════════════════════════════════════════════ */
function _sanitizeHtmlBasic_(html) {
  let out = String(html ?? "");
  // Eliminar scripts completos
  out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  // Eliminar event handlers
  out = out.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  out = out.replace(/javascript\s*:/gi, "");
  // ── NUEVO: eliminar tags estructurales que romperían el email layout ──
  // Estos tags cierran divs del template del correo prematuramente
  out = out.replace(/<\/?(html|body|head|meta|link|base|title)[^>]*>/gi, "");
  // Eliminar style blocks incrustados (pueden conflictar con estilos del correo)
  out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  return out.trim();
}

/* ═══════════════════════════════════════════════════════
   _renderBlocksHtml_
   Renderiza solo los bloques de CONTENIDO (texto, listas, etc.).
   Los bloques tipo "button" se omiten aquí porque el botón de
   carpeta se inyecta de forma incondicional en generarHtmlCorreo_.
   Retorna { html, hasCustomButton } para que el llamador decida.
═══════════════════════════════════════════════════════ */
function _renderBlocksHtml_(plantilla, nombre, sucursal, area, linkCarpeta, nombreReporte) {
  const rv = (txt) => reemplazarVariables_(txt, nombre, sucursal, area);
  let blocks = [];
  const raw = String(plantilla.BLOQUES_JSON ?? "").trim();
  if (raw) {
    try { blocks = JSON.parse(raw); } catch (_) { blocks = []; }
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    // Sin bloques: devolver solo texto intro para que el botón se añada afuera
    const saludo         = rv(plantilla.SALUDO || "Hola {NOMBRE},");
    const textoPrincipal = rv(plantilla.TEXTO_PRINCIPAL || "");
    return {
      html: `<p>${escapeHtml_(saludo)}</p>\n<p>${escapeHtml_(textoPrincipal)}</p>`,
      hasCustomButton: false
    };
  }

  const htmlParts = [];
  let hasCustomButton = false;

  for (const b of blocks) {
    const type = String(b?.type ?? "").toLowerCase().trim();

    if (type === "button") {
      // El bloque "button" del usuario puede apuntar a un href propio
      hasCustomButton = true;
      const label = rv(String(b.label ?? plantilla.TEXTO_BOTON ?? "Abrir"));
      const href  = b.href ? rv(String(b.href)) : linkCarpeta;
      // Botón con estilos inline para máxima compatibilidad con clientes de correo
      htmlParts.push(_inlineBtn_(href, label, plantilla));
    } else if (type === "text") {
      htmlParts.push(`<p>${nl2br_(escapeHtml_(rv(String(b.text ?? ""))))}</p>`);
    } else if (type === "html") {
      htmlParts.push(_sanitizeHtmlBasic_(rv(String(b.html ?? ""))));
    } else if (type === "list") {
      const items   = Array.isArray(b.items) ? b.items : [];
      const ordered = String(b.ordered ?? "").toUpperCase() === "TRUE";
      const tag     = ordered ? "ol" : "ul";
      const li      = items.map(it => `<li>${nl2br_(escapeHtml_(rv(String(it ?? ""))))}</li>`).join("");
      htmlParts.push(`<${tag} style="margin:10px 0 14px 18px;font-size:13px;line-height:1.8;color:#444;">${li}</${tag}>`);
    } else if (type === "divider") {
      htmlParts.push(`<hr style="border:none;border-top:1px solid #eee;margin:18px 0;">`);
    } else if (type === "callout") {
      const color_ = plantilla.COLOR_PRINCIPAL || "#1a237e";
      const title  = rv(String(b.title ?? "Nota"));
      const text   = rv(String(b.text ?? ""));
      htmlParts.push(
        `<div style="background:#f8f9ff;border-left:4px solid ${color_};padding:16px 20px;border-radius:0 6px 6px 0;margin:20px 0;">` +
        `<h3 style="margin:0 0 10px;font-size:14px;color:${color_};">${escapeHtml_(title)}</h3>` +
        `<div style="font-size:13px;line-height:1.7;color:#444;">${nl2br_(escapeHtml_(text))}</div></div>`
      );
    } else if (type === "instructions") {
      const color_ = plantilla.COLOR_PRINCIPAL || "#1a237e";
      htmlParts.push(
        `<div style="background:#f8f9ff;border-left:4px solid ${color_};padding:16px 20px;border-radius:0 6px 6px 0;margin:20px 0;">` +
        `<h3 style="margin:0 0 10px;font-size:14px;color:${color_};">¿Cómo llenar tu reporte diario?</h3>` +
        `<ol style="margin:0 0 0 18px;font-size:13px;line-height:1.8;color:#444;">` +
        `<li>Abre el enlace con tu cuenta de Google.</li>` +
        `<li>Lee primero el archivo <strong>INSTRUCCIONES_REPORTE_DIARIO</strong>.</li>` +
        `<li>Abre <strong>${escapeHtml_(nombreReporte)}</strong> y registra tus actividades <strong>al final de cada día</strong>.</li>` +
        `<li>Describe brevemente lo que realizaste, aprendiste u observaste.</li>` +
        `<li>Los cambios se guardan automáticamente en Google Drive.</li>` +
        `<li>Mantén el reporte actualizado — forma parte de tu evaluación.</li>` +
        `</ol></div>`
      );
    }
  }

  return { html: htmlParts.join("\n"), hasCustomButton };
}

/* ═══════════════════════════════════════════════════════
   _inlineBtn_
   Genera el HTML de un botón de acción con ESTILOS INLINE.
   Los estilos inline garantizan que el botón sea visible incluso
   cuando Gmail / Outlook / otros clientes strips el bloque <style>.
═══════════════════════════════════════════════════════ */
function _inlineBtn_(href, label, plantilla) {
  const color      = plantilla.COLOR_PRINCIPAL || "#1a237e";
  const esOutline  = String(plantilla.BOTON_ESTILO || "solid").toLowerCase().trim() === "outline";
  const btnStyle   = esOutline
    ? `display:inline-block;background:transparent;color:${color};padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin:8px 0;border:2px solid ${color};font-family:Arial,sans-serif;`
    : `display:inline-block;background:${color};color:#ffffff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin:8px 0;border:none;font-family:Arial,sans-serif;`;
  return `<p style="margin:16px 0 20px;"><a href="${escapeAttr_(href)}" style="${btnStyle}">${escapeHtml_(label)}</a></p>`;
}

function escapeHtml_(s) {
  return String(s ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function escapeAttr_(s) {
  return escapeHtml_(s).replace(/`/g,"");
}
function nl2br_(s) {
  return String(s ?? "").replace(/\n/g, "<br>");
}

/* ████████████████████████████████████████████████████████
   generarHtmlCorreo_

   ARQUITECTURA DEFINITIVA DEL BOTÓN:
   ─────────────────────────────────────────────────────────
   El botón de carpeta se inyecta DIRECTAMENTE en el template
   del correo, FUERA de bodyInner, con ESTILOS INLINE.

   Esto resuelve 3 bugs en cadena:
     1. WYSIWYG podía producir </div> o </body> que cerraban
        el div .body del correo antes del botón.
     2. class="btn" dependía del bloque <style>, que muchos
        clientes de correo (Gmail móvil, Outlook) eliminan.
     3. En todos los modos anteriores el botón estaba dentro
        de bodyInner, vulnerable a ser descartado.

   Ahora: bodyInner = SOLO contenido de texto/bloques.
          El botón aparece SIEMPRE después de bodyInner,
          generado incondicionalmente en el template.
████████████████████████████████████████████████████████ */
function generarHtmlCorreo_(plantilla, nombre, sucursal, area, linkCarpeta, nombreReporte) {
  const color = plantilla.COLOR_PRINCIPAL || "#1a237e";
  const rv    = (txt) => reemplazarVariables_(txt, nombre, sucursal, area);

  const titulo    = rv(plantilla.TITULO_HEADER    || "📋 Tu espacio de reportes está listo");
  let   subtitulo = rv(plantilla.SUBTITULO_HEADER || "{SUCURSAL} | {AREA}");
  if (!area) subtitulo = subtitulo.replace(/\s*\|\s*/g, " ").replace(/\s{2,}/g, " ").trim();

  const pie      = rv(plantilla.PIE      || "Recursos Humanos · {EMPRESA}");
  const pieLegal = rv(plantilla.PIE_LEGAL || "");

  const mostrarLogo   = _boolStr_(plantilla.MOSTRAR_LOGO, true);
  const mostrarBanner = _boolStr_(plantilla.MOSTRAR_BANNER, false);

  const logoHtml   = mostrarLogo   ? `<div style="margin:0 0 10px 0"><img src="cid:logo" alt="Logo" style="max-height:48px;max-width:220px;display:block;"></div>` : "";
  const bannerHtml = mostrarBanner ? `<div style="margin:0 0 12px 0"><img src="cid:banner" alt="Banner" style="width:100%;max-width:600px;display:block;border-radius:8px;"></div>` : "";

  const modo       = String(plantilla.MODO_EDITOR || "simple").toLowerCase().trim();
  const textoBoton = rv(plantilla.TEXTO_BOTON || "📂 Abrir mi carpeta de reportes");

  // ══ BOTÓN PRINCIPAL — ESTILOS INLINE — SIEMPRE PRESENTE ══
  // Se genera aquí, fuera de bodyInner, y se inyecta en el template.
  const folderBtnHtml = _inlineBtn_(linkCarpeta, textoBoton, plantilla);

  // ══ bodyInner = solo contenido de texto/bloques, SIN botón ══
  let bodyInner     = "";
  let instrHtml     = "";   // instrucciones (solo simple y bloques fallback)
  let pieAdicional  = "";
  let bloquesHasBtn = false; // rastrea si modo bloques tiene botón propio

  const nombresExtra = [1, 2, 3].map(n => plantilla[`ARCHIVO_EXTRA_${n}_NOMBRE`]).filter(Boolean);

  if (modo === "wysiwyg") {
    // ── Modo WYSIWYG ──────────────────────────────────────
    // El usuario escribe HTML libre. Se sanitiza para quitar scripts
    // y tags estructurales que podrían romper el correo.
    // El botón de carpeta NO forma parte de bodyInner —
    // siempre se inyecta después en el template.
    const rawHtml   = rv(String(plantilla.WYSIWYG_HTML ?? ""));
    const sanitized = _sanitizeHtmlBasic_(rawHtml);

    if (sanitized) {
      bodyInner = sanitized;
    } else {
      // WYSIWYG vacío: usar saludo + texto principal como fallback
      const saludo         = rv(plantilla.SALUDO || "Hola {NOMBRE},");
      const textoPrincipal = rv(plantilla.TEXTO_PRINCIPAL || "");
      bodyInner = `<p style="font-size:14px;line-height:1.7;margin:0 0 14px;">${escapeHtml_(saludo)}</p>`
                + `<p style="font-size:14px;line-height:1.7;margin:0 0 14px;">${escapeHtml_(textoPrincipal)}</p>`;
    }

  } else if (modo === "bloques") {
    // ── Modo Bloques ──────────────────────────────────────
    const resultadoBloques = _renderBlocksHtml_(plantilla, nombre, sucursal, area, linkCarpeta, nombreReporte);
    bodyInner          = resultadoBloques.html;
    bloquesHasBtn      = resultadoBloques.hasCustomButton;
    // instrHtml queda vacío: en modo bloques el usuario controla el layout

  } else {
    // ── Modo Simple (default) ─────────────────────────────
    const saludo         = rv(plantilla.SALUDO || "Hola {NOMBRE},");
    const textoPrincipal = rv(plantilla.TEXTO_PRINCIPAL || "");
    bodyInner = `<p style="font-size:14px;line-height:1.7;margin:0 0 14px;">${escapeHtml_(saludo)}</p>`
              + `<p style="font-size:14px;line-height:1.7;margin:0 0 14px;">${escapeHtml_(textoPrincipal)}</p>`;

    const listaExtra = nombresExtra.length > 0
      ? `<li>Encuentra también estos archivos: <strong>${escapeHtml_(nombresExtra.join(", "))}</strong>.</li>`
      : "";

    instrHtml =
      `<div style="background:#f8f9ff;border-left:4px solid ${color};padding:16px 20px;border-radius:0 6px 6px 0;margin:20px 0;">` +
      `<h3 style="margin:0 0 10px;font-size:14px;color:${color};">¿Cómo llenar tu reporte diario?</h3>` +
      `<ol style="margin:0 0 0 18px;font-size:13px;line-height:1.8;color:#444;">` +
      `<li>Abre el enlace con tu cuenta de Google.</li>` +
      `<li>Lee primero el archivo <strong>INSTRUCCIONES_REPORTE_DIARIO</strong>.</li>` +
      `<li>Abre <strong>${escapeHtml_(nombreReporte)}</strong> y registra tus actividades <strong>al final de cada día</strong>.</li>` +
      `<li>Describe brevemente lo que realizaste, aprendiste u observaste.</li>` +
      `<li>Los cambios se guardan automáticamente en Google Drive.</li>` +
      `<li>Mantén el reporte actualizado — forma parte de tu evaluación.</li>` +
      `${listaExtra}` +
      `</ol></div>` +
      `<p style="font-size:14px;line-height:1.7;margin:0 0 14px;">Si tienes alguna duda, contacta a tu responsable en la sucursal.</p>`;
  }

  // ══ Determinar si el botón automático debe mostrarse ══
  // Para modo bloques con botón propio (type:"button"), ya está en bodyInner → no duplicar.
  // Para todos los demás casos (simple, wysiwyg, bloques sin botón propio) → siempre mostrar.
  const mostrarBtnAuto = !(modo === "bloques" && bloquesHasBtn);

  const watermark =
    `<div style="text-align:center;margin-top:18px;padding-top:12px;border-top:1px solid #e8eaf6;">` +
    `<span style="font-size:10px;color:#bdbdbd;letter-spacing:.4px;">` +
    `⚡ Sistema desarrollado por <a href="${AUTOR_LI}" target="_blank" style="color:#9e9e9e;text-decoration:none;font-weight:bold;">Guillermo Elizalde</a> &nbsp;·&nbsp; ${AUTOR_TAG}` +
    `</span></div>`;

  // ══ CSS de respaldo (para clientes que sí lo soportan) ══
  // Aunque el botón usa inline styles, este CSS ayuda en clientes modernos.
  const botonEstilo = String(plantilla.BOTON_ESTILO || "solid").toLowerCase().trim();
  const btnCssClass = botonEstilo === "outline"
    ? `.btn-folder{display:inline-block;background:transparent;color:${color};padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin:8px 0;border:2px solid ${color};}`
    : `.btn-folder{display:inline-block;background:${color};color:#ffffff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin:8px 0;border:none;}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;}
    .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);}
    .head{background:${color};color:#fff;padding:22px 28px;}
    .head h1{margin:0;font-size:20px;font-weight:700;}
    .head p{margin:6px 0 0;font-size:13px;opacity:.85;}
    .body{padding:22px 28px;color:#333;}
    .body p{font-size:14px;line-height:1.7;margin:0 0 14px;}
    .body ul,.body ol{margin:10px 0 14px 18px;font-size:13px;line-height:1.8;color:#444;}
    .note{font-size:12px;color:#888;border-top:1px solid #eee;padding-top:14px;margin-top:20px;}
    .foot{background:#f0f0f0;padding:16px 28px;font-size:12px;color:#999;text-align:center;}
    ${btnCssClass}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      ${logoHtml}
      <h1>${escapeHtml_(titulo)}</h1>
      <p>${escapeHtml_(subtitulo)}</p>
    </div>
    <div class="body">
      ${bannerHtml}
      ${bodyInner}
      ${mostrarBtnAuto ? folderBtnHtml : ""}
      ${instrHtml}
      ${pieAdicional}
      ${pieLegal ? `<p class="note">${escapeHtml_(pieLegal)}</p>` : ""}
      ${watermark}
    </div>
    <div class="foot">${escapeHtml_(pie)}</div>
  </div>
</body>
</html>`;
}

function _getInlineImagesFromPlantilla_(plantilla) {
  const inlineImages = {};
  const logoId   = String(plantilla.LOGO_DRIVE_ID   ?? "").trim();
  const bannerId = String(plantilla.BANNER_DRIVE_ID ?? "").trim();

  if (_boolStr_(plantilla.MOSTRAR_LOGO, true) && logoId) {
    try {
      inlineImages.logo = DriveApp.getFileById(logoId).getBlob();
    } catch (e) {
      console.warn(`[${AUTOR_TAG}] No se pudo cargar LOGO_DRIVE_ID:`, e.message);
    }
  }
  if (_boolStr_(plantilla.MOSTRAR_BANNER, false) && bannerId) {
    try {
      inlineImages.banner = DriveApp.getFileById(bannerId).getBlob();
    } catch (e) {
      console.warn(`[${AUTOR_TAG}] No se pudo cargar BANNER_DRIVE_ID:`, e.message);
    }
  }
  return inlineImages;
}

function enviarCorreoOnboarding_(correo, nombre, sucursal, area, linkCarpeta, nombreReporte) {
  verificarAutoria_();
  const base = cargarPlantillaCorreo_();

  const ctx = {
    NOMBRE: String(nombre ?? ""),
    SUCURSAL: String(sucursal ?? ""),
    AREA: String(area ?? ""),
    CORREO: String(correo ?? "")
  };
  const { plantilla, variante } = aplicarVariantesCorreo_(base, ctx);
  if (variante) console.log(`[${AUTOR_TAG}] Correo: variante aplicada:`, variante.NOMBRE, "prioridad:", variante.PRIORIDAD);

  const asunto = reemplazarVariables_(
    plantilla.ASUNTO || "📋 Tu espacio de reportes está listo — {SUCURSAL}",
    nombre, sucursal, area
  );

  const html = generarHtmlCorreo_(plantilla, nombre, sucursal, area, linkCarpeta, nombreReporte);

  const opciones = { htmlBody: html };
  if (CONFIG.EMAIL_RH && CONFIG.EMAIL_RH.includes("@")) opciones.cc = CONFIG.EMAIL_RH;

  const inlineImages = _getInlineImagesFromPlantilla_(plantilla);
  if (inlineImages && Object.keys(inlineImages).length) opciones.inlineImages = inlineImages;

  GmailApp.sendEmail(correo, asunto, "", opciones);
}

/* ████████████████████████████████████████████████████████
   MÓDULO: REPORTES + ONBOARDING
████████████████████████████████████████████████████████ */
function crearCarpetaReporte_(sh, row, nv, writer, form) {
  const colExistente = encontrarColumna_(sh, "LINK_CARPETA_REPORTE");
  if (colExistente) {
    const valActual = sh.getRange(row, colExistente).getValue().toString().trim();
    if (valActual && !valActual.startsWith("❌")) {
      console.log(`[${AUTOR_TAG}] Fila ${row}: LINK_CARPETA_REPORTE ya existe, omitiendo módulo reportes.`);
      return;
    }
  }

  const nombre   = form.nombre;
  const sucursal = form.sucursal.toUpperCase().trim();
  const area     = getcamp_(nv, "AREA").toUpperCase().trim();
  const correo   = getcamp_(nv, "CORREO").trim();

  if (!correo) {
    console.warn(`[${AUTOR_TAG}] Fila ${row}: Sin correo — carpeta de reportes no creada.`);
    writer.set("LINK_CARPETA_REPORTE", "⚠️ Sin correo — no creada").flush();
    return;
  }

  const parteArea     = area ? ` - ${area}` : "";
  const nombreCarpeta = sanitizarNombre_(`${sucursal}${parteArea} - ${nombre}`);

  try {
    const rootReportes = DriveApp.getFolderById(CONFIG.REPORTES_ROOT_FOLDER_ID);

    let carpetaBecario;
    const itCarpetas = rootReportes.getFoldersByName(nombreCarpeta);
    if (itCarpetas.hasNext()) {
      carpetaBecario = itCarpetas.next();
      console.log(`[${AUTOR_TAG}] Fila ${row}: Carpeta de reportes ya existía en Drive, reutilizando.`);
    } else {
      carpetaBecario = rootReportes.createFolder(nombreCarpeta);
    }

    try { carpetaBecario.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (_) {}

    const nombreReporte = sanitizarNombre_(`REGISTRO_DIARIO_${nombre}`);
    if (!findFile_(carpetaBecario, nombreReporte)) {
      DriveApp.getFileById(CONFIG.TEMPLATE_REPORTE_ID).makeCopy(nombreReporte, carpetaBecario);
    }

    const nombreInstr = "INSTRUCCIONES_REPORTE_DIARIO";
    if (!findFile_(carpetaBecario, nombreInstr)) {
      DriveApp.getFileById(CONFIG.INSTRUCCIONES_REPORTE_ID).makeCopy(nombreInstr, carpetaBecario);
    }

    const plantillaBase = cargarPlantillaCorreo_();
    [1, 2, 3].forEach(n => {
      const fileId  = (plantillaBase[`ARCHIVO_EXTRA_${n}_ID`]     || "").trim();
      const fileNom = (plantillaBase[`ARCHIVO_EXTRA_${n}_NOMBRE`] || "").trim();
      if (!fileId || !fileNom) return;
      if (findFile_(carpetaBecario, fileNom)) return;
      try {
        DriveApp.getFileById(fileId).makeCopy(fileNom, carpetaBecario);
        console.log(`[${AUTOR_TAG}] Fila ${row}: Archivo extra ${n} copiado: ${fileNom}`);
      } catch (e) {
        console.warn(`[${AUTOR_TAG}] Fila ${row}: No se pudo copiar archivo extra ${n} (${fileId}): ${e.message}`);
      }
    });

    try {
      carpetaBecario.addEditor(correo);
    } catch (e) {
      console.warn(`[${AUTOR_TAG}] Fila ${row}: No se pudo compartir con ${correo}: ${e.message}`);
    }

    const linkCarpeta = carpetaBecario.getUrl();
    writer.set("LINK_CARPETA_REPORTE", linkCarpeta).flush();
    enviarCorreoOnboarding_(correo, nombre, sucursal, area, linkCarpeta, nombreReporte);
    console.log(`[${AUTOR_TAG}] Fila ${row}: Módulo reportes completado para ${correo}.`);

  } catch (e) {
    console.error(`[${AUTOR_TAG}] Fila ${row}: Error en módulo reportes: ${e.message}`);
    writer.set("LINK_CARPETA_REPORTE", "❌ Error: " + e.message).flush();
  }
}

/* ████████████████████████████████████████████████████████
   VISTA PREVIA / PRUEBA
████████████████████████████████████████████████████████ */
function abrirVistaPreviaDesdePanel(data) {
  verificarAutoria_();
  cargarConfigDesdeSheet_();

  const base = Object.assign({}, cargarPlantillaCorreo_(), data);
  const nombre   = "NOMBRE APELLIDO EJEMPLO";
  const sucursal = "SUCURSAL NORTE";
  const area     = data.AREA_EJEMPLO || "SISTEMAS";
  const correo   = "ejemplo@correo.com";

  const { plantilla } = aplicarVariantesCorreo_(base, { NOMBRE:nombre, SUCURSAL:sucursal, AREA:area, CORREO:correo });

  const html = generarHtmlCorreo_(
    plantilla,
    nombre,
    sucursal,
    area,
    "https://drive.google.com/drive/folders/ejemplo",
    "REGISTRO_DIARIO_NOMBRE_APELLIDO_EJEMPLO"
  );

  const output = HtmlService.createHtmlOutput(html).setWidth(660).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(output, "👁 Vista previa del correo");
}

function enviarCorreoPruebaDesdePanel(data) {
  verificarAutoria_();
  cargarConfigDesdeSheet_();
  const emailDestino = Session.getActiveUser().getEmail();
  if (!emailDestino) throw new Error("No se pudo obtener tu email. Asegúrate de estar autenticado.");

  const base = Object.assign({}, cargarPlantillaCorreo_(), data);
  const nombre   = "NOMBRE APELLIDO EJEMPLO";
  const sucursal = "SUCURSAL NORTE";
  const area     = "SISTEMAS";

  const { plantilla } = aplicarVariantesCorreo_(base, { NOMBRE:nombre, SUCURSAL:sucursal, AREA:area, CORREO:emailDestino });

  const html = generarHtmlCorreo_(
    plantilla,
    nombre,
    sucursal,
    area,
    "https://drive.google.com/drive/folders/ejemplo",
    "REGISTRO_DIARIO_NOMBRE_APELLIDO_EJEMPLO"
  );

  const asunto = "[PRUEBA] " + reemplazarVariables_(plantilla.ASUNTO || "Correo de prueba", "NOMBRE EJEMPLO", "SUCURSAL NORTE", "SISTEMAS");

  const opciones = { htmlBody: html };
  const inlineImages = _getInlineImagesFromPlantilla_(plantilla);
  if (inlineImages && Object.keys(inlineImages).length) opciones.inlineImages = inlineImages;

  GmailApp.sendEmail(emailDestino, asunto, "", opciones);
  return emailDestino;
}

/* ████████████████████████████████████████████████████████
   PANEL DE CONTROL VISUAL (Sidebar)
   FIX #3: CSS con .hint definida
   FIX #4: subTab() sincroniza MODO_EDITOR select
   FIX #5: WYSIWYG_HTML textarea oculto (solo uso interno)
   FIX #6: cambiarModoCorreo() con modo "simple" como fallback seguro
████████████████████████████████████████████████████████ */
function abrirPanel() {
  verificarAutoria_();
  const html = HtmlService.createHtmlOutput(getSidebarHtml_())
    .setTitle(`⚙️ Panel · ${AUTOR}`)
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getSidebarHtml_() {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
  '<style>' +
  '*{box-sizing:border-box;margin:0;padding:0}' +
  'body{font-family:Arial,sans-serif;font-size:13px;color:#333;background:#f8f9fa;overflow-x:hidden}' +
  '.header{background:#1a237e;color:#fff;padding:14px 16px}' +
  '.header h2{font-size:14px;font-weight:700;margin:0}' +
  '.header p{font-size:11px;opacity:.75;margin:3px 0 0}' +
  '.autor-badge{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:20px;margin-top:6px;letter-spacing:.4px;}' +
  '.tabs{display:flex;background:#fff;border-bottom:2px solid #e0e0e0}' +
  '.tab{flex:1;padding:10px 4px;border:none;background:none;cursor:pointer;font-size:12px;color:#666;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .15s}' +
  '.tab.active{color:#1a237e;border-bottom-color:#1a237e;font-weight:bold}' +
  '.panel{display:none;padding:14px;height:calc(100vh - 130px);overflow-y:auto}' +
  '.panel.active{display:block}' +
  '.section{margin-bottom:16px}' +
  '.sec-title{font-size:10px;font-weight:bold;color:#1a237e;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e8eaf6}' +
  'label{display:block;font-size:11px;color:#555;margin:8px 0 2px}' +
  'input[type=text],input[type=email],textarea,select{width:100%;padding:7px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;color:#333;background:#fff}' +
  'input:focus,textarea:focus,select:focus{outline:none;border-color:#1a237e;box-shadow:0 0 0 2px rgba(26,35,126,.1)}' +
  'textarea{resize:vertical;min-height:60px;font-family:Arial,sans-serif}' +
  '.btn{display:block;width:100%;padding:9px;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;margin-top:8px;transition:opacity .15s}' +
  '.btn:hover{opacity:.88}' +
  '.btn:disabled{opacity:.45;cursor:not-allowed}' +
  '.btn-primary{background:#1a237e;color:#fff}' +
  '.btn-secondary{background:#f0f0f0;color:#444;border:1px solid #ddd}' +
  '.btn-outline{background:#fff;color:#1a237e;border:1px solid #1a237e}' +
  '.btn-row{display:flex;gap:6px;margin-top:8px}' +
  '.btn-row .btn{flex:1;margin-top:0}' +
  '.status{padding:8px 10px;border-radius:4px;font-size:11px;margin-top:10px;display:none;line-height:1.5}' +
  '.status.ok{background:#e8f5e9;color:#2e7d32;display:block}' +
  '.status.err{background:#ffebee;color:#c62828;display:block}' +
  '.status.loading{background:#e3f2fd;color:#1565c0;display:block}' +
  '@keyframes spin{to{transform:rotate(360deg)}}' +
  '.spin{display:inline-block;width:11px;height:11px;border:2px solid #1565c0;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin-right:5px;vertical-align:middle}' +
  '.subtabs{display:flex;gap:6px;margin:8px 0}' +
  '.subtabs button{flex:1;border:1px solid #ddd;background:#fff;padding:7px;border-radius:6px;cursor:pointer;font-size:12px;color:#555}' +
  '.subtabs button.active{border-color:#1a237e;color:#1a237e;font-weight:bold;background:#f0f4ff}' +
  '.subpanel{display:none}' +
  '.subpanel.active{display:block}' +
  '.toolbar{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}' +
  '.tool{border:1px solid #ddd;background:#fff;border-radius:6px;padding:6px 8px;font-size:11px;cursor:pointer}' +
  '.tool:hover{background:#f5f5f5}' +
  '.editor{border:1px solid #ddd;border-radius:6px;padding:10px;min-height:160px;background:#fff;font-size:13px;line-height:1.6}' +
  '.row2{display:flex;gap:6px}' +
  '.row2 > *{flex:1}' +
  /* FIX #3: .hint y .small definidas */
  '.small{font-size:11px;color:#666}' +
  '.hint{font-size:11px;color:#888;margin:4px 0 2px;line-height:1.5;font-style:italic}' +
  '.footer-credit{text-align:center;padding:10px 0 6px;font-size:10px;color:#bbb;border-top:1px solid #eee;margin-top:6px;}' +
  '.footer-credit strong{color:#9e9e9e;}' +
  '.footer-credit a{color:#1a73e8;text-decoration:none;}' +
  '.autor-li{display:inline-block;color:rgba(255,255,255,0.75);font-size:10px;margin-top:4px;text-decoration:none;letter-spacing:.3px;}' +
  '.autor-li:hover{color:#fff;text-decoration:underline;}' +
  '</style></head><body>' +

  '<div class="header">' +
  '  <h2>🎛 Panel de Control</h2>' +
  '  <p>Sistema de Becarios v7.6</p>' +
  '  <div class="autor-badge">⚡ Desarrollado por Guillermo Elizalde</div>' +
  '  <a class="autor-li" href="https://www.linkedin.com/in/guillermo-san-juan-elizalde-032930211?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank">🔗 LinkedIn</a>' +
  '</div>' +
  '<div class="tabs">' +
  '  <button class="tab active" onclick="cambiarTab(\'config\',this)">⚙️ Config</button>' +
  '  <button class="tab" onclick="cambiarTab(\'correo\',this)">✉️ Correo</button>' +
  '  <button class="tab" onclick="cambiarTab(\'variantes\',this)">🧩 Variantes</button>' +
  '</div>' +

  // CONFIG TAB
  '<div id="tab-config" class="panel active">' +
  '  <div class="section"><div class="sec-title">🏢 Empresa</div>' +
  '    <label>Nombre de la empresa</label><input type="text" id="EMPRESA">' +
  '    <label>Email de RH <span class="hint">(recibe copia)</span></label><input type="email" id="EMAIL_RH">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">📋 Credencial</div>' +
  '    <label>Vigencia en meses</label><input type="text" id="VIGENCIA_MESES">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">📁 Carpetas en Drive</div>' +
  '    <label>Carpeta raíz expedientes</label><input type="text" id="ROOT_FOLDER_ID">' +
  '    <label>Carpeta raíz reportes</label><input type="text" id="REPORTES_ROOT_FOLDER_ID">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">📄 Plantillas</div>' +
  '    <label>Plantilla credencial (Slides)</label><input type="text" id="TEMPLATE_SLIDES_ID">' +
  '    <label>Plantilla reporte diario</label><input type="text" id="TEMPLATE_REPORTE_ID">' +
  '    <label>Instrucciones reporte</label><input type="text" id="INSTRUCCIONES_REPORTE_ID">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">🤖 Gemini</div>' +
  '    <label>Modelo Gemini</label><input type="text" id="GEMINI_MODEL">' +
  '    <label>Reintentos</label><input type="text" id="GEMINI_REINTENTOS">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">🔀 Proveedor de IA</div>' +
  '    <label>Proveedor activo</label>' +
  '    <select id="AI_PROVIDER"><option value="gemini">Gemini (Google)</option><option value="groq">Groq (Llama)</option><option value=\"mistral\">Mistral OCR</option></select>' +
  '    <p class="hint">Gemini → GEMINI_API_KEY · Groq → GROQ_API_KEY · Mistral → MISTRAL_API_KEY en Propiedades del script</p>' +
  '    <label>Modelo Groq <span class="hint">(si usas Groq)</span></label><input type="text" id="GROQ_MODEL" placeholder="meta-llama/llama-4-scout-17b-16e-instruct">' +
  '    <label>Modelo OCR Mistral <span class="hint">(si usas Mistral)</span></label><input type="text" id="MISTRAL_OCR_MODEL" placeholder="mistral-ocr-latest">' +
  '    <label>Modelo Chat Mistral <span class="hint">(extracción JSON)</span></label><input type="text" id="MISTRAL_CHAT_MODEL" placeholder="mistral-small-latest">' +
  '  </div>' +
  '  <div id="st-config" class="status"></div>' +
  '  <button class="btn btn-primary" id="btn-save-config" onclick="guardarConfig()">💾 Guardar configuración</button>' +
  '  <div class="footer-credit">⚡ Sistema por <strong>Guillermo Elizalde</strong> · GE-v7.6 · <a href="https://www.linkedin.com/in/guillermo-san-juan-elizalde-032930211?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank">LinkedIn</a></div>' +
  '</div>' +

  // CORREO TAB
  '<div id="tab-correo" class="panel">' +
  '  <div class="section"><div class="sec-title">Modo de edición</div>' +
  '    <label>Modo</label>' +
  '    <select id="MODO_EDITOR" onchange="cambiarModoCorreo(this.value)">' +
  '      <option value="simple">Simple</option>' +
  '      <option value="bloques">Bloques</option>' +
  '      <option value="wysiwyg">WYSIWYG</option>' +
  '    </select>' +
  /* FIX #3: class="hint" ahora tiene estilo definido */
  '    <p class="hint">Variables disponibles: {NOMBRE} {SUCURSAL} {AREA} {EMPRESA}</p>' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">Header + imágenes (inline)</div>' +
  '    <label>Título header</label><input type="text" id="TITULO_HEADER">' +
  '    <label>Subtítulo header</label><input type="text" id="SUBTITULO_HEADER">' +
  '    <div class="row2">' +
  '      <div><label>Mostrar logo</label><select id="MOSTRAR_LOGO"><option value="TRUE">TRUE</option><option value="FALSE">FALSE</option></select></div>' +
  '      <div><label>Mostrar banner</label><select id="MOSTRAR_BANNER"><option value="FALSE">FALSE</option><option value="TRUE">TRUE</option></select></div>' +
  '    </div>' +
  '    <label>LOGO Drive ID <span class="hint">(inline)</span></label><input type="text" id="LOGO_DRIVE_ID" placeholder="ID de Drive">' +
  '    <label>BANNER Drive ID <span class="hint">(inline)</span></label><input type="text" id="BANNER_DRIVE_ID" placeholder="ID de Drive">' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">Campos comunes</div>' +
  '    <label>Asunto</label><input type="text" id="ASUNTO">' +
  '    <label>Color principal</label><input type="text" id="COLOR_PRINCIPAL" placeholder="#1a237e">' +
  '    <label>Estilo de botón</label>' +
  '    <select id="BOTON_ESTILO"><option value="solid">solid (relleno)</option><option value="outline">outline (contorno)</option></select>' +
  '  </div>' +
  /* FIX #4: Los botones de subtab sincronizan MODO_EDITOR via subTab() */
  '  <div class="subtabs">' +
  '    <button id="btn-sub-simple" class="active" onclick="subTab(\'simple\')">Simple</button>' +
  '    <button id="btn-sub-bloques" onclick="subTab(\'bloques\')">Bloques</button>' +
  '    <button id="btn-sub-wysiwyg" onclick="subTab(\'wysiwyg\')">WYSIWYG</button>' +
  '  </div>' +
  '  <div id="sub-simple" class="subpanel active">' +
  '    <div class="section"><div class="sec-title">Contenido (simple)</div>' +
  '      <label>Saludo</label><input type="text" id="SALUDO">' +
  '      <label>Párrafo principal</label><textarea id="TEXTO_PRINCIPAL" rows="4"></textarea>' +
  '      <label>Texto del botón</label><input type="text" id="TEXTO_BOTON">' +
  '      <label>Pie</label><input type="text" id="PIE">' +
  '      <label>Nota legal</label><textarea id="PIE_LEGAL" rows="2"></textarea>' +
  '    </div>' +
  '  </div>' +
  '  <div id="sub-bloques" class="subpanel">' +
  '    <div class="section"><div class="sec-title">Editor por bloques</div>' +
  '      <p class="hint">Tipos: text, html, button, list, divider, callout, instructions. Si no hay bloque "button", se agrega el botón de carpeta automáticamente.</p>' +
  '      <textarea id="BLOQUES_JSON" rows="10" placeholder=\'[{"type":"text","text":"Hola {NOMBRE},"},{"type":"button","label":"Abrir carpeta"}]\'></textarea>' +
  '    </div>' +
  '  </div>' +
  '  <div id="sub-wysiwyg" class="subpanel">' +
  '    <div class="section"><div class="sec-title">WYSIWYG <span class="hint">(el botón de carpeta se agrega automáticamente al final)</span></div>' +
  '      <div class="toolbar">' +
  '        <button class="tool" type="button" onclick="cmd(\'bold\')"><b>B</b></button>' +
  '        <button class="tool" type="button" onclick="cmd(\'italic\')"><i>I</i></button>' +
  '        <button class="tool" type="button" onclick="cmd(\'insertUnorderedList\')">• Lista</button>' +
  '        <button class="tool" type="button" onclick="cmd(\'insertOrderedList\')">1. Lista</button>' +
  '        <button class="tool" type="button" onclick="insLink()">Link</button>' +
  '        <button class="tool" type="button" onclick="insVar(\'{NOMBRE}\')">{NOMBRE}</button>' +
  '        <button class="tool" type="button" onclick="insVar(\'{SUCURSAL}\')">{SUCURSAL}</button>' +
  '        <button class="tool" type="button" onclick="insVar(\'{AREA}\')">{AREA}</button>' +
  '        <button class="tool" type="button" onclick="insVar(\'{EMPRESA}\')">{EMPRESA}</button>' +
  '      </div>' +
  '      <div id="WYSIWYG_EDITOR" class="editor" contenteditable="true"></div>' +
  /* FIX #5: textarea WYSIWYG_HTML oculto — solo uso interno al guardar */
  '      <textarea id="WYSIWYG_HTML" style="display:none" placeholder="(uso interno)"></textarea>' +
  '    </div>' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">Archivos extra (global)</div>' +
  '    <label>Extra 1 (ID / Nombre)</label><div class="row2"><input type="text" id="ARCHIVO_EXTRA_1_ID" placeholder="ID Drive"><input type="text" id="ARCHIVO_EXTRA_1_NOMBRE" placeholder="nombre.pdf"></div>' +
  '    <label>Extra 2 (ID / Nombre)</label><div class="row2"><input type="text" id="ARCHIVO_EXTRA_2_ID" placeholder="ID Drive"><input type="text" id="ARCHIVO_EXTRA_2_NOMBRE" placeholder="nombre.pdf"></div>' +
  '    <label>Extra 3 (ID / Nombre)</label><div class="row2"><input type="text" id="ARCHIVO_EXTRA_3_ID" placeholder="ID Drive"><input type="text" id="ARCHIVO_EXTRA_3_NOMBRE" placeholder="nombre.pdf"></div>' +
  '  </div>' +
  '  <div id="st-correo" class="status"></div>' +
  '  <div class="btn-row">' +
  '    <button class="btn btn-outline" id="btn-previa" onclick="verPrevia()">👁 Vista previa</button>' +
  '    <button class="btn btn-secondary" id="btn-prueba" onclick="enviarPrueba()">📧 Enviar prueba</button>' +
  '  </div>' +
  '  <button class="btn btn-primary" id="btn-save-correo" onclick="guardarCorreo()">💾 Guardar correo</button>' +
  '  <div class="footer-credit">⚡ Sistema por <strong>Guillermo Elizalde</strong> · GE-v7.6 · <a href="https://www.linkedin.com/in/guillermo-san-juan-elizalde-032930211?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank">LinkedIn</a></div>' +
  '</div>' +

  // VARIANTES TAB
  '<div id="tab-variantes" class="panel">' +
  '  <div class="section"><div class="sec-title">Variantes + reglas</div>' +
  '    <p class="hint">La variante con mayor PRIORIDAD que cumpla sus reglas se aplica sobre la plantilla base.</p>' +
  '    <label>Selecciona variante</label>' +
  '    <select id="VAR_SEL" onchange="cargarVarianteSeleccionada()"></select>' +
  '    <div class="btn-row">' +
  '      <button class="btn btn-outline" onclick="nuevaVariante()">➕ Nueva</button>' +
  '      <button class="btn btn-secondary" onclick="borrarVariante()">🗑 Borrar</button>' +
  '    </div>' +
  '  </div>' +
  '  <div class="section"><div class="sec-title">Datos de variante</div>' +
  '    <input type="hidden" id="VAR_ROW">' +
  '    <label>Nombre</label><input type="text" id="VAR_NOMBRE">' +
  '    <label>Prioridad <span class="hint">(número; mayor valor gana)</span></label><input type="text" id="VAR_PRIORIDAD" value="10">' +
  '    <label>REGLA_JSON</label>' +
  '    <textarea id="VAR_REGLA" rows="6" placeholder=\'[{"field":"AREA","op":"equals","value":"SISTEMAS"}]\'></textarea>' +
  '    <p class="hint">Operadores: equals | contains | regex | notequals | notcontains</p>' +
  '    <label>DATA_JSON <span class="hint">(campos de ✉️ CORREO que esta variante sobreescribe)</span></label>' +
  '    <textarea id="VAR_DATA" rows="8" placeholder=\'{"ASUNTO":"Bienvenido {NOMBRE}","MODO_EDITOR":"bloques","BLOQUES_JSON":"[...]"}\'></textarea>' +
  '  </div>' +
  '  <div id="st-var" class="status"></div>' +
  '  <button class="btn btn-primary" onclick="guardarVariante()">💾 Guardar variante</button>' +
  '  <div class="footer-credit">⚡ Sistema por <strong>Guillermo Elizalde</strong> · GE-v7.6 · <a href="https://www.linkedin.com/in/guillermo-san-juan-elizalde-032930211?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank">LinkedIn</a></div>' +
  '</div>' +

  '<script>' +
  // ── Navegación de tabs principales ──
  'function cambiarTab(id,btn){' +
  '  document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active");});' +
  '  document.querySelectorAll(".panel").forEach(function(p){p.classList.remove("active");});' +
  '  document.getElementById("tab-"+id).classList.add("active");' +
  '  btn.classList.add("active");' +
  '}' +

  // ── Status helpers ──
  'function setStatus(id,msg,tipo){var el=document.getElementById(id);el.className="status "+tipo;el.innerHTML=(tipo==="loading")?"<span class=\'spin\'></span>"+msg:msg;}' +
  'function clearStatus(id){document.getElementById(id).className="status";}' +

  // FIX #4: subTab() sincroniza MODO_EDITOR select además del panel visual
  'function subTab(id){' +
  '  ["simple","bloques","wysiwyg"].forEach(function(x){' +
  '    document.getElementById("sub-"+x).classList.remove("active");' +
  '    document.getElementById("btn-sub-"+x).classList.remove("active");' +
  '  });' +
  '  document.getElementById("sub-"+id).classList.add("active");' +
  '  document.getElementById("btn-sub-"+id).classList.add("active");' +
  '  var sel=document.getElementById("MODO_EDITOR");' +
  '  if(sel && sel.value!==id) sel.value=id;' +   // sincroniza select sin disparar onchange
  '}' +

  // FIX #6: cambiarModoCorreo recibe el valor directamente para evitar lecturas de DOM tardías
  // y tiene "simple" como fallback seguro
  'function cambiarModoCorreo(val){' +
  '  var m=val||document.getElementById("MODO_EDITOR").value||"simple";' +
  '  if(m==="bloques") subTab("bloques");' +
  '  else if(m==="wysiwyg") subTab("wysiwyg");' +
  '  else subTab("simple");' +   // FIX #6: fallback siempre válido
  '}' +

  // ── WYSIWYG helpers ──
  'function cmd(c){document.execCommand(c,false,null);}' +
  'function insLink(){var url=prompt("URL (https://...)");if(!url)return;document.execCommand("createLink",false,url);}' +
  'function insVar(v){document.execCommand("insertText",false,v);}' +

  // ── Carga de datos ──
  'var _DATA=null;' +
  'function cargarDatos(){' +
  '  google.script.run' +
  '    .withSuccessHandler(llenarFormularios)' +
  '    .withFailureHandler(function(e){setStatus("st-config","❌ Error al cargar: "+e.message,"err");})' +
  '    .cargarTodaLaConfig();' +
  '}' +

  'function llenarFormularios(data){' +
  '  _DATA=data;' +
  // Config fields
  '  var cfgFields=["EMPRESA","EMAIL_RH","VIGENCIA_MESES","ROOT_FOLDER_ID","REPORTES_ROOT_FOLDER_ID","TEMPLATE_SLIDES_ID","TEMPLATE_REPORTE_ID","INSTRUCCIONES_REPORTE_ID","GEMINI_MODEL","GEMINI_REINTENTOS","GROQ_MODEL","MISTRAL_OCR_MODEL","MISTRAL_CHAT_MODEL"];' +
  '  cfgFields.forEach(function(k){var el=document.getElementById(k);if(el&&data.config[k]!==undefined)el.value=data.config[k];});' +
  '  var aiSel=document.getElementById("AI_PROVIDER");if(aiSel&&data.config.AI_PROVIDER)aiSel.value=data.config.AI_PROVIDER;' +
  // Correo fields
  '  var c=data.correo||{};' +
  '  var correoFields=["ASUNTO","SALUDO","TEXTO_PRINCIPAL","TEXTO_BOTON","PIE","COLOR_PRINCIPAL","ARCHIVO_EXTRA_1_ID","ARCHIVO_EXTRA_1_NOMBRE","ARCHIVO_EXTRA_2_ID","ARCHIVO_EXTRA_2_NOMBRE","ARCHIVO_EXTRA_3_ID","ARCHIVO_EXTRA_3_NOMBRE","MODO_EDITOR","BLOQUES_JSON","WYSIWYG_HTML","LOGO_DRIVE_ID","BANNER_DRIVE_ID","MOSTRAR_LOGO","MOSTRAR_BANNER","BOTON_ESTILO","TITULO_HEADER","SUBTITULO_HEADER","PIE_LEGAL"];' +
  '  correoFields.forEach(function(k){var el=document.getElementById(k);if(!el)return;if(c[k]!==undefined)el.value=c[k];});' +
  // FIX #5: cargar WYSIWYG en el editor visual, no solo en el textarea oculto
  '  document.getElementById("WYSIWYG_EDITOR").innerHTML=(c.WYSIWYG_HTML||"");' +
  // FIX #4+#6: sincronizar subtab con el modo cargado
  '  cambiarModoCorreo(c.MODO_EDITOR||"simple");' +
  '  renderVarSel();' +
  '}' +

  // ── Variantes ──
  'function renderVarSel(){' +
  '  var sel=document.getElementById("VAR_SEL");' +
  '  sel.innerHTML="";' +
  '  var opt=document.createElement("option");opt.value="";opt.textContent="(selecciona)";sel.appendChild(opt);' +
  '  var arr=(_DATA&&_DATA.variantes)?_DATA.variantes:[];' +
  '  arr.forEach(function(v){var o=document.createElement("option");o.value=v.row;o.textContent=v.NOMBRE+" (P:"+v.PRIORIDAD+")";o.dataset.row=v.row;sel.appendChild(o);});' +
  '}' +

  'function cargarVarianteSeleccionada(){' +
  '  var row=document.getElementById("VAR_SEL").value;' +
  '  if(!row){' +
  '    document.getElementById("VAR_ROW").value="";' +
  '    document.getElementById("VAR_NOMBRE").value="";' +
  '    document.getElementById("VAR_PRIORIDAD").value="10";' +
  '    document.getElementById("VAR_REGLA").value="";' +
  '    document.getElementById("VAR_DATA").value="";' +
  '    return;' +
  '  }' +
  '  var v=(_DATA&&_DATA.variantes||[]).find(function(x){return String(x.row)===String(row);});' +
  '  if(!v)return;' +
  '  document.getElementById("VAR_ROW").value=v.row;' +
  '  document.getElementById("VAR_NOMBRE").value=v.NOMBRE;' +
  '  document.getElementById("VAR_PRIORIDAD").value=v.PRIORIDAD;' +
  '  document.getElementById("VAR_REGLA").value=v.REGLA_JSON||"";' +
  '  document.getElementById("VAR_DATA").value=v.DATA_JSON||"";' +
  '}' +

  'function nuevaVariante(){document.getElementById("VAR_SEL").value="";cargarVarianteSeleccionada();document.getElementById("VAR_NOMBRE").focus();}' +

  // ── Getters de datos de formulario ──
  'function getConfigData(){' +
  '  return{' +
  '    EMPRESA:document.getElementById("EMPRESA").value,' +
  '    EMAIL_RH:document.getElementById("EMAIL_RH").value,' +
  '    VIGENCIA_MESES:document.getElementById("VIGENCIA_MESES").value,' +
  '    ROOT_FOLDER_ID:document.getElementById("ROOT_FOLDER_ID").value,' +
  '    REPORTES_ROOT_FOLDER_ID:document.getElementById("REPORTES_ROOT_FOLDER_ID").value,' +
  '    TEMPLATE_SLIDES_ID:document.getElementById("TEMPLATE_SLIDES_ID").value,' +
  '    TEMPLATE_REPORTE_ID:document.getElementById("TEMPLATE_REPORTE_ID").value,' +
  '    INSTRUCCIONES_REPORTE_ID:document.getElementById("INSTRUCCIONES_REPORTE_ID").value,' +
  '    GEMINI_MODEL:document.getElementById("GEMINI_MODEL").value,' +
  '    GEMINI_REINTENTOS:document.getElementById("GEMINI_REINTENTOS").value,' +
  '    AI_PROVIDER:document.getElementById("AI_PROVIDER").value,' +
  '    GROQ_MODEL:document.getElementById("GROQ_MODEL").value,' +
  '    MISTRAL_OCR_MODEL:document.getElementById("MISTRAL_OCR_MODEL").value,' +
  '    MISTRAL_CHAT_MODEL:document.getElementById("MISTRAL_CHAT_MODEL").value' +
  '  };' +
  '}' +

  'function getCorreoData(){' +
  // FIX #5: sincronizar editor WYSIWYG → textarea oculto antes de leer
  '  var wy=document.getElementById("WYSIWYG_EDITOR").innerHTML;' +
  '  document.getElementById("WYSIWYG_HTML").value=wy;' +
  '  return{' +
  '    ASUNTO:document.getElementById("ASUNTO").value,' +
  '    SALUDO:document.getElementById("SALUDO").value,' +
  '    TEXTO_PRINCIPAL:document.getElementById("TEXTO_PRINCIPAL").value,' +
  '    TEXTO_BOTON:document.getElementById("TEXTO_BOTON").value,' +
  '    PIE:document.getElementById("PIE").value,' +
  '    COLOR_PRINCIPAL:document.getElementById("COLOR_PRINCIPAL").value,' +
  '    ARCHIVO_EXTRA_1_ID:document.getElementById("ARCHIVO_EXTRA_1_ID").value,' +
  '    ARCHIVO_EXTRA_1_NOMBRE:document.getElementById("ARCHIVO_EXTRA_1_NOMBRE").value,' +
  '    ARCHIVO_EXTRA_2_ID:document.getElementById("ARCHIVO_EXTRA_2_ID").value,' +
  '    ARCHIVO_EXTRA_2_NOMBRE:document.getElementById("ARCHIVO_EXTRA_2_NOMBRE").value,' +
  '    ARCHIVO_EXTRA_3_ID:document.getElementById("ARCHIVO_EXTRA_3_ID").value,' +
  '    ARCHIVO_EXTRA_3_NOMBRE:document.getElementById("ARCHIVO_EXTRA_3_NOMBRE").value,' +
  '    MODO_EDITOR:document.getElementById("MODO_EDITOR").value,' +
  '    BLOQUES_JSON:document.getElementById("BLOQUES_JSON").value,' +
  '    WYSIWYG_HTML:document.getElementById("WYSIWYG_HTML").value,' +
  '    LOGO_DRIVE_ID:document.getElementById("LOGO_DRIVE_ID").value,' +
  '    BANNER_DRIVE_ID:document.getElementById("BANNER_DRIVE_ID").value,' +
  '    MOSTRAR_LOGO:document.getElementById("MOSTRAR_LOGO").value,' +
  '    MOSTRAR_BANNER:document.getElementById("MOSTRAR_BANNER").value,' +
  '    BOTON_ESTILO:document.getElementById("BOTON_ESTILO").value,' +
  '    TITULO_HEADER:document.getElementById("TITULO_HEADER").value,' +
  '    SUBTITULO_HEADER:document.getElementById("SUBTITULO_HEADER").value,' +
  '    PIE_LEGAL:document.getElementById("PIE_LEGAL").value' +
  '  };' +
  '}' +

  // ── Acciones de guardado ──
  'function guardarConfig(){' +
  '  var btn=document.getElementById("btn-save-config");' +
  '  setStatus("st-config","Guardando...","loading");btn.disabled=true;' +
  '  google.script.run' +
  '    .withSuccessHandler(function(){setStatus("st-config","✅ Configuración guardada","ok");btn.disabled=false;})' +
  '    .withFailureHandler(function(e){setStatus("st-config","❌ "+e.message,"err");btn.disabled=false;})' +
  '    .guardarConfigDesdePanel(getConfigData());' +
  '}' +

  'function guardarCorreo(){' +
  '  var btn=document.getElementById("btn-save-correo");' +
  '  setStatus("st-correo","Guardando...","loading");btn.disabled=true;' +
  '  google.script.run' +
  '    .withSuccessHandler(function(){setStatus("st-correo","✅ Correo guardado","ok");btn.disabled=false;})' +
  '    .withFailureHandler(function(e){setStatus("st-correo","❌ "+e.message,"err");btn.disabled=false;})' +
  '    .guardarCorreoDesdePanel(getCorreoData());' +
  '}' +

  'function verPrevia(){' +
  '  var btn=document.getElementById("btn-previa");' +
  '  setStatus("st-correo","Generando vista previa...","loading");btn.disabled=true;' +
  '  google.script.run' +
  '    .withSuccessHandler(function(){clearStatus("st-correo");btn.disabled=false;})' +
  '    .withFailureHandler(function(e){setStatus("st-correo","❌ "+e.message,"err");btn.disabled=false;})' +
  '    .abrirVistaPreviaDesdePanel(getCorreoData());' +
  '}' +

  'function enviarPrueba(){' +
  '  var btn=document.getElementById("btn-prueba");' +
  '  setStatus("st-correo","Enviando prueba...","loading");btn.disabled=true;' +
  '  google.script.run' +
  '    .withSuccessHandler(function(email){setStatus("st-correo","✅ Prueba enviada a "+email,"ok");btn.disabled=false;})' +
  '    .withFailureHandler(function(e){setStatus("st-correo","❌ "+e.message,"err");btn.disabled=false;})' +
  '    .enviarCorreoPruebaDesdePanel(getCorreoData());' +
  '}' +

  'function guardarVariante(){' +
  '  setStatus("st-var","Guardando variante...","loading");' +
  '  var payload={' +
  '    row:document.getElementById("VAR_ROW").value,' +
  '    NOMBRE:document.getElementById("VAR_NOMBRE").value,' +
  '    PRIORIDAD:document.getElementById("VAR_PRIORIDAD").value,' +
  '    REGLA_JSON:document.getElementById("VAR_REGLA").value,' +
  '    DATA_JSON:document.getElementById("VAR_DATA").value' +
  '  };' +
  '  google.script.run' +
  '    .withSuccessHandler(function(){setStatus("st-var","✅ Variante guardada","ok");recargarTodo();})' +
  '    .withFailureHandler(function(e){setStatus("st-var","❌ "+e.message,"err");})' +
  '    .guardarVarianteCorreoDesdePanel(payload);' +
  '}' +

  'function borrarVariante(){' +
  '  var row=document.getElementById("VAR_ROW").value||document.getElementById("VAR_SEL").value;' +
  '  if(!row){setStatus("st-var","Selecciona una variante primero.","err");return;}' +
  '  if(!confirm("¿Borrar esta variante?"))return;' +
  '  setStatus("st-var","Borrando...","loading");' +
  '  google.script.run' +
  '    .withSuccessHandler(function(){setStatus("st-var","✅ Borrada","ok");recargarTodo();})' +
  '    .withFailureHandler(function(e){setStatus("st-var","❌ "+e.message,"err");})' +
  '    .borrarVarianteCorreoDesdePanel(row);' +
  '}' +

  'function recargarTodo(){' +
  '  google.script.run' +
  '    .withSuccessHandler(llenarFormularios)' +
  '    .withFailureHandler(function(e){setStatus("st-config","❌ Error al recargar: "+e.message,"err");})' +
  '    .cargarTodaLaConfig();' +
  '}' +

  // ── Inicio ──
  'cargarDatos();' +
  '</script>' +
  '</body></html>';
}

/* ─── Setup de hoja variantes ─── */
function setupVariantes() {
  verificarAutoria_();
  asegurarHojaVariantes_();
  SpreadsheetApp.getUi().alert("✅ Hoja ✉️ VARIANTES lista." + selloGE_());
}