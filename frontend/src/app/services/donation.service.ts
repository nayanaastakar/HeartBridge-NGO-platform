import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient) { }

  createDonation(donationData: any): Observable<any> {
    return this.http.post(`${API_URL}/donations`, donationData);
  }

  getMyDonations(): Observable<any> {
    return this.http.get(`${API_URL}/donations/my-donations`);
  }

  getNGODonations(ngoId: string): Observable<any> {
    return this.http.get(`${API_URL}/donations/ngo/${ngoId}`);
  }

  getDonationStats(ngoId?: string): Observable<any> {
    let params = new HttpParams();
    if (ngoId) {
      params = params.set('ngoId', ngoId);
    }
    return this.http.get(`${API_URL}/donations/stats`, { params });
  }

  getMonthlyDonations(ngoId?: string): Observable<any> {
    let params = new HttpParams();
    if (ngoId) {
      params = params.set('ngoId', ngoId);
    }
    return this.http.get(`${API_URL}/donations/monthly`, { params });
  }

  getCategoryWiseDonations(): Observable<any> {
    return this.http.get(`${API_URL}/donations/category-wise`);
  }

  // Razorpay Methods
  createRazorpayOrder(amount: number): Observable<any> {
    return this.http.post(`${API_URL}/payments/create-order`, { amount });
  }

  verifyRazorpayPayment(paymentData: any): Observable<any> {
    return this.http.post(`${API_URL}/payments/verify`, paymentData);
  }
}

