import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CatalogoItem,
  EstadoPrioridadResultado,
  ServicioGrupo,
  ServicioSeleccionado,
  TecnicoItem
} from '../../../core/models/catalogo';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';
import { ServicioSelect } from '../../../shared/servicio-select/servicio-select';

@Component({
  selector: 'app-solicitud-form',
  imports: [ReactiveFormsModule, RouterLink, ServicioSelect],
  templateUrl: './solicitud-form.html',
  styleUrl: './solicitud-form.css'
})
export class SolicitudForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly solicitudService = inject(SolicitudService);
  private readonly catalogoService = inject(CatalogoService);

  readonly id = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly servicios = signal<ServicioGrupo[]>([]);
  readonly tecnicos = signal<TecnicoItem[]>([]);
  readonly objetos = signal<CatalogoItem[]>([]);
  readonly estados = signal<EstadoPrioridadResultado[]>([]);
  readonly prioridades = signal<EstadoPrioridadResultado[]>([]);
  readonly resultados = signal<EstadoPrioridadResultado[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    observaciones: [''],
    tipoTecnicoId: [null as number | null, Validators.required],
    tipoServicioId: [null as number | null, Validators.required],
    tecnicoId: [null as number | null],
    objetoId: [null as number | null],
    estadoId: [null as number | null],
    prioridadId: [null as number | null],
    resultadoId: [null as number | null]
  });

  get esEdicion(): boolean {
    return this.id() !== null;
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id.set(rawId ? Number(rawId) : null);

    forkJoin({
      servicios: this.catalogoService.listarServicios(),
      objetos: this.catalogoService.listarObjetos(),
      estados: this.catalogoService.listarEstados(),
      prioridades: this.catalogoService.listarPrioridades(),
      resultados: this.catalogoService.listarResultados()
    }).subscribe({
      next: (catalogos) => {
        this.servicios.set(catalogos.servicios);
        this.objetos.set(catalogos.objetos);
        this.estados.set(catalogos.estados);
        this.prioridades.set(catalogos.prioridades);
        this.resultados.set(catalogos.resultados);
        const id = this.id();
        if (id) {
          this.cargarSolicitud(id);
        }
      },
      error: () => this.error.set('No se pudieron cargar los catálogos.')
    });
  }

  onServicioSeleccionado(opcion: ServicioSeleccionado | null): void {
    const especialidadAnterior = this.form.controls.tipoTecnicoId.value;
    this.form.patchValue({
      tipoTecnicoId: opcion?.tipoTecnicoId ?? null,
      tipoServicioId: opcion?.tipoServicioId ?? null
    });
    this.form.controls.tipoServicioId.markAsTouched();
    if (!opcion) {
      this.form.patchValue({ tecnicoId: null });
      this.tecnicos.set([]);
      return;
    }
    if (opcion.tipoTecnicoId !== especialidadAnterior) {
      this.form.patchValue({ tecnicoId: null });
      this.cargarTecnicos(opcion.tipoTecnicoId);
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const v = this.form.getRawValue();
    const base = {
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim() || null,
      observaciones: v.observaciones.trim() || null,
      tipoTecnicoId: Number(v.tipoTecnicoId),
      tipoServicioId: Number(v.tipoServicioId),
      tecnicoId: v.tecnicoId ? Number(v.tecnicoId) : null,
      objetoId: v.objetoId ? Number(v.objetoId) : null
    };
    const id = this.id();
    if (id) {
      this.solicitudService
        .actualizar(id, {
          ...base,
          estadoId: Number(v.estadoId),
          prioridadId: Number(v.prioridadId),
          resultadoId: v.resultadoId ? Number(v.resultadoId) : null
        })
        .subscribe({
          next: () => void this.router.navigate(['/solicitudes']),
          error: () => this.error.set('No se pudo actualizar la solicitud.')
        });
      return;
    }
    this.solicitudService.crear(base).subscribe({
      next: () => void this.router.navigate(['/solicitudes']),
      error: () => this.error.set('No se pudo crear la solicitud.')
    });
  }

  private cargarSolicitud(id: number): void {
    this.solicitudService.obtenerPorId(id).subscribe({
      next: (solicitud) => {
        this.cargarTecnicos(solicitud.tipoTecnico.id);
        this.form.patchValue(
          {
            titulo: solicitud.titulo,
            descripcion: solicitud.descripcion ?? '',
            observaciones: solicitud.observaciones ?? '',
            tipoTecnicoId: solicitud.tipoTecnico.id,
            tipoServicioId: solicitud.tipoServicio.id,
            tecnicoId: solicitud.tecnico?.id ?? null,
            objetoId: solicitud.objeto?.id ?? null,
            estadoId: solicitud.estado.id,
            prioridadId: solicitud.prioridad.id,
            resultadoId: solicitud.resultado?.id ?? null
          },
          { emitEvent: false }
        );
      },
      error: () => this.error.set('No se encontró la solicitud.')
    });
  }

  private cargarTecnicos(tipoTecnicoId: number | null): void {
    if (!tipoTecnicoId) {
      this.tecnicos.set([]);
      return;
    }
    this.catalogoService.listarTecnicos(tipoTecnicoId).subscribe({
      next: (tecnicos) => this.tecnicos.set(tecnicos),
      error: () => this.error.set('No se pudieron filtrar los técnicos.')
    });
  }
}
