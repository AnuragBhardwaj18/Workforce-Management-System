import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) { }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Projects`);
  }

  addProject(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Projects`, data);
  }

  getAllocations(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/ProjectAllocations`);
  }

  assignEmployee(data: any): Observable<any> {
    return this.http.post(`${API_URL}/ProjectAllocations/assign`, data);
  }

  removeAllocation(allocationId: number, updatedBy: string): Observable<any> {
    return this.http.put(`${API_URL}/ProjectAllocations/remove/${allocationId}?updatedBy=${encodeURIComponent(updatedBy)}`, {});
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/Projects/${id}`, { responseType: 'text' as 'json' });
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/Projects/${id}`, data);
  }
}
