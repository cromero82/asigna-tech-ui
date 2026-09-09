import { Routes } from '@angular/router';
import { DominioList } from './features/dominios/dominio-list';
import { SolicitudList } from './features/solicitudes/solicitud-list/solicitud-list';
import { RutaVacia } from './shared/ruta-vacia';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  {
    path: 'solicitudes',
    component: SolicitudList,
    children: [
      { path: 'nueva', component: RutaVacia },
      { path: ':id/editar', component: RutaVacia }
    ]
  },
  { path: 'dominios/especialidades', redirectTo: '/dominios/servicios', pathMatch: 'full' },
  { path: 'dominios/tipos-servicio', redirectTo: '/dominios/servicios', pathMatch: 'full' },
  {
    path: 'dominios/servicios',
    component: DominioList,
    data: { dominio: 'servicio', titulo: 'Servicio' }
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
