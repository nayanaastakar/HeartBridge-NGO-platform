import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  adminLoginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.adminLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.adminLoginForm.valid) {
      this.loading = true;
      const credentials = this.adminLoginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.user.role === 'system_admin') {
            this.snackBar.open('✓ Welcome, System Administrator', 'Close', { duration: 3000 });
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.snackBar.open('✗ Access Denied: This portal is for System Administrators only.', 'Close', { duration: 5000 });
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.loading = false;
          const msg = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open('✗ ' + msg, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
