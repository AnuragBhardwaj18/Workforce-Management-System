import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient) { }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Employees`);
  }

  addEmployee(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Employees`, data);
  }

  updateEmployee(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/Employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/Employees/${id}`, { responseType: 'text' as 'json' });
  }

  searchEmployee(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Employees/search?keyword=${keyword}`);
  }
}
