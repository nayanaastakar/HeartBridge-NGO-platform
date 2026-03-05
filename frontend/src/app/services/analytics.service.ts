import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) { }

  getPlatformStats(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/platform`);
  }

  getDetailedAnalytics(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/detailed`);
  }

  getDonationTrend(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/donation-trend`);
  }

  getDonationSizeBreakdown(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/donation-size-breakdown`);
  }

  getUserGrowth(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/user-growth`);
  }

  getTopNGOs(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/top-ngos`);
  }

  getTopDonors(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/top-donors`);
  }

  getNGODashboard(ngoId: string): Observable<any> {
    return this.http.get(`${API_URL}/analytics/ngo/${ngoId}`);
  }

  getDonorDashboard(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/donor`);
  }
}
