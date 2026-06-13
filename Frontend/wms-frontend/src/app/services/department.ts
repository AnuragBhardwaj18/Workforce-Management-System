import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Departments`);
  }

  addDepartment(data: any): Observable<any> {
    const payload = {
      departmentName: data.departmentName,
      description: data.description
    };

    console.log('POST payload:', payload);

    return this.http.post(`${API_URL}/Departments`, payload);
  }

  updateDepartment(id: number, data: any): Observable<any> {
    const payload = {
      departmentName: data.departmentName,
      description: data.description
    };

    return this.http.put(`${API_URL}/Departments/${id}`, payload);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/Departments/${id}`, {
      responseType: 'text'
    });
  }
}
