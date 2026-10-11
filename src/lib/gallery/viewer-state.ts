/**
 * Estado del visor de fotos como funciones puras (design.md S8.2, CA-57, CA-60, CA-64). El visor no
 * da la vuelta: en los extremos el botón queda desactivado. Con una sola foto no hay contador ni
 * botones de cambio.
 */

export interface ViewerState {
  /** Posición de la foto mostrada, desde 0. */
  index: number;
  total: number;
}

/** Deslizamiento horizontal mínimo, en px, para cambiar de foto (CA-60). */
export const SWIPE_THRESHOLD = 48;

/** Una foto atrás (-1) o adelante (1). En los extremos devuelve el mismo estado. */
export function step(state: ViewerState, dir: -1 | 1): ViewerState {
  const index = Math.min(Math.max(state.index + dir, 0), Math.max(state.total - 1, 0));
  return { ...state, index };
}

export interface ViewerControls {
  /** Con una sola foto no hay botones de cambio ni contador. */
  showNav: boolean;
  prevDisabled: boolean;
  nextDisabled: boolean;
  /** "3 de 12", o `null` con una sola foto. */
  counter: string | null;
}

export function controls(state: ViewerState): ViewerControls {
  const showNav = state.total > 1;
  return {
    showNav,
    prevDisabled: state.index <= 0,
    nextDisabled: state.index >= state.total - 1,
    counter: showNav ? `${state.index + 1} de ${state.total}` : null,
  };
}

/**
 * Qué cambio pide un deslizamiento: -1 (foto anterior), 1 (siguiente) o 0 (ninguno). Cuenta solo si
 * es sobre todo horizontal y de al menos 48 px: deslizar a la izquierda avanza.
 */
export function swipeDirection(dxPx: number, dyPx: number): -1 | 0 | 1 {
  if (Math.abs(dxPx) < SWIPE_THRESHOLD || Math.abs(dxPx) <= Math.abs(dyPx)) return 0;
  return dxPx < 0 ? 1 : -1;
}
