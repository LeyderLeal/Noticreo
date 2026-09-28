/**
 * estructura.js
 * Comportamiento común a todas las páginas: cabecera y pie.
 * Cada página llama a iniciarEstructura() al cargar.
 */

import { esClavePropia } from '../nucleo/almacenamiento.js';
import { EVENTO_CAMBIO, obtenerFavoritos } from '../nucleo/favoritos.js';
import { fechaActualTexto, parametroURL, pluralizar } from '../nucleo/utilidades.js';
import { activarRespaldoImagenes } from './tarjeta.js';

/**
 * Resalta en el menú la página actual.
 * El <body> de cada HTML indica su sección con data-seccion.
 */
function marcarEnlaceActivo() {
  const seccion = document.body.dataset.seccion;
  const enlace = document.querySelector(`.nav [data-nav="${seccion}"]`);
  if (enlace) {
    enlace.classList.add('is-active');
    enlace.setAttribute('aria-current', 'page');
  }
}

/** Actualiza el contador de favoritos de la cabecera. */
function actualizarContadorFavoritos() {
  const contador = document.getElementById('contador-favoritos');
  if (contador) {
    const total = obtenerFavoritos().length;
    contador.textContent = pluralizar(total, 'noticia guardada', 'noticias guardadas');
  }
}

/** Si se llegó desde el buscador, conserva el texto en la caja de búsqueda. */
function conservarBusqueda() {
  const campo = document.querySelector('.head-search input');
  const busqueda = parametroURL('q');
  if (campo && busqueda) campo.value = busqueda;
}

/** Inicializa cabecera y pie. */
export function iniciarEstructura() {
  marcarEnlaceActivo();
  conservarBusqueda();
  actualizarContadorFavoritos();
  activarRespaldoImagenes();

  const fecha = document.getElementById('fecha-actual');
  if (fecha) fecha.textContent = `Colombia · ${fechaActualTexto()}`;

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  // Mismo navegador: el evento propio. Otra pestaña: el evento "storage".
  window.addEventListener(EVENTO_CAMBIO, actualizarContadorFavoritos);
  window.addEventListener('storage', (evento) => {
    if (esClavePropia(evento.key)) actualizarContadorFavoritos();
  });
}

/**
 * Muestra un mensaje de error cuando no se pudieron cargar las noticias.
 * @param {HTMLElement} contenedor
 * @param {Error} error
 */
export function pintarErrorCarga(contenedor, error) {
  console.error(error);
  contenedor.innerHTML = `
    <div class="estado estado-error">
      <div class="estado-icono" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>
      </div>
      <h2>No se pudieron cargar las noticias</h2>
      <p>Revisa tu conexión y vuelve a intentarlo. Si abriste el proyecto con doble clic, ábrelo desde un servidor local: las instrucciones están en el README del repositorio.</p>
      <button type="button" class="btn btn-outline" data-reintentar>Reintentar</button>
    </div>`;
  contenedor.querySelector('[data-reintentar]')
    .addEventListener('click', () => window.location.reload());
}
