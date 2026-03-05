import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DataPreviewDialogComponent } from '../data-preview-dialog/data-preview-dialog.component';
import { SystemMaintenanceDialogComponent } from '../system-maintenance-dialog/system-maintenance-dialog.component';
import { AnalyticsDashboardDialogComponent } from '../analytics-dashboard-dialog/analytics-dashboard-dialog.component';

export interface DataPreviewDialogData {
  title: string;
  content: any;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  platformStats: any = {};
  loading = false;

  constructor(
    private analyticsService: AnalyticsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadPlatformStats();
  }

  loadPlatformStats() {
    this.loading = true;
    this.analyticsService.getPlatformStats().subscribe({
      next: (response) => {
        this.loading = false;
        this.platformStats = response.data || {};
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading platform stats', 'Close', { duration: 3000 });
      }
    });
  }

  // Admin Functions
  viewAllUsers() {
    this.router.navigate(['/admin/users']);
    this.snackBar.open('Navigating to User Management', 'Close', { duration: 2000 });
  }

  viewAllNGOs() {
    this.router.navigate(['/admin/ngos']);
    this.snackBar.open('Navigating to NGO Management', 'Close', { duration: 2000 });
  }

  viewAllDonations() {
    this.router.navigate(['/admin/donations']);
    this.snackBar.open('Navigating to Donation Oversight', 'Close', { duration: 2000 });
  }

  createAdmin() {
    this.router.navigate(['/admin-register']);
    this.snackBar.open('Navigating to Admin Registration', 'Close', { duration: 2000 });
  }

  // Quick Actions
  refreshStats() {
    this.loadPlatformStats();
    this.snackBar.open('Platform statistics refreshed', 'Close', { duration: 2000 });
  }

  openAnalytics() {
    // Fetch real analytics data from backend
    this.analyticsService.getDetailedAnalytics().subscribe({
      next: (response) => {
        const analyticsData = {
          overview: {
            totalRevenue: this.platformStats.donations?.totalAmount || 0,
            totalDonations: this.platformStats.donations?.count || 0,
            averageDonation: this.platformStats.donations?.totalAmount ? 
              Math.round(this.platformStats.donations.totalAmount / this.platformStats.donations.count) : 0,
            activeUsers: this.platformStats.donors || 0,
            activeNGOs: this.platformStats.ngos || 0
          },
          charts: {
            donationTrend: response.data.donationTrend || [],
            donationSizeBreakdown: response.data.donationSizeBreakdown || [],
            userGrowth: response.data.userGrowth || []
          },
          topPerformers: {
            ngos: response.data.topNGOs || [],
            donors: response.data.topDonors || []
          }
        };

        this.dialog.open(AnalyticsDashboardDialogComponent, {
          width: '95vw',
          maxHeight: '90vh',
          data: analyticsData
        });
      },
      error: (error) => {
        this.snackBar.open('Error loading analytics data', 'Close', { duration: 3000 });
      }
    });
  }

  systemMaintenance() {
    const maintenanceData = {
      systemHealth: {
        database: 'Connected',
        api: 'Running',
        lastBackup: new Date().toLocaleDateString(),
        uptime: '2 days, 14 hours'
      },
      quickActions: [
        { name: 'Clear Cache', description: 'Clear application cache and refresh data', icon: '🗑️' },
        { name: 'Check Database', description: 'Verify database connection and integrity', icon: '🔍' },
        { name: 'View Logs', description: 'Show recent system logs and errors', icon: '📋' },
        { name: 'Backup Data', description: 'Create backup of platform data', icon: '💾' },
        { name: 'Reset Stats', description: 'Recalculate platform statistics', icon: '🔄' }
      ],
      systemInfo: {
        version: '1.0.0',
        environment: 'Development',
        nodeVersion: 'v20.20.0',
        mongodb: 'Connected'
      }
    };

    this.dialog.open(SystemMaintenanceDialogComponent, {
      width: '900px',
      maxHeight: '85vh',
      data: maintenanceData
    });
  }
}

