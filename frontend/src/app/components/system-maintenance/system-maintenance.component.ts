import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SystemMaintenanceService } from '../../services/system-maintenance.service';

@Component({
  selector: 'app-system-maintenance',
  templateUrl: './system-maintenance.component.html',
  styleUrls: ['./system-maintenance.component.scss']
})
export class SystemMaintenanceComponent implements OnInit {
  systemHealth: any = {};
  maintenanceLogs: any[] = [];
  collections: any[] = [];
  loading = false;

  // Forms
  clearDataForm: FormGroup;
  logFilterForm: FormGroup;

  // UI State
  activeTab = 0;
  selectedCollections: string[] = [];
  logStats: any = {};

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private maintenanceService: SystemMaintenanceService
  ) {
    this.clearDataForm = this.fb.group({
      collections: [[], Validators.required],
      confirm: [false, Validators.requiredTrue]
    });

    this.logFilterForm = this.fb.group({
      level: [''],
      action: [''],
      startDate: [''],
      endDate: [''],
      limit: [100],
      offset: [0]
    });
  }

  ngOnInit() {
    this.loadSystemHealth();
    this.loadCollections();
    this.loadLogs();
  }

  loadSystemHealth() {
    this.loading = true;
    this.maintenanceService.getSystemHealth().subscribe({
      next: (response: any) => {
        this.systemHealth = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to load system health', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadCollections() {
    this.maintenanceService.getCollections().subscribe({
      next: (response: any) => {
        this.collections = response.data;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to load collections', 'Close', { duration: 3000 });
      }
    });
  }

  loadLogs() {
    this.loading = true;
    const filters = this.logFilterForm.value;

    this.maintenanceService.viewLogs(filters).subscribe({
      next: (response: any) => {
        this.maintenanceLogs = response.data.logs;
        this.logStats = response.data.stats;
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to load logs', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  clearCache() {
    this.loading = true;
    this.maintenanceService.clearCache().subscribe({
      next: (response: any) => {
        this.snackBar.open('Cache cleared successfully', 'Close', { duration: 3000 });
        this.loadSystemHealth();
        this.loadLogs();
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to clear cache', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  clearData() {
    if (this.clearDataForm.invalid) {
      this.snackBar.open('Please select collections and confirm', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const { collections } = this.clearDataForm.value;

    this.maintenanceService.clearData({ collections, confirm: true }).subscribe({
      next: (response: any) => {
        this.snackBar.open(`Data cleared: ${response.data.totalDeleted} records`, 'Close', { duration: 5000 });
        this.loadCollections();
        this.loadLogs();
        this.clearDataForm.reset();
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to clear data', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  backupData() {
    this.loading = true;
    this.maintenanceService.backupData().subscribe({
      next: (response: any) => {
        this.snackBar.open('Backup created successfully', 'Close', { duration: 3000 });
        this.loadLogs();
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to create backup', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  resetStats() {
    this.loading = true;
    this.maintenanceService.resetStats().subscribe({
      next: (response: any) => {
        this.snackBar.open('Statistics reset successfully', 'Close', { duration: 3000 });
        this.loadLogs();
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to reset statistics', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  checkDatabase() {
    this.loading = true;
    this.maintenanceService.checkDatabase().subscribe({
      next: (response: any) => {
        this.snackBar.open('Database check completed', 'Close', { duration: 3000 });
        this.loadSystemHealth();
        this.loadLogs();
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to check database', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onTabChange(index: number) {
    this.activeTab = index;

    // Refresh data when switching tabs
    if (index === 0) this.loadSystemHealth();
    if (index === 1) this.loadLogs();
    if (index === 2) this.loadCollections();
  }

  onCollectionToggle(collection: any, event: any) {
    const checkbox = event.source;
    const value = checkbox.value;

    if (checkbox.checked) {
      this.selectedCollections.push(value);
    } else {
      const index = this.selectedCollections.indexOf(value);
      if (index > -1) {
        this.selectedCollections.splice(index, 1);
      }
    }

    this.clearDataForm.patchValue({ collections: this.selectedCollections });
  }

  applyLogFilters() {
    this.loadLogs();
  }

  resetLogFilters() {
    this.logFilterForm.reset({
      level: '',
      action: '',
      startDate: '',
      endDate: '',
      limit: 100,
      offset: 0
    });
    this.loadLogs();
  }

  getLogLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return 'error';
      case 'WARN': return 'warning';
      case 'INFO': return 'info';
      default: return 'default';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getCollectionIcon(collection: string): string {
    const icons: { [key: string]: string } = {
      'users': 'people',
      'ngos': 'business',
      'donations': 'payments',
      'wishes': 'favorite',
      'impactUpdates': 'trending_up',
      'emergencyFunds': 'emergency',
      'discussions': 'forum'
    };
    return icons[collection] || 'storage';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatLogDetails(details: any): string {
    if (!details) return 'No details';
    if (typeof details === 'string') return details;

    // If it's an object, transform to a readable string instead of JSON
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(' | ');
  }
}
