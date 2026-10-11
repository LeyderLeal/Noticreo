/**
 * datos.js
 * Capa de datos de las noticias.
 *
 * El archivo data/noticias.json no se puede modificar desde el navegador.
 * Para poder crear y eliminar noticias sin servidor, el catálogo se arma
 * combinando tres fuentes:
 *   1. Las noticias del archivo JSON (se descarga una sola vez por página).
 *   2. Las noticias creadas por el usuario, guardadas en localStorage.
 *   3. Los ids de las noticias del JSON que el usuario eliminó.
 */

import { leer, guardar, borrar, CLAVES } from './almacenamiento.js';
import { quitarFavorito } from './favoritos.js';
import { hoyISO } from './utilidades.js';

const RUTA_JSON = 'data/noticias.json';

/** Secciones de la aplicación: nombre visible y sufijo de clase CSS. */
export const CATEGORIAS = Object.freeze({
  educacion:  { nombre: 'Educación',  clase: 'edu' },
  tecnologia: { nombre: 'Tecnología', clase: 'tec' },
  turismo:    { nombre: 'Turismo',    clase: 'tur' },
  comercio:   { nombre: 'Comercio',   clase: 'com' },
});

/** Copia en memoria del archivo JSON. */
let noticiasBase = null;

/**
 * Descarga el archivo JSON una sola vez.
 * @returns {Promise<Array>}
 * @throws {Error} Si el archivo no se puede leer.
 */
async function cargarNoticiasBase() {
  if (noticiasBase) return noticiasBase;
  const respuesta = await fetch(RUTA_JSON);
  if (!respuesta.ok) {
    throw new Error(`No se pudo leer ${RUTA_JSON} (HTTP ${respuesta.status})`);
  }
  noticiasBase = await respuesta.json();
  return noticiasBase;
}

/** Lee una lista guardada; si no existe o está dañada, devuelve un arreglo vacío. */
function leerLista(clave) {
  const valor = leer(clave, []);
  return Array.isArray(valor) ? valor : [];
}

/**
 * Ordena de la más reciente a la más antigua.
 * Con la misma fecha, va primero la de id mayor.
 */
function ordenarPorFecha(noticias) {
  return [...noticias].sort((a, b) =>
    b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

/**
 * Devuelve el catálogo ordenado por fecha descendente: las noticias del
 * JSON que no se han eliminado más las creadas por el usuario.
 * @returns {Promise<Array>}
 * @throws {Error} Si el archivo no se puede leer.
 */
export async function obtenerNoticias() {
  const base = await cargarNoticiasBase();
  const eliminadas = leerLista(CLAVES.ELIMINADAS);
  const creadas = leerLista(CLAVES.CREADAS);
  const visibles = base.filter((noticia) => !eliminadas.includes(noticia.id));
  return ordenarPorFecha([...visibles, ...creadas]);
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

/**
 * Convierte el texto del formulario en bloques de contenido.
 * Cada línea en blanco separa un párrafo.
 * @param {string} texto
 * @returns {Array<{tipo: string, texto: string}>}
 */
function textoABloques(texto) {
  return texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)
    .map((parrafo) => ({ tipo: 'p', texto: parrafo }));
}

/** Minutos de lectura estimados a 200 palabras por minuto (mínimo 1). */
function estimarLectura(texto) {
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

/**
 * Crea una noticia y la guarda en localStorage.
 * El id, la fecha y el tiempo de lectura se calculan aquí.
 * @param {{titulo: string, categoria: string, autor: string,
 *          resumen: string, contenido: string, imagen: string}} datos
 * @returns {Object} La noticia creada.
 * @throws {Error} Si el navegador no permite guardarla.
 */
export function crearNoticia(datos) {
  const nueva = {
    id: Date.now(),
    titulo: datos.titulo.trim(),
    categoria: datos.categoria,
    resumen: datos.resumen.trim(),
    autor: datos.autor.trim(),
    fecha: hoyISO(),
    lectura: estimarLectura(datos.contenido),
    imagen: datos.imagen.trim(),
    contenido: textoABloques(datos.contenido),
    creadaPorUsuario: true,
  };
  if (!guardar(CLAVES.CREADAS, [...leerLista(CLAVES.CREADAS), nueva])) {
    throw new Error('El navegador no permitió guardar la noticia.');
  }
  return nueva;
}

/**
 * Elimina una noticia del catálogo y la quita de favoritos.
 * - Si la creó el usuario, se borra de su lista.
 * - Si viene del JSON, su id se agrega a la lista de eliminadas.
 * @param {number} id
 */
export function eliminarNoticia(id) {
  const creadas = leerLista(CLAVES.CREADAS);
  const restantes = creadas.filter((noticia) => noticia.id !== id);

  if (restantes.length < creadas.length) {
    guardar(CLAVES.CREADAS, restantes);
  } else {
    const eliminadas = leerLista(CLAVES.ELIMINADAS);
    if (!eliminadas.includes(id)) guardar(CLAVES.ELIMINADAS, [...eliminadas, id]);
  }
  quitarFavorito(id);
}

/**
 * Vuelve al catálogo original: borra las noticias creadas, recupera las
 * eliminadas y quita de favoritos las noticias que dejan de existir.
 */
export function restablecerNoticias() {
  leerLista(CLAVES.CREADAS).forEach((noticia) => quitarFavorito(noticia.id));
  borrar(CLAVES.CREADAS);
  borrar(CLAVES.ELIMINADAS);
}

/** @returns {boolean} true si el usuario creó o eliminó alguna noticia. */
export function hayCambiosEnCatalogo() {
  return leerLista(CLAVES.CREADAS).length > 0 || leerLista(CLAVES.ELIMINADAS).length > 0;
}
