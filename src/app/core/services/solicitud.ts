import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarSolicitud, CrearSolicitud, Solicitud } from '../models/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/solicitudes`;

  listar(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.url);
  }

  obtenerPorId(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.url}/${id}`);
  }

  crear(body: CrearSolicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.url, body);
  }

  actualizar(id: number, body: ActualizarSolicitud): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.url}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
