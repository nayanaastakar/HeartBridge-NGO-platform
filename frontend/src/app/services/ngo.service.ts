import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NGOService {
  constructor(private http: HttpClient) { }

  getNGOs(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/ngos`, { params: filters });
  }

  getNGOById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/ngos/${id}`);
  }

  createNGO(ngoData: any): Observable<any> {
    return this.http.post(`${API_URL}/ngos`, ngoData);
  }

  updateNGO(id: string, ngoData: any): Observable<any> {
    return this.http.put(`${API_URL}/ngos/${id}`, ngoData);
  }

  getMyNGO(): Observable<any> {
    return this.http.get(`${API_URL}/ngos/me/mine`);
  }

  uploadLogo(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`${API_URL}/ngos/${id}/upload-logo`, formData);
  }

  uploadDocument(id: string, file: File, title: string): Observable<any> {
    const formData = new FormData();
    formData.append('proof-document', file);
    formData.append('title', title);
    return this.http.post(`${API_URL}/ngos/${id}/upload-document`, formData);
  }

  uploadBanner(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('banner', file);
    return this.http.post(`${API_URL}/ngos/${id}/upload-banner`, formData);
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    // Prepend API base for local uploads
    // In dev with proxy, this will be /uploads/...
    const baseUrl = API_URL.replace('/api/v1', '');
    return `${baseUrl}${path}`;
  }
}

