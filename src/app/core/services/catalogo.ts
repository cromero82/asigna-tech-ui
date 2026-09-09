import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CatalogoItem,
  EstadoPrioridadResultado,
  ServicioGrupo,
  TecnicoItem,
  TipoServicioItem
} from '../models/catalogo';

export interface TipoServicioBody {
  nombre: string;
  tipoTecnicoId: number;
}

export interface TecnicoBody {
  nombre: string;
  correo?: string | null;
  tipoTecnicoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private tiposTecnico$?: Observable<CatalogoItem[]>;
  private servicios$?: Observable<ServicioGrupo[]>;

  listarTiposTecnico(): Observable<CatalogoItem[]> {
    this.tiposTecnico$ ??= this.http
      .get<CatalogoItem[]>(`${this.api}/tipos-tecnico`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.tiposTecnico$;
  }

  listarServicios(): Observable<ServicioGrupo[]> {
    this.servicios$ ??= this.http
      .get<ServicioGrupo[]>(`${this.api}/servicios`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.servicios$;
  }

  listarTiposServicio(tipoTecnicoId?: number): Observable<TipoServicioItem[]> {
    return this.http.get<TipoServicioItem[]>(`${this.api}/tipos-servicio`, {
      params: this.filtroTipo(tipoTecnicoId)
    });
  }

  listarTecnicos(tipoTecnicoId?: number): Observable<TecnicoItem[]> {
    return this.http.get<TecnicoItem[]>(`${this.api}/tecnicos`, {
      params: this.filtroTipo(tipoTecnicoId)
    });
  }

  listarObjetos(): Observable<CatalogoItem[]> {
    return this.http.get<CatalogoItem[]>(`${this.api}/objetos`);
  }

  listarEstados(): Observable<EstadoPrioridadResultado[]> {
    return this.http.get<EstadoPrioridadResultado[]>(`${this.api}/estados-solicitud`);
  }

  listarPrioridades(): Observable<EstadoPrioridadResultado[]> {
    return this.http.get<EstadoPrioridadResultado[]>(`${this.api}/prioridades`);
  }

  listarResultados(): Observable<EstadoPrioridadResultado[]> {
    return this.http.get<EstadoPrioridadResultado[]>(`${this.api}/resultados-solicitud`);
  }

  crearTipoTecnico(nombre: string): Observable<CatalogoItem> {
    return this.http
      .post<CatalogoItem>(`${this.api}/tipos-tecnico`, { nombre })
      .pipe(tap(() => this.invalidarCache()));
  }

  crearTipoServicio(body: TipoServicioBody): Observable<TipoServicioItem> {
    return this.http
      .post<TipoServicioItem>(`${this.api}/tipos-servicio`, body)
      .pipe(tap(() => this.invalidarCache()));
  }

  actualizarTipoServicio(id: number, body: TipoServicioBody): Observable<TipoServicioItem> {
    return this.http
      .put<TipoServicioItem>(`${this.api}/tipos-servicio/${id}`, body)
      .pipe(tap(() => this.invalidarCache()));
  }

  eliminarTipoServicio(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/tipos-servicio/${id}`)
      .pipe(tap(() => this.invalidarCache()));
  }

  crearTecnico(body: TecnicoBody): Observable<TecnicoItem> {
    return this.http
      .post<TecnicoItem>(`${this.api}/tecnicos`, body)
      .pipe(tap(() => this.invalidarCache()));
  }

  actualizarTecnico(id: number, body: TecnicoBody): Observable<TecnicoItem> {
    return this.http
      .put<TecnicoItem>(`${this.api}/tecnicos/${id}`, body)
      .pipe(tap(() => this.invalidarCache()));
  }

  eliminarTecnico(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/tecnicos/${id}`)
      .pipe(tap(() => this.invalidarCache()));
  }

  crearObjeto(nombre: string): Observable<CatalogoItem> {
    return this.http
      .post<CatalogoItem>(`${this.api}/objetos`, { nombre })
      .pipe(tap(() => this.invalidarCache()));
  }

  actualizarObjeto(id: number, nombre: string): Observable<CatalogoItem> {
    return this.http
      .put<CatalogoItem>(`${this.api}/objetos/${id}`, { nombre })
      .pipe(tap(() => this.invalidarCache()));
  }

  eliminarObjeto(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/objetos/${id}`)
      .pipe(tap(() => this.invalidarCache()));
  }

  invalidarCache(): void {
    this.tiposTecnico$ = undefined;
    this.servicios$ = undefined;
  }

  private filtroTipo(tipoTecnicoId?: number): HttpParams {
    return tipoTecnicoId
      ? new HttpParams().set('tipoTecnicoId', String(tipoTecnicoId))
      : new HttpParams();
  }
}
