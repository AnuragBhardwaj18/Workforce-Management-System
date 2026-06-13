import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../layout/navbar/navbar';
import { Sidebar } from '../layout/sidebar/sidebar';
import { AuditLogService } from '../../services/audit-log';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css'
})
export class AuditLogs implements OnInit {
  logs: any[] = [];
  employees: any[] = [];
  filteredLogs: any[] = [];
  keyword = '';
  selectedEntity = '';
  entities = ['Employee', 'Project', 'Department', 'Client', 'Attendance', 'Leave'];

  constructor(
    private service: AuditLogService,
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
        this.loadAuditLogs();
      },
      error: (err) => {
        console.error('Load employees error:', err);
        this.loadAuditLogs();
      }
    });
  }

  loadAuditLogs(): void {
    this.service.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.applyFilters();
      },
      error: (err) => console.error('Load audit logs error:', err)
    });
  }

  getEmployeeName(id: number): string {
    if (id === 0) return 'System / Admin';
    const emp = this.employees.find((e: any) => e.employeeId === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  }

  applyFilters(): void {
    let temp = [...this.logs];

    if (this.selectedEntity) {
      temp = temp.filter(l => l.EntityName?.toLowerCase() === this.selectedEntity.toLowerCase());
    }

    if (this.keyword.trim()) {
      const query = this.keyword.toLowerCase().trim();
      temp = temp.filter(l => 
        l.Action?.toLowerCase().includes(query) ||
        l.EntityName?.toLowerCase().includes(query) ||
        l.RecordId?.toString().includes(query) ||
        this.getEmployeeName(l.CreatedBy).toLowerCase().includes(query)
      );
    }

    this.filteredLogs = temp;
    this.cd.detectChanges();
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedEntity = '';
    this.applyFilters();
  }
}
