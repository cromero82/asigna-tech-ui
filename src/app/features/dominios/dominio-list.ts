import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, distinctUntilChanged, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CatalogoItem, ServicioGrupo, TecnicoItem } from '../../core/models/catalogo';
import { CatalogoService } from '../../core/services/catalogo';

export type DominioClave = 'servicio' | 'tecnico' | 'objeto';

interface FilaDominio {
  id: number;
  nombre: string;
  extra?: string;
}

interface ResultadoDominio {
  columnaExtra: string | null;
  filas: FilaDominio[];
}

@Component({
  selector: 'app-dominio-list',
  imports: [],
  templateUrl: './dominio-list.html',
  styleUrl: './dominio-list.css'
})
export class DominioList {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogoService = inject(CatalogoService);

  readonly titulo = signal('Dominios');
  readonly columnaExtra = signal<string | null>(null);
  readonly filas = signal<FilaDominio[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    this.route.data
      .pipe(
        map((data) => ({
          clave: data['dominio'] as DominioClave,
          titulo: data['titulo'] as string
        })),
        distinctUntilChanged((a, b) => a.clave === b.clave),
        switchMap(({ clave, titulo }) => {
          this.titulo.set(titulo);
          this.error.set(null);
          this.filas.set([]);
          return this.cargar$(clave).pipe(
            catchError(() => {
              this.error.set('No se pudo cargar el catálogo.');
              return of({ columnaExtra: null, filas: [] });
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.columnaExtra.set(resultado.columnaExtra);
        this.filas.set(resultado.filas);
      });
  }

  private cargar$(clave: DominioClave): Observable<ResultadoDominio> {
    if (clave === 'servicio') {
      return this.catalogoService.listarServicios().pipe(
        map((grupos) => ({
          columnaExtra: 'Especialidad',
          filas: this.filasServicio(grupos)
        }))
      );
    }

    if (clave === 'objeto') {
      return this.catalogoService.listarObjetos().pipe(
        map((lista) => ({
          columnaExtra: null,
          filas: lista.map((item) => ({ id: item.id, nombre: item.nombre }))
        }))
      );
    }

    return forkJoin({
      especialidades: this.catalogoService.listarTiposTecnico(),
      tecnicos: this.catalogoService.listarTecnicos()
    }).pipe(
      map(({ especialidades, tecnicos }) => ({
        columnaExtra: 'Especialidad',
        filas: tecnicos.map((item) => this.filaTecnico(item, this.mapaEspecialidad(especialidades)))
      }))
    );
  }

  private mapaEspecialidad(lista: CatalogoItem[]): Map<number, string> {
    return new Map(lista.map((item) => [item.id, item.nombre]));
  }

  private filasServicio(grupos: ServicioGrupo[]): FilaDominio[] {
    return grupos.flatMap((grupo) =>
      grupo.tiposServicio.map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
        extra: grupo.nombre
      }))
    );
  }

  private filaTecnico(item: TecnicoItem, nombres: Map<number, string>): FilaDominio {
    const correo = item.correo ? ` · ${item.correo}` : '';
    return {
      id: item.id,
      nombre: `${item.nombre}${correo}`,
      extra: nombres.get(item.tipoTecnicoId) ?? ''
    };
  }
}
