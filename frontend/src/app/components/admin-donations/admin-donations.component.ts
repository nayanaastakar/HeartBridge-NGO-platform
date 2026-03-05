import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../config';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-admin-donations',
  templateUrl: './admin-donations.component.html',
  styleUrls: ['./admin-donations.component.scss']
})
export class AdminDonationsComponent implements OnInit {
  donations: any[] = [];
  filteredDonations: any[] = [];
  loading = false;
  searchQuery = '';
  selectedType = 'all';

  stats = {
    totalAmount: 0,
    count: 0,
    average: 0,
    todayCount: 0
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadDonations();
  }

  loadDonations() {
    this.loading = true;
    this.http.get(`${API_URL}/donations`).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.donations = response.data || [];
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading donations', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.donations];

    // Search query filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d =>
        (d.donorId?.name && d.donorId.name.toLowerCase().includes(query)) ||
        (d.ngoId?.name && d.ngoId.name.toLowerCase().includes(query)) ||
        (d.transactionId && d.transactionId.toLowerCase().includes(query)) ||
        (d.donationType && d.donationType.toLowerCase().includes(query))
      );
    }

    // Type filter (Aligned with backend: general, wish, emergency, adopt_a_day)
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(d => d.donationType === this.selectedType);
    }

    this.filteredDonations = filtered;
  }

  calculateStats() {
    const total = this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const today = new Date().setHours(0, 0, 0, 0);

    this.stats = {
      totalAmount: total,
      count: this.donations.length,
      average: this.donations.length > 0 ? Math.round(total / this.donations.length) : 0,
      todayCount: this.donations.filter(d => new Date(d.createdAt).getTime() >= today).length
    };
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'general': return 'corporate_fare';
      case 'wish': return 'redeem';
      case 'emergency': return 'error_outline';
      case 'adopt_a_day': return 'event';
      default: return 'volunteer_activism';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'general': return '#3b82f6';
      case 'wish': return '#8b5cf6';
      case 'emergency': return '#ef4444';
      case 'adopt_a_day': return '#f59e0b';
      default: return '#10b981';
    }
  }

  downloadReceipt(donation: any) {
    const receiptHtml = `
      <html>
        <head>
          <title>Donation Receipt - ${donation.transactionId || 'RCP-TXN'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #fdfdfd; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 40px; border-radius: 16px; max-width: 650px; margin: auto; background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
            .logo { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
            .details { margin: 30px 0; line-height: 2.2; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; }
            .label { font-weight: 600; color: #64748b; font-size: 0.9rem; text-transform: uppercase; }
            .value { font-weight: 700; color: #1e293b; font-size: 1rem; }
            .amount-box { background: #f8fafc; padding: 30px; text-align: center; border-radius: 12px; margin-top: 32px; border: 1px solid #e2e8f0; }
            .amount { font-size: 2.5rem; font-weight: 800; color: #10b981; margin-top: 8px; }
            .footer { margin-top: 48px; text-align: center; font-size: 0.85rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 24px; }
            @media print { .print-btn { display: none; } body { background: white; } .receipt-card { box-shadow: none; border: 1px solid #eee; } }
            .print-btn { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; float: right; font-weight: 600; display: flex; align-items: center; gap: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
            <div class="header">
              <div class="logo">HeartBridge NGO Platform</div>
              <p style="color: #64748b; margin-top: 4px;">Thank you for your kindness!</p>
            </div>
            <div class="details">
              <div class="row"><span class="label">Receipt ID</span> <span class="value">${donation.transactionId || 'DMN-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</span></div>
              <div class="row"><span class="label">Date</span> <span class="value">${new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div class="row"><span class="label">Donor Name</span> <span class="value">${donation.donorId?.name || 'Anonymous Donor'}</span></div>
              <div class="row"><span class="label">Supported NGO</span> <span class="value">${donation.ngoId?.name || 'Central Support Fund'}</span></div>
              <div class="row"><span class="label">Category</span> <span class="value">${(donation.donationType || 'general').replace('_', ' ').toUpperCase()}</span></div>
            </div>
            <div class="amount-box">
              <div class="label">Total Amount Donated</div>
              <div class="amount">₹${donation.amount?.toLocaleString('en-IN')}</div>
            </div>
            <div class="footer">
              <p>This is a computer-generated receipt for your donation via <strong>HeartBridge</strong>.</p>
              <p>HeartBridge NGO Platform - Bridging Hearts, Changing Lives.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(receiptHtml);
    printWindow?.document.close();
  }
}
