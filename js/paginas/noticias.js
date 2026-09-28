/**
 * noticias.js - Listado de noticias
 * Todo lo que el usuario puede cambiar (sección, búsqueda, orden y página)
 * vive en el objeto "estado". Cada cambio actualiza ese objeto y vuelve a
 * pintar el listado con pintar(), de modo que la pantalla siempre refleja
 * el estado actual.
 */

import { iniciarEstructura, pintarErrorCarga } from '../componentes/estructura.js';
import { activarBotonesFavorito, crearTarjeta } from '../componentes/tarjeta.js';
import { CATEGORIAS, obtenerNoticias } from '../nucleo/datos.js';
import { escaparHTML, normalizar, parametroURL, pluralizar } from '../nucleo/utilidades.js';

const NOTICIAS_POR_PAGINA = 6;

const estado = {
  categoria: 'todas',
  busqueda: '',
  orden: 'recientes',
  pagina: 1,
};

/** Catálogo completo; se carga una vez al abrir la página. */
let noticias = [];

const filtros = document.getElementById('filtros');
const selectorOrden = document.getElementById('orden');
const avisoBusqueda = document.getElementById('busqueda-activa');
const total = document.getElementById('total-noticias');
const rango = document.getElementById('rango-noticias');
const resultado = document.getElementById('resultado');
const paginacion = document.getElementById('paginacion');


/* ---------- Estado y URL ---------- */

function leerEstadoDesdeURL() {
  const categoria = parametroURL('categoria');
  if (categoria && CATEGORIAS[categoria]) estado.categoria = categoria;
  estado.busqueda = (parametroURL('q') ?? '').trim();
}

/** Refleja sección y búsqueda en la URL sin recargar la página. */
function actualizarURL() {
  const parametros = new URLSearchParams();
  if (estado.categoria !== 'todas') parametros.set('categoria', estado.categoria);
  if (estado.busqueda) parametros.set('q', estado.busqueda);
  const consulta = parametros.toString();
  history.replaceState(null, '', consulta ? `?${consulta}` : window.location.pathname);
}

/** Aplica sección, búsqueda y orden. Devuelve una lista nueva. */
function filtrarYOrdenar() {
  const termino = normalizar(estado.busqueda);

  const filtradas = noticias.filter((noticia) => {
    const coincideSeccion = estado.categoria === 'todas' || noticia.categoria === estado.categoria;
    const coincideBusqueda = !termino || normalizar(`${noticia.titulo} ${noticia.resumen}`).includes(termino);
    return coincideSeccion && coincideBusqueda;
  });

  if (estado.orden === 'antiguas') return filtradas.reverse();
  if (estado.orden === 'titulo') return filtradas.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  return filtradas; // "recientes": el catálogo ya viene ordenado así
}


function pintarFiltros() {
  filtros.querySelectorAll('[data-categoria]').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.categoria === estado.categoria));
  });
}

function pintarBusqueda() {
  avisoBusqueda.hidden = !estado.busqueda;
  if (estado.busqueda) {
    avisoBusqueda.innerHTML = `
      <span>Resultados para «${escaparHTML(estado.busqueda)}»</span>
      <button type="button" class="btn-link" data-quitar-busqueda>Quitar búsqueda</button>`;
  }
}

function pintarPaginacion(totalPaginas) {
  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }
  const numeros = Array.from({ length: totalPaginas }, (_, i) => i + 1)
    .map((numero) => `<button type="button" data-pagina="${numero}"
        ${numero === estado.pagina ? 'aria-current="page"' : ''}
        aria-label="Página ${numero}">${numero}</button>`)
    .join('');

  paginacion.innerHTML = `
    <button type="button" data-pagina="${estado.pagina - 1}" ${estado.pagina === 1 ? 'disabled' : ''}>Anterior</button>
    ${numeros}
    <button type="button" data-pagina="${estado.pagina + 1}" ${estado.pagina === totalPaginas ? 'disabled' : ''}>Siguiente</button>`;
}

function pintarSinResultados() {
  resultado.innerHTML = `
    <div class="estado">
      <div class="estado-icono" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      </div>
      <h2>No encontramos noticias</h2>
      <p>No hay noticias que coincidan con la sección o la búsqueda seleccionadas.</p>
      <button type="button" class="btn btn-outline" data-ver-todas>Ver todas las noticias</button>
    </div>`;
}

/** Vuelve a pintar el listado completo según el estado actual. */
function pintar() {
  const lista = filtrarYOrdenar();
  const totalPaginas = Math.max(1, Math.ceil(lista.length / NOTICIAS_POR_PAGINA));
  estado.pagina = Math.min(Math.max(1, estado.pagina), totalPaginas);

  const inicio = (estado.pagina - 1) * NOTICIAS_POR_PAGINA;
  const visibles = lista.slice(inicio, inicio + NOTICIAS_POR_PAGINA);
  const hayFiltro = estado.categoria !== 'todas' || estado.busqueda;

  pintarFiltros();
  pintarBusqueda();
  total.textContent = hayFiltro
    ? pluralizar(lista.length, 'resultado', 'resultados')
    : pluralizar(lista.length, 'noticia publicada', 'noticias publicadas');
  rango.textContent = lista.length ? `Mostrando ${inicio + 1}–${inicio + visibles.length}` : '';

  if (lista.length === 0) {
    pintarSinResultados();
    pintarPaginacion(0);
    return;
  }

  resultado.innerHTML = `<div class="grid-news">
    ${visibles.map((noticia) => crearTarjeta(noticia, { conFavorito: true })).join('')}
  </div>`;
  pintarPaginacion(totalPaginas);
}


/* ---------- Eventos ---------- */

function quitarBusqueda() {
  estado.busqueda = '';
  const campo = document.querySelector('.head-search input');
  if (campo) campo.value = '';
}

function enlazarEventos() {
  filtros.addEventListener('click', (evento) => {
    const chip = evento.target.closest('[data-categoria]');
    if (!chip) return;
    estado.categoria = chip.dataset.categoria;
    estado.pagina = 1;
    actualizarURL();
    pintar();
  });

  selectorOrden.addEventListener('change', () => {
    estado.orden = selectorOrden.value;
    estado.pagina = 1;
    pintar();
  });

  paginacion.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-pagina]');
    if (!boton || boton.disabled) return;
    estado.pagina = Number(boton.dataset.pagina);
    pintar();
    filtros.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  avisoBusqueda.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-quitar-busqueda]')) return;
    quitarBusqueda();
    actualizarURL();
    pintar();
  });

  resultado.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-ver-todas]')) return;
    estado.categoria = 'todas';
    quitarBusqueda();
    actualizarURL();
    pintar();
  });
}


async function iniciar() {
  iniciarEstructura();
  activarBotonesFavorito();
  leerEstadoDesdeURL();
  enlazarEventos();
  pintarFiltros();

  try {
    noticias = await obtenerNoticias();
    pintar();
  } catch (error) {
    total.textContent = '';
    pintarErrorCarga(resultado, error);
  }
}

iniciar();
