import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmergencyIncidentService {
  private baseUrl = '/api/v1/emergency-incidents';

  constructor(private http: HttpClient) {}

  getIncidents(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(this.baseUrl, { params: httpParams });
  }

  getIncident(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createIncident(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateIncident(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  addUpdate(id: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/updates`, data);
  }

  respondToIncident(id: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/respond`, data);
  }
}
