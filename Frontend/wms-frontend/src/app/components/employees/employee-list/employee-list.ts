import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { EmployeeService } from '../../../services/employee';
import { DepartmentService } from '../../../services/department';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit {

  employees: any[] = [];
  departments: any[] = [];
  keyword = '';
  showForm = false;

  employee: any = this.getEmptyEmployee();

  isEdit = false;
  editId = 0;

  constructor(
    private service: EmployeeService,
    private deptService: DepartmentService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  getEmptyEmployee() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'M',
      dob: '',
      doj: '',
      departmentId: 1,
      roleId: 3,
      status: 'Active'
    };
  }

  loadEmployees(): void {
    this.service.getEmployees().subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load employees error:', err)
    });
  }

  loadDepartments(): void {
    this.deptService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load departments error:', err)
    });
  }

  getDepartmentName(id: number): string {
    const dept = this.departments.find(d => d.departmentId === id);
    return dept ? dept.departmentName : `Dept ${id}`;
  }

  getRoleName(id: number): string {
    const roles: Record<number, string> = {
      1: 'Admin',
      2: 'Employee',
      3: 'Manager'
    };
    return roles[id] || `Role ${id}`;
  }

  openForm(): void {
    this.employee = this.getEmptyEmployee();
    this.isEdit = false;
    this.editId = 0;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.editId = 0;
    this.employee = this.getEmptyEmployee();
  }

  saveEmployee(): void {
    if (!this.employee.firstName?.trim()) { alert('First Name is required'); return; }
    if (!this.employee.lastName?.trim()) { alert('Last Name is required'); return; }
    if (!this.employee.email?.trim()) { alert('Email is required'); return; }
    if (!this.employee.phoneNumber?.trim()) { alert('Phone Number is required'); return; }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(this.employee.phoneNumber.trim())) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (!this.employee.dob) { alert('Date of Birth is required'); return; }
    
    const dobDate = new Date(this.employee.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      alert('Employee age must be greater than 18.');
      return;
    }

    if (!this.employee.doj) { alert('Joining Date is required'); return; }

    const payload = {
      firstName: this.employee.firstName,
      lastName: this.employee.lastName,
      email: this.employee.email,
      phoneNumber: this.employee.phoneNumber,
      gender: this.employee.gender,
      dob: this.employee.dob,
      doj: this.employee.doj,
      departmentId: Number(this.employee.departmentId),
      roleId: Number(this.employee.roleId),
      status: this.employee.status
    };

    if (this.isEdit) {
      this.service.updateEmployee(this.editId, payload).subscribe({
        next: (res) => {
          const idx = this.employees.findIndex(e => e.employeeId === this.editId);
          if (idx !== -1) {
            this.employees[idx] = { ...this.employees[idx], ...res };
            this.employees = [...this.employees];
          }
          this.cancelForm();
          this.cd.detectChanges();
          alert('Employee updated successfully');
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Update employee error:', err);
          alert('Employee update failed');
        }
      });
    } else {
      this.service.addEmployee(payload).subscribe({
        next: (res) => {
          this.employees = [...this.employees, res];
          this.cancelForm();
          this.cd.detectChanges();
          alert('Employee added successfully');
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Add employee error:', err);
          alert('Employee add failed');
        }
      });
    }
  }

  editEmployee(e: any): void {
    this.isEdit = true;
    this.editId = e.employeeId;
    this.employee = {
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      gender: e.gender,
      dob: e.dob ? e.dob.substring(0, 10) : '',
      doj: e.doj ? e.doj.substring(0, 10) : '',
      departmentId: e.departmentId,
      roleId: e.roleId,
      status: e.status
    };
    this.showForm = true;
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.service.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.employeeId !== id);
          this.cd.detectChanges();
          alert('Employee deleted successfully');
        },
        error: (err) => {
          console.error('Delete employee error:', err);
          alert('Employee delete failed');
        }
      });
    }
  }

  search(): void {
    if (!this.keyword.trim()) {
      this.loadEmployees();
      return;
    }
    this.service.searchEmployee(this.keyword).subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Search employee error:', err)
    });
  }

  clearSearch(): void {
    this.keyword = '';
    this.loadEmployees();
  }
}
