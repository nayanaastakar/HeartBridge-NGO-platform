import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsrService {
  private corporateUrl = '/api/v1/corporate';
  private grantsUrl = '/api/v1/grants';

  constructor(private http: HttpClient) {}

  registerCorporate(data: any): Observable<any> {
    return this.http.post(`${this.corporateUrl}/register`, data);
  }

  getMyCorporate(): Observable<any> {
    return this.http.get(`${this.corporateUrl}/me`);
  }

  getGrants(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(this.grantsUrl, { params: httpParams });
  }

  getGrant(id: string): Observable<any> {
    return this.http.get(`${this.grantsUrl}/${id}`);
  }

  createGrant(data: any): Observable<any> {
    return this.http.post(this.grantsUrl, data);
  }

  applyForGrant(grantId: string, data: any): Observable<any> {
    return this.http.post(`${this.grantsUrl}/${grantId}/apply`, data);
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.grantsUrl}/my-applications`);
  }

  updateApplicationStatus(appId: string, status: string, notes: string): Observable<any> {
    return this.http.put(`${this.grantsUrl}/applications/${appId}/status`, { status, notes });
  }
}
