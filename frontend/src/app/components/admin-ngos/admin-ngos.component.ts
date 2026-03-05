import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CreateNGODialogComponent } from '../create-ngo-dialog/create-ngo-dialog.component';
import { ReviewDocsDialogComponent } from '../review-docs-dialog/review-docs-dialog.component';

import { environment } from '../../config';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-admin-ngos',
  templateUrl: './admin-ngos.component.html',
  styleUrls: ['./admin-ngos.component.scss']
})
export class AdminNGOsComponent implements OnInit {
  ngos: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadNGOs();
  }

  loadNGOs() {
    this.loading = true;
    this.http.get(`${API_URL}/ngos`).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.ngos = response.ngos || [];
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading NGOs', 'Close', { duration: 3000 });
      }
    });
  }

  viewNGODetails(ngoId: string) {
    this.router.navigate(['/ngo', ngoId]);
  }

  createNGO() {
    const dialogRef = this.dialog.open(CreateNGODialogComponent, {
      width: '600px',
      maxHeight: '80vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('NGO created successfully', 'Close', { duration: 3000 });
        this.loadNGOs(); // Refresh the list
      }
    });
  }

  editNGO(ngo: any) {
    const dialogRef = this.dialog.open(CreateNGODialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: { ngo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadNGOs(); // Refresh the list
      }
    });
  }

  deleteNGO(ngoId: string) {
    if (confirm('Are you sure you want to delete this NGO? This action cannot be undone.')) {
      this.http.delete(`${API_URL}/ngos/${ngoId}`).subscribe({
        next: (response: any) => {
          this.snackBar.open('NGO deleted successfully', 'Close', { duration: 3000 });
          this.loadNGOs(); // Refresh the list
        },
        error: (error) => {
          this.snackBar.open('Error deleting NGO', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleVerification(ngo: any, skipConfirm: boolean = false) {
    const newStatus = !ngo.isVerified;
    const action = newStatus ? 'verify' : 'unverify';

    const proceed = skipConfirm || confirm(`Are you sure you want to ${action} ${ngo.name}?`);

    if (proceed) {
      this.http.put(`${API_URL}/ngos/${ngo._id}`, { isVerified: newStatus }).subscribe({
        next: (response: any) => {
          this.snackBar.open(`NGO ${newStatus ? 'verified' : 'unverified'} successfully`, 'Close', { duration: 3000 });
          this.loadNGOs(); // Refresh the list
        },
        error: (error) => {
          const errorMessage = error?.error?.message || `Error ${action}ing NGO`;
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }

  reviewDocs(ngo: any) {
    const dialogRef = this.dialog.open(ReviewDocsDialogComponent, {
      width: '600px',
      data: { ngo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'verify') {
        this.toggleVerification(ngo, true);
      }
    });
  }

  getThemeClass(category: string): string {
    if (!category) return 'theme-default';
    const cat = category.toLowerCase();
    if (cat.includes('child')) return 'theme-child';
    if (cat.includes('old age')) return 'theme-senior';
    if (cat.includes('food')) return 'theme-food';
    if (cat.includes('health')) return 'theme-health';
    if (cat.includes('disab')) return 'theme-ability';
    if (cat.includes('animal')) return 'theme-animal';
    if (cat.includes('education')) return 'theme-edu';
    return 'theme-default';
  }
}
