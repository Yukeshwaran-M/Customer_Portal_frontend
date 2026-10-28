import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerEditorPageComponent } from './customer-editor-page/customer-editor-page.component';
import { CustomerListComponent } from './customer-list/customer-list.component';

const routes: Routes = [
  { path: '', component: CustomerListComponent, title: 'Customers' },
  { path: 'new', component: CustomerEditorPageComponent, title: 'Add customer' },
  { path: ':id/edit', component: CustomerEditorPageComponent, title: 'Edit customer' },
  { path: ':id', component: CustomerDetailsComponent, title: 'Customer details' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRoutingModule {}
