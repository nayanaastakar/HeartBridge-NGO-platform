import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ImpactStoryService {
  private apiUrl = `${API_URL}/impact-stories`;

  constructor(private http: HttpClient) { }

  /**
   * Get all impact stories with pagination and filtering
   */
  getAllImpactStories(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get impact stories by specific NGO
   */
  getImpactStoriesByNGO(ngoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ngo/${ngoId}`);
  }

  /**
   * Get single impact story details
   */
  getImpactStory(storyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${storyId}`);
  }

  /**
   * Create new impact story (NGO Admin only)
   */
  createImpactStory(storyData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, storyData);
  }

  /**
   * Update impact story (NGO Admin only)
   */
  updateImpactStory(storyId: string, storyData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${storyId}`, storyData);
  }

  /**
   * Delete impact story (NGO Admin only)
   */
  deleteImpactStory(storyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${storyId}`);
  }

  /**
   * Like/unlike an impact story
   */
  likeImpactStory(storyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${storyId}/like`, {});
  }

  /**
   * Share an impact story
   */
  shareImpactStory(storyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${storyId}/share`, {});
  }

  /**
   * Get featured impact stories
   */
  getFeaturedImpactStories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/featured`);
  }

  /**
   * Upload before photo
   */
  uploadBeforePhoto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('beforePhoto', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/upload-before-photo`, formData);
  }

  /**
   * Upload after photo
   */
  uploadAfterPhoto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('afterPhoto', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/upload-after-photo`, formData);
  }
}
