import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerEditorPageComponent } from './customer-editor-page/customer-editor-page.component';
import { CustomerFiltersComponent } from './customer-filters/customer-filters.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerStatsComponent } from './customer-stats/customer-stats.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import { CustomersRoutingModule } from './customers-routing.module';

@NgModule({
  declarations: [
    CustomerListComponent,
    CustomerStatsComponent,
    CustomerFiltersComponent,
    CustomerTableComponent,
    CustomerFormComponent,
    CustomerEditorPageComponent,
    CustomerDetailsComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CustomersRoutingModule, SharedModule],
})
export class CustomersModule {}
