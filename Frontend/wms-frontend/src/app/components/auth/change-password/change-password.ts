import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword implements OnInit {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (localStorage.getItem('needsPasswordChange') !== 'true') {
      const role = this.authService.getRole();
      if (role === 'Employee') {
        this.router.navigate(['/attendance']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  togglePassword(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentPassword.trim() || !this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirmation password do not match.';
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.errorMessage = 'New password cannot be the same as your current password.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long.';
      return;
    }

    this.isLoading = true;

    const data = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.authService.changePassword(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully! Redirecting...';
        
        // Mark as changed in local storage
        localStorage.setItem('needsPasswordChange', 'false');

        // Redirect after a short delay
        setTimeout(() => {
          const role = this.authService.getRole();
          if (role === 'Employee') {
            this.router.navigate(['/attendance']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error || 'Failed to change password. Please check your current password and try again.';
      }
    });
  }
}
