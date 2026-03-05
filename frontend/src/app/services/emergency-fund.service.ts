import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class EmergencyFundService {
  constructor(private http: HttpClient) { }

  getEmergencyFunds(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/emergency-funds`, { params: filters });
  }

  getEmergencyFundById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/emergency-funds/${id}`);
  }

  createEmergencyFund(fundData: any): Observable<any> {
    return this.http.post(`${API_URL}/emergency-funds`, fundData);
  }

  updateEmergencyFund(id: string, fundData: any): Observable<any> {
    return this.http.put(`${API_URL}/emergency-funds/${id}`, fundData);
  }

  deleteEmergencyFund(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/emergency-funds/${id}`);
  }

  getActiveEmergencyFunds(): Observable<any> {
    return this.http.get(`${API_URL}/emergency-funds/active`);
  }

  uploadProofDocument(fundId: string, formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/emergency-funds/${fundId}/proof-document`, formData);
  }

  getProofDocument(fundId: string): Observable<any> {
    return this.http.get(`${API_URL}/emergency-funds/${fundId}/proof-document`);
  }

  deleteProofDocument(fundId: string): Observable<any> {
    return this.http.delete(`${API_URL}/emergency-funds/${fundId}/proof-document`);
  }
}

