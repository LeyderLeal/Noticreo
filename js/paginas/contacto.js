/**
 * contacto.js - Formulario de contacto
 * Validaciones: campos obligatorios, formato de correo, longitud mínima
 * del mensaje y autorización de datos. Al superar todas, se limpia el
 * formulario y aparece el mensaje de confirmación. No hay servidor, así
 * que el envío se resuelve en el navegador.
 */

import { iniciarEstructura } from '../componentes/estructura.js';
import { activarContador, crearValidador, reglas } from '../componentes/validacion.js';

const formulario = document.getElementById('form-contacto');
const alerta = document.getElementById('alerta-contacto');
const textoAlerta = document.getElementById('texto-alerta');

/** Reglas de cada campo, en el orden en que se revisan. */
const esquema = {
  nombre: [
    reglas.requerido('Escribe tu nombre.'),
    reglas.minimo(3, 'El nombre debe tener al menos 3 caracteres.'),
  ],
  correo: [
    reglas.requerido('Escribe tu correo electrónico.'),
    reglas.correo('Escribe un correo válido, por ejemplo nombre@dominio.com'),
  ],
  asunto: [
    reglas.requerido('Escribe el asunto del mensaje.'),
    reglas.minimo(5, 'El asunto debe tener al menos 5 caracteres.'),
  ],
  mensaje: [
    reglas.requerido('Escribe tu mensaje.'),
    reglas.minimo(20, 'El mensaje debe tener al menos 20 caracteres.'),
  ],
  autorizacion: [
    reglas.requerido('Debes autorizar el tratamiento de datos para enviar el mensaje.'),
  ],
};

function iniciar() {
  iniciarEstructura();

  const validador = crearValidador(formulario, esquema);
  const refrescarContador = activarContador(
    formulario.elements.mensaje,
    document.getElementById('contador-mensaje'),
  );

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    alerta.hidden = true;
    if (!validador.validarTodo()) return;

    const primerNombre = formulario.elements.nombre.value.trim().split(/\s+/)[0];

    // reset() dispara el evento "reset", que limpia estados y contador.
    formulario.reset();

    textoAlerta.textContent = `Gracias por escribirnos, ${primerNombre}. Recibimos tu mensaje y te `
      + 'responderemos al correo registrado en un máximo de dos días hábiles.';
    alerta.hidden = false;
    alerta.focus();
  });

  formulario.addEventListener('reset', () => {
    alerta.hidden = true;
    validador.limpiar();
    // El navegador vacía los campos justo después de este evento.
    setTimeout(refrescarContador);
  });
}

iniciar();
