import { Component, OnInit } from '@angular/core';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-donation-history',
  templateUrl: './donation-history.component.html',
  styleUrls: ['./donation-history.component.scss']
})
export class DonationHistoryComponent implements OnInit {
  donations: any[] = [];
  loading = false;
  displayedColumns: string[] = ['receipt', 'ngo', 'type', 'amount', 'date'];

  stats = {
    totalAmount: 0,
    count: 0,
    impactPoints: 0
  };

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadDonations();
  }

  loadDonations() {
    this.loading = true;
    this.donationService.getMyDonations().subscribe({
      next: (response) => {
        this.loading = false;
        this.donations = response.data || [];
        this.calculateStats();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading donation history', 'Close', { duration: 3000 });
      }
    });
  }

  calculateStats() {
    this.stats.totalAmount = this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    this.stats.count = this.donations.length;
    this.stats.impactPoints = Math.floor(this.stats.totalAmount / 10); // Reward logic: 1 point per 10 INR
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'general': return 'favorite';
      case 'wish': return 'redeem';
      case 'emergency': return 'error_outline';
      case 'adopt_a_day': return 'event';
      default: return 'volunteer_activism';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'general': return '#ef4444';
      case 'wish': return '#8b5cf6';
      case 'emergency': return '#f43f5e';
      case 'adopt_a_day': return '#f59e0b';
      default: return '#10b981';
    }
  }

  downloadReceipt(donation: any) {
    const receiptHtml = `
      <html>
        <head>
          <title>Donation Receipt - ${donation.transactionId || 'DMN-TXN'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #fdfdfd; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 40px; border-radius: 16px; max-width: 650px; margin: auto; background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; display: flex; flex-direction: column; align-items: center; }
            .logo-section { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
            .heart { color: #ec4899; font-size: 32px; display: flex; align-items: center; }
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
              <div class="logo-section">
                <span class="heart">❤️</span>
                <div class="logo">HeartBridge</div>
              </div>
              <p style="color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Official Donation Receipt</p>
            </div>
            <div class="details">
              <div class="row"><span class="label">Transaction ID</span> <span class="value">${donation.transactionId || 'DMN-' + donation._id?.substring(0, 8).toUpperCase()}</span></div>
              <div class="row"><span class="label">Payment Date</span> <span class="value">${new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div class="row"><span class="label">Donor Name</span> <span class="value">${donation.donorId?.name || this.authService.getUser()?.name || 'Valued Supporter'}</span></div>
              <div class="row"><span class="label">NGO Name</span> <span class="value">${donation.ngoId?.name || 'HeartBridge Impact Fund'}</span></div>
              <div class="row"><span class="label">Impact Category</span> <span class="value">${(donation.donationType || 'general').replace('_', ' ').toUpperCase()}</span></div>
            </div>
            <div class="amount-box">
              <div class="label">Donated Amount</div>
              <div class="amount">₹${donation.amount?.toLocaleString('en-IN')}</div>
            </div>
            <div class="footer">
              <p>Your support helps us change lives. Thank you for being a HeartBridge donor!</p>
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
