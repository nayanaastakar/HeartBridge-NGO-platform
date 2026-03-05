import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AdoptADayService {
  constructor(private http: HttpClient) { }

  getAdoptADays(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/adopt-a-day`, { params: filters });
  }

  getAdoptADayById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/adopt-a-day/${id}`);
  }

  createAdoptADay(adoptData: any): Observable<any> {
    return this.http.post(`${API_URL}/adopt-a-day`, adoptData);
  }

  updateAdoptADay(id: string, adoptData: any): Observable<any> {
    return this.http.put(`${API_URL}/adopt-a-day/${id}`, adoptData);
  }

  deleteAdoptADay(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/adopt-a-day/${id}`);
  }

  getAvailableDays(): Observable<any> {
    return this.http.get(`${API_URL}/adopt-a-day/available`);
  }

  adoptDay(id: string, amount: number): Observable<any> {
    return this.http.post(`${API_URL}/adopt-a-day/${id}/adopt`, { amount });
  }
}

