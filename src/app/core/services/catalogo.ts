import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CatalogoItem,
  EstadoPrioridadResultado,
  TecnicoItem,
  TipoServicioItem
} from '../models/catalogo';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listarTiposTecnico(): Observable<CatalogoItem[]> {
    return this.http.get<CatalogoItem[]>(`${this.api}/tipos-tecnico`);
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

  private filtroTipo(tipoTecnicoId?: number): HttpParams {
    return tipoTecnicoId
      ? new HttpParams().set('tipoTecnicoId', String(tipoTecnicoId))
      : new HttpParams();
  }
}
