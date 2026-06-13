import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../shared/api.config';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  totalEmployees = 0;
  activeEmployees = 0;
  presentToday = 0;
  pendingLeaves = 0;
  approvedLeaves = 0;
  totalDepartments = 0;
  activeProjects = 0;
  totalProjects = 0;

  username = localStorage.getItem('username') || 'User';
  role = localStorage.getItem('role');

  get isAdmin(): boolean { return this.role === 'Admin'; }
  get isManager(): boolean { return this.role === 'Manager'; }

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    if (this.isAdmin) {
      // Unified dashboard summary for Admin
      this.http.get<any>(`${API_URL}/Dashboard/summary`).subscribe({
        next: (data) => {
          this.totalEmployees = data.totalEmployees ?? 0;
          this.activeEmployees = data.activeEmployees ?? 0;
          this.presentToday = data.presentToday ?? 0;
          this.pendingLeaves = data.pendingLeaves ?? 0;
          this.approvedLeaves = data.approvedLeaves ?? 0;
          this.totalDepartments = data.totalDepartments ?? 0;
          this.activeProjects = data.activeProjects ?? 0;
          this.totalProjects = data.totalProjects ?? 0;
          this.cd.detectChanges();
        },
        error: () => {
          this.loadIndividualCounts();
        }
      });
    } else {
      // Non-admin roles (Managers/Employees): Load filtered metrics
      this.loadRoleScopedDashboard();
    }
  }

  loadRoleScopedDashboard(): void {
    // Request all lists concurrently
    forkJoin({
      employees: this.http.get<any[]>(`${API_URL}/Employees`),
      attendances: this.http.get<any[]>(`${API_URL}/Attendances`),
      leaves: this.http.get<any[]>(`${API_URL}/Leaves`),
      allocations: this.http.get<any[]>(`${API_URL}/ProjectAllocations`)
    }).subscribe({
      next: (res) => {
        // 1. Resolve logged-in user employee profile
        let userMatch = res.employees.find(
          (e: any) => e.email && e.email.toLowerCase() === this.username?.toLowerCase()
        );
        if (!userMatch) {
          userMatch = res.employees.find(
            (e: any) => e.email && e.email.toLowerCase().startsWith(this.username?.toLowerCase() || '')
          );
        }
        if (!userMatch && this.role) {
          userMatch = res.employees.find(
            (e: any) => e.role && e.role.roleName && e.role.roleName.toLowerCase() === this.role?.toLowerCase()
          );
        }

        const currentEmpId = userMatch?.employeeId || 1;
        const currentDeptId = userMatch?.departmentId || 0;

        if (this.isManager) {
          // Managers see stats for standard employees under them in the same department
          const teammates = res.employees.filter(
            (e: any) => e.departmentId === currentDeptId && e.employeeId !== currentEmpId && e.role?.roleName === 'Employee'
          );
          const teammateIds = teammates.map((e: any) => e.employeeId);

          this.totalEmployees = teammates.length;
          this.activeEmployees = teammates.filter((e: any) => e.status === 'Active').length;

          // Today's attendances of teammates
          const todayStr = new Date().toISOString().substring(0, 10);
          this.presentToday = res.attendances.filter(
            (a: any) => teammateIds.includes(a.empId) && a.attendanceDate && a.attendanceDate.startsWith(todayStr)
          ).length;

          // Leaves of teammates
          const teammateLeaves = res.leaves.filter((l: any) => teammateIds.includes(l.employeeId));
          this.pendingLeaves = teammateLeaves.filter((l: any) => l.status === 'Pending').length;
          this.approvedLeaves = teammateLeaves.filter((l: any) => l.status === 'Approved').length;

          // Active Projects allocated to teammates
          const activeAllocations = res.allocations.filter(
            (a: any) => teammateIds.includes(a.employeeId) && a.status === true
          );
          const projectIds = activeAllocations.map((a: any) => a.projectId);
          const uniqueProjects = Array.from(new Set(projectIds));
          this.totalProjects = uniqueProjects.length;
          this.activeProjects = uniqueProjects.length;

        } else {
          // Regular Employee sees their own personal dashboard metrics
          this.totalEmployees = 0; // Hide/unused
          this.activeEmployees = 0; // Hide/unused

          // Today's attendance status
          const todayStr = new Date().toISOString().substring(0, 10);
          const hasAttended = res.attendances.some(
            (a: any) => a.empId === currentEmpId && a.attendanceDate && a.attendanceDate.startsWith(todayStr)
          );
          this.presentToday = hasAttended ? 1 : 0;

          // Leaves submitted by self
          const myLeaves = res.leaves.filter((l: any) => l.employeeId === currentEmpId);
          this.pendingLeaves = myLeaves.filter((l: any) => l.status === 'Pending').length;
          this.approvedLeaves = myLeaves.filter((l: any) => l.status === 'Approved').length;

          // Projects allocated to self
          const myAllocations = res.allocations.filter(
            (a: any) => a.employeeId === currentEmpId && a.status === true
          );
          const projectIds = myAllocations.map((a: any) => a.projectId);
          const uniqueProjects = Array.from(new Set(projectIds));
          this.totalProjects = uniqueProjects.length;
          this.activeProjects = uniqueProjects.length;
        }

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading role scoped dashboard data:', err)
    });
  }

  loadIndividualCounts(): void {
    this.http.get<any[]>(`${API_URL}/Employees`).subscribe({
      next: (data) => {
        this.totalEmployees = data.length;
        this.activeEmployees = data.filter((e: any) => e.status === 'Active').length || data.length;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Employee count error:', err)
    });

    this.http.get<any[]>(`${API_URL}/Departments`).subscribe({
      next: (data) => {
        this.totalDepartments = data.length;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Department count error:', err)
    });

    this.http.get<any[]>(`${API_URL}/Projects`).subscribe({
      next: (data) => {
        this.totalProjects = data.length;
        this.activeProjects = data.filter((p: any) => p.status === 'Active').length || data.length;
        this.cd.detectChanges();
      },
      error: () => {
        this.totalProjects = 0;
        this.activeProjects = 0;
      }
    });

    this.http.get<any[]>(`${API_URL}/Leaves/pending`).subscribe({
      next: (data) => {
        this.pendingLeaves = data.length;
        this.cd.detectChanges();
      },
      error: () => { this.pendingLeaves = 0; }
    });
  }
}
