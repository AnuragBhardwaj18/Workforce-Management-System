import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) { }

  employeeReport(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Reports/employee-report`);
  }

  leaveReport(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Reports/leave-report`);
  }

  projectAllocationReport(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Reports/project-allocation-report`);
  }
}
