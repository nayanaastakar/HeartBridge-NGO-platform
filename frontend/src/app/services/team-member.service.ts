import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private baseUrl = `${environment.apiUrl}/team-members`;

  constructor(private http: HttpClient) { }

  getTeamMembers(ngoId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ngo/${ngoId}`);
  }

  getTeamMember(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createTeamMember(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateTeamMember(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteTeamMember(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
