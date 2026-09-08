import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioGrupo } from '../../core/models/catalogo';
import { ServicioSelect } from './servicio-select';

describe('ServicioSelect', () => {
  let fixture: ComponentFixture<ServicioSelect>;
  const grupos: ServicioGrupo[] = [
    {
      id: 1,
      nombre: 'Android',
      tiposServicio: [{ id: 10, nombre: 'Mantenimiento', tipoTecnicoId: 1 }]
    },
    {
      id: 2,
      nombre: 'Laptops (Portátiles) y computadores',
      tiposServicio: [
        { id: 20, nombre: 'Instalación de software', tipoTecnicoId: 2 },
        { id: 21, nombre: 'Mantenimiento', tipoTecnicoId: 2 }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioSelect]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioSelect);
    fixture.componentRef.setInput('grupos', grupos);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('emite solo el tipo de servicio elegido', () => {
    const emitidas: unknown[] = [];
    fixture.componentInstance.seleccion.subscribe((valor) => emitidas.push(valor));
    fixture.componentInstance.abrir();
    fixture.detectChanges();
    const opciones = fixture.nativeElement.querySelectorAll('.option') as NodeListOf<HTMLButtonElement>;
    opciones[2].click();
    expect(emitidas).toEqual([
      {
        tipoTecnicoId: 2,
        tipoServicioId: 21,
        especialidadNombre: 'Laptops (Portátiles) y computadores',
        tipoServicioNombre: 'Mantenimiento'
      }
    ]);
  });
});
