import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'exito' | 'error';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 1;
  readonly lista = signal<Toast[]>([]);

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje);
  }

  quitar(id: number): void {
    this.lista.update((lista) => lista.filter((item) => item.id !== id));
  }

  private mostrar(tipo: ToastTipo, mensaje: string): void {
    const id = this.siguienteId++;
    this.lista.update((lista) => [...lista, { id, tipo, mensaje }]);
    window.setTimeout(() => this.quitar(id), 4000);
  }
}
