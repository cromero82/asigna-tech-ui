import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pendientes = 0;
  readonly visible = signal(false);

  begin(): void {
    this.pendientes += 1;
    this.visible.set(true);
  }

  end(): void {
    this.pendientes = Math.max(0, this.pendientes - 1);
    if (this.pendientes === 0) {
      this.visible.set(false);
    }
  }
}
