import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl = '/api/v1/ai';

  constructor(private http: HttpClient) {}

  askAssistant(query: string, context?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/assistant`, { query, context });
  }

  forecastDonations(months: number = 6): Observable<any> {
    return this.http.post(`${this.baseUrl}/forecast-donations`, { months });
  }

  predictCampaignSuccess(campaignData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/predict-campaign`, campaignData);
  }

  detectAnomalies(): Observable<any> {
    return this.http.post(`${this.baseUrl}/detect-anomalies`, {});
  }

  getImpactScore(ngoId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/impact-score/${ngoId}`);
  }
}
