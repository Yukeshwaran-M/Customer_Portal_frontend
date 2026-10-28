import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import { ConfirmRequest, ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @ViewChild('cancelButton') private cancelButton?: ElementRef<HTMLButtonElement>;
  private current: ConfirmRequest | null = null;

  readonly request$ = this.confirmService.request$.pipe(
    tap((request) => {
      this.current = request;
      if (request) {
        // move focus into the dialog once it is rendered (safe default: the non-destructive button)
        setTimeout(() => this.cancelButton?.nativeElement.focus());
      }
    }),
  );

  constructor(private readonly confirmService: ConfirmService) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.current?.respond(false);
  }

  onBackdropClick(event: MouseEvent, request: ConfirmRequest): void {
    if (event.target === event.currentTarget) {
      request.respond(false);
    }
  }
}
