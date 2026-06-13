import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  constructor(private http: HttpClient) { }

  getAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Announcements`);
  }

  getActiveAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Announcements/active`);
  }

  addAnnouncement(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Announcements`, data);
  }

  updateAnnouncement(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/Announcements/${id}`, data);
  }

  deactivateAnnouncement(id: number): Observable<any> {
    return this.http.put(`${API_URL}/Announcements/deactivate/${id}`, {}, { responseType: 'text' });
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/Announcements/${id}`, { responseType: 'text' });
  }
}
