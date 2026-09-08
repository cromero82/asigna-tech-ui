import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingService } from '../../core/ui/loading';
import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
  it('muestra el overlay cuando hay carga', async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlay]
    }).compileComponents();
    const fixture = TestBed.createComponent(LoadingOverlay);
    TestBed.inject(LoadingService).begin();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando');
  });
});
