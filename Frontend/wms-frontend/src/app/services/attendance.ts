import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private http: HttpClient) { }

  getAttendance(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Attendances`);
  }

  checkIn(empId: number, workMode: string): Observable<any> {
    return this.http.post(`${API_URL}/Attendances/check-in?empId=${empId}&workMode=${workMode}`, {});
  }

  checkOut(empId: number): Observable<any> {
    return this.http.post(`${API_URL}/Attendances/check-out?empId=${empId}`, {});
  }
}
