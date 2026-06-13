import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  fillCredentials(role: 'admin' | 'manager' | 'employee'): void {
    const credentialsMap: Record<string, { username: string; password: string }> = {
      admin: { username: 'admin@wms.com', password: 'Admin@123' },
      manager: { username: 'manager', password: 'Password123' },
      employee: { username: 'employee', password: 'Password123' }
    };
    const creds = credentialsMap[role];
    this.username = creds.username;
    this.password = creds.password;
    this.errorMessage = '';
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.isLoading = true;

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.authService.saveLoginData(response);
        this.isLoading = false;

        if (response.needsPasswordChange) {
          this.router.navigate(['/change-password']);
          this.cd.detectChanges();
          return;
        }

        const role = response.role;

        if (role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Manager') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Employee') {
          this.router.navigate(['/attendance']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.cd.detectChanges();
      },

      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Wrong username or password';
        this.cd.detectChanges();
      }
    });
  }
}
