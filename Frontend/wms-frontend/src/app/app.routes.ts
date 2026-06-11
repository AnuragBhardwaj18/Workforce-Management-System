import { Routes } from '@angular/router';

import { Login } from './components/auth/login/login';
import { Dashboard } from './components/dashboard/dashboard/dashboard';

import { DepartmentList } from './components/departments/department-list/department-list';

import { EmployeeList } from './components/employees/employee-list/employee-list';

import { AttendanceList } from './components/attendance/attendance-list/attendance-list';

import { LeaveList } from './components/leaves/leave-list/leave-list';

import { ProjectList } from './components/projects/project-list/project-list';

import { ReportList } from './components/reports/report-list/report-list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'departments',
    component: DepartmentList
  },

  {
    path: 'employees',
    component: EmployeeList
  },

  {
    path: 'attendance',
    component: AttendanceList
  },

  {
    path: 'leaves',
    component: LeaveList
  },

  {
    path: 'projects',
    component: ProjectList
  },

  {
    path: 'reports',
    component: ReportList
  }
];
