import { Routes } from '@angular/router';
import { SolicitudForm } from './features/solicitudes/solicitud-form/solicitud-form';
import { SolicitudList } from './features/solicitudes/solicitud-list/solicitud-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  { path: 'solicitudes', component: SolicitudList },
  { path: 'solicitudes/nueva', component: SolicitudForm },
  { path: 'solicitudes/:id/editar', component: SolicitudForm }
];
