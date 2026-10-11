import { describe, expect, it } from 'vitest';
import {
  SWIPE_THRESHOLD,
  controls,
  step,
  swipeDirection,
} from '../../src/lib/gallery/viewer-state';

describe('step (CA-57)', () => {
  it('avanza y retrocede una foto', () => {
    expect(step({ index: 2, total: 5 }, 1)).toEqual({ index: 3, total: 5 });
    expect(step({ index: 2, total: 5 }, -1)).toEqual({ index: 1, total: 5 });
  });

  it('no da la vuelta en los extremos', () => {
    expect(step({ index: 0, total: 5 }, -1).index).toBe(0);
    expect(step({ index: 4, total: 5 }, 1).index).toBe(4);
  });

  it('con una sola foto no se mueve', () => {
    expect(step({ index: 0, total: 1 }, 1).index).toBe(0);
    expect(step({ index: 0, total: 1 }, -1).index).toBe(0);
  });
});

describe('controls (CA-57, CA-64)', () => {
  it('en la primera foto "Anterior" está desactivado', () => {
    expect(controls({ index: 0, total: 12 })).toEqual({
      showNav: true,
      prevDisabled: true,
      nextDisabled: false,
      counter: '1 de 12',
    });
  });

  it('en la última foto "Siguiente" está desactivado', () => {
    expect(controls({ index: 11, total: 12 })).toMatchObject({
      prevDisabled: false,
      nextDisabled: true,
      counter: '12 de 12',
    });
  });

  it('en el medio, el contador dice "3 de 12"', () => {
    expect(controls({ index: 2, total: 12 })).toMatchObject({
      prevDisabled: false,
      nextDisabled: false,
      counter: '3 de 12',
    });
  });

  it('una sola foto: sin contador ni botones de cambio', () => {
    expect(controls({ index: 0, total: 1 })).toEqual({
      showNav: false,
      prevDisabled: true,
      nextDisabled: true,
      counter: null,
    });
  });
});

describe('swipeDirection (CA-60)', () => {
  it('el umbral es de 48 px', () => {
    expect(SWIPE_THRESHOLD).toBe(48);
    expect(swipeDirection(-48, 0)).toBe(1);
    expect(swipeDirection(48, 0)).toBe(-1);
    expect(swipeDirection(-47, 0)).toBe(0);
    expect(swipeDirection(47, 0)).toBe(0);
  });

  it('deslizar a la izquierda avanza y a la derecha retrocede', () => {
    expect(swipeDirection(-120, 10)).toBe(1);
    expect(swipeDirection(120, -10)).toBe(-1);
  });

  it('un gesto sobre todo vertical no cuenta', () => {
    expect(swipeDirection(60, 80)).toBe(0);
    expect(swipeDirection(-60, -60)).toBe(0);
  });
});
