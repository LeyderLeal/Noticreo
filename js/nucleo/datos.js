/**
 * datos.js
 * Capa de datos de las noticias.
 *
 * Las noticias se leen del archivo local data/noticias.json con fetch.
 * El archivo se descarga una sola vez por página y se guarda en memoria,
 * así varias funciones pueden pedir el catálogo sin repetir la petición.
 */

const RUTA_JSON = 'data/noticias.json';

/** Secciones de la aplicación: nombre visible y sufijo de clase CSS. */
export const CATEGORIAS = Object.freeze({
  educacion:  { nombre: 'Educación',  clase: 'edu' },
  tecnologia: { nombre: 'Tecnología', clase: 'tec' },
  turismo:    { nombre: 'Turismo',    clase: 'tur' },
  comercio:   { nombre: 'Comercio',   clase: 'com' },
});

/** Copia en memoria del catálogo ya ordenado. */
let catalogo = null;

/**
 * Ordena de la más reciente a la más antigua.
 * Con la misma fecha, va primero la de id mayor.
 */
function ordenarPorFecha(noticias) {
  return [...noticias].sort((a, b) =>
    b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

/**
 * Devuelve todas las noticias ordenadas por fecha descendente.
 * @returns {Promise<Array>}
 * @throws {Error} Si el archivo no se puede leer.
 */
export async function obtenerNoticias() {
  if (catalogo) return catalogo;
  const respuesta = await fetch(RUTA_JSON);
  if (!respuesta.ok) {
    throw new Error(`No se pudo leer ${RUTA_JSON} (HTTP ${respuesta.status})`);
  }
  catalogo = ordenarPorFecha(await respuesta.json());
  return catalogo;
}

/**
 * Busca una noticia por id.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function obtenerNoticia(id) {
  const noticias = await obtenerNoticias();
  return noticias.find((noticia) => noticia.id === id) ?? null;
}
