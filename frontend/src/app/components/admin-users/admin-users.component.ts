import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DataPreviewDialogComponent } from '../data-preview-dialog/data-preview-dialog.component';

import { environment } from '../../config';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  searchQuery = '';

  stats = {
    total: 0,
    admins: 0,
    ngos: 0,
    donors: 0
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get(`${API_URL}/users`).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.users = response.users || [];
        this.applyFilter();
        this.calculateStats();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredUsers = [...this.users];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user =>
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      );
    }
  }

  calculateStats() {
    this.stats = {
      total: this.users.length,
      admins: this.users.filter(u => u.role === 'system_admin').length,
      ngos: this.users.filter(u => u.role === 'ngo_admin').length,
      donors: this.users.filter(u => u.role === 'donor').length
    };
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  private pastelPalette = [
    { bg: '#ffcfd2', text: '#991b1b' }, // Salmon
    { bg: '#cfe1ff', text: '#1e40af' }, // Blue
    { bg: '#fdecc8', text: '#92400e' }, // Apricot
    { bg: '#dcfce7', text: '#166534' }, // Green
    { bg: '#f5f3ff', text: '#5b21b6' }, // Violet
    { bg: '#fff1f2', text: '#9f1239' }, // Rose
    { bg: '#fef9c3', text: '#854d0e' }, // Yellow
    { bg: '#e0f2fe', text: '#075985' }  // Cyan
  ];

  getUserPastel(user: any) {
    // Generate a consistent index based on the user's name or ID
    const seed = user._id || user.name || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.pastelPalette.length;
    return this.pastelPalette[index];
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'system_admin': return '#ffcfd2';
      case 'ngo_admin': return '#cfe1ff';
      case 'donor': return '#fdecc8';
      default: return '#f1f5f9';
    }
  }

  getRoleTextColor(role: string): string {
    switch (role) {
      case 'system_admin': return '#991b1b';
      case 'ngo_admin': return '#1e40af';
      case 'donor': return '#92400e';
      default: return '#475569';
    }
  }

  viewProfile(user: any) {
    this.dialog.open(DataPreviewDialogComponent, {
      width: '500px',
      data: {
        title: `User Profile: ${user.name}`,
        content: {
          personalInfo: {
            name: user.name,
            email: user.email,
            phone: user.phone || 'Not provided',
            address: user.address || 'Not provided',
            bio: user.bio || 'No bio available'
          },
          accountInfo: {
            role: user.role?.toUpperCase(),
            joinedDate: new Date(user.createdAt).toLocaleDateString(),
            userId: user._id
          }
        }
      }
    });
  }

  changeRole(user: any, newRole: string) {
    this.http.put(`${API_URL}/users/role`, { userId: user._id, role: newRole }).subscribe({
      next: (response: any) => {
        this.snackBar.open(`User promoted to ${newRole.replace('_', ' ')}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.name}? This cannot be undone.`)) {
      this.http.delete(`${API_URL}/users/${user._id}`).subscribe({
        next: (response: any) => {
          this.snackBar.open(`${user.name} deleted successfully`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
