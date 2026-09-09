import { Component, input, output } from '@angular/core';
import { ModalShell } from '../modal-shell/modal-shell';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalShell],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  readonly titulo = input('Confirmar');
  readonly mensaje = input.required<string>();
  readonly confirmarLabel = input('Eliminar');
  readonly confirmado = output<void>();
  readonly cancelado = output<void>();
}
