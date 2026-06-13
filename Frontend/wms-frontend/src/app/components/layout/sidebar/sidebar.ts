import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  role = localStorage.getItem('role');

  isAdmin(): boolean {
    return this.role === 'Admin';
  }

  isManager(): boolean {
    return this.role === 'Manager';
  }

  isEmployee(): boolean {
    return this.role === 'Employee';
  }
}
