import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemMaintenanceService {
  private baseUrl = 'http://localhost:3000/api/v1/system-maintenance';

  constructor(private http: HttpClient) {}

  // System Health
  getSystemHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Database Operations
  checkDatabase(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-database`);
  }

  // Cache Operations
  clearCache(): Observable<any> {
    return this.http.post(`${this.baseUrl}/clear-cache`, {});
  }

  // Data Management
  clearData(data: { collections: string[], confirm: boolean }): Observable<any> {
    return this.http.post(`${this.baseUrl}/clear-data`, data);
  }

  getCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections`);
  }

  // Backup Operations
  backupData(): Observable<any> {
    return this.http.post(`${this.baseUrl}/backup-data`, {});
  }

  // Statistics
  resetStats(): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-stats`, {});
  }

  // Logs
  viewLogs(filters?: any): Observable<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.set(key, filters[key]);
        }
      });
    }
    
    return this.http.get(`${this.baseUrl}/view-logs?${params.toString()}`);
  }
}
