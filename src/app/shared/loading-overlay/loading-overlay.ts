import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/ui/loading';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css'
})
export class LoadingOverlay {
  readonly loading = inject(LoadingService);
}
