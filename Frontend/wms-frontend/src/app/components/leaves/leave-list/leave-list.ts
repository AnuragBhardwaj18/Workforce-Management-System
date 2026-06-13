import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { LeaveService } from '../../../services/leave';
import { EmployeeService } from '../../../services/employee';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './leave-list.html',
  styleUrl: './leave-list.css'
})
export class LeaveList implements OnInit {
  leaves: any[] = [];
  employees: any[] = [];
  showApplyForm = false;

  role = localStorage.getItem('role');
  username = localStorage.getItem('username');
  managerId = Number(localStorage.getItem('employeeId')) || 1;
  userDepartmentId: number | null = null;

  get isAdmin(): boolean { return this.role === 'Admin'; }
  get isManager(): boolean { return this.role === 'Manager'; }

  leave: any = {
    employeeId: 1,
    leaveType: 'Sick',
    reason: '',
    fromDate: '',
    toDate: ''
  };

  constructor(
    private service: LeaveService,
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
        this.loadLeaves();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load employees error:', err)
    });
  }

  resolveCurrentEmployeeId(): void {
    if (!this.username) return;
    
    // Find the current logged-in employee based on username/email
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
      this.leave.employeeId = match.employeeId;
      this.managerId = match.employeeId;
      this.userDepartmentId = match.departmentId;
    }
  }

  getEmployeeName(id: number): string {
    const emp = this.employees.find((e: any) => e.employeeId === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  }

  getEmployeeRole(id: number): string {
    const emp = this.employees.find((e: any) => e.employeeId === id);
    return emp?.role?.roleName || 'Employee';
  }

  canApproveOrReject(leave: any): boolean {
    if (this.isAdmin) {
      return true; // Admin can approve/reject any leave request
    }

    if (this.isManager) {
      const requester = this.employees.find((e: any) => e.employeeId === leave.employeeId);
      if (requester) {
        // Manager can only approve if employee is in the same department AND has the Employee role
        return requester.departmentId === this.userDepartmentId && requester.role?.roleName === 'Employee';
      }
    }

    return false; // Employees cannot approve/reject any leaves
  }

  loadLeaves(): void {
    this.service.getLeaves().subscribe({
      next: (data: any[]) => {
        if (this.isAdmin) {
          this.leaves = data;
        } else if (this.isManager) {
          // Managers see leaves for themselves and standard employees in their department
          this.leaves = data.filter((l: any) => {
            if (l.employeeId === this.leave.employeeId) return true; // See own leaves
            const requester = this.employees.find((e: any) => e.employeeId === l.employeeId);
            return requester && requester.departmentId === this.userDepartmentId && requester.role?.roleName === 'Employee';
          });
        } else {
          // Standard employees see only their own leaves
          this.leaves = data.filter((l: any) => l.employeeId === this.leave.employeeId);
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load leaves error:', err)
    });
  }

  toggleApplyForm(): void {
    this.showApplyForm = !this.showApplyForm;
  }

  applyLeave(): void {
    if (!this.leave.reason?.trim()) { alert('Reason is required'); return; }
    if (!this.leave.fromDate) { alert('From Date is required'); return; }
    if (!this.leave.toDate) { alert('To Date is required'); return; }

    // Ensure employeeId is cast to number
    this.leave.employeeId = Number(this.leave.employeeId);

    this.service.applyLeave(this.leave).subscribe({
      next: () => {
        const currentEmpId = this.leave.employeeId;
        this.leave = {
          employeeId: currentEmpId,
          leaveType: 'Sick',
          reason: '',
          fromDate: '',
          toDate: ''
        };
        this.showApplyForm = false;
        this.loadLeaves();
        this.cd.detectChanges();
        alert('Leave application submitted successfully!');
      },
      error: (err: any) => {
        console.error('Apply leave error:', err);
        alert('Failed to submit leave application.');
      }
    });
  }

  approve(id: number): void {
    if (confirm('Approve this leave request?')) {
      this.service.approveLeave(id, this.managerId).subscribe({
        next: () => this.loadLeaves(),
        error: (err: any) => { console.error('Approve error:', err); alert('Approval failed.'); }
      });
    }
  }

  reject(id: number): void {
    if (confirm('Reject this leave request?')) {
      this.service.rejectLeave(id, this.managerId).subscribe({
        next: () => this.loadLeaves(),
        error: (err: any) => { console.error('Reject error:', err); alert('Rejection failed.'); }
      });
    }
  }

  cancel(id: number): void {
    if (confirm('Cancel this leave request?')) {
      this.service.cancelLeave(id).subscribe({
        next: () => this.loadLeaves(),
        error: (err: any) => { console.error('Cancel error:', err); alert('Cancellation failed.'); }
      });
    }
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-warning',
      'Approved': 'badge-success',
      'Rejected': 'badge-danger',
      'Cancelled': 'badge-secondary'
    };
    return map[status] || 'badge-secondary';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bi-hourglass-split',
      'Approved': 'bi-check-circle-fill',
      'Rejected': 'bi-x-circle-fill',
      'Cancelled': 'bi-slash-circle-fill'
    };
    return map[status] || '';
  }

  getLeaveTypeBadge(type: string): string {
    const map: Record<string, string> = {
      'Sick': 'badge-danger',
      'Casual': 'badge-info',
      'Earned': 'badge-primary'
    };
    return map[type] || 'badge-secondary';
  }
}
