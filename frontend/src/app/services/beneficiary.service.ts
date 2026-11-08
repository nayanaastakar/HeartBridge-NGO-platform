import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BeneficiaryService {
  private baseUrl = '/api/v1/beneficiaries';
  private casesUrl = '/api/v1/cases';

  constructor(private http: HttpClient) {}

  getBeneficiaries(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(this.baseUrl, { params: httpParams });
  }

  getBeneficiary(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createBeneficiary(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateBeneficiary(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  getCases(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(this.casesUrl, { params: httpParams });
  }

  getCase(id: string): Observable<any> {
    return this.http.get(`${this.casesUrl}/${id}`);
  }

  createCase(data: any): Observable<any> {
    return this.http.post(this.casesUrl, data);
  }

  updateCase(id: string, data: any): Observable<any> {
    return this.http.put(`${this.casesUrl}/${id}`, data);
  }

  addCaseNote(id: string, note: string): Observable<any> {
    return this.http.post(`${this.casesUrl}/${id}/notes`, { note });
  }
}
