import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { NGOService } from '../../services/ngo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  ngo: any = null;
  loading = false;
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ngoService: NGOService,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getUser();
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required]],
      bio: [this.currentUser?.bio || '', [Validators.maxLength(500)]],
      phone: [this.currentUser?.phone || ''],
      address: [this.currentUser?.address || '']
    });

    if (this.currentUser?.profilePicture) {
      this.previewImage = this.currentUser.profilePicture;
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.profilePicture && !this.selectedFile) {
        this.previewImage = user.profilePicture;
      }
      if (user?.role === 'ngo_admin') {
        this.loadNGO();
      }
    });

    if (this.currentUser?.role === 'ngo_admin') {
      this.loadNGO();
    }
  }

  loadNGO() {
    this.ngoService.getMyNGO().subscribe({
      next: (res) => this.ngo = res.ngo,
      error: (err) => console.error('Error loading NGO for profile:', err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('File size too large (Max 2MB)', 'Close', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const formData = this.profileForm.value;

      this.authService.updateProfile(formData).subscribe({
        next: async (response) => {
          try {
            if (this.selectedFile) {
              await lastValueFrom(this.authService.uploadProfilePicture(this.selectedFile));
            }
            this.loading = false;
            this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          } catch (uploadError) {
            this.loading = false;
            this.snackBar.open('Profile info updated, but image upload failed', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to update profile info', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
