import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  readonly dominiosAbierto = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.dominiosAbierto.set(false));
  }

  @HostListener('document:click')
  cerrarDominios(): void {
    this.dominiosAbierto.set(false);
  }

  alternarDominios(event: Event): void {
    event.stopPropagation();
    this.dominiosAbierto.update((abierto) => !abierto);
  }

  dominiosActivo(): boolean {
    return this.router.url.startsWith('/dominios');
  }
}
