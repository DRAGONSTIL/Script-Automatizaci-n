# Sistema de onboarding de becarios con Google Apps Script + IA

Automatiza el alta operativa de becarios desde Google Forms / Google Sheets usando Google Drive, Google Slides, Gmail y modelos de IA para extracción documental.

## Qué hace

Este sistema procesa una fila del formulario y ejecuta de forma automática gran parte del onboarding:

- Lee documentos como INE, CURP e IMSS
- Extrae datos clave con IA
- Valida CURP y NSS
- Crea la estructura completa del expediente en Google Drive
- Copia y ordena archivos adjuntos sin duplicados
- Genera una credencial en PDF desde una plantilla de Google Slides
- Crea carpeta de reportes y documentos de seguimiento
- Envía correo de onboarding con acceso a la carpeta correspondiente
- Permite procesar una fila, extraer solo con IA o procesar toda la hoja

## Stack

- Google Apps Script
- Google Sheets
- Google Drive
- Google Slides
- Gmail
- Gemini / Groq / Mistral OCR

## Flujo general

1. Se recibe una respuesta del formulario.
2. El script toma la fila activa o la fila recién enviada.
3. Lee los documentos cargados por la persona.
4. Extrae CURP, NSS y otros datos relevantes usando IA.
5. Crea el expediente del becario por sucursal.
6. Organiza los archivos en carpetas predefinidas.
7. Genera la credencial en PDF.
8. Crea la carpeta de reportes.
9. Comparte accesos y envía el correo de onboarding.

## Estructura de carpetas que genera

```text
01_Documentos_Adjuntos/
  ├── INE
  ├── CURP_Documento
  ├── Comprobante_Domicilio
  ├── Historial_Academico_y_CV
  ├── Seguro_IMSS_o_Facultativo

02_Cartas/
  └── Carta_de_Presentacion

03_Seguimiento/

04_Credencial/
```

## Requisitos

Antes de usarlo necesitas:

- Una hoja de cálculo de Google Sheets conectada a un Google Form
- Documentos adjuntos guardados en Google Drive
- Una plantilla de Google Slides para la credencial
- Una carpeta raíz para expedientes
- Una carpeta raíz para reportes
- Una cuenta con permisos sobre Drive, Sheets, Slides y Gmail
- Al menos un proveedor de IA configurado:
  - Gemini
  - Groq
  - Mistral

## Configuración

### 1) Variables base del script

En `CONFIG` debes definir o cargar desde la hoja `⚙️ CONFIG`:

- `ROOT_FOLDER_ID`
- `TEMPLATE_SLIDES_ID`
- `REPORTES_ROOT_FOLDER_ID`
- `TEMPLATE_REPORTE_ID`
- `INSTRUCCIONES_REPORTE_ID`
- `EMPRESA`
- `EMAIL_RH`

También puedes ajustar:

- `AI_PROVIDER`
- `GEMINI_MODEL`
- `GROQ_MODEL`
- `MISTRAL_OCR_MODEL`
- `MISTRAL_CHAT_MODEL`
- `VIGENCIA_MESES`
- `SKIP_COMPLETED`

### 2) Script Properties

Configura las llaves desde **Apps Script > Project Settings > Script Properties**.

Usa solo las que correspondan al proveedor que vayas a utilizar:

```text
GEMINI_API_KEY=tu_api_key
GROQ_API_KEY=tu_api_key
MISTRAL_API_KEY=tu_api_key
```

## Hoja `⚙️ CONFIG`

El sistema puede leer configuración desde una hoja llamada `⚙️ CONFIG`.

Claves esperadas:

- `EMPRESA`
- `EMAIL_RH`
- `VIGENCIA_MESES`
- `ROOT_FOLDER_ID`
- `REPORTES_ROOT_FOLDER_ID`
- `TEMPLATE_SLIDES_ID`
- `TEMPLATE_REPORTE_ID`
- `INSTRUCCIONES_REPORTE_ID`
- `GEMINI_MODEL`
- `GEMINI_REINTENTOS`
- `GEMINI_ESPERA_MS`
- `AI_PROVIDER`
- `GROQ_MODEL`
- `MISTRAL_OCR_MODEL`
- `MISTRAL_CHAT_MODEL`
- `SKIP_COMPLETED`

## Hoja `✉️ CORREO`

También puede cargar una plantilla editable de correo desde una hoja llamada `✉️ CORREO`.

Campos soportados:

- `ASUNTO`
- `SALUDO`
- `TEXTO_PRINCIPAL`
- `TEXTO_BOTON`
- `PIE`
- `COLOR_PRINCIPAL`
- `ARCHIVO_EXTRA_1_ID`
- `ARCHIVO_EXTRA_1_NOMBRE`
- `ARCHIVO_EXTRA_2_ID`
- `ARCHIVO_EXTRA_2_NOMBRE`
- `ARCHIVO_EXTRA_3_ID`
- `ARCHIVO_EXTRA_3_NOMBRE`
- `MODO_EDITOR`
- `BLOQUES_JSON`
- `WYSIWYG_HTML`
- `LOGO_DRIVE_ID`
- `BANNER_DRIVE_ID`
- `MOSTRAR_LOGO`
- `MOSTRAR_BANNER`
- `BOTON_ESTILO`
- `TITULO_HEADER`
- `SUBTITULO_HEADER`
- `PIE_LEGAL`

## Columnas esperadas del formulario

El script busca estos campos en la respuesta del formulario:

- `NOMBRE COMPLETO`
- `SUCURSAL EN LA QUE REALIZARAS TU ESTADIA.`
- `Área de Estadía`
- `Fecha de Ingreso`
- `Dirección de correo electrónico`
- `Identificación Oficial (INE)`
- `Documento CURP`
- `Comprobante de Domicilio`
- `Historial Académico y Currículum Vitae`
- `Seguro (IMSS o Facultativo)`
- `Fotografía con Fondo Blanco`
- `Carta de Presentación`

## Proveedores de IA

### Gemini
Recomendado para imágenes y PDFs usando File API.

### Groq
Útil para imágenes.  
Si recibe PDF, el sistema puede redirigir a Mistral si está configurado.

### Mistral OCR
Especialmente útil para PDFs y extracción OCR más robusta.

## Menú disponible en Google Sheets

Al abrir la hoja, el script agrega un menú con opciones para:

- Procesar fila seleccionada
- Extraer solo con IA
- Procesar toda la hoja
- Abrir panel de control
- Ver modelos disponibles
- Consultar información del sistema

## Instalación rápida

1. Crea un proyecto de Apps Script vinculado a tu Google Sheet.
2. Pega el contenido de `scriptauto.js`.
3. Configura `Script Properties`.
4. Crea las hojas `⚙️ CONFIG` y `✉️ CORREO` si quieres administrar todo desde Sheets.
5. Asigna los IDs de carpetas y plantillas.
6. Autoriza los permisos del proyecto.
7. Ejecuta `onOpen()` una vez para inicializar el menú.
8. Configura el trigger de formulario para `onFormSubmit(e)`.


## Limitaciones

- Apps Script tiene límite de tiempo por ejecución
- La calidad del OCR depende de la legibilidad del documento
- El sistema depende de una estructura consistente en nombres de columnas y archivos

