import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../layout/navbar/navbar';
import { Sidebar } from '../layout/sidebar/sidebar';
import { Auth } from '../../services/auth';
import { EmployeeService } from '../../services/employee';
import { ProjectService } from '../../services/project';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './my-team.html',
  styleUrl: './my-team.css'
})
export class MyTeam implements OnInit {
  username: string | null = '';
  role: string | null = '';
  currentEmployee: any = null;
  teammates: any[] = [];
  allocations: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.role = this.auth.getRole();
    this.loadTeamData();
  }

  loadTeamData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Fetch all employees
    this.employeeService.getEmployees().subscribe({
      next: (employees: any[]) => {
        // Resolve current logged-in employee record
        let match = employees.find(
          (e: any) => e.email && e.email.toLowerCase() === this.username?.toLowerCase()
        );

        if (!match) {
          match = employees.find(
            (e: any) => e.email && e.email.toLowerCase().startsWith(this.username?.toLowerCase() || '')
          );
        }

        if (!match && this.role) {
          match = employees.find(
            (e: any) => e.role && e.role.roleName && e.role.roleName.toLowerCase() === this.role?.toLowerCase()
          );
        }

        if (match) {
          this.currentEmployee = match;
          const deptId = match.departmentId;

          // Filter teammates (employees in same department, excluding self and admins, including employees and department manager)
          this.teammates = employees.filter(
            (e: any) => e.departmentId === deptId && 
                        e.employeeId !== match.employeeId && 
                        (e.role?.roleName === 'Employee' || e.role?.roleName === 'Manager')
          );

          // Load allocations to map projects
          this.loadAllocations();
        } else {
          // If logged in as admin (who isn't associated with a department), show all employees as team
          this.teammates = employees;
          this.loadAllocations();
        }
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading employees for team:', err);
        this.errorMessage = 'Failed to load team members.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  loadAllocations(): void {
    this.projectService.getAllocations().subscribe({
      next: (data: any[]) => {
        // Keep active allocations
        this.allocations = data.filter((a: any) => a.status === true);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading allocations:', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  getTeammateProjects(empId: number): any[] {
    return this.allocations
      .filter((a: any) => a.employeeId === empId)
      .map((a: any) => a.project?.projectName || `Project #${a.projectId}`);
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'E';
  }
}
