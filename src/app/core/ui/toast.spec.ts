import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast';

describe('ToastService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra un éxito y lo quita a los 4s', () => {
    const toasts = TestBed.inject(ToastService);
    toasts.exito('Solicitud creada.');
    expect(toasts.lista()).toEqual([
      expect.objectContaining({ tipo: 'exito', mensaje: 'Solicitud creada.' })
    ]);
    vi.advanceTimersByTime(4000);
    expect(toasts.lista()).toEqual([]);
  });

  it('puede quitar un error a mano', () => {
    const toasts = TestBed.inject(ToastService);
    toasts.error('Falló');
    const id = toasts.lista()[0].id;
    toasts.quitar(id);
    expect(toasts.lista()).toEqual([]);
  });
});
