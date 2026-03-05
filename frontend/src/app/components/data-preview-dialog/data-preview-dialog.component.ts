import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-preview-dialog',
  template: `
    <div class="elegant-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button mat-icon-button (click)="closeDialog()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <!-- Generic Data Viewer (Used for Profile etc) -->
        <div *ngIf="isGenericData()" class="generic-data-view">
          <div *ngFor="let section of data.content | keyvalue" class="data-section-card">
            <h3 class="section-subtitle">{{ formatKey(section.key) }}</h3>
            <div class="detail-grid" *ngIf="isObject(section.value)">
              <div *ngFor="let item of $any(section.value) | keyvalue" class="detail-item">
                <span class="detail-label">{{ formatKey(item.key) }}</span>
                <span class="detail-value">{{ item.value || 'None' }}</span>
              </div>
            </div>
            <div class="detail-simple" *ngIf="!isObject(section.value)">
              {{ section.value }}
            </div>
          </div>
        </div>

        <!-- Platform Statistics -->
        <div *ngIf="data.content && data.content.systemInfo && !data.content.logs" class="data-section">
          <h3>📊 Platform Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">Total Users:</span>
              <span class="value">{{ getStat(data.content.systemInfo, 'totalUsers', 'users') }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Total NGOs:</span>
              <span class="value">{{ getStat(data.content.systemInfo, 'totalNGOs', 'ngos') }}</span>
            </div>
          </div>
        </div>

        <!-- System Logs -->
        <div *ngIf="data.content && data.content.logs" class="data-section">
          <h3>📋 System Logs</h3>
          <div class="logs-container">
            <div *ngFor="let log of data.content.logs" class="log-entry">
              <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              <span class="log-lvl" [class]="log.level">{{ log.level?.toUpperCase() }}</span>
              <span class="log-msg">{{ log.message }}</span>
            </div>
          </div>
        </div>

        <!-- Backup Details -->
        <div *ngIf="data.content && data.content.backupId" class="data-section">
          <h3>💾 Backup Summary</h3>
          <div class="success-banner">System data summary exported successfully.</div>
          <div class="info-grid">
            <div class="info-item">
               <span class="label">Backup ID:</span>
               <span class="value code-text">{{ data.content.backupId }}</span>
               <button mat-flat-button color="accent" (click)="downloadBackup()" style="margin-top: 10px; width: 100%;">
                 <mat-icon>download</mat-icon> Download JSON
               </button>
            </div>
          </div>
          
          <div *ngIf="data.content.summary" class="stats-grid" style="margin-top: 15px;">
            <div *ngFor="let item of data.content.summary | keyvalue" class="stat-item">
              <span class="label">{{ formatKey(item.key) }}:</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Cache Cleared -->
        <div *ngIf="data.content && data.content.cacheCleared" class="data-section">
          <h3>🧹 Cache Cleared</h3>
          <div class="success-banner">{{ data.content.itemsCleared?.length > 0 ? 'Cache flushed successfully.' : 'Cache is already clean.' }}</div>
          
          <div *ngIf="data.content.itemsCleared && data.content.itemsCleared.length > 0">
            <div class="items-list">
              <span *ngFor="let item of data.content.itemsCleared" class="item-tag">{{ item }}</span>
            </div>
          </div>
          
          <div class="stats-mini-grid" style="margin-top: 15px;">
            <div class="mini-stat">Modules: {{ data.content.modulesCleared ?? 0 }}</div>
            <div class="mini-stat">Logs: {{ data.content.logsCleared ?? 0 }}</div>
            <div class="mini-stat">Temp Files: {{ data.content.tempFilesCleared ?? 0 }}</div>
          </div>
        </div>

        <!-- Database Collections -->
        <div *ngIf="data.content && data.content.collections" class="data-section">
          <h3>🗄️ Database Collections</h3>
          <div class="stats-grid">
            <div *ngFor="let col of data.content.collections | keyvalue" class="stat-item">
              <span class="label">{{ formatKey(col.key) }}:</span>
              <span class="value">{{ col.value ?? '0' }}</span>
            </div>
          </div>
        </div>

        <!-- Advanced Toggle (Removed Raw JSON from direct view) -->
        <div class="advanced-toggle" *ngIf="!isGenericData()">
          <button mat-button (click)="showRaw = !showRaw">
            <mat-icon>{{ showRaw ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showRaw ? 'Hide' : 'Show' }} Technical Details
          </button>
          <div *ngIf="showRaw" class="raw-data-container">
            <pre>{{ formatJson(data.content) }}</pre>
          </div>
        </div>

      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" (click)="closeDialog()">Done</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .elegant-dialog { padding: 16px; min-width: 400px; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; font-weight: 800; color: #1e293b; letter-spacing: -0.02em; }
    
    .generic-data-view { display: flex; flex-direction: column; gap: 20px; }
    .data-section-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .section-subtitle { margin: 0 0 16px 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; word-break: break-all; }
    
    .data-section { margin-bottom: 24px; }
    h3 { font-size: 1.1rem; font-weight: 700; color: #334155; margin-bottom: 16px; }
    
    .logs-container { background: #0f172a; color: #cbd5e1; padding: 16px; border-radius: 12px; max-height: 400px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    .log-entry { padding: 8px 0; border-bottom: 1px solid #1e293b; display: flex; gap: 12px; }
    .log-lvl.error { color: #f87171; }
    .log-lvl.info { color: #60a5fa; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat-item { background: white; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
    .label { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; }
    .value { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
    
    .success-banner { background: #f0fdf4; color: #15803d; padding: 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
    .advanced-toggle { margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px; }
    .raw-data-container { margin-top: 12px; background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 0.75rem; max-height: 200px; overflow-y: auto; }
    
    .items-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .item-tag { background: #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-family: monospace; }
  `]
})
export class DataPreviewDialogComponent {
  showRaw = false;

  constructor(
    public dialogRef: MatDialogRef<DataPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: any }
  ) { }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object';
  }

  isGenericData(): boolean {
    const c = this.data.content;
    if (!c) return false;
    // If it has these specific keys, it's NOT generic (using specialized view)
    return !(c.systemInfo || c.logs || c.backupId || c.cacheCleared || c.collections);
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getStat(obj: any, key1: string, key2: string): any {
    return obj ? (obj[key1] || obj[key2] || 0) : 0;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  downloadBackup() {
    if (!this.data.content) return;
    const dataStr = JSON.stringify(this.data.content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.data.content.backupId || 'heartbridge-backup'}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  formatKey(key: any): string {
    if (!key) return '';
    const s = String(key);
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');
  }
}
