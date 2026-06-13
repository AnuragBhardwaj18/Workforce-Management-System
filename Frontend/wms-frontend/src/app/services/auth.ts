import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { API_URL } from '../shared/api.config';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private loginStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private http: HttpClient) { }

  login(data: LoginModel): Observable<any> {
    return this.http.post(`${API_URL}/Auth/login`, data);
  }

  saveLoginData(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('username', response.username);
    localStorage.setItem('needsPasswordChange', response.needsPasswordChange ? 'true' : 'false');
    this.loginStatus.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${API_URL}/Auth/change-password`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('needsPasswordChange');
    this.loginStatus.next(false);
  }
}
