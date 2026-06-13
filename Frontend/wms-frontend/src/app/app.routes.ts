import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { Login } from './components/auth/login/login';
import { ChangePassword } from './components/auth/change-password/change-password';
import { Dashboard } from './components/dashboard/dashboard/dashboard';
import { DepartmentList } from './components/departments/department-list/department-list';
import { EmployeeList } from './components/employees/employee-list/employee-list';
import { AttendanceList } from './components/attendance/attendance-list/attendance-list';
import { LeaveList } from './components/leaves/leave-list/leave-list';
import { ProjectList } from './components/projects/project-list/project-list';
import { ReportList } from './components/reports/report-list/report-list';
import { AnnouncementList } from './components/announcements/announcement-list/announcement-list';
import { ClientList } from './components/clients/client-list/client-list';
import { Profile } from './components/profile/profile';
import { MyTeam } from './components/my-team/my-team';
import { AuditLogs } from './components/audit-logs/audit-logs';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'change-password', component: ChangePassword },

  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },

  {
    path: 'my-team',
    component: MyTeam,
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'departments',
    component: DepartmentList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },

  {
    path: 'employees',
    component: EmployeeList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },

  {
    path: 'attendance',
    component: AttendanceList,
    canActivate: [authGuard]
  },

  {
    path: 'leaves',
    component: LeaveList,
    canActivate: [authGuard]
  },

  {
    path: 'projects',
    component: ProjectList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Manager', 'Employee'] }
  },

  {
    path: 'reports',
    component: ReportList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Manager'] }
  },

  {
    path: 'announcements',
    component: AnnouncementList,
    canActivate: [authGuard]
  },

  {
    path: 'clients',
    component: ClientList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },

  {
    path: 'audit-logs',
    component: AuditLogs,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },

  { path: '**', redirectTo: 'login' }
];
