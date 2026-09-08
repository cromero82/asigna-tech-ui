import { Routes } from '@angular/router';
import { DominioList } from './features/dominios/dominio-list';
import { SolicitudForm } from './features/solicitudes/solicitud-form/solicitud-form';
import { SolicitudList } from './features/solicitudes/solicitud-list/solicitud-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  { path: 'solicitudes', component: SolicitudList },
  { path: 'solicitudes/nueva', component: SolicitudForm },
  { path: 'solicitudes/:id/editar', component: SolicitudForm },
  {
    path: 'dominios/especialidades',
    component: DominioList,
    data: { dominio: 'especialidad', titulo: 'Especialidad' }
  },
  {
    path: 'dominios/tipos-servicio',
    component: DominioList,
    data: { dominio: 'tipo-servicio', titulo: 'Tipo de servicio' }
  },
  {
    path: 'dominios/tecnicos',
    component: DominioList,
    data: { dominio: 'tecnico', titulo: 'Técnico' }
  },
  {
    path: 'dominios/objetos',
    component: DominioList,
    data: { dominio: 'objeto', titulo: 'Objeto' }
  }
];
