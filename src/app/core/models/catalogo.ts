export interface CatalogoItem {
  id: number;
  nombre: string;
}

export interface EstadoPrioridadResultado {
  id: number;
  codigo: string;
  nombre: string;
}

export interface TipoServicioItem {
  id: number;
  nombre: string;
  tipoTecnicoId: number;
}

export interface TecnicoItem {
  id: number;
  nombre: string;
  correo: string | null;
  tipoTecnicoId: number;
}

export interface ServicioGrupo {
  id: number;
  nombre: string;
  tiposServicio: TipoServicioItem[];
}

export interface ServicioSeleccionado {
  tipoTecnicoId: number;
  tipoServicioId: number;
  especialidadNombre: string;
  tipoServicioNombre: string;
}
