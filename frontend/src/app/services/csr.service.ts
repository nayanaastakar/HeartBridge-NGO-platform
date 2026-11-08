import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsrService {
  private baseUrl = '/api/v1/corporate';

  constructor(private http: HttpClient) {}

  registerCorporate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getMyCorporate(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  getGrants(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(`${this.baseUrl}/grants`, { params: httpParams });
  }

  getGrant(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/grants/${id}`);
  }

  createGrant(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/grants`, data);
  }

  applyForGrant(grantId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/grants/apply`, { grantId, ...data });
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/mine`);
  }

  getReceivedApplications(grantId?: string): Observable<any> {
    const params = grantId ? new HttpParams().set('grantId', grantId) : {};
    return this.http.get(`${this.baseUrl}/applications/received`, { params });
  }

  reviewApplication(appId: string, status: string, feedback: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/applications/${appId}/review`, { status, reviewNotes: feedback });
  }
}
