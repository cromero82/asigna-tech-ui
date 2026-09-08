export interface CatalogoRef {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string | null;
  observaciones: string | null;
  tipoTecnico: CatalogoRef;
  tipoServicio: CatalogoRef;
  tecnico: CatalogoRef | null;
  objeto: CatalogoRef | null;
  estado: CatalogoRef;
  prioridad: CatalogoRef;
  resultado: CatalogoRef | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearSolicitud {
  titulo: string;
  descripcion?: string | null;
  observaciones?: string | null;
  tipoTecnicoId: number;
  tipoServicioId: number;
  tecnicoId?: number | null;
  objetoId?: number | null;
}

export interface ActualizarSolicitud extends CrearSolicitud {
  estadoId: number;
  prioridadId: number;
  resultadoId?: number | null;
}
