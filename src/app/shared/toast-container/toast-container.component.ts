import { Component } from '@angular/core';
import { NotificationService, Toast } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
})
export class ToastContainerComponent {
  readonly toasts$ = this.notifications.toasts$;

  constructor(private readonly notifications: NotificationService) {}

  dismiss(id: number): void {
    this.notifications.dismiss(id);
  }

  trackById(_index: number, toast: Toast): number {
    return toast.id;
  }
}
