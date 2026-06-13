import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private http: HttpClient) { }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Clients`);
  }

  getClient(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/Clients/${id}`);
  }

  addClient(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Clients`, data);
  }

  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/Clients/${id}`, data);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/Clients/${id}`, { responseType: 'text' as 'json' });
  }
}
