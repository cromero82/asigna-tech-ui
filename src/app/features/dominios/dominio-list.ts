import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  distinctUntilChanged,
  forkJoin,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { mensajeHttp } from '../../core/http/mensaje-http';
import { CatalogoItem, ServicioGrupo, TecnicoItem } from '../../core/models/catalogo';
import { CatalogoService } from '../../core/services/catalogo';
import { ToastService } from '../../core/ui/toast';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ModalShell } from '../../shared/modal-shell/modal-shell';

export type DominioClave = 'servicio' | 'tecnico' | 'objeto';

interface FilaDominio {
  id: number;
  nombre: string;
  extra?: string;
  correo?: string | null;
  tipoTecnicoId?: number;
}

interface ResultadoDominio {
  columnaExtra: string | null;
  filas: FilaDominio[];
  especialidades: CatalogoItem[];
}

@Component({
  selector: 'app-dominio-list',
  imports: [ReactiveFormsModule, ConfirmDialog, ModalShell],
  templateUrl: './dominio-list.html',
  styleUrl: './dominio-list.css'
})
export class DominioList {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toasts = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly recargar$ = new Subject<void>();

  readonly clave = signal<DominioClave>('objeto');
  readonly titulo = signal('Dominios');
  readonly columnaExtra = signal<string | null>(null);
  readonly filas = signal<FilaDominio[]>([]);
  readonly especialidades = signal<CatalogoItem[]>([]);
  readonly error = signal<string | null>(null);
  readonly edicionId = signal<number | null>(null);
  readonly formularioVisible = signal(false);
  readonly pendienteEliminar = signal<FilaDominio | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    correo: [''],
    tipoTecnicoId: [null as number | null],
    nuevaEspecialidad: ['']
  });

  constructor() {
    this.route.data
      .pipe(
        map((data) => ({
          clave: data['dominio'] as DominioClave,
          titulo: data['titulo'] as string
        })),
        distinctUntilChanged((a, b) => a.clave === b.clave),
        tap(({ clave, titulo }) => {
          this.clave.set(clave);
          this.titulo.set(titulo);
          this.cerrarFormulario();
          this.error.set(null);
        }),
        switchMap(({ clave }) =>
          merge(of(null), this.recargar$).pipe(
            switchMap(() =>
              this.cargar$(clave).pipe(
                catchError(() => {
                  this.error.set('No se pudo cargar el catálogo.');
                  return of({
                    columnaExtra: null,
                    filas: [],
                    especialidades: []
                  });
                })
              )
            )
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.columnaExtra.set(resultado.columnaExtra);
        this.filas.set(resultado.filas);
        this.especialidades.set(resultado.especialidades);
      });
  }

  get esEdicion(): boolean {
    return this.edicionId() !== null;
  }

  get muestraEspecialidad(): boolean {
    return this.clave() !== 'objeto';
  }

  get muestraCorreo(): boolean {
    return this.clave() === 'tecnico';
  }

  get muestraNuevaEspecialidad(): boolean {
    return this.clave() === 'servicio';
  }

  abrirCrear(): void {
    this.edicionId.set(null);
    this.form.reset({
      nombre: '',
      correo: '',
      tipoTecnicoId: null,
      nuevaEspecialidad: ''
    });
    this.formularioVisible.set(true);
    this.error.set(null);
  }

  abrirEditar(fila: FilaDominio): void {
    this.edicionId.set(fila.id);
    this.form.reset({
      nombre: fila.nombre,
      correo: fila.correo ?? '',
      tipoTecnicoId: fila.tipoTecnicoId ?? null,
      nuevaEspecialidad: ''
    });
    this.formularioVisible.set(true);
    this.error.set(null);
  }

  cerrarFormulario(): void {
    this.formularioVisible.set(false);
    this.edicionId.set(null);
    this.form.reset({
      nombre: '',
      correo: '',
      tipoTecnicoId: null,
      nuevaEspecialidad: ''
    });
  }

  guardar(): void {
    if (this.form.controls.nombre.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const clave = this.clave();
    if (clave === 'objeto') {
      this.guardarObjeto();
      return;
    }
    if (clave === 'tecnico') {
      this.guardarTecnico();
      return;
    }
    this.guardarServicio();
  }

  pedirEliminar(fila: FilaDominio): void {
    this.pendienteEliminar.set(fila);
  }

  mensajeEliminar(fila: FilaDominio): string {
    return `¿Eliminar "${fila.nombre}"?`;
  }

  confirmarEliminar(): void {
    const fila = this.pendienteEliminar();
    if (!fila) {
      return;
    }
    this.error.set(null);
    const id = fila.id;
    const pedido =
      this.clave() === 'objeto'
        ? this.catalogoService.eliminarObjeto(id)
        : this.clave() === 'tecnico'
          ? this.catalogoService.eliminarTecnico(id)
          : this.catalogoService.eliminarTipoServicio(id);
    pedido.subscribe({
      next: () => {
        this.pendienteEliminar.set(null);
        this.toasts.exito('Registro eliminado.');
        if (this.edicionId() === id) {
          this.cerrarFormulario();
        }
        this.recargar$.next();
      },
      error: (err: unknown) => this.error.set(mensajeHttp(err, 'No se pudo eliminar.'))
    });
  }

  private guardarObjeto(): void {
    const nombre = this.form.controls.nombre.value.trim();
    const id = this.edicionId();
    const pedido = id
      ? this.catalogoService.actualizarObjeto(id, nombre)
      : this.catalogoService.crearObjeto(nombre);
    this.enviar(pedido);
  }

  private guardarTecnico(): void {
    const tipoTecnicoId = this.form.controls.tipoTecnicoId.value;
    if (!tipoTecnicoId) {
      this.form.controls.tipoTecnicoId.markAsTouched();
      this.error.set('Seleccione una especialidad.');
      return;
    }
    const body = {
      nombre: this.form.controls.nombre.value.trim(),
      correo: this.form.controls.correo.value.trim() || null,
      tipoTecnicoId
    };
    const id = this.edicionId();
    const pedido = id
      ? this.catalogoService.actualizarTecnico(id, body)
      : this.catalogoService.crearTecnico(body);
    this.enviar(pedido);
  }

  private guardarServicio(): void {
    const nueva = this.form.controls.nuevaEspecialidad.value.trim();
    const tipoTecnicoId = this.form.controls.tipoTecnicoId.value;
    if (!nueva && !tipoTecnicoId) {
      this.form.controls.tipoTecnicoId.markAsTouched();
      this.error.set('Seleccione una especialidad o cree una nueva.');
      return;
    }
    if (nueva) {
      this.catalogoService.crearTipoTecnico(nueva).subscribe({
        next: (especialidad) => this.persistirServicio(especialidad.id),
        error: (err: unknown) =>
          this.error.set(mensajeHttp(err, 'No se pudo crear la especialidad.'))
      });
      return;
    }
    this.persistirServicio(Number(tipoTecnicoId));
  }

  private persistirServicio(tipoTecnicoId: number): void {
    const body = {
      nombre: this.form.controls.nombre.value.trim(),
      tipoTecnicoId
    };
    const id = this.edicionId();
    const pedido = id
      ? this.catalogoService.actualizarTipoServicio(id, body)
      : this.catalogoService.crearTipoServicio(body);
    this.enviar(pedido);
  }

  private enviar(pedido: Observable<unknown>): void {
    this.error.set(null);
    pedido.subscribe({
      next: () => {
        this.toasts.exito(this.edicionId() ? 'Registro actualizado.' : 'Registro creado.');
        this.cerrarFormulario();
        this.recargar$.next();
      },
      error: (err: unknown) => this.error.set(mensajeHttp(err, 'No se pudo guardar.'))
    });
  }

  private cargar$(clave: DominioClave): Observable<ResultadoDominio> {
    if (clave === 'servicio') {
      return forkJoin({
        especialidades: this.catalogoService.listarTiposTecnico(),
        grupos: this.catalogoService.listarServicios()
      }).pipe(
        map(({ especialidades, grupos }) => ({
          columnaExtra: 'Especialidad',
          filas: this.filasServicio(grupos),
          especialidades
        }))
      );
    }

    if (clave === 'objeto') {
      return this.catalogoService.listarObjetos().pipe(
        map((lista) => ({
          columnaExtra: null,
          filas: lista.map((item) => ({ id: item.id, nombre: item.nombre })),
          especialidades: []
        }))
      );
    }

    return forkJoin({
      especialidades: this.catalogoService.listarTiposTecnico(),
      tecnicos: this.catalogoService.listarTecnicos()
    }).pipe(
      map(({ especialidades, tecnicos }) => ({
        columnaExtra: 'Especialidad',
        filas: tecnicos.map((item) => this.filaTecnico(item, this.mapaEspecialidad(especialidades))),
        especialidades
      }))
    );
  }

  private filasServicio(grupos: ServicioGrupo[]): FilaDominio[] {
    return grupos.flatMap((grupo) =>
      grupo.tiposServicio.map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
        extra: grupo.nombre,
        tipoTecnicoId: grupo.id
      }))
    );
  }

  private filaTecnico(item: TecnicoItem, nombres: Map<number, string>): FilaDominio {
    return {
      id: item.id,
      nombre: item.nombre,
      correo: item.correo,
      extra: nombres.get(item.tipoTecnicoId) ?? '',
      tipoTecnicoId: item.tipoTecnicoId
    };
  }

  private mapaEspecialidad(lista: CatalogoItem[]): Map<number, string> {
    return new Map(lista.map((item) => [item.id, item.nombre]));
  }
}
