import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private http: HttpClient) { }

  getLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Leaves`);
  }

  getPendingLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Leaves/pending`);
  }

  applyLeave(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Leaves/apply`, data);
  }

  approveLeave(id: number, managerId: number): Observable<any> {
    return this.http.put(`${API_URL}/Leaves/approve/${id}?managerId=${managerId}`, {});
  }

  rejectLeave(id: number, managerId: number): Observable<any> {
    return this.http.put(`${API_URL}/Leaves/reject/${id}?managerId=${managerId}`, {});
  }

  cancelLeave(id: number): Observable<any> {
    return this.http.put(`${API_URL}/Leaves/cancel/${id}`, {});
  }
}
