import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DonationService } from '../../services/donation.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any;
  dashboardData: any = {
    recentDonations: [],
    totalDonated: { totalAmount: 0, count: 0 },
    ngosSupported: 0,
    monthlyDonations: []
  };
  private destroy$ = new Subject<void>();
  private refreshInterval: any;
  loading = false;

  constructor(
    public authService: AuthService,
    private analyticsService: AnalyticsService,
    private donationService: DonationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    const role = this.user?.role;

    if (role === 'donor') {
      this.loadDonorDashboard();
      // Refresh dashboard every 30 seconds for updates
      this.refreshInterval = setInterval(() => {
        this.loadDonorDashboard();
      }, 30000);
    } else if (role === 'ngo_admin') {
      this.router.navigate(['/ngo-dashboard']);
    } else if (role === 'system_admin') {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  loadDonorDashboard() {
    this.loading = true;
    this.analyticsService.getDonorDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response && response.data) {
            // Ensure we have all required fields
            this.dashboardData = {
              recentDonations: response.data.recentDonations || [],
              totalDonated: response.data.totalDonated || { totalAmount: 0, count: 0 },
              ngosSupported: response.data.ngosSupported || 0,
              monthlyDonations: response.data.monthlyDonations || []
            };
            console.log('Dashboard updated successfully:', this.dashboardData);
          } else {
            console.warn('Invalid response structure:', response);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading dashboard:', error);
        }
      });
  }

  refreshDashboard() {
    this.loadDonorDashboard();
  }

  getImpactPoints(): number {
    return Math.floor((this.dashboardData.totalDonated?.totalAmount || 0) / 10);
  }

  getBadgeInfo() {
    const points = this.getImpactPoints();
    if (points > 2000) {
      return { label: 'Gold Supporter', class: 'badge-gold', icon: 'military_tech', color: '#fbbf24' };
    } else if (points > 500) {
      return { label: 'Silver Supporter', class: 'badge-silver', icon: 'workspace_premium', color: '#94a3b8' };
    } else {
      return { label: 'Bronze Supporter', class: 'badge-bronze', icon: 'stars', color: '#b45309' };
    }
  }

  downloadCertificate() {
    const points = this.getImpactPoints();

    if (points < 1000) {
      this.snackBar.open(`You need 1,000 Impact Points to unlock this certificate. Current: ${points}`, 'Close', { duration: 5000 });
      return;
    }

    const badgeInfo = this.getBadgeInfo();
    const donorName = this.user?.name || 'Valued Supporter';
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const certificateHtml = `
      <html>
        <head>
          <title>Impact Certificate - ${donorName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;500;700&family=Great+Vibes&display=swap');
            
            @page {
              size: landscape;
              margin: 0;
            }

            * { box-sizing: border-box; }

            body { 
              margin: 0; padding: 0; 
              background: #0f172a; 
              display: flex; justify-content: center; align-items: center; 
              min-height: 100vh;
              font-family: 'Montserrat', sans-serif;
              -webkit-print-color-adjust: exact;
              overflow: hidden;
            }

            .cert-canvas {
              width: 950px; /* Reduced from 1050px */
              height: 650px; /* Reduced from 750px to prevent page overflow */
              background: #fff;
              padding: 15px;
              position: relative;
              box-shadow: 0 40px 80px rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-inside: avoid;
            }

            .outer-frame {
              border: 12px solid #d4af37;
              height: 100%;
              width: 100%;
              padding: 8px;
              position: relative;
              background: #fff;
            }

            .inner-frame {
              border: 1.5px solid #d4af37;
              height: 100%;
              width: 100%;
              padding: 40px 50px; /* Compact padding */
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
              justify-content: space-between; /* Ensures even distribution inside border */
            }

            .corner {
              position: absolute;
              width: 60px;
              height: 60px;
              border: 3px solid #d4af37;
              z-index: 2;
            }
            .tl { top: -4px; left: -4px; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
            .tr { top: -4px; right: -4px; border-left: none; border-bottom: none; border-radius: 0 10px 0 0; }
            .bl { bottom: -4px; left: -4px; border-right: none; border-top: none; border-radius: 0 0 0 10px; }
            .br { bottom: -4px; right: -4px; border-left: none; border-top: none; border-radius: 0 0 10px 0; }

            .watermark {
              position: absolute;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              font-family: 'Cinzel', serif;
              font-size: 300px;
              color: #d4af37;
              opacity: 0.03;
              z-index: 0;
            }

            .header {
              text-align: center;
              z-index: 3;
            }

            .cert-title {
              font-family: 'Cinzel', serif;
              font-size: 48px; /* Reduced from 64px */
              color: #1a202c;
              margin: 0;
              letter-spacing: 6px;
              font-weight: 900;
              text-transform: uppercase;
            }

            .cert-subtitle {
              font-size: 11px; /* Reduced from 14px */
              color: #d4af37;
              text-transform: uppercase;
              letter-spacing: 8px;
              margin-top: 5px;
              font-weight: 700;
            }

            .presented-to {
              font-size: 16px; /* Reduced */
              color: #64748b;
              margin-top: 20px;
              font-style: italic;
            }

            .name-display {
              font-family: 'Great Vibes', cursive;
              font-size: 64px; /* Reduced from 84px */
              color: #1e293b;
              margin: 5px 0 15px 0;
              padding: 0 40px 2px 40px;
              border-bottom: 1.5px solid #e2e8f0;
              text-align: center;
              z-index: 3;
              max-width: 80%;
            }

            .description {
              font-size: 15px; /* Reduced from 18px */
              line-height: 1.6;
              color: #475569;
              max-width: 90%;
              text-align: center;
              margin-bottom: 20px;
            }

            .achievement-grid {
              display: flex;
              gap: 20px;
              margin-bottom: 25px;
            }

            .achievement-card {
              border: 1px solid #f1f5f9;
              padding: 10px 20px;
              text-align: center;
              background: #fafafa;
              border-radius: 6px;
            }

            .card-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #94a3b8;
              font-weight: 700;
            }

            .card-value {
              display: block;
              font-size: 18px;
              font-weight: 700;
              color: #d4af37;
              margin-top: 2px;
            }

            .footer-section {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0 10px;
            }

            .footer-item {
              width: 180px;
              text-align: center;
            }

            .signature {
              font-family: 'Great Vibes', cursive;
              font-size: 24px; /* Reduced */
              color: #1e293b;
              margin-bottom: 5px;
            }

            .date {
              font-size: 14px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 10px;
            }

            .line {
              border-top: 1px solid #cbd5e1;
              margin-bottom: 5px;
            }

            .line-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              font-weight: 600;
            }

            .gold-seal {
              position: relative;
              width: 100px;
              height: 90px;
              margin-bottom: 10px;
              filter: drop-shadow(0 10px 15px rgba(236, 72, 153, 0.3));
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .gold-seal::before,
            .gold-seal::after {
              content: "";
              position: absolute;
              left: 50px;
              top: 0;
              width: 50px;
              height: 80px;
              background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
              border-radius: 50px 50px 0 0;
              transform: rotate(-45deg);
              transform-origin: 0 100%;
            }
            .gold-seal::after {
              left: 0;
              transform: rotate(45deg);
              transform-origin: 100% 100%;
            }
            .gold-seal .hb-text {
              position: relative;
              z-index: 5;
              color: white;
              font-family: 'Cinzel', serif;
              font-size: 22px;
              font-weight: 900;
              margin-top: -15px; /* Adjust text position inside heart */
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .print-btn {
              position: fixed;
              top: 20px; right: 20px;
              background: #f1f5f9;
              color: #0f172a;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 700;
              box-shadow: 0 8px 16px rgba(0,0,0,0.3);
              z-index: 1000;
            }

            @media print {
              .print-btn { display: none; }
              body { background: white; }
              .cert-canvas { 
                box-shadow: none; 
                width: 950px; 
                height: 650px;
                margin: auto;
              }
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Download Certificate</button>

          <div class="cert-canvas">
            <div class="outer-frame">
              <div class="tl corner"></div>
              <div class="tr corner"></div>
              <div class="bl corner"></div>
              <div class="br corner"></div>

              <div class="inner-frame">
                
                <div class="header">
                  <div class="cert-title">Certificate of Impact</div>
                  <div class="cert-subtitle">Official HeartBridge Recognition</div>
                </div>

                <div class="presented-to">This distinguished honor is proudly presented to</div>
                <div class="name-display">${donorName}</div>

                <p class="description">
                  In recognition of your outstanding generosity and commitment to social welfare. 
                  Your support has directly impacted countless lives across our partner NGO network, 
                  exemplifying the spirit of shared humanity and collective growth.
                </p>

                <div class="achievement-grid">
                  <div class="achievement-card">
                    <span class="card-label">Impact Tier</span>
                    <span class="card-value">${badgeInfo.label}</span>
                  </div>
                  <div class="achievement-card">
                    <span class="card-label">Total Points</span>
                    <span class="card-value">${points}</span>
                  </div>
                </div>

                <div class="footer-section">
                  <div class="footer-item">
                    <div class="date">${date}</div>
                    <div class="line"></div>
                    <span class="line-label">Date of Issue</span>
                  </div>

                  <div class="footer-item"></div>

                  <div class="footer-item">
                    <div class="signature">HeartBridge Auth</div>
                    <div class="line"></div>
                    <span class="line-label">Official Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(certificateHtml);
    printWindow?.document.close();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}

