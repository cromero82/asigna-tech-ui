import { TestBed } from '@angular/core/testing';
import { RutaVacia } from './ruta-vacia';

describe('RutaVacia', () => {
  it('se crea sin plantilla', async () => {
    await TestBed.configureTestingModule({
      imports: [RutaVacia]
    }).compileComponents();
    const fixture = TestBed.createComponent(RutaVacia);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
