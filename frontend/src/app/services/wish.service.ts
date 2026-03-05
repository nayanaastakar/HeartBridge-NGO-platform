import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class WishService {
  constructor(private http: HttpClient) { }

  getWishes(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/wishes`, { params: filters });
  }

  getWishById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/wishes/${id}`);
  }

  createWish(wishData: any): Observable<any> {
    return this.http.post(`${API_URL}/wishes`, wishData);
  }

  updateWish(id: string, wishData: any): Observable<any> {
    return this.http.put(`${API_URL}/wishes/${id}`, wishData);
  }

  deleteWish(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/wishes/${id}`);
  }

  getActiveWishes(): Observable<any> {
    return this.http.get(`${API_URL}/wishes/active`);
  }
}

