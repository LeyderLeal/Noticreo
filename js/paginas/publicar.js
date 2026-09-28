/**
 * publicar.js - Formulario de publicación
 * En esta versión el formulario valida los datos de una noticia y, si son
 * correctos, genera la vista previa de su tarjeta con el mismo componente
 * que usa el listado. Guardar la noticia en el catálogo y eliminar
 * noticias existentes corresponde a la siguiente entrega.
 */

import { iniciarEstructura } from '../componentes/estructura.js';
import { crearTarjeta } from '../componentes/tarjeta.js';
import { activarContador, crearValidador, reglas } from '../componentes/validacion.js';
import { hoyISO, mostrarAviso } from '../nucleo/utilidades.js';

const formulario = document.getElementById('form-publicar');
const vistaPrevia = document.getElementById('vista-previa');

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

function iniciar() {
  iniciarEstructura();

  const validador = crearValidador(formulario, esquema);
  const refrescarContador = activarContador(
    formulario.elements.resumen,
    document.getElementById('contador-resumen'),
  );
  const contenidoInicial = vistaPrevia.innerHTML;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!validador.validarTodo()) return;

    const datos = Object.fromEntries(new FormData(formulario));
    const noticia = {
      id: 0,
      titulo: datos.titulo.trim(),
      categoria: datos.categoria,
      resumen: datos.resumen.trim(),
      autor: datos.autor.trim(),
      fecha: hoyISO(),
      imagen: datos.imagen.trim(),
    };

    vistaPrevia.innerHTML = crearTarjeta(noticia);
    mostrarAviso('Vista previa generada');
  });

  formulario.addEventListener('reset', () => {
    validador.limpiar();
    vistaPrevia.innerHTML = contenidoInicial;
    setTimeout(refrescarContador);
  });
}

iniciar();
