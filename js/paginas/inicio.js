/**
 * inicio.js - Página de inicio (index.html)
 *
 * Pinta con los datos del JSON:
 *   - la noticia principal (la más reciente),
 *   - la columna de tres noticias secundarias,
 *   - la sección de noticias destacadas (las tres siguientes).
 * Las secciones informativa y de llamado a la acción son estáticas en el HTML.
 */

import { iniciarEstructura, pintarErrorCarga } from '../componentes/estructura.js';
import { crearTarjeta, etiquetaCategoria, imagenNoticia } from '../componentes/tarjeta.js';
import { obtenerNoticias } from '../nucleo/datos.js';
import { escaparHTML, formatearFechaCorta, formatearFechaLarga } from '../nucleo/utilidades.js';

const portada = document.getElementById('portada');
const destacadas = document.getElementById('destacadas');
const seccionDestacadas = document.getElementById('seccion-destacadas');
const actualizado = document.getElementById('hero-actualizado');

/** Noticia principal con imagen grande. */
function plantillaPrincipal(noticia) {
  const enlace = `detalle.html?id=${noticia.id}`;
  return `
    <article class="lead">
      <a href="${enlace}" tabindex="-1" aria-hidden="true">${imagenNoticia(noticia)}</a>
      ${etiquetaCategoria(noticia.categoria)}
      <h1><a href="${enlace}">${escaparHTML(noticia.titulo)}</a></h1>
      <p>${escaparHTML(noticia.resumen)}</p>
      <div class="meta">
        <strong>${escaparHTML(noticia.autor)}</strong>
        <span>${formatearFechaLarga(noticia.fecha)}</span>
        <span>${noticia.lectura} min de lectura</span>
      </div>
    </article>`;
}

/** Noticia secundaria de la columna derecha. */
function plantillaSecundaria(noticia) {
  const enlace = `detalle.html?id=${noticia.id}`;
  return `
    <article class="side-item">
      <div>
        ${etiquetaCategoria(noticia.categoria)}
        <h3><a href="${enlace}">${escaparHTML(noticia.titulo)}</a></h3>
        <div class="meta"><time datetime="${noticia.fecha}">${formatearFechaCorta(noticia.fecha)}</time></div>
      </div>
      <a href="${enlace}" class="side-media" tabindex="-1" aria-hidden="true">${imagenNoticia(noticia)}</a>
    </article>`;
}

function pintarSinNoticias() {
  portada.innerHTML = `
    <div class="estado">
      <h2>Aún no hay noticias publicadas</h2>
      <p>Todas las noticias fueron eliminadas. Puedes crear una nueva o restablecer las de ejemplo desde la página Publicar.</p>
      <a href="publicar.html" class="btn btn-primary">Ir a Publicar</a>
    </div>`;
  seccionDestacadas.hidden = true;
}

async function iniciar() {
  iniciarEstructura();

  try {
    const noticias = await obtenerNoticias();
    portada.removeAttribute('aria-busy');

    if (noticias.length === 0) {
      pintarSinNoticias();
      return;
    }

    const [principal, ...resto] = noticias;
    const secundarias = resto.slice(0, 3);
    const siguientes = resto.slice(3, 6);

    actualizado.textContent = `Actualizado el ${formatearFechaLarga(principal.fecha)}`;
    portada.innerHTML = `
      ${plantillaPrincipal(principal)}
      <div class="side-list">${secundarias.map(plantillaSecundaria).join('')}</div>`;

    // Si hay pocas noticias, la sección de destacadas se oculta en vez de quedar vacía.
    seccionDestacadas.hidden = siguientes.length === 0;
    destacadas.innerHTML = siguientes.map((noticia) => crearTarjeta(noticia)).join('');
  } catch (error) {
    portada.removeAttribute('aria-busy');
    seccionDestacadas.hidden = true;
    pintarErrorCarga(portada, error);
  }
}

iniciar();
