import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private apiUrl = `${environment.apiUrl}/discussions`;

  constructor(private http: HttpClient) { }

  // Get all discussions
  getAllDiscussions(category?: string, search?: string, page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get single discussion
  getDiscussion(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create discussion
  createDiscussion(discussionData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, discussionData);
  }

  // Add reply to discussion
  addReply(discussionId: string, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${discussionId}/reply`, { content });
  }

  // Mark reply as helpful
  markHelpful(discussionId: string, replyId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${discussionId}/mark-helpful`, { replyId });
  }

  // Get discussions by category
  getByCategory(category: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/category/${category}`, { params });
  }

  // Update discussion status
  updateStatus(discussionId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${discussionId}/status`, { status });
  }

  // Delete discussion
  deleteDiscussion(discussionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${discussionId}`);
  }

  // Update discussion
  updateDiscussion(discussionId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${discussionId}`, data);
  }

  // Update reply
  updateReply(discussionId: string, replyId: string, content: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${discussionId}/reply/${replyId}`, { content });
  }

  // Delete reply
  deleteReply(discussionId: string, replyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${discussionId}/reply/${replyId}`);
  }
}
