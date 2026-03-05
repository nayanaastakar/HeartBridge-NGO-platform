import { Component, OnInit } from '@angular/core';
import { NGOService } from '../../services/ngo.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ImpactStoryService } from '../../services/impact-story.service';
import { AddImpactStoryDialogComponent } from '../add-impact-story-dialog/add-impact-story-dialog.component';
import { lastValueFrom } from 'rxjs';
import { handleImageError } from '../../utils/image-utils';

@Component({
  selector: 'app-ngo-dashboard',
  templateUrl: './ngo-dashboard.component.html',
  styleUrls: ['./ngo-dashboard.component.scss']
})
export class NGODashboardComponent implements OnInit {
  ngo: any = {};
  dashboardData: any = {};
  loading = false;
  impactStories: any[] = [];

  constructor(
    public ngoService: NGOService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private impactStoryService: ImpactStoryService
  ) { }

  ngOnInit() {
    console.log('NGO Dashboard initialized');
    const user = this.authService.getUser();
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Is authenticated:', this.authService.isAuthenticated());

    if (!this.authService.isAuthenticated()) {
      console.warn('User is not authenticated');
      this.snackBar.open('Please login to access NGO dashboard', 'Close', { duration: 3000 });
      return;
    }

    if (user?.role !== 'ngo_admin') {
      console.warn('User is not an NGO admin');
      this.snackBar.open('Access denied. NGO admin access required.', 'Close', { duration: 3000 });
      return;
    }

    this.loadMyNGO();
  }

  refresh() {
    this.loadMyNGO();
  }

  loadMyNGO() {
    console.log('Loading NGO data...');
    this.loading = true;
    this.ngoService.getMyNGO().subscribe({
      next: (response) => {
        console.log('NGO response received:', response);
        this.loading = false;
        this.ngo = response.ngo || {};
        console.log('NGO data set:', this.ngo);
        console.log('NGO name:', this.ngo.name);
        if (this.ngo._id) {
          console.log('Loading dashboard for NGO ID:', this.ngo._id);
          this.loadDashboard(this.ngo._id);
        } else {
          console.warn('No NGO ID found in response');
        }
      },
      error: (error) => {
        console.error('Error loading NGO:', error);
        this.loading = false;
        this.snackBar.open('Error loading NGO', 'Close', { duration: 3000 });
      }
    });
  }

  loadDashboard(ngoId: string) {
    this.loading = true;
    this.analyticsService.getNGODashboard(ngoId).subscribe({
      next: (response) => {
        this.dashboardData = response.data || {};
        this.loadMyStories(ngoId); // Load stories after dashboard data
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading dashboard:', error);
        this.snackBar.open('Error loading dashboard', 'Close', { duration: 3000 });
      }
    });
  }

  loadMyStories(ngoId: string) {
    this.impactStoryService.getImpactStoriesByNGO(ngoId).subscribe({
      next: (response) => {
        this.impactStories = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.loading = false;
      }
    });
  }

  openAddStoryDialog() {
    const dialogRef = this.dialog.open(AddImpactStoryDialogComponent, {
      width: '800px',
      data: { ngoId: this.ngo._id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMyStories(this.ngo._id);
      }
    });
  }

  openEditStoryDialog(story: any) {
    const dialogRef = this.dialog.open(AddImpactStoryDialogComponent, {
      width: '800px',
      data: { story }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMyStories(this.ngo._id);
      }
    });
  }

  deleteStory(storyId: string) {
    if (confirm('Are you sure you want to delete this impact story?')) {
      this.impactStoryService.deleteImpactStory(storyId).subscribe({
        next: () => {
          this.snackBar.open('Story deleted successfully', 'Close', { duration: 3000 });
          this.loadMyStories(this.ngo._id);
        },
        error: (error) => {
          console.error('Error deleting story:', error);
          this.snackBar.open('Failed to delete story', 'Close', { duration: 3000 });
        }
      });
    }
  }

  async uploadDocs(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File too large (Max 10MB)', 'Close', { duration: 3000 });
      return;
    }

    const docTitle = prompt('Enter document title (e.g., Registration Certificate):', 'NGO Registration Certificate');
    if (docTitle) {
      this.loading = true;
      try {
        console.log('Uploading verification document...');
        const res = await lastValueFrom(this.ngoService.uploadDocument(this.ngo._id, file, docTitle));
        this.ngo = res.ngo;
        this.snackBar.open('Document uploaded successfully! Admin will review it.', 'Close', { duration: 5000 });
      } catch (error) {
        console.error('Error uploading document:', error);
        this.snackBar.open('Failed to upload document. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }

  async onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('Logo size too large (Max 2MB)', 'Close', { duration: 3000 });
        return;
      }

      this.loading = true;
      try {
        console.log('Uploading NGO logo...');
        const res = await lastValueFrom(this.ngoService.uploadLogo(this.ngo._id, file));
        // Add cache buster to ensure UI updates
        this.ngo.logo = res.ngo.logo + '?t=' + Date.now();
        this.snackBar.open('NGO Logo updated successfully!', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Error uploading logo:', error);
        this.snackBar.open('Failed to upload logo', 'Close', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }

  async onBannerSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Banner size too large (Max 5MB)', 'Close', { duration: 3000 });
        return;
      }

      this.loading = true;
      try {
        const res = await lastValueFrom(this.ngoService.uploadBanner(this.ngo._id, file));

        // Add cache buster to ensure UI updates
        this.ngo.banner = res.ngo.banner + '?t=' + Date.now();
        this.snackBar.open('Marketplace Banner updated successfully!', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('CRITICAL: Banner upload failed:', error);
        this.snackBar.open('Failed to upload banner', 'Close', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }

  onImageError(event: any): void {
    handleImageError(event);
  }
}
