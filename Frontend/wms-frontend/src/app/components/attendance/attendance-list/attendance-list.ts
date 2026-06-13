import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { AttendanceService } from '../../../services/attendance';
import { EmployeeService } from '../../../services/employee';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './attendance-list.html',
  styleUrl: './attendance-list.css'
})
export class AttendanceList implements OnInit {
  records: any[] = [];
  employees: any[] = [];
  workMode = 'WFO';

  empId = 1;
  role = localStorage.getItem('role');
  username = localStorage.getItem('username');

  get isAdmin(): boolean { return this.role === 'Admin'; }
  get isManager(): boolean { return this.role === 'Manager'; }

  constructor(
    private service: AttendanceService,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.resolveCurrentEmployeeId();
        this.loadAttendance();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load employees error:', err)
    });
  }

  resolveCurrentEmployeeId(): void {
    if (!this.username) return;

    // Find current employee by username/email
    let match = this.employees.find(
      (e: any) => e.email && e.email.toLowerCase() === this.username?.toLowerCase()
    );

    if (!match) {
      match = this.employees.find(
        (e: any) => e.email && e.email.toLowerCase().startsWith(this.username?.toLowerCase() || '')
      );
    }

    if (!match && this.role) {
      match = this.employees.find(
        (e: any) => e.role && e.role.roleName && e.role.roleName.toLowerCase() === this.role?.toLowerCase()
      );
    }

    if (match) {
      this.empId = match.employeeId;
    }
  }

  getEmployeeName(id: number): string {
    const emp = this.employees.find((e: any) => e.employeeId === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  }

  loadAttendance(): void {
    this.service.getAttendance().subscribe({
      next: (data: any[]) => {
        if (this.role === 'Admin') {
          this.records = data;
        } else if (this.role === 'Manager') {
          // Get manager's employee record to find department
          const managerEmp = this.employees.find(e => e.employeeId === this.empId);
          if (managerEmp) {
            const deptId = managerEmp.departmentId;
            // Get IDs of all employees under this manager in the same department (plus themselves)
            const deptEmpIds = this.employees
              .filter((e: any) => e.departmentId === deptId && (e.employeeId === this.empId || e.role?.roleName === 'Employee'))
              .map((e: any) => e.employeeId);
            this.records = data.filter((a: any) => deptEmpIds.includes(a.empId));
          } else {
            // Fallback: see own records only
            this.records = data.filter((a: any) => a.empId === this.empId);
          }
        } else {
          // Employee role: only see own records
          this.records = data.filter((a: any) => a.empId === this.empId);
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load attendance error:', err)
    });
  }

  checkIn(): void {
    // Cast empId to number
    const targetEmpId = Number(this.empId);

    this.service.checkIn(targetEmpId, this.workMode).subscribe({
      next: () => {
        this.loadAttendance();
        setTimeout(() => {
          alert('Check-in recorded successfully!');
        }, 100);
      },
      error: (err) => {
        console.error('Check-in error:', err);
        alert('Check-in failed. You may already be checked in today.');
      }
    });
  }

  checkOut(): void {
    // Cast empId to number
    const targetEmpId = Number(this.empId);

    this.service.checkOut(targetEmpId).subscribe({
      next: () => {
        this.loadAttendance();
        setTimeout(() => {
          alert('Check-out recorded successfully!');
        }, 100);
      },
      error: (err) => {
        console.error('Check-out error:', err);
        alert('Check-out failed. Please ensure you have checked in first.');
      }
    });
  }
}
