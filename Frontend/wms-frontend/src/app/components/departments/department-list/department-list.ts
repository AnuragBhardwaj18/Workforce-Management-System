import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { DepartmentService } from '../../../services/department';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css'
})
export class DepartmentList implements OnInit {

  departments: any[] = [];
  showForm = false;

  department: any = {
    departmentName: '',
    description: ''
  };

  isEdit = false;
  editId = 0;

  constructor(
    private service: DepartmentService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.service.getDepartments().subscribe({
      next: (data) => {
        this.departments = [...data];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load departments error:', err)
    });
  }

  openForm(): void {
    this.department = { departmentName: '', description: '' };
    this.isEdit = false;
    this.editId = 0;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.editId = 0;
    this.department = { departmentName: '', description: '' };
  }

  saveDepartment(): void {
    const payload = {
      departmentName: this.department.departmentName,
      description: this.department.description
    };

    if (!payload.departmentName?.trim()) {
      alert('Department Name is required');
      return;
    }

    if (this.isEdit) {
      this.service.updateDepartment(this.editId, payload).subscribe({
        next: () => {
          this.cancelForm();
          this.loadDepartments();
          alert('Department updated successfully');
        },
        error: (err) => {
          console.error('Update error:', err);
          alert('Update failed');
        }
      });
    } else {
      this.service.addDepartment(payload).subscribe({
        next: () => {
          this.cancelForm();
          this.loadDepartments();
          alert('Department added successfully');
        },
        error: (err) => {
          console.error('Add error:', err);
          alert('Add failed');
        }
      });
    }
  }

  editDepartment(d: any): void {
    this.isEdit = true;
    this.editId = d.departmentId;
    this.department = {
      departmentName: d.departmentName,
      description: d.description
    };
    this.showForm = true;
  }

  deleteDepartment(id: number): void {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    this.service.deleteDepartment(id).subscribe({
      next: () => {
        this.departments = this.departments.filter(d => d.departmentId !== id);
        this.cd.detectChanges();
        alert('Department deleted successfully');
      },
      error: (err) => {
        console.error('Delete error:', err);
        alert('Delete failed');
      }
    });
  }
}
