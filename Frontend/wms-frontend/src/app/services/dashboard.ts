import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({
  providedIn: 'root'
})
export class Dashboard {
  constructor(private http: HttpClient) { }

  getSummary(): Observable<any> {
    return this.http.get(`${API_URL}/Dashboard/summary`);
  }

  getLeaveStatistics(): Observable<any> {
    return this.http.get(`${API_URL}/Dashboard/leave-statistics`);
  }

  getProjectStatistics(): Observable<any> {
    return this.http.get(`${API_URL}/Dashboard/project-statistics`);
  }
}
