import { Component, Input, OnChanges } from '@angular/core';
import { CustomerSummary } from '../../../core/models/customer.model';

interface StatCard {
  label: string;
  value: number | null;
  tone: 'primary' | 'success' | 'secondary' | 'warning';
}

@Component({
  selector: 'app-customer-stats',
  templateUrl: './customer-stats.component.html',
  styleUrls: ['./customer-stats.component.css'],
})
export class CustomerStatsComponent implements OnChanges {
  @Input() summary: CustomerSummary | null = null;
  cards: StatCard[] = this.buildCards();

  ngOnChanges(): void {
    this.cards = this.buildCards();
  }

  trackByLabel(_index: number, card: StatCard): string {
    return card.label;
  }

  private buildCards(): StatCard[] {
    const summary = this.summary;
    return [
      { label: 'Total customers', value: summary?.total ?? null, tone: 'primary' },
      { label: 'Active', value: summary?.active ?? null, tone: 'success' },
      { label: 'Inactive', value: summary?.inactive ?? null, tone: 'secondary' },
      { label: 'Needs review', value: summary?.needsReview ?? null, tone: 'warning' },
    ];
  }
}
