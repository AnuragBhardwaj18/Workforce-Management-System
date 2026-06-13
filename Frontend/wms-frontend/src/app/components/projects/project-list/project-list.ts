import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ProjectService } from '../../../services/project';
import { ClientService } from '../../../services/client';
import { EmployeeService } from '../../../services/employee';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  projects: any[] = [];
  allocations: any[] = [];
  clients: any[] = [];
  employees: any[] = [];
  showProjectForm = false;
  isEditProject = false;
  editProjectId = 0;

  project: any = {
    projectName: '',
    clientId: 0,
    startDate: '',
    endDate: '',
    status: 'Active'
  };

  allocation: any = {
    employeeId: 0,
    projectId: 0,
    createdBy: localStorage.getItem('username') || 'Admin'
  };

  role = localStorage.getItem('role');
  username = localStorage.getItem('username');
  userEmployeeId: number | null = null;
  userDepartmentId: number | null = null;
  assignableEmployees: any[] = [];

  constructor(
    private service: ProjectService,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    this.loadEmployees();
  }

  loadProjects(): void {
    this.service.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        if (this.projects.length > 0) {
          this.allocation.projectId = this.projects[0].projectId;
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load projects error:', err)
    });
  }

  loadAllocations(): void {
    this.service.getAllocations().subscribe({
      next: (data) => {
        const active = data.filter((a: any) => a.status === true).map((a: any) => {
          const matchedEmp = this.employees.find(e => e.employeeId === a.employeeId);
          if (matchedEmp) {
            a.employee = matchedEmp;
          }
          return a;
        });
        if (this.role === 'Admin') {
          this.allocations = active;
        } else if (this.role === 'Manager') {
          // Managers see themselves and standard employees under them in their department
          this.allocations = active.filter((a: any) => {
            if (a.employeeId === this.userEmployeeId) return true;
            return a.employee && a.employee.departmentId === this.userDepartmentId && a.employee.role?.roleName === 'Employee';
          });
        } else {
          // Standard employees see only their own allocations
          this.allocations = active.filter((a: any) => a.employeeId === this.userEmployeeId);
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load allocations error:', err)
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data.filter((c: any) => c.status === true);
        if (this.clients.length > 0) {
          this.project.clientId = this.clients[0].clientId;
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load clients error:', err)
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.resolveCurrentEmployee();
        this.buildAssignableEmployees();
        this.loadAllocations();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load employees error:', err)
    });
  }

  resolveCurrentEmployee(): void {
    if (!this.username) return;

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
      this.userEmployeeId = match.employeeId;
      this.userDepartmentId = match.departmentId;
      this.allocation.createdBy = `${match.firstName} ${match.lastName}`;
    }
  }

  buildAssignableEmployees(): void {
    if (this.role === 'Admin') {
      this.assignableEmployees = this.employees.filter((e: any) => e.status === 'Active');
    } else if (this.role === 'Manager') {
      // Managers can only assign standard active employees under their department
      this.assignableEmployees = this.employees.filter(
        (e: any) => e.departmentId === this.userDepartmentId && e.role?.roleName === 'Employee' && e.status === 'Active'
      );
    } else {
      this.assignableEmployees = [];
    }

    if (this.assignableEmployees.length > 0) {
      this.allocation.employeeId = this.assignableEmployees[0].employeeId;
    }
  }

  toggleProjectForm(): void {
    this.showProjectForm = !this.showProjectForm;
    this.isEditProject = false;
    this.editProjectId = 0;
    this.project = { projectName: '', clientId: this.clients[0]?.clientId || 0, startDate: '', endDate: '', status: 'Active' };
  }

  addProject(): void {
    if (!this.project.projectName?.trim()) {
      alert('Project name is required');
      return;
    }
    const payload = {
      ...this.project,
      clientId: Number(this.project.clientId)
    };

    if (this.isEditProject) {
      this.service.updateProject(this.editProjectId, payload).subscribe({
        next: (res) => {
          const clientObj = this.clients.find(c => c.clientId === payload.clientId);
          const updatedProj = { ...res, client: clientObj };

          const idx = this.projects.findIndex(p => p.projectId === this.editProjectId);
          if (idx !== -1) {
            this.projects[idx] = updatedProj;
            this.projects = [...this.projects];
          }
          this.isEditProject = false;
          this.editProjectId = 0;
          this.project = { projectName: '', clientId: this.clients[0]?.clientId || 0, startDate: '', endDate: '', status: 'Active' };
          this.showProjectForm = false;
          this.cd.detectChanges();

          alert('Project updated successfully!');
          this.loadProjects();
        },
        error: (err) => {
          console.error('Update project error:', err);
          alert('Failed to update project.');
        }
      });
    } else {
      this.service.addProject(payload).subscribe({
        next: (res) => {
          // Resolve client details locally for immediate table update
          const clientObj = this.clients.find(c => c.clientId === payload.clientId);
          const newProj = { ...res, client: clientObj };

          this.projects = [...this.projects, newProj];
          this.project = { projectName: '', clientId: this.clients[0]?.clientId || 0, startDate: '', endDate: '', status: 'Active' };
          this.showProjectForm = false;
          this.cd.detectChanges();

          alert('Project added successfully!');
          this.loadProjects();
        },
        error: (err) => {
          console.error('Add project error:', err);
          alert('Failed to add project.');
        }
      });
    }
  }

  editProject(p: any): void {
    this.isEditProject = true;
    this.editProjectId = p.projectId;
    this.project = {
      projectName: p.projectName,
      clientId: p.clientId,
      startDate: p.startDate ? p.startDate.substring(0, 10) : '',
      endDate: p.endDate ? p.endDate.substring(0, 10) : '',
      status: p.status
    };
    this.showProjectForm = true;
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.service.deleteProject(id).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.projectId !== id);
          this.cd.detectChanges();
          alert('Project deleted successfully!');
        },
        error: (err) => {
          console.error('Delete project error:', err);
          alert('Failed to delete project. Make sure there are no allocations assigned to this project first.');
        }
      });
    }
  }

  assignEmployee(): void {
    const payload = {
      employeeId: Number(this.allocation.employeeId),
      projectId: Number(this.allocation.projectId),
      createdBy: this.allocation.createdBy
    };
    this.service.assignEmployee(payload).subscribe({
      next: (res) => {
        // Resolve employee & project details locally for immediate table update
        const emp = this.employees.find(e => e.employeeId === payload.employeeId);
        const proj = this.projects.find(p => p.projectId === payload.projectId);
        const newAlloc = { ...res, employee: emp, project: proj };

        this.allocations = [...this.allocations, newAlloc];
        this.cd.detectChanges();

        alert('Employee assigned to project successfully!');
        this.loadAllocations();
      },
      error: (err) => {
        console.error('Assign error:', err);
        alert('Failed to assign employee. Make sure they are not already assigned.');
      }
    });
  }

  removeAllocation(id: number): void {
    if (this.role === 'Manager') {
      const alloc = this.allocations.find(a => a.allocationId === id);
      if (alloc && alloc.employeeId === this.userEmployeeId) {
        alert('You cannot remove yourself from the project.');
        return;
      }
    }
    if (confirm('Are you sure you want to remove this employee allocation?')) {
      const username = localStorage.getItem('username') || 'Admin';
      this.service.removeAllocation(id, username).subscribe({
        next: () => {
          this.allocations = this.allocations.filter(a => a.allocationId !== id);
          this.cd.detectChanges();

          alert('Employee allocation removed successfully!');
        },
        error: (err) => {
          console.error('Remove allocation error:', err);
          alert('Failed to remove allocation.');
        }
      });
    }
  }

  getProjectStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-success',
      'OnHold': 'badge-warning',
      'Completed': 'badge-secondary'
    };
    return map[status] || 'badge-secondary';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'Admin';
  }

  isManager(): boolean {
    return localStorage.getItem('role') === 'Manager';
  }
}
