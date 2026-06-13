import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../layout/navbar/navbar';
import { Sidebar } from '../layout/sidebar/sidebar';
import { Auth } from '../../services/auth';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  username: string | null = '';
  role: string | null = '';
  employee: any = null;
  isAdminUser = false;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  // Form model for editable fields
  editModel = {
    phoneNumber: '',
    gender: 'M',
    dob: ''
  };

  constructor(
    private auth: Auth,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.role = this.auth.getRole();
    this.isAdminUser = this.role === 'Admin' && this.username === 'admin@wms.com';

    if (this.isAdminUser) {
      // Setup a mock employee profile for the system admin
      this.employee = {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@wms.com',
        phoneNumber: '1234567890',
        gender: 'M',
        dob: '1985-01-01',
        doj: '2020-01-01',
        status: 'Active',
        role: { roleName: 'Admin' },
        department: { departmentName: 'IT Operations' }
      };
    } else {
      this.loadEmployeeProfile();
    }
  }

  loadEmployeeProfile(): void {
    if (!this.username) return;

    this.employeeService.getEmployees().subscribe({
      next: (employees: any[]) => {
        // Attempt smart resolution of employee record:
        // 1. Check exact match on email
        let match = employees.find(
          (e: any) => e.email && e.email.toLowerCase() === this.username?.toLowerCase()
        );

        // 2. Check match by name/first part of email
        if (!match) {
          match = employees.find(
            (e: any) => e.email && e.email.toLowerCase().startsWith(this.username?.toLowerCase() || '')
          );
        }

        // 3. Check first/last name matches username
        if (!match) {
          match = employees.find(
            (e: any) =>
              (e.firstName && e.firstName.toLowerCase() === this.username?.toLowerCase()) ||
              (e.lastName && e.lastName.toLowerCase() === this.username?.toLowerCase())
          );
        }

        // 4. Check matching by RoleName (for generic logins like 'manager' or 'employee')
        if (!match && this.role) {
          match = employees.find(
            (e: any) => e.role && e.role.roleName && e.role.roleName.toLowerCase() === this.role?.toLowerCase()
          );
        }

        // 5. Fallback to localStorage employeeId or first employee in system
        if (!match) {
          const storedEmpId = Number(localStorage.getItem('employeeId'));
          if (storedEmpId) {
            match = employees.find((e: any) => e.employeeId === storedEmpId);
          }
        }

        if (!match && employees.length > 0) {
          match = employees[0]; // Fallback to first available employee to keep UI rich
        }

        if (match) {
          this.employee = match;
          this.syncEditModel();
        } else {
          this.errorMessage = 'Could not retrieve employee details for this user.';
        }
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading employee profile:', err);
        this.errorMessage = 'Failed to load profile details.';
        this.cd.detectChanges();
      }
    });
  }

  syncEditModel(): void {
    if (!this.employee) return;
    this.editModel = {
      phoneNumber: this.employee.phoneNumber || '',
      gender: this.employee.gender || 'M',
      dob: this.employee.dob ? this.employee.dob.substring(0, 10) : ''
    };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.syncEditModel();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.employee || this.isAdminUser) return;

    this.successMessage = '';
    this.errorMessage = '';

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!this.editModel.phoneNumber?.trim()) {
      this.errorMessage = 'Phone Number is required.';
      this.cd.detectChanges();
      return;
    }
    if (!phoneRegex.test(this.editModel.phoneNumber.trim())) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';
      this.cd.detectChanges();
      return;
    }

    // Validate Date of Birth (Age > 18)
    if (!this.editModel.dob) {
      this.errorMessage = 'Date of Birth is required.';
      this.cd.detectChanges();
      return;
    }
    const dobDate = new Date(this.editModel.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      this.errorMessage = 'Employee age must be greater than 18.';
      this.cd.detectChanges();
      return;
    }

    const updatedEmployee = {
      ...this.employee,
      phoneNumber: this.editModel.phoneNumber,
      gender: this.editModel.gender,
      dob: this.editModel.dob
    };

    this.employeeService.updateEmployee(this.employee.employeeId, updatedEmployee).subscribe({
      next: (res: any) => {
        this.employee = res;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Update profile error:', err);
        this.errorMessage = 'Failed to update profile details.';
        this.cd.detectChanges();
      }
    });
  }

  getInitials(): string {
    if (!this.employee) return 'U';
    const first = this.employee.firstName?.[0] || '';
    const last = this.employee.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }
}
