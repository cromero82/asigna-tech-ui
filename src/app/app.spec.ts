import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { RutaVacia } from './shared/ruta-vacia';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: 'dominios/objetos', component: RutaVacia }])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Asigna Tech');
  });

  it('should render the domains menu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dominios');
    expect(compiled.textContent).toContain('Servicio');
    expect(compiled.textContent).not.toContain('Especialidad');
    expect(compiled.textContent).not.toContain('Tipo de servicio');
    expect(compiled.textContent).toContain('Técnico');
    expect(compiled.textContent).toContain('Objeto');
  });

  it('abre y cierra el menú de dominios', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;
    const event = { stopPropagation: () => undefined } as Event;
    cmp.alternarDominios(event);
    expect(cmp.dominiosAbierto()).toBe(true);
    cmp.alternarDominios(event);
    expect(cmp.dominiosAbierto()).toBe(false);
    cmp.alternarDominios(event);
    cmp.cerrarDominios();
    expect(cmp.dominiosAbierto()).toBe(false);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dominios/objetos');
    expect(cmp.dominiosActivo()).toBe(true);
  });
});
