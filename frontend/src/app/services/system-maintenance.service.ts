import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = `${environment.apiUrl}/system-maintenance`;

@Injectable({
    providedIn: 'root'
})
export class SystemMaintenanceService {
    constructor(private http: HttpClient) { }

    getSystemHealth(): Observable<any> {
        return this.http.get(`${API_URL}/health`);
    }

    getCollections(): Observable<any> {
        return this.http.get(`${API_URL}/check-database`);
    }

    viewLogs(filters: any): Observable<any> {
        return this.http.get(`${API_URL}/view-logs`, { params: filters });
    }

    clearCache(): Observable<any> {
        return this.http.post(`${API_URL}/clear-cache`, {});
    }

    backupData(): Observable<any> {
        return this.http.post(`${API_URL}/backup-data`, {});
    }

    resetStats(): Observable<any> {
        return this.http.post(`${API_URL}/reset-stats`, {});
    }

    checkDatabase(): Observable<any> {
        return this.http.get(`${API_URL}/check-database`);
    }

    clearData(payload: { collections: string[]; confirm: boolean }): Observable<any> {
        return this.http.post(`${API_URL}/clear-data`, payload);
    }
}
