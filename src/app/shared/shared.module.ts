import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ToastContainerComponent } from './toast-container/toast-container.component';

@NgModule({
  declarations: [PaginationComponent, ConfirmDialogComponent, ToastContainerComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [PaginationComponent, ConfirmDialogComponent, ToastContainerComponent],
})
export class SharedModule {}
