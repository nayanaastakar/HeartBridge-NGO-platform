import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VolunteerService {
  private baseUrl = '/api/v1/volunteers';

  constructor(private http: HttpClient) {}

  registerVolunteer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile/me`, data);
  }

  getTasks(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k]) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(`${this.baseUrl}/tasks`, { params: httpParams });
  }

  applyForTask(taskId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks/${taskId}/apply`, {});
  }

  createTask(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks`, data);
  }

  updateTask(taskId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${taskId}`, data);
  }

  logHours(taskId: string, hours: number, notes: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks/${taskId}/log-hours`, { hours, notes });
  }

  getVolunteers(ngoId?: string): Observable<any> {
    const params = ngoId ? new HttpParams().set('ngoId', ngoId) : {};
    return this.http.get(`${this.baseUrl}`, { params });
  }
}
