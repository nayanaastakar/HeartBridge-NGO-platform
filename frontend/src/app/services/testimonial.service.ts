import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private baseUrl = `${environment.apiUrl}/testimonials`;

  constructor(private http: HttpClient) { }

  getTestimonials(ngoId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ngo/${ngoId}`);
  }

  getTestimonial(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createTestimonial(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateTestimonial(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  likeTestimonial(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/like`, {});
  }
}
