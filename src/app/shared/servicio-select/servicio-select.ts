import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { ServicioGrupo, ServicioSeleccionado, TipoServicioItem } from '../../core/models/catalogo';

@Component({
  selector: 'app-servicio-select',
  templateUrl: './servicio-select.html',
  styleUrl: './servicio-select.css'
})
export class ServicioSelect {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly grupos = input.required<ServicioGrupo[]>();
  readonly tipoServicioId = input<number | null>(null);
  readonly seleccion = output<ServicioSeleccionado | null>();

  readonly abierto = signal(false);
  readonly filtro = signal('');
  readonly texto = signal('');
  readonly activoIndex = signal(-1);

  readonly gruposFiltrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    return this.grupos()
      .map((grupo) => ({
        ...grupo,
        tiposServicio: grupo.tiposServicio.filter(
          (tipo) =>
            !q ||
            grupo.nombre.toLowerCase().includes(q) ||
            tipo.nombre.toLowerCase().includes(q)
        )
      }))
      .filter((grupo) => grupo.tiposServicio.length > 0);
  });

  readonly opcionesPlanas = computed(() =>
    this.gruposFiltrados().flatMap((grupo) =>
      grupo.tiposServicio.map((tipo) => this.aSeleccion(grupo, tipo))
    )
  );

  constructor() {
    effect(() => {
      const id = this.tipoServicioId();
      const grupos = this.grupos();
      untracked(() => {
        if (!this.abierto()) {
          this.texto.set(this.etiquetaDe(id, grupos));
        }
      });
    });
  }

  abrir(): void {
    this.abierto.set(true);
    this.filtro.set('');
    this.activoIndex.set(this.indiceSeleccionado());
  }

  onInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.texto.set(valor);
    this.filtro.set(valor);
    this.abierto.set(true);
    this.activoIndex.set(this.opcionesPlanas().length > 0 ? 0 : -1);
  }

  onKeydown(event: KeyboardEvent): void {
    const opciones = this.opcionesPlanas();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.abierto.set(true);
      this.activoIndex.set(Math.min(this.activoIndex() + 1, opciones.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activoIndex.set(Math.max(this.activoIndex() - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      const actual = opciones[this.activoIndex()];
      if (actual) {
        event.preventDefault();
        this.elegir(actual);
      }
      return;
    }
    if (event.key === 'Escape') {
      this.cerrarYRestaurar();
    }
  }

  elegir(opcion: ServicioSeleccionado): void {
    this.seleccion.emit(opcion);
    this.texto.set(this.etiqueta(opcion));
    this.filtro.set('');
    this.abierto.set(false);
  }

  esActiva(tipoServicioId: number): boolean {
    const activa = this.opcionesPlanas()[this.activoIndex()];
    return activa?.tipoServicioId === tipoServicioId;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumento(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.cerrarYRestaurar();
    }
  }

  private cerrarYRestaurar(): void {
    if (!this.abierto()) {
      return;
    }
    this.abierto.set(false);
    this.filtro.set('');
    const texto = this.texto().trim();
    if (!texto) {
      this.seleccion.emit(null);
      this.texto.set('');
      return;
    }
    this.texto.set(this.etiquetaDe(this.tipoServicioId(), this.grupos()));
  }

  private indiceSeleccionado(): number {
    const id = this.tipoServicioId();
    if (!id) {
      return this.opcionesPlanas().length > 0 ? 0 : -1;
    }
    const idx = this.opcionesPlanas().findIndex((opcion) => opcion.tipoServicioId === id);
    return idx >= 0 ? idx : 0;
  }

  private etiquetaDe(tipoServicioId: number | null, grupos: ServicioGrupo[]): string {
    if (!tipoServicioId) {
      return '';
    }
    for (const grupo of grupos) {
      const tipo = grupo.tiposServicio.find((item) => item.id === tipoServicioId);
      if (tipo) {
        return this.etiqueta(this.aSeleccion(grupo, tipo));
      }
    }
    return '';
  }

  private etiqueta(opcion: ServicioSeleccionado): string {
    return `${opcion.tipoServicioNombre} · ${opcion.especialidadNombre}`;
  }

  private aSeleccion(grupo: ServicioGrupo, tipo: TipoServicioItem): ServicioSeleccionado {
    return {
      tipoTecnicoId: grupo.id,
      tipoServicioId: tipo.id,
      especialidadNombre: grupo.nombre,
      tipoServicioNombre: tipo.nombre
    };
  }
}
