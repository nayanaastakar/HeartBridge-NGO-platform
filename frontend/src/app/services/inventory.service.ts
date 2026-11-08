import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private baseUrl = '/api/v1/inventory';

  constructor(private http: HttpClient) {}

  getItems(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] !== undefined) httpParams = httpParams.set(k, params[k]); });
    }
    return this.http.get(this.baseUrl, { params: httpParams });
  }

  getItem(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createItem(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateItem(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  addTransaction(itemId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${itemId}/transactions`, data);
  }

  getLowStock(): Observable<any> {
    return this.http.get(`${this.baseUrl}/alerts/low-stock`);
  }

  getTransactions(itemId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${itemId}/transactions`);
  }
}
