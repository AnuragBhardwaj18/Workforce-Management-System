import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { AnnouncementService } from '../../../services/announcement';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './announcement-list.html',
  styleUrl: './announcement-list.css'
})
export class AnnouncementList implements OnInit {
  announcements: any[] = [];
  showForm = false;
  isEdit = false;
  editId = 0;
  activeDropdownId: number | null = null;

  announcement: any = {
    title: '',
    message: '',
    isActive: true
  };

  constructor(
    private service: AnnouncementService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    if (this.isAdmin() || this.isManager()) {
      this.service.getAnnouncements().subscribe({
        next: (data) => {
          this.announcements = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error loading announcements:', err)
      });
    } else {
      this.service.getActiveAnnouncements().subscribe({
        next: (data) => {
          this.announcements = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error loading active announcements:', err)
      });
    }
  }

  toggleDropdown(event: Event, id: number): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.activeDropdownId = null;
  }

  toggleForm(): void {
    if (this.showForm && !this.isEdit) {
      this.showForm = false;
    } else {
      this.announcement = { title: '', message: '', isActive: true };
      this.isEdit = false;
      this.editId = 0;
      this.showForm = true;
    }
  }

  saveAnnouncement(): void {
    if (!this.announcement.title?.trim() || !this.announcement.message?.trim()) {
      alert('Title and Message are required');
      return;
    }

    if (this.isEdit) {
      this.service.updateAnnouncement(this.editId, this.announcement).subscribe({
        next: () => {
          this.showForm = false;
          this.loadAnnouncements();
          alert('Announcement updated successfully!');
        },
        error: (err) => console.error('Error updating announcement:', err)
      });
    } else {
      this.service.addAnnouncement(this.announcement).subscribe({
        next: () => {
          this.showForm = false;
          this.loadAnnouncements();
          alert('Announcement published successfully!');
        },
        error: (err) => console.error('Error adding announcement:', err)
      });
    }
  }

  editAnnouncement(a: any): void {
    this.activeDropdownId = null;
    this.isEdit = true;
    this.editId = a.announcementId;
    this.announcement = {
      title: a.title,
      message: a.message,
      isActive: a.isActive
    };
    this.showForm = true;
    this.cd.detectChanges();
  }

  deactivate(id: number): void {
    this.activeDropdownId = null;
    if (confirm('Deactivate this announcement?')) {
      this.service.deactivateAnnouncement(id).subscribe({
        next: () => {
          this.loadAnnouncements();
          alert('Announcement deactivated successfully!');
        },
        error: (err) => console.error('Error deactivating:', err)
      });
    }
  }

  deleteAnnouncement(id: number): void {
    this.activeDropdownId = null;
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.service.deleteAnnouncement(id).subscribe({
        next: () => {
          this.announcements = this.announcements.filter(a => a.announcementId !== id);
          this.cd.detectChanges();
          alert('Announcement deleted successfully!');
        },
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'Admin';
  }

  isManager(): boolean {
    return localStorage.getItem('role') === 'Manager';
  }
}
