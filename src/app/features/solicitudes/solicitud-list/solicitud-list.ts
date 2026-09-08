import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeHttp } from '../../../core/http/mensaje-http';
import { Solicitud } from '../../../core/models/solicitud';
import { SolicitudService } from '../../../core/services/solicitud';

@Component({
  selector: 'app-solicitud-list',
  imports: [RouterLink],
  templateUrl: './solicitud-list.html',
  styleUrl: './solicitud-list.css'
})
export class SolicitudList implements OnInit {
  private readonly solicitudService = inject(SolicitudService);

  readonly solicitudes = signal<Solicitud[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
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

  eliminar(solicitud: Solicitud): void {
    const ok = window.confirm(`¿Eliminar la solicitud "${solicitud.titulo}"?`);
    if (!ok) {
      return;
    }
    this.solicitudService.eliminar(solicitud.id).subscribe({
      next: () => this.cargar(),
      error: (err: unknown) =>
        this.error.set(mensajeHttp(err, 'No se pudo eliminar la solicitud.'))
    });
  }
}
