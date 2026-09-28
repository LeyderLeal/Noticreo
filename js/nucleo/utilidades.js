/**
 * utilidades.js
 * Funciones de apoyo:
 * formato de fechas, escape de HTML, búsqueda sin tildes, lectura de
 * parámetros de la URL y el aviso flotante.
 */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul',
  'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Convierte "AAAA-MM-DD" en un Date local.
 * No se usa new Date("AAAA-MM-DD") porque lo interpreta en UTC y en
 * Colombia (UTC-5) la fecha mostrada quedaría un día antes.
 * @param {string} iso
 * @returns {Date}
 */
export function fechaDesdeISO(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** @returns {string} Fecha de hoy en formato "AAAA-MM-DD" (hora local). */
export function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/** "2026-09-14" → "14 de septiembre de 2026" */
export function formatearFechaLarga(iso) {
  const f = fechaDesdeISO(iso);
  return `${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`;
}

/** "2026-09-14" → "14 sep 2026" */
export function formatearFechaCorta(iso) {
  const f = fechaDesdeISO(iso);
  return `${String(f.getDate()).padStart(2, '0')} ${MESES_CORTOS[f.getMonth()]} ${f.getFullYear()}`;
}

/** Fecha actual para la cabecera: "domingo, 27 de septiembre de 2026". */
export function fechaActualTexto() {
  const hoy = new Date();
  return `${DIAS[hoy.getDay()]}, ${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

/**
 * Escapa los caracteres especiales de HTML.
 * Obligatorio al insertar texto con innerHTML, sobre todo el que escribe
 * el usuario en Publicar: evita que un título con etiquetas <script>
 * se ejecute al mostrarse (ataque XSS).
 * @param {*} texto
 * @returns {string}
 */
export function escaparHTML(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Minúsculas y sin tildes, para que buscar "tecnologia" encuentre "Tecnología".
 * @param {string} texto
 * @returns {string}
 */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lee un parámetro de la URL actual (ej.: detalle.html?id=3 → "3").
 * @param {string} nombre
 * @returns {string|null}
 */
export function parametroURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

/**
 * Elige singular o plural según la cantidad.
 * @example pluralizar(1, 'noticia', 'noticias') → "1 noticia"
 */
export function pluralizar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

let temporizadorAviso = null;

/**
 * Muestra un mensaje breve en la parte inferior de la pantalla.
 * Usa role="status" para que los lectores de pantalla lo anuncien.
 * @param {string} mensaje
 */
export function mostrarAviso(mensaje) {
  let aviso = document.getElementById('aviso');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = 'aviso';
    aviso.className = 'aviso';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    document.body.append(aviso);
  }
  aviso.textContent = mensaje;
  aviso.classList.add('es-visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('es-visible'), 2600);
}
