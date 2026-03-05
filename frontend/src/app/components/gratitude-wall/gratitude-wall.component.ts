import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GratitudeService } from '../../services/gratitude.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-gratitude-wall',
  templateUrl: './gratitude-wall.component.html',
  styleUrls: ['./gratitude-wall.component.scss']
})
export class GratitudeWallComponent implements OnInit {
  messages: any[] = [];
  loading = false;
  postingMessage = false;
  showPostForm = false;
  gratitudeForm!: FormGroup;
  isLoggedIn = false;
  userRole = '';

  constructor(
    private gratitudeService: GratitudeService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.gratitudeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.loadGratitudeWall();
    this.checkUserAuth();
  }

  checkUserAuth() {
    const user = this.authService.getUser();
    this.isLoggedIn = !!user;
    this.userRole = user?.role || '';
  }

  loadGratitudeWall() {
    this.loading = true;
    this.gratitudeService.getGratitudeWall(50).subscribe({
      next: (response) => {
        this.loading = false;
        this.messages = response.data || [];
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading gratitude wall', 'Close', { duration: 3000 });
      }
    });
  }

  togglePostForm() {
    this.showPostForm = !this.showPostForm;
  }

  postGratitude() {
    if (this.gratitudeForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.postingMessage = true;
    this.gratitudeService.createGratitude(this.gratitudeForm.value).subscribe({
      next: (response) => {
        this.postingMessage = false;
        this.snackBar.open('Thank you message posted successfully!', 'Close', { duration: 3000 });
        this.gratitudeForm.reset();
        this.showPostForm = false;
        this.loadGratitudeWall();
      },
      error: (error) => {
        this.postingMessage = false;
        const errorMsg = error?.error?.message || 'Error posting gratitude message';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
  }

  canPostGratitude(): boolean {
    return this.isLoggedIn && this.userRole === 'ngo_admin';
  }

  shareGratitude(message: any) {
    const shareUrl = `${window.location.origin}/gratitude-wall`;
    const title = `❤️ Gratitude: ${message.title}`;
    const text = `A message of thanks from ${message.ngoId?.name}: "${message.title}". Check out the HeartBridge Gratitude Wall!`;

    if (navigator.share) {
      navigator.share({ title, text, url: shareUrl }).then(() => {
        this.snackBar.open('Thanks for sharing the gratitude! ❤️', 'Close', { duration: 3000 });
      }).catch(err => {
        if (err.name !== 'AbortError') this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Wall link copied! Share with others 📤', 'Close', { duration: 3000 });
    }).catch(err => {
      this.snackBar.open('Failed to copy link.', 'Close', { duration: 3000 });
    });
  }
}


