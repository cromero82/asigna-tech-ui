import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, forkJoin } from 'rxjs';
import { mensajeHttp } from '../../../core/http/mensaje-http';
import { CatalogoItem, EstadoPrioridadResultado } from '../../../core/models/catalogo';
import { Solicitud } from '../../../core/models/solicitud';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { ToastService } from '../../../core/ui/toast';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ModalShell } from '../../../shared/modal-shell/modal-shell';
import { SolicitudForm } from '../solicitud-form/solicitud-form';

@Component({
  selector: 'app-solicitud-list',
  imports: [RouterLink, RouterOutlet, ConfirmDialog, ModalShell, SolicitudForm],
  templateUrl: './solicitud-list.html',
  styleUrl: './solicitud-list.css'
})
export class SolicitudList implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly solicitudes = signal<Solicitud[]>([]);
  readonly error = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly estadoFiltro = signal<number | null>(null);
  readonly especialidadFiltro = signal<number | null>(null);
  readonly estados = signal<EstadoPrioridadResultado[]>([]);
  readonly especialidades = signal<CatalogoItem[]>([]);
  readonly formAbierto = signal(false);
  readonly formId = signal<number | null>(null);
  readonly pendienteEliminar = signal<Solicitud | null>(null);

  readonly filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const estadoId = this.estadoFiltro();
    const tipoId = this.especialidadFiltro();
    return this.solicitudes().filter((solicitud) => {
      if (estadoId && solicitud.estado.id !== estadoId) {
        return false;
      }
      if (tipoId && solicitud.tipoTecnico.id !== tipoId) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = [
        solicitud.titulo,
        solicitud.tipoServicio.nombre,
        solicitud.tipoTecnico.nombre,
        solicitud.tecnico?.nombre ?? '',
        solicitud.objeto?.nombre ?? '',
        solicitud.estado.nombre
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  readonly formKeys = computed(() => {
    if (!this.formAbierto()) {
      return [];
    }
    const id = this.formId();
    return [id === null ? 'nueva' : `editar-${id}`];
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.sincronizarModalDesdeUrl());
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarFiltros();
    this.sincronizarModalDesdeUrl();
  }

  cargar(): void {
    this.error.set(null);
    this.solicitudService.listar().subscribe({
      next: (lista) => this.solicitudes.set(lista),
      error: (err: unknown) =>
        this.error.set(
          mensajeHttp(err, 'No se pudo cargar el listado. ¿Está el API en el puerto 3000?')
        )
    });
  }

  onEstado(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.estadoFiltro.set(value ? Number(value) : null);
  }

  onEspecialidad(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.especialidadFiltro.set(value ? Number(value) : null);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.estadoFiltro.set(null);
    this.especialidadFiltro.set(null);
  }

  hayFiltros(): boolean {
    return !!(this.busqueda().trim() || this.estadoFiltro() || this.especialidadFiltro());
  }

  pedirEliminar(solicitud: Solicitud): void {
    this.pendienteEliminar.set(solicitud);
  }

  mensajeEliminar(solicitud: Solicitud): string {
    return `¿Eliminar la solicitud "${solicitud.titulo}"?`;
  }

  confirmarEliminar(): void {
    const solicitud = this.pendienteEliminar();
    if (!solicitud) {
      return;
    }
    this.solicitudService.eliminar(solicitud.id).subscribe({
      next: () => {
        this.pendienteEliminar.set(null);
        this.toasts.exito('Solicitud eliminada.');
        this.cargar();
      },
      error: (err: unknown) =>
        this.error.set(mensajeHttp(err, 'No se pudo eliminar la solicitud.'))
    });
  }

  cerrarFormulario(): void {
    void this.router.navigate(['/solicitudes']);
  }

  onFormCerrado(evento: { guardado: boolean }): void {
    void this.router.navigate(['/solicitudes']);
    if (evento.guardado) {
      this.cargar();
    }
  }

  private cargarFiltros(): void {
    forkJoin({
      estados: this.catalogoService.listarEstados(),
      especialidades: this.catalogoService.listarTiposTecnico()
    }).subscribe({
      next: ({ estados, especialidades }) => {
        this.estados.set(estados);
        this.especialidades.set(especialidades);
      }
    });
  }

  private sincronizarModalDesdeUrl(): void {
    const url = this.router.url.split('?')[0];
    if (url === '/solicitudes/nueva') {
      this.formAbierto.set(true);
      this.formId.set(null);
      return;
    }
    const match = url.match(/^\/solicitudes\/(\d+)\/editar$/);
    if (match) {
      this.formAbierto.set(true);
      this.formId.set(Number(match[1]));
      return;
    }
    this.formAbierto.set(false);
    this.formId.set(null);
  }
}
