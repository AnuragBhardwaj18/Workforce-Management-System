import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ReportService } from '../../../services/report';
import { EmployeeService } from '../../../services/employee';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, Navbar, Sidebar],
  templateUrl: './report-list.html',
  styleUrl: './report-list.css'
})
export class ReportList implements OnInit {
  reportData: any[] = [];
  selectedReport = '';
  employees: any[] = [];
  myTeamIds: number[] = [];

  username = localStorage.getItem('username');
  role = localStorage.getItem('role');

  get isAdmin(): boolean { return this.role === 'Admin'; }
  get isManager(): boolean { return this.role === 'Manager'; }

  constructor(
    private service: ReportService,
    private employeeService: EmployeeService,
    private auth: Auth,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEmployeesAndResolveTeam();
  }

  loadEmployeesAndResolveTeam(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.resolveTeamIds();
      },
      error: (err) => console.error('Error loading employees for reports:', err)
    });
  }

  resolveTeamIds(): void {
    if (this.isAdmin || !this.username) return;

    // Find logged-in user profile
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
      const deptId = match.departmentId;
      if (this.isManager) {
        // Managers see themselves and standard employees under them in their department
        this.myTeamIds = this.employees
          .filter((e: any) => e.departmentId === deptId && (e.employeeId === match.employeeId || e.role?.roleName === 'Employee'))
          .map((e: any) => e.employeeId);
      } else {
        // Standard employees can only see their own reports
        this.myTeamIds = [match.employeeId];
      }
    } else {
      // Fallback
      this.myTeamIds = [];
    }
  }

  loadEmployeeReport(): void {
    this.selectedReport = 'Employee Report';
    this.service.employeeReport().subscribe({
      next: (data) => {
        const mappedData = data.map((item: any) => {
          const newItem = { ...item };
          if (newItem.employeeName && newItem.employeeId) {
            newItem.employeeName = `${newItem.employeeName} (ID: #${newItem.employeeId})`;
          }
          return newItem;
        });

        if (this.isAdmin) {
          this.reportData = mappedData;
        } else {
          // Filter to team members (same department) and self
          this.reportData = mappedData.filter((item: any) => this.myTeamIds.includes(item.employeeId));
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Employee report error:', err);
        this.reportData = [];
        this.cd.detectChanges();
      }
    });
  }

  loadLeaveReport(): void {
    this.selectedReport = 'Leave Report';
    this.service.leaveReport().subscribe({
      next: (data) => {
        const mappedData = data.map((item: any) => {
          const newItem = { ...item };
          if (newItem.approvedBy) {
            const approverId = Number(newItem.approvedBy);
            const emp = this.employees.find((e: any) => e.employeeId === approverId);
            if (emp) {
              newItem.approvedBy = `${emp.firstName} ${emp.lastName} (ID: #${approverId})`;
            } else {
              newItem.approvedBy = `Employee #${approverId}`;
            }
          } else {
            newItem.approvedBy = '—';
          }
          if (newItem.employeeName && newItem.employeeId) {
            newItem.employeeName = `${newItem.employeeName} (ID: #${newItem.employeeId})`;
          }
          return newItem;
        });

        if (this.isAdmin) {
          this.reportData = mappedData;
        } else {
          // Filter to team members and self
          this.reportData = mappedData.filter((item: any) => this.myTeamIds.includes(item.employeeId));
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Leave report error:', err);
        this.reportData = [];
        this.cd.detectChanges();
      }
    });
  }

  loadProjectReport(): void {
    this.selectedReport = 'Project Allocation Report';
    this.service.projectAllocationReport().subscribe({
      next: (data) => {
        const mappedData = data.map((item: any) => {
          const newItem = { ...item };
          if (newItem.status === true) {
            newItem.status = 'Active';
          } else if (newItem.status === false) {
            newItem.status = 'Inactive';
          }
          if (newItem.employeeName && newItem.employeeId) {
            newItem.employeeName = `${newItem.employeeName} (ID: #${newItem.employeeId})`;
          }
          if (newItem.createdBy) {
            const creatorStr = newItem.createdBy.trim().toLowerCase();
            const creatorMatch = this.employees.find((e: any) => {
              const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
              return fullName === creatorStr || 
                     e.email?.toLowerCase() === creatorStr ||
                     e.email?.toLowerCase().startsWith(creatorStr) ||
                     e.role?.roleName?.toLowerCase() === creatorStr;
            });
            if (creatorMatch) {
              newItem.createdBy = `${creatorMatch.firstName} ${creatorMatch.lastName} (ID: #${creatorMatch.employeeId})`;
            }
          }
          return newItem;
        });

        if (this.isAdmin) {
          this.reportData = mappedData;
        } else {
          // Filter to team members and self
          this.reportData = mappedData.filter((item: any) => this.myTeamIds.includes(item.employeeId));
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Project report error:', err);
        this.reportData = [];
        this.cd.detectChanges();
      }
    });
  }

  downloadExcel(): void {
    if (this.reportData.length === 0) {
      alert('No data available to download');
      return;
    }

    const headers = this.getKeys(this.reportData[0]);
    const formattedHeaders = headers.map(h => this.formatHeader(h));
    
    let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 support
    csvContent += formattedHeaders.join(',') + '\n';

    this.reportData.forEach((row: any) => {
      const line = headers.map(key => {
        let val = row[key];
        if (val === null || val === undefined) {
          val = '';
        } else {
          val = val.toString().replace(/"/g, '""'); // Escape quotes
          if (val.includes(',') || val.includes('\n') || val.includes('\r')) {
            val = `"${val}"`;
          }
        }
        return val;
      });
      csvContent += line.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${this.selectedReport.replace(/\s+/g, '_')}_${dateStr}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}
