import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  username: string | null = '';
  role: string | null = '';

  constructor(private auth: Auth, private router: Router) {
    this.username = this.auth.getUsername();
    this.role = this.auth.getRole();
  }

  getInitials(): string {
    if (!this.username) return 'U';
    const parts = this.username.trim().split(/[\s_@]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
