/**
 * publicar.js - Gestión básica de noticias (publicar.html)
 *
 * Crear: el formulario valida los datos y, si son correctos, guarda la
 * noticia con crearNoticia(); desde ese momento aparece en todas las páginas.
 * Eliminar: la tabla de administración lista el catálogo completo y cada
 * fila tiene un botón para eliminar la noticia, previa confirmación.
 */

import { iniciarEstructura, pintarErrorCarga } from '../componentes/estructura.js';
import { crearTarjeta, etiquetaCategoria } from '../componentes/tarjeta.js';
import { activarContador, crearValidador, reglas } from '../componentes/validacion.js';
import {
  crearNoticia, eliminarNoticia, hayCambiosEnCatalogo, obtenerNoticias, restablecerNoticias,
} from '../nucleo/datos.js';
import { escaparHTML, formatearFechaCorta, mostrarAviso, pluralizar } from '../nucleo/utilidades.js';

const formulario = document.getElementById('form-publicar');
const alerta = document.getElementById('alerta-publicar');
const textoAlerta = document.getElementById('texto-alerta-publicar');
const ultimaPublicada = document.getElementById('ultima-publicada');
const contenedorTabla = document.getElementById('tabla-admin');
const filasAdmin = document.getElementById('filas-admin');
const totalAdmin = document.getElementById('total-admin');
const botonRestablecer = document.getElementById('restablecer');

const esquema = {
  titulo: [
    reglas.requerido('Escribe el título de la noticia.'),
    reglas.minimo(10, 'El título debe tener al menos 10 caracteres.'),
    reglas.maximo(120, 'El título no puede superar los 120 caracteres.'),
  ],
  categoria: [
    reglas.requerido('Selecciona la sección de la noticia.'),
  ],
  autor: [
    reglas.requerido('Escribe el nombre del autor.'),
    reglas.minimo(3, 'El nombre del autor debe tener al menos 3 caracteres.'),
  ],
  resumen: [
    reglas.requerido('Escribe la descripción breve.'),
    reglas.minimo(20, 'La descripción breve debe tener al menos 20 caracteres.'),
    reglas.maximo(200, 'La descripción breve no puede superar los 200 caracteres.'),
  ],
  contenido: [
    reglas.requerido('Escribe el contenido de la noticia.'),
    reglas.minimo(50, 'El contenido debe tener al menos 50 caracteres.'),
  ],
  imagen: [
    reglas.urlOpcional('Escribe una dirección válida que empiece por http:// o https://'),
  ],
};

/** Id de la noticia que se muestra en el panel "Última noticia publicada". */
let idUltimaPublicada = null;
const contenidoInicialPanel = ultimaPublicada.innerHTML;

/** Fila de la tabla de administración. */
function plantillaFila(noticia) {
  const enlace = `detalle.html?id=${noticia.id}`;
  const origen = noticia.creadaPorUsuario
    ? '<span class="origen origen-propia">Creada por ti</span>'
    : '<span class="origen">Ejemplo</span>';
  return `
    <tr>
      <td class="celda-titulo"><a href="${enlace}">${escaparHTML(noticia.titulo)}</a></td>
      <td>${etiquetaCategoria(noticia.categoria)}</td>
      <td><time datetime="${noticia.fecha}">${formatearFechaCorta(noticia.fecha)}</time></td>
      <td>${origen}</td>
      <td class="celda-accion">
        <button type="button" class="btn btn-peligro btn-sm" data-eliminar="${noticia.id}"
          aria-label="Eliminar: ${escaparHTML(noticia.titulo)}">Eliminar</button>
      </td>
    </tr>`;
}

/** Vuelve a pintar la tabla con el catálogo actual. */
async function pintarTabla() {
  try {
    const noticias = await obtenerNoticias();
    totalAdmin.textContent = pluralizar(noticias.length, 'noticia en el catálogo', 'noticias en el catálogo');
    botonRestablecer.hidden = !hayCambiosEnCatalogo();
    filasAdmin.innerHTML = noticias.length
      ? noticias.map(plantillaFila).join('')
      : `<tr><td colspan="5" class="celda-vacia">No hay noticias en el catálogo.
           Publica una nueva o restablece las de ejemplo.</td></tr>`;
  } catch (error) {
    botonRestablecer.hidden = true;
    pintarErrorCarga(contenedorTabla, error);
  }
}

/** Vuelve a dejar el panel lateral con su texto inicial. */
function limpiarPanel() {
  ultimaPublicada.innerHTML = contenidoInicialPanel;
  idUltimaPublicada = null;
}

function iniciar() {
  iniciarEstructura();

  const validador = crearValidador(formulario, esquema);
  const refrescarContador = activarContador(
    formulario.elements.resumen,
    document.getElementById('contador-resumen'),
  );

  // Crear: guarda la noticia y la muestra en el panel y en la tabla.
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    alerta.hidden = true;
    if (!validador.validarTodo()) return;

    let noticia;
    try {
      noticia = crearNoticia(Object.fromEntries(new FormData(formulario)));
    } catch {
      mostrarAviso('No se pudo guardar la noticia en este navegador.');
      return;
    }

    // reset() dispara el evento "reset", que limpia estados y contador.
    formulario.reset();

    textoAlerta.innerHTML = `«${escaparHTML(noticia.titulo)}» ya aparece en el inicio y en el listado.
      <a href="detalle.html?id=${noticia.id}">Ver noticia</a>`;
    alerta.hidden = false;
    alerta.focus();

    ultimaPublicada.innerHTML = crearTarjeta(noticia);
    idUltimaPublicada = noticia.id;
    mostrarAviso('Noticia publicada');
    await pintarTabla();
  });

  formulario.addEventListener('reset', () => {
    alerta.hidden = true;
    validador.limpiar();
    // El navegador vacía los campos justo después de este evento.
    setTimeout(refrescarContador);
  });

  // Eliminar: un solo listener para todos los botones de la tabla.
  filasAdmin.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('[data-eliminar]');
    if (!boton) return;
    const id = Number(boton.dataset.eliminar);
    const titulo = boton.closest('tr').querySelector('.celda-titulo').textContent;
    if (!window.confirm(`¿Eliminar la noticia «${titulo}»?`)) return;

    eliminarNoticia(id);
    if (id === idUltimaPublicada) {
      limpiarPanel();
      alerta.hidden = true;
    }
    mostrarAviso('Noticia eliminada');
    await pintarTabla();
  });

  botonRestablecer.addEventListener('click', async () => {
    const mensaje = '¿Restablecer las noticias de ejemplo? '
      + 'Se borrarán las noticias que creaste y volverán las que eliminaste.';
    if (!window.confirm(mensaje)) return;

    restablecerNoticias();
    limpiarPanel();
    alerta.hidden = true;
    mostrarAviso('Noticias de ejemplo restablecidas');
    await pintarTabla();
  });

  pintarTabla();
}

iniciar();
