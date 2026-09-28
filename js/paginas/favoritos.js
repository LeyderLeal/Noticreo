/**
 * favoritos.js - Lista personalizada
 * Muestra las noticias guardadas en localStorage, de la más recién guardada
 * a la más antigua. Se vuelve a pintar cada vez que cambia la lista:
 * al quitar una noticia con su botón, al vaciar la lista o si se modifica
 * desde otra pestaña.
 */

import { iniciarEstructura, pintarErrorCarga } from '../componentes/estructura.js';
import { activarBotonesFavorito, crearTarjeta } from '../componentes/tarjeta.js';
import { esClavePropia } from '../nucleo/almacenamiento.js';
import { obtenerNoticias } from '../nucleo/datos.js';
import { EVENTO_CAMBIO, obtenerFavoritos, vaciarFavoritos } from '../nucleo/favoritos.js';
import { mostrarAviso, pluralizar } from '../nucleo/utilidades.js';

const lista = document.getElementById('lista-favoritos');
const total = document.getElementById('total-favoritos');
const botonVaciar = document.getElementById('vaciar-favoritos');

function pintarVacio() {
  lista.innerHTML = `
    <div class="estado">
      <div class="estado-icono" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z"/></svg>
      </div>
      <h2>Aún no tienes noticias guardadas</h2>
      <p>Toca el corazón de cualquier noticia para guardarla aquí y leerla cuando quieras.</p>
      <a href="noticias.html" class="btn btn-primary">Explorar noticias</a>
    </div>`;
}

async function pintar() {
  try {
    const catalogo = await obtenerNoticias();
    const porId = new Map(catalogo.map((noticia) => [noticia.id, noticia]));

    // Se invierte para mostrar primero la última que se guardó.
    const guardadas = [...obtenerFavoritos()].reverse()
      .map((id) => porId.get(id))
      .filter(Boolean);

    total.textContent = pluralizar(guardadas.length, 'noticia guardada', 'noticias guardadas');
    botonVaciar.hidden = guardadas.length === 0;

    if (guardadas.length === 0) {
      pintarVacio();
      return;
    }
    lista.innerHTML = `<div class="grid-news">
      ${guardadas.map((noticia) => crearTarjeta(noticia, { conFavorito: true })).join('')}
    </div>`;
  } catch (error) {
    botonVaciar.hidden = true;
    pintarErrorCarga(lista, error);
  }
}

function iniciar() {
  iniciarEstructura();
  activarBotonesFavorito();

  botonVaciar.addEventListener('click', () => {
    if (!window.confirm('¿Quitar todas las noticias de tu lista de favoritos?')) return;
    vaciarFavoritos();
    mostrarAviso('Lista de favoritos vaciada');
  });

  window.addEventListener(EVENTO_CAMBIO, pintar);
  window.addEventListener('storage', (evento) => {
    if (esClavePropia(evento.key)) pintar();
  });

  pintar();
}

iniciar();
