import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ImpactUpdateService {
  constructor(private http: HttpClient) { }

  getImpactUpdates(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/impact-updates`, { params: filters });
  }

  getFeaturedImpactUpdates(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/impact-updates/featured`, { params: filters });
  }

  getNGOImpactUpdates(ngoId: string, filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/impact-updates/ngo/${ngoId}`, { params: filters });
  }

  getDonorImpactUpdates(filters?: any): Observable<any> {
    return this.http.get(`${API_URL}/impact-updates/my-impacts`, { params: filters });
  }

  createImpactUpdate(updateData: any): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates`, updateData);
  }

  publishImpactUpdate(id: string): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/publish`, {});
  }

  uploadImpactImages(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/upload-images`, formData);
  }

  tagDonors(id: string, donorTags: any[]): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/tag-donors`, { donorTags });
  }

  likeImpactUpdate(id: string): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/like`, {});
  }

  commentOnImpactUpdate(id: string, comment: string): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/comment`, { comment });
  }

  shareImpactUpdate(id: string): Observable<any> {
    return this.http.post(`${API_URL}/impact-updates/${id}/share`, {});
  }

  getImpactStats(ngoId?: string): Observable<any> {
    const params: any = {};
    if (ngoId) {
      params.ngoId = ngoId;
    }
    return this.http.get(`${API_URL}/impact-updates/stats`, { params });
  }

  deleteImpactUpdate(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/impact-updates/${id}`);
  }
}
