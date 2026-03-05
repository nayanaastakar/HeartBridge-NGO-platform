import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-analytics-dashboard-dialog',
  template: `
    <div class="analytics-container">
      <h2 mat-dialog-title>📊 Analytics Dashboard</h2>
      <mat-dialog-content class="dialog-content">
        
        <!-- Overview Cards -->
        <div class="overview-section">
          <h3>📈 Platform Overview</h3>
          <div class="overview-grid">
            <div class="overview-card revenue">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <h4>₹{{ data.overview.totalRevenue.toLocaleString() }}</h4>
                <p>Total Revenue</p>
              </div>
            </div>
            <div class="overview-card donations">
              <div class="card-icon">🎁</div>
              <div class="card-content">
                <h4>{{ data.overview.totalDonations }}</h4>
                <p>Total Donations</p>
              </div>
            </div>
            <div class="overview-card average">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <h4>₹{{ data.overview.averageDonation.toLocaleString() }}</h4>
                <p>Average Donation</p>
              </div>
            </div>
            <div class="overview-card users">
              <div class="card-icon">👥</div>
              <div class="card-content">
                <h4>{{ data.overview.activeUsers }}</h4>
                <p>Active Users</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="chart-row">
            <!-- Donation Trend Chart -->
            <div class="chart-container">
              <h3>📈 Donation Trend (6 Months)</h3>
              <div class="bar-chart">
                <div class="chart-bar" *ngFor="let item of data.charts.donationTrend" 
                     [style.height.%]="getBarHeight(item.amount, data.charts.donationTrend)">
                  <div class="bar-value">₹{{ formatAmount(item.amount) }}</div>
                  <div class="bar-label">{{ item.month }}</div>
                </div>
              </div>
            </div>

            <!-- Donation Size Breakdown -->
            <div class="chart-container">
              <h3>💰 Donation Size Breakdown</h3>
              <div class="size-breakdown">
                <div class="size-item" *ngFor="let item of data.charts.donationSizeBreakdown">
                  <div class="size-info">
                    <span class="size-label">{{ item.size }}</span>
                    <span class="size-count">{{ item.count }} donations</span>
                    <span class="size-amount">₹{{ formatAmount(item.amount) }}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="item.percentage"></div>
                  </div>
                  <span class="percentage">{{ item.percentage }}%</span>
                </div>
              </div>
            </div>

            <!-- User Growth -->
            <div class="chart-container">
              <h3>👥 User Growth (6 Months)</h3>
              <div class="growth-legend">
                <div class="legend-item">
                  <div class="legend-color donors"></div>
                  <span>Donors</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color ngos"></div>
                  <span>NGOs</span>
                </div>
              </div>
              <div class="growth-chart">
                <div class="growth-item" *ngFor="let item of data.charts.userGrowth; let i = index">
                  <div class="growth-bar-container">
                    <div class="growth-bar donors" [style.height.%]="getGrowthHeight(item.donors, data.charts.userGrowth)">
                      <span class="growth-value">{{ item.donors }}</span>
                    </div>
                    <div class="growth-bar ngos" [style.height.%]="getGrowthHeight(item.ngos, data.charts.userGrowth)">
                      <span class="growth-value">{{ item.ngos }}</span>
                    </div>
                  </div>
                  <div class="growth-label">{{ item.month }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Performers -->
        <div class="top-performers-section">
          <div class="performers-container">
            <div class="performers-list">
              <h4>🏆 Top NGOs</h4>
              <div class="performer-item" *ngFor="let ngo of data.topPerformers.ngos; let i = index">
                <div class="performer-info">
                  <span class="performer-name">{{ ngo.name }}</span>
                  <span class="performer-stats">{{ ngo.donations }} donations • ₹{{ formatAmount(ngo.amount) }}</span>
                </div>
                <div class="performer-rank">#{{ i + 1 }}</div>
              </div>
            </div>
            
            <div class="performers-list">
              <h4>💝 Top Donors</h4>
              <div class="performer-item" *ngFor="let donor of data.topPerformers.donors; let i = index">
                <div class="performer-info">
                  <span class="performer-name">{{ donor.name }}</span>
                  <span class="performer-stats">{{ donor.donations }} donations • ₹{{ formatAmount(donor.amount) }}</span>
                </div>
                <div class="performer-rank">#{{ i + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="exportAnalytics()">📊 Export Report</button>
        <button mat-raised-button color="primary" (click)="closeDialog()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
      background: #fafafa;
    }
    
    .dialog-content {
      max-height: 75vh;
      overflow-y: auto;
    }
    
    h3 {
      color: #d32f2f;
      margin-bottom: 16px;
    }
    
    .overview-section {
      margin-bottom: 32px;
    }
    
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .overview-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    
    .overview-card:hover {
      transform: translateY(-2px);
    }
    
    .card-icon {
      font-size: 32px;
      margin-right: 16px;
    }
    
    .card-content h4 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .card-content p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }
    
    .revenue { border-left: 4px solid #4caf50; }
    .donations { border-left: 4px solid #2196f3; }
    .average { border-left: 4px solid #ff9800; }
    .users { border-left: 4px solid #9c27b0; }
    
    .charts-section {
      margin-bottom: 32px;
    }
    
    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .chart-container.full-width {
      grid-column: 1 / -1;
    }
    
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 120px;
      padding: 10px 0;
      margin-bottom: 10px;
    }
    
    .chart-bar {
      width: 40px;
      background: linear-gradient(to top, #d32f2f, #ff6b6b);
      border-radius: 4px 4px 0 0;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      min-height: 20px;
    }
    
    .bar-value {
      position: absolute;
      top: -20px;
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }
    
    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }
    
    .size-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .size-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .size-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .size-label {
      font-weight: 600;
      color: #333;
    }
    
    .size-count {
      font-size: 0.9rem;
      color: #666;
    }
    
    .size-amount {
      font-size: 0.85rem;
      color: #d32f2f;
      font-weight: 500;
    }
    
    .progress-bar {
      flex: 2;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #4caf50, #8bc34a);
      transition: width 0.3s ease;
    }
    
    .percentage {
      min-width: 40px;
      text-align: right;
      font-weight: 600;
      color: #333;
    }
    
    .growth-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      padding: 20px 0;
    }
    
    .growth-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }
    
    .legend-color.donors {
      background: #2196f3;
    }
    
    .legend-color.ngos {
      background: #ff9800;
    }
    
    .growth-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .growth-month {
      font-size: 12px;
      color: #666;
    }
    
    .growth-bars {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    
    .growth-bar {
      width: 20px;
      border-radius: 2px 2px 0 0;
      position: relative;
      cursor: pointer;
    }
    
    .growth-bar.donors {
      background: #2196f3;
    }
    
    .growth-bar.ngos {
      background: #ff9800;
    }
    
    .bar-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .growth-bar:hover .bar-tooltip {
      opacity: 1;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 16px;
    }
    
    .legend-item {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .legend-item.donors { color: #2196f3; }
    .legend-item.ngos { color: #ff9800; }
    
    .performers-section {
      margin-bottom: 20px;
    }
    
    .performer-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .performer-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .performer-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .performer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .rank {
      width: 24px;
      height: 24px;
      background: #d32f2f;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    
    .performer-info {
      flex: 1;
    }
    
    .performer-name {
      font-weight: 500;
      color: #333;
    }
    
    .performer-stats {
      font-size: 12px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .chart-row,
      .performer-row {
        grid-template-columns: 1fr;
      }
      
      .overview-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AnalyticsDashboardDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AnalyticsDashboardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  getBarHeight(amount: number, data: any[]): number {
    if (!data || data.length === 0) return 10;
    const maxAmount = Math.max(...data.map(item => item.amount));
    if (maxAmount === 0) return 10;
    return Math.max((amount / maxAmount) * 100, 10);
  }

  formatAmount(amount: number): string {
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'k';
    }
    return amount.toString();
  }

  getGrowthHeight(value: number, data: any[]): number {
    if (!data || data.length === 0) return 10;
    const maxValue = Math.max(...data.flatMap(item => [item.donors, item.ngos]));
    if (maxValue === 0) return 10;
    return Math.max((value / maxValue) * 100, 10);
  }

  exportAnalytics() {
    const reportData = {
      title: 'HeartBridge Analytics Report',
      generatedAt: new Date().toLocaleString(),
      overview: this.data.overview,
      topPerformers: this.data.topPerformers
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `heartbridge-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
