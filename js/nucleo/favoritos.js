/**
 * favoritos.js
 * Gestión de la lista de favoritos del usuario.
 *
 * Se guarda en localStorage un arreglo con los ids de las noticias.
 * Cada cambio emite el evento "favoritos:cambio" en window, para que la
 * cabecera actualice su contador y la página de Favoritos se vuelva a
 * pintar sin que estos módulos dependan unos de otros.
 */

import { leer, guardar, borrar, CLAVES } from './almacenamiento.js';

export const EVENTO_CAMBIO = 'favoritos:cambio';

function notificarCambio() {
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO));
}

/** @returns {number[]} Ids guardados, en el orden en que se agregaron. */
export function obtenerFavoritos() {
  const ids = leer(CLAVES.FAVORITOS, []);
  return Array.isArray(ids) ? ids : [];
}

/** @returns {boolean} true si la noticia está en favoritos. */
export function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

/**
 * Agrega la noticia si no está, o la quita si ya estaba.
 * @param {number} id
 * @returns {boolean} true si quedó guardada; false si se quitó.
 */
export function alternarFavorito(id) {
  const ids = obtenerFavoritos();
  const posicion = ids.indexOf(id);
  if (posicion === -1) {
    ids.push(id);
  } else {
    ids.splice(posicion, 1);
  }
  guardar(CLAVES.FAVORITOS, ids);
  notificarCambio();
  return posicion === -1;
}

/** Vacía la lista completa. */
export function vaciarFavoritos() {
  borrar(CLAVES.FAVORITOS);
  notificarCambio();
}
