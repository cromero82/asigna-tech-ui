import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CatalogoItem,
  EstadoPrioridadResultado,
  TecnicoItem,
  TipoServicioItem
} from '../../../core/models/catalogo';
import { CatalogoService } from '../../../core/services/catalogo';
import { SolicitudService } from '../../../core/services/solicitud';

@Component({
  selector: 'app-solicitud-form',
  imports: [ReactiveFormsModule, RouterLink],
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
  readonly tiposTecnico = signal<CatalogoItem[]>([]);
  readonly tiposServicio = signal<TipoServicioItem[]>([]);
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
    objetoId: [null as number | null, Validators.required],
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
      tiposTecnico: this.catalogoService.listarTiposTecnico(),
      objetos: this.catalogoService.listarObjetos(),
      estados: this.catalogoService.listarEstados(),
      prioridades: this.catalogoService.listarPrioridades(),
      resultados: this.catalogoService.listarResultados()
    }).subscribe({
      next: (catalogos) => {
        this.tiposTecnico.set(catalogos.tiposTecnico);
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

    this.form.controls.tipoTecnicoId.valueChanges.subscribe((tipoTecnicoId) => {
      this.form.patchValue({ tipoServicioId: null, tecnicoId: null }, { emitEvent: false });
      this.cargarFiltrados(tipoTecnicoId);
    });
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
      objetoId: Number(v.objetoId)
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
        this.cargarFiltrados(solicitud.tipoTecnico.id);
        this.form.patchValue(
          {
            titulo: solicitud.titulo,
            descripcion: solicitud.descripcion ?? '',
            observaciones: solicitud.observaciones ?? '',
            tipoTecnicoId: solicitud.tipoTecnico.id,
            tipoServicioId: solicitud.tipoServicio.id,
            tecnicoId: solicitud.tecnico?.id ?? null,
            objetoId: solicitud.objeto.id,
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

  private cargarFiltrados(tipoTecnicoId: number | null): void {
    if (!tipoTecnicoId) {
      this.tiposServicio.set([]);
      this.tecnicos.set([]);
      return;
    }
    forkJoin({
      tiposServicio: this.catalogoService.listarTiposServicio(tipoTecnicoId),
      tecnicos: this.catalogoService.listarTecnicos(tipoTecnicoId)
    }).subscribe({
      next: (data) => {
        this.tiposServicio.set(data.tiposServicio);
        this.tecnicos.set(data.tecnicos);
      },
      error: () => this.error.set('No se pudieron filtrar técnicos o tipos de servicio.')
    });
  }
}
