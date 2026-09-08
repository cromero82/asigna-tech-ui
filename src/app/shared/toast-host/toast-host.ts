import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/ui/toast';

@Component({
  selector: 'app-toast-host',
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css'
})
export class ToastHost {
  readonly toasts = inject(ToastService);
}
