/**
 * validacion.js
 * Validación de formularios reutilizable (Contacto y Publicar).
/** Correo con usuario, @, dominio y extensión de al menos 2 letras. */
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esUrlValida(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Cada una recibe el mensaje de error a mostrar. */
export const reglas = {
  requerido: (mensaje) => (valor) => (valor.trim() ? null : mensaje),
  minimo: (cantidad, mensaje) => (valor) => (valor.trim().length >= cantidad ? null : mensaje),
  maximo: (cantidad, mensaje) => (valor) => (valor.trim().length <= cantidad ? null : mensaje),
  correo: (mensaje) => (valor) => (PATRON_CORREO.test(valor.trim()) ? null : mensaje),
  urlOpcional: (mensaje) => (valor) => (!valor.trim() || esUrlValida(valor.trim()) ? null : mensaje),
};

/** Valor de un campo; una casilla marcada cuenta como texto no vacío. */
function valorDe(campo) {
  if (campo.type === 'checkbox') return campo.checked ? 'marcado' : '';
  return campo.value;
}

/**
 * Pinta el estado de un campo.
 * @param {HTMLElement} campo
 * @param {string|null} error - Mensaje o null.
 * @param {boolean} neutro - true para quitar tanto el error como el verde.
 */
function pintarEstado(campo, error, neutro = false) {
  const contenedor = campo.closest('.field, .check');
  const pista = contenedor.querySelector('[data-pista]');
  const conValor = campo.type !== 'checkbox' && campo.value.trim() !== '';

  contenedor.classList.toggle('is-error', Boolean(error));
  contenedor.classList.toggle('is-valid', !error && !neutro && conValor);
  campo.setAttribute('aria-invalid', String(Boolean(error)));
  if (pista) pista.textContent = error ?? pista.dataset.pista;
}

/**
 * Conecta la validación a un formulario.
 * - Valida cada campo al salir de él.
 * - Si un campo ya muestra error, lo revalida mientras se escribe,
 *   para que el error desaparezca apenas se corrige.
 * @param {HTMLFormElement} formulario
 * @param {Object<string, Function[]>} esquema - { nombreCampo: [reglas] }
 * @returns {{validarTodo: Function, limpiar: Function}}
 */
export function crearValidador(formulario, esquema) {
  const nombres = Object.keys(esquema);

  function validarCampo(nombre) {
    const campo = formulario.elements[nombre];
    const error = esquema[nombre]
      .map((regla) => regla(valorDe(campo)))
      .find(Boolean) ?? null;
    pintarEstado(campo, error);
    return error === null;
  }

  /** Valida todo y lleva el foco al primer campo con error. */
  function validarTodo() {
    const resultados = nombres.map(validarCampo);
    const primeroInvalido = nombres.find((_, i) => !resultados[i]);
    if (primeroInvalido) formulario.elements[primeroInvalido].focus();
    return primeroInvalido === undefined;
  }

  /** Quita todos los estados (se usa al limpiar o tras enviar). */
  function limpiar() {
    nombres.forEach((nombre) => pintarEstado(formulario.elements[nombre], null, true));
  }

  nombres.forEach((nombre) => {
    const campo = formulario.elements[nombre];
    const esCasilla = campo.type === 'checkbox';

    if (!esCasilla) campo.addEventListener('blur', () => validarCampo(nombre));

    campo.addEventListener(esCasilla ? 'change' : 'input', () => {
      if (campo.closest('.field, .check').classList.contains('is-error')) validarCampo(nombre);
    });
  });

  return { validarTodo, limpiar };
}

/**
 * Contador de caracteres "N / máximo" bajo un campo de texto.
 * @param {HTMLInputElement|HTMLTextAreaElement} campo
 * @param {HTMLElement} salida
 * @returns {Function} Función para refrescar el contador manualmente.
 */
export function activarContador(campo, salida) {
  const maximo = campo.maxLength;
  const refrescar = () => { salida.textContent = `${campo.value.length} / ${maximo}`; };
  campo.addEventListener('input', refrescar);
  refrescar();
  return refrescar;
}
