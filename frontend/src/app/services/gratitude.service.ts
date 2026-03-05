import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GratitudeService {
  constructor(private http: HttpClient) { }

  getGratitudeWall(limit?: number): Observable<any> {
    let params = new HttpParams();
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get(`${API_URL}/gratitude/wall`, { params });
  }

  getGratitudeMessages(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/gratitude`, { params: filters });
  }

  getGratitudeById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/gratitude/${id}`);
  }

  createGratitude(gratitudeData: any): Observable<any> {
    return this.http.post(`${API_URL}/gratitude`, gratitudeData);
  }

  updateGratitude(id: string, gratitudeData: any): Observable<any> {
    return this.http.put(`${API_URL}/gratitude/${id}`, gratitudeData);
  }

  deleteGratitude(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/gratitude/${id}`);
  }
}

