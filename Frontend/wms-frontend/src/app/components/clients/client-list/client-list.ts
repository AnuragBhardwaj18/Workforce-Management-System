import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ClientService } from '../../../services/client';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css'
})
export class ClientList implements OnInit {
  clients: any[] = [];
  showForm = false;
  isEdit = false;
  editId = 0;

  client: any = this.getEmptyClient();

  constructor(
    private service: ClientService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  getEmptyClient() {
    return {
      clientName: '',
      clientAddress: '',
      clientPhoneNumber: '',
      clientLocation: '',
      status: true
    };
  }

  loadClients(): void {
    this.service.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Load clients error:', err)
    });
  }

  openForm(): void {
    this.client = this.getEmptyClient();
    this.isEdit = false;
    this.editId = 0;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.editId = 0;
    this.client = this.getEmptyClient();
  }

  saveClient(): void {
    if (!this.client.clientName?.trim()) {
      alert('Client Name is required');
      return;
    }

    const payload = {
      clientName: this.client.clientName,
      clientAddress: this.client.clientAddress,
      clientPhoneNumber: this.client.clientPhoneNumber,
      clientLocation: this.client.clientLocation,
      status: this.client.status
    };

    if (this.isEdit) {
      this.service.updateClient(this.editId, payload).subscribe({
        next: (res) => {
          const idx = this.clients.findIndex(c => c.clientId === this.editId);
          if (idx !== -1) {
            this.clients[idx] = { ...this.clients[idx], ...res };
            this.clients = [...this.clients];
          }
          this.cancelForm();
          this.cd.detectChanges();
          alert('Client updated successfully');
          this.loadClients();
        },
        error: (err) => {
          console.error('Update client error:', err);
          alert('Failed to update client');
        }
      });
    } else {
      this.service.addClient(payload).subscribe({
        next: (res) => {
          this.clients = [...this.clients, res];
          this.cancelForm();
          this.cd.detectChanges();
          alert('Client added successfully');
          this.loadClients();
        },
        error: (err) => {
          console.error('Add client error:', err);
          alert('Failed to add client');
        }
      });
    }
  }

  editClient(c: any): void {
    this.isEdit = true;
    this.editId = c.clientId;
    this.client = {
      clientName: c.clientName,
      clientAddress: c.clientAddress,
      clientPhoneNumber: c.clientPhoneNumber,
      clientLocation: c.clientLocation,
      status: c.status
    };
    this.showForm = true;
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.service.deleteClient(id).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.clientId !== id);
          this.cd.detectChanges();
          alert('Client deleted successfully');
        },
        error: (err) => {
          console.error('Delete client error:', err);
          alert('Failed to delete client. This client cannot be deleted because they are currently assigned to one or more projects.');
        }
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
