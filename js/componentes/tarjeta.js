/**
 * tarjeta.js
 * Piezas visuales reutilizables de una noticia: etiqueta de categoría,
 * imagen, botón de favorito y la tarjeta completa del listado.
 *
 * Todas las funciones devuelven texto HTML. Cualquier dato de la noticia
 * pasa por escaparHTML antes de insertarse.
 */

import { CATEGORIAS } from '../nucleo/datos.js';
import { alternarFavorito, esFavorito } from '../nucleo/favoritos.js';
import { escaparHTML, formatearFechaCorta, mostrarAviso } from '../nucleo/utilidades.js';

/** Figuras decorativas sobre el degradado de cada categoría. */
const DECORACION = {
  edu: '<circle cx="300" cy="48" r="34" fill="#fff" opacity=".3"/><path d="M0 140 L120 104 L250 142 L380 110 L380 180 L0 180Z" fill="#1F4E38" opacity=".3"/>',
  tec: '<rect x="40" y="36" width="110" height="108" fill="#fff" opacity=".26"/><rect x="184" y="66" width="150" height="78" fill="#16295C" opacity=".32"/>',
  tur: '<circle cx="300" cy="44" r="26" fill="#fff" opacity=".38"/><path d="M0 132 L110 96 L230 138 L380 100 L380 180 L0 180Z" fill="#7C3F10" opacity=".32"/>',
  com: '<circle cx="96" cy="70" r="44" fill="#fff" opacity=".24"/><rect x="170" y="86" width="170" height="58" rx="8" fill="#3E1F6B" opacity=".3"/>',
};

const ICONO_CORAZON =
  '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path class="icono-corazon" d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z"/></svg>';

/** Datos de la categoría; si no se reconoce, se usa Educación. */
export function datosCategoria(clave) {
  return CATEGORIAS[clave] ?? CATEGORIAS.educacion;
}

/** Etiqueta de color con el nombre de la sección. */
export function etiquetaCategoria(clave) {
  const categoria = datosCategoria(clave);
  return `<span class="tag tag-${categoria.clase}">${categoria.nombre}</span>`;
}

/** SVG decorativo de una categoría */
function svgDecorativo(clase) {
  return `<svg viewBox="0 0 380 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${DECORACION[clase]}</svg>`;
}

/**
 * Imagen de la noticia.
 * @param {Object} noticia
 * @param {string} [clasesExtra]
 */
export function imagenNoticia(noticia, clasesExtra = '') {
  const categoria = datosCategoria(noticia.categoria);
  if (noticia.imagen) {
    return `<div class="ph ${clasesExtra}" data-categoria="${categoria.clase}">
      <img src="${escaparHTML(noticia.imagen)}" alt="" loading="lazy">
    </div>`;
  }
  return `<div class="ph ph-${categoria.clase} ${clasesExtra}" aria-hidden="true">${svgDecorativo(categoria.clase)}</div>`;
}

/**
 * Si una foto externa no carga, se reemplaza por el degradado de su categoría.
 */
export function activarRespaldoImagenes() {
  document.addEventListener('error', (evento) => {
    const imagen = evento.target;
    if (!(imagen instanceof HTMLImageElement)) return;
    const contenedor = imagen.closest('.ph[data-categoria]');
    if (!contenedor) return;
    const clase = contenedor.dataset.categoria;
    contenedor.classList.add(`ph-${clase}`);
    contenedor.innerHTML = svgDecorativo(clase);
  }, true);
}

/**
 * Botón circular de favorito que va sobre la imagen de la tarjeta.
 * data-favorito guarda el id; aria-pressed refleja si está guardada.
 */
export function botonFavorito(noticia) {
  const guardada = esFavorito(noticia.id);
  const accion = guardada ? 'Quitar de favoritos' : 'Guardar en favoritos';
  return `<button type="button" class="fav-btn" data-favorito="${noticia.id}"
      data-titulo="${escaparHTML(noticia.titulo)}" aria-pressed="${guardada}"
      aria-label="${accion}: ${escaparHTML(noticia.titulo)}">${ICONO_CORAZON}</button>`;
}

/**
 * Tarjeta de noticia: imagen, etiqueta, nombre, descripción breve y botón "Ver más".
 * @param {Object} noticia
 * @param {{conFavorito?: boolean, conResumen?: boolean}} [opciones]
 */
export function crearTarjeta(noticia, { conFavorito = false, conResumen = true } = {}) {
  const enlace = `detalle.html?id=${noticia.id}`;
  return `
    <article class="card">
      <div class="card-media">
        <a href="${enlace}" tabindex="-1" aria-hidden="true">${imagenNoticia(noticia)}</a>
        ${conFavorito ? botonFavorito(noticia) : ''}
      </div>
      <div class="card-body">
        ${etiquetaCategoria(noticia.categoria)}
        <h3><a href="${enlace}">${escaparHTML(noticia.titulo)}</a></h3>
        ${conResumen ? `<p>${escaparHTML(noticia.resumen)}</p>` : ''}
        <div class="card-foot">
          <time class="meta" datetime="${noticia.fecha}">${formatearFechaCorta(noticia.fecha)}</time>
          <a href="${enlace}" class="btn btn-outline btn-sm">Ver más</a>
        </div>
      </div>
    </article>`;
}

/**
 * Pinta un botón de favorito según su estado: aria-pressed, texto
 * accesible y, si lo tiene, el texto visible (data-texto-activo/inactivo).
 */
export function pintarBotonFavorito(boton, guardada) {
  boton.setAttribute('aria-pressed', String(guardada));
  if (boton.classList.contains('fav-btn')) {
    const accion = guardada ? 'Quitar de favoritos' : 'Guardar en favoritos';
    boton.setAttribute('aria-label', `${accion}: ${boton.dataset.titulo ?? ''}`);
  }
  const texto = boton.querySelector('[data-texto-activo]');
  if (texto) {
    texto.textContent = guardada ? texto.dataset.textoActivo : texto.dataset.textoInactivo;
  }
}

/**
 * Escucha los clics en cualquier botón con data-favorito de la página
 * Todos los botones de la misma noticia se sincronizan.
 */
export function activarBotonesFavorito() {
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-favorito]');
    if (!boton) return;
    const id = Number(boton.dataset.favorito);
    const guardada = alternarFavorito(id);
    document.querySelectorAll(`[data-favorito="${id}"]`)
      .forEach((otroBoton) => pintarBotonFavorito(otroBoton, guardada));
    mostrarAviso(guardada ? 'Noticia guardada en favoritos' : 'Noticia quitada de favoritos');
  });
}
