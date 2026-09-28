/**
 * almacenamiento.js
 * Capa de acceso a localStorage.
 *
 * Centraliza en un solo lugar las claves que usa la aplicación y el manejo
 * de errores (navegación privada, cuota llena o datos corruptos), para que
 * el resto del código no tenga que repetir try/catch ni JSON.parse.
 */

/** Prefijo común: evita choques con otros sitios servidos desde el mismo dominio. */
const PREFIJO = 'noticreo:';

/** Claves usadas por la aplicación. */
export const CLAVES = Object.freeze({
  FAVORITOS: 'favoritos',   // arreglo de ids de noticias guardadas
});

/**
 * Lee un valor guardado y lo convierte desde JSON.
 * @param {string} clave - Una de las CLAVES.
 * @param {*} valorPorDefecto - Se devuelve si no existe o no se puede leer.
 * @returns {*} El valor guardado o el valor por defecto.
 */
export function leer(clave, valorPorDefecto) {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    return crudo === null ? valorPorDefecto : JSON.parse(crudo);
  } catch {
    return valorPorDefecto;
  }
}

/**
 * Guarda un valor convirtiéndolo a JSON.
 * @param {string} clave - Una de las CLAVES.
 * @param {*} valor - Cualquier valor serializable.
 * @returns {boolean} true si se guardó; false si el navegador lo impidió.
 */
export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un valor guardado.
 * @param {string} clave - Una de las CLAVES.
 */
export function borrar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* Sin acceso a localStorage: no hay nada que borrar. */
  }
}

/**
 * Indica si una clave de un evento "storage" pertenece a esta aplicación.
 * Se usa para sincronizar pestañas abiertas al mismo tiempo.
 * @param {string|null} claveEvento
 * @returns {boolean}
 */
export function esClavePropia(claveEvento) {
  return typeof claveEvento === 'string' && claveEvento.startsWith(PREFIJO);
}
