import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataPreviewDialogComponent } from '../data-preview-dialog/data-preview-dialog.component';
import { environment } from '../../config';

const API_URL = environment.apiUrl;
@Component({
  selector: 'app-system-maintenance-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>build</mat-icon> System Maintenance
      </h2>
      
      <mat-dialog-content>
        <div class="maintenance-grid">
          <button mat-raised-button color="primary" (click)="executeAction('Clear Cache')">
            <mat-icon>cleaning_services</mat-icon> Clear Cache
          </button>
          
          <button mat-raised-button color="accent" (click)="executeAction('Check Database')">
            <mat-icon>storage</mat-icon> Check Database
          </button>
          
          <button mat-raised-button class="view-logs-btn" (click)="executeAction('View Logs')">
            <mat-icon>assignment</mat-icon> View Logs
          </button>
          
          <button mat-raised-button class="backup-btn" (click)="executeAction('Backup Data')">
            <mat-icon>backup</mat-icon> Backup Data
          </button>
          
          <button mat-stroked-button color="warn" (click)="executeAction('Reset Stats')">
            <mat-icon>restart_alt</mat-icon> Reset Statistics
          </button>
        </div>

        <div *ngIf="loading" class="loading-overlay">
           <mat-spinner diameter="40"></mat-spinner>
           <p>Processing request...</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { position: relative; padding: 10px; }
    h2 { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #333; }
    .maintenance-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 16px; 
      padding-bottom: 20px; 
    }
    button { 
      height: 60px; 
      font-size: 1rem; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      gap: 8px;
    }
    .backup-btn { background-color: #2e7d32; color: white; }
    .view-logs-btn { background-color: #455a64; color: white; }
    
    .loading-overlay { 
      position: absolute; 
      top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(255,255,255,0.9); 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      z-index: 100;
      border-radius: 4px;
    }
    .loading-overlay p { margin-top: 16px; font-weight: 500; color: #555; }
  `]
})
export class SystemMaintenanceDialogComponent implements OnInit {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<SystemMaintenanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.fetchSystemHealth();
  }

  fetchSystemHealth() {
    this.http.get(`${API_URL}/system-maintenance/health`).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.data.systemHealth = {
            database: response.data.database,
            api: response.data.api,
            lastBackup: response.data.lastBackup,
            uptime: response.data.uptime
          };
          this.data.systemInfo = {
            version: response.data.version,
            environment: response.data.environment,
            nodeVersion: response.data.nodeVersion,
            mongodb: response.data.database
          };
        }
      },
      error: (err) => {
        console.error('Error fetching system health', err);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  executeAction(actionName: string) {
    console.log('Executing action:', actionName);
    this.loading = true;

    // Helper to open the generic result dialog
    const openResultDialog = (title: string, responseData: any) => {
      this.dialog.open(DataPreviewDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: {
          title: title,
          content: responseData
        }
      });
    };

    switch (actionName) {
      case 'Clear Catch': // Handling typo from voice input
      case 'Clear Cache':
        this.http.post(`${API_URL}/system-maintenance/clear-cache`, {}).subscribe({
          next: (response: any) => {
            this.loading = false;
            this.snackBar.open('Cache cleared successfully', 'Close', { duration: 3000 });
            openResultDialog('Cache Cleaned', response.data);
          },
          error: (err) => {
            this.loading = false;
            console.error('Cache clear error', err);
            this.snackBar.open('Error clearing cache', 'Close', { duration: 3000 });
          }
        });
        break;

      case 'Check Database':
        this.http.get(`${API_URL}/system-maintenance/check-database`).subscribe({
          next: (response: any) => {
            this.loading = false;
            openResultDialog('Database Health', response.data);
          },
          error: (err) => {
            this.loading = false;
            this.snackBar.open('Error checking database', 'Close', { duration: 3000 });
          }
        });
        break;

      case 'View Logs':
        this.http.get(`${API_URL}/system-maintenance/view-logs`).subscribe({
          next: (response: any) => {
            this.loading = false;
            openResultDialog('System Logs', response.data);
          },
          error: (err) => {
            this.loading = false;
            this.snackBar.open('Error retrieving logs', 'Close', { duration: 3000 });
          }
        });
        break;

      case 'Backup':
      case 'Backup Data':
        this.http.post(`${API_URL}/system-maintenance/backup-data`, {}).subscribe({
          next: (response: any) => {
            this.loading = false;
            this.snackBar.open('Backup created successfully', 'Close', { duration: 3000 });
            openResultDialog('Backup Details', response.data);
          },
          error: (err) => {
            this.loading = false;
            this.snackBar.open('Backup failed', 'Close', { duration: 3000 });
          }
        });
        break;

      case 'Reset Stats':
        this.http.post(`${API_URL}/system-maintenance/reset-stats`, {}).subscribe({
          next: (response: any) => {
            this.loading = false;
            this.snackBar.open('Statistics reset successfully', 'Close', { duration: 3000 });
            openResultDialog('Statistics Reset', response.data);
          },
          error: (err) => {
            this.loading = false;
            this.snackBar.open('Error resetting stats', 'Close', { duration: 3000 });
          }
        });
        break;

      default:
        this.loading = false;
        this.snackBar.open('Action executed', 'Close', { duration: 3000 });
        break;
    }
  }
}
