import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private http: HttpClient) { }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/AuditLogs`);
  }

  getAuditLog(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/AuditLogs/${id}`);
  }

  getLogsByEntity(entityName: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/AuditLogs/entity/${entityName}`);
  }
}
