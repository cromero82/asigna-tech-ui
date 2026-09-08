import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { SolicitudService } from '../../../core/services/solicitud';
import { SolicitudList } from './solicitud-list';

describe('SolicitudList', () => {
  let fixture: ComponentFixture<SolicitudList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudList],
      providers: [
        provideRouter([]),
        {
          provide: SolicitudService,
          useValue: {
            listar: () => of([]),
            eliminar: () => of(undefined)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudList);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
