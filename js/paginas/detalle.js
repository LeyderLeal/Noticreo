/**
 * detalle.js - Detalle de la noticia
 * Lee el id desde la URL, busca la noticia en el catálogo y pinta:
 *   - la información completa y la imagen representativa,
 *   - los botones de interacción (favoritos, compartir y contacto),
 *   - la banda "Sigue leyendo" con tres noticias relacionadas.
 */

import { iniciarEstructura, pintarErrorCarga } from '../componentes/estructura.js';
import {
  activarBotonesFavorito, crearTarjeta, datosCategoria, etiquetaCategoria, imagenNoticia,
} from '../componentes/tarjeta.js';
import { obtenerNoticias } from '../nucleo/datos.js';
import { esFavorito } from '../nucleo/favoritos.js';
import { escaparHTML, formatearFechaLarga, mostrarAviso, parametroURL } from '../nucleo/utilidades.js';

const articulo = document.getElementById('articulo');
const seccionRelacionadas = document.getElementById('sigue-leyendo');
const relacionadas = document.getElementById('relacionadas');
const enlaceSeccion = document.getElementById('enlace-seccion');

const ICONO_CORAZON =
  '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path class="icono-corazon" d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z"/></svg>';


/** Iniciales del autor para el círculo de la línea de autoría. */
function iniciales(nombre) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((parte) => parte[0].toUpperCase()).join('');
}

/**
 * Convierte los bloques del JSON en HTML.
 * Tipos: "p" (párrafo), "h2" (subtítulo) y "cita" (cita destacada).
 */
function plantillaContenido(bloques) {
  return bloques.map((bloque) => {
    if (bloque.tipo === 'h2') return `<h2>${escaparHTML(bloque.texto)}</h2>`;
    if (bloque.tipo === 'cita') {
      return `<blockquote class="pullquote">
        <p>${escaparHTML(bloque.texto)}</p>
        ${bloque.autor ? `<cite>${escaparHTML(bloque.autor)}</cite>` : ''}
      </blockquote>`;
    }
    return `<p>${escaparHTML(bloque.texto)}</p>`;
  }).join('');
}

/**
 * Botón de favorito con texto visible. Comparte data-favorito con los
 * demás botones de la misma noticia, así todos cambian juntos.
 */
function botonFavoritoConTexto(noticia, clases, textoActivo, textoInactivo) {
  const guardada = esFavorito(noticia.id);
  return `<button type="button" class="btn ${clases}" data-favorito="${noticia.id}" aria-pressed="${guardada}">
    ${ICONO_CORAZON}
    <span data-texto-activo="${textoActivo}" data-texto-inactivo="${textoInactivo}">${guardada ? textoActivo : textoInactivo}</span>
  </button>`;
}

function plantillaArticulo(noticia) {
  const categoria = datosCategoria(noticia.categoria);
  return `
    <nav class="crumb" aria-label="Ruta de navegación">
      <a href="index.html">Inicio</a> / <a href="noticias.html">Noticias</a> /
      <a href="noticias.html?categoria=${noticia.categoria}">${categoria.nombre}</a>
    </nav>
    <div class="article-grid">
      <article>
        ${etiquetaCategoria(noticia.categoria)}
        <h1>${escaparHTML(noticia.titulo)}</h1>
        <p class="standfirst">${escaparHTML(noticia.resumen)}</p>

        <div class="byline">
          <div class="avatar" aria-hidden="true">${escaparHTML(iniciales(noticia.autor))}</div>
          <div>
            <div class="who">${escaparHTML(noticia.autor)}</div>
            <div class="when">
              <time datetime="${noticia.fecha}">${formatearFechaLarga(noticia.fecha)}</time> · ${noticia.lectura} min de lectura
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn btn-outline btn-sm" data-compartir>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 3v13M8 7l4-4 4 4"/></svg>
              Compartir
            </button>
            ${botonFavoritoConTexto(noticia, 'btn-outline btn-sm', 'Guardada', 'Leer después')}
          </div>
        </div>

        ${imagenNoticia(noticia, 'article-hero')}
        ${noticia.pie ? `<p class="caption">${escaparHTML(noticia.pie)}</p>` : '<div class="caption"></div>'}

        <div class="prose">${plantillaContenido(noticia.contenido)}</div>
      </article>

      <aside class="aside">
        <div class="panel panel-fav">
          <h2>Guarda esta noticia</h2>
          <p>Se añade a tu lista de favoritos en este navegador. No necesitas crear una cuenta.</p>
          ${botonFavoritoConTexto(noticia, 'btn-primary', 'Quitar de favoritos', 'Agregar a favoritos')}
        </div>
        <div class="panel">
          <h2>¿Tienes información sobre este tema?</h2>
          <p>Escríbenos y el equipo editorial revisará tu aporte.</p>
          <a href="contacto.html" class="btn btn-outline">Ir a contacto</a>
        </div>
      </aside>
    </div>`;
}

/**
 * Elige tres noticias para "Sigue leyendo":
 * primero las indicadas en el JSON (campo "relacionadas"), luego las de la
 * misma sección y, si aún faltan, las más recientes.
 */
function elegirRelacionadas(noticia, catalogo) {
  const otras = catalogo.filter((candidata) => candidata.id !== noticia.id);
  const elegidas = [];
  const agregar = (candidata) => {
    if (candidata && elegidas.length < 3 && !elegidas.includes(candidata)) elegidas.push(candidata);
  };

  (noticia.relacionadas ?? []).forEach((id) => agregar(otras.find((c) => c.id === id)));
  otras.filter((c) => c.categoria === noticia.categoria).forEach(agregar);
  otras.forEach(agregar);
  return elegidas;
}

function pintarRelacionadas(noticia, catalogo) {
  const lista = elegirRelacionadas(noticia, catalogo);
  if (lista.length === 0) return;
  const categoria = datosCategoria(noticia.categoria);
  enlaceSeccion.href = `noticias.html?categoria=${noticia.categoria}`;
  enlaceSeccion.textContent = `Ver la sección de ${categoria.nombre}`;
  relacionadas.innerHTML = lista.map((n) => crearTarjeta(n, { conResumen: false })).join('');
  seccionRelacionadas.hidden = false;
}

function pintarNoEncontrada() {
  document.title = 'Noticia no encontrada | NotiCreo';
  articulo.innerHTML = `
    <div class="estado">
      <h1 class="visualmente-oculto">Noticia no encontrada</h1>
      <h2>No encontramos esta noticia</h2>
      <p>Es posible que el enlace esté incompleto o que la noticia ya no esté disponible.</p>
      <a href="noticias.html" class="btn btn-primary">Ver todas las noticias</a>
    </div>`;
}

/** Copia el enlace de la noticia. El portapapeles solo funciona en https o localhost. */
async function compartir() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    mostrarAviso('Enlace copiado al portapapeles');
  } catch {
    mostrarAviso('No se pudo copiar. Copia el enlace desde la barra de direcciones.');
  }
}


async function iniciar() {
  iniciarEstructura();
  activarBotonesFavorito();

  const id = Number(parametroURL('id'));

  try {
    const catalogo = await obtenerNoticias();
    const noticia = catalogo.find((candidata) => candidata.id === id);

    if (!noticia) {
      pintarNoEncontrada();
      return;
    }

    document.title = `${noticia.titulo} | NotiCreo`;
    articulo.innerHTML = plantillaArticulo(noticia);
    articulo.querySelector('[data-compartir]').addEventListener('click', compartir);
    pintarRelacionadas(noticia, catalogo);
  } catch (error) {
    pintarErrorCarga(articulo, error);
  }
}

iniciar();
