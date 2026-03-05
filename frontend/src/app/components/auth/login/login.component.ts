import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('heartbridge_remembered_email');
    const rememberMe = localStorage.getItem('heartbridge_remember_me') === 'true';

    if (rememberedEmail && rememberMe) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    console.log('Login form submitted');
    console.log('Form valid:', this.loginForm.valid);

    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;
      const rememberMe = credentials.rememberMe;

      console.log('Sending login credentials:', { email: credentials.email, password: '***' });

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('heartbridge_remembered_email', credentials.email);
        localStorage.setItem('heartbridge_remember_me', 'true');
      } else {
        localStorage.removeItem('heartbridge_remembered_email');
        localStorage.removeItem('heartbridge_remember_me');
      }

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login response received:', response);
          this.loading = false;
          this.snackBar.open('✓ Login successful! Welcome back.', 'Close', { duration: 3000 });

          const role = response.user.role;
          console.log('User role from response:', role);

          // Reset form
          this.loginForm.reset();
          this.showPassword = false;

          // Navigate based on role
          if (role === 'donor') {
            this.router.navigate(['/dashboard']);
          } else if (role === 'ngo_admin') {
            this.router.navigate(['/ngo-dashboard']);
          } else if (role === 'system_admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/marketplace']);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open('✗ ' + errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      console.log('Login form is invalid. Marking fields as touched.');
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
    }
  }

  /**
   * Google Sign-In
   */
  signInWithGoogle() {
    this.loading = true;
    this.authService.googleLogin().subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('✓ Google Sign-In successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('✗ Google Sign-In failed', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  /**
   * Handle Forgot Password
   */
  forgotPassword(event: Event) {
    event.preventDefault();
    const email = this.loginForm.get('email')?.value;

    if (email && !this.loginForm.get('email')?.errors) {
      this.snackBar.open(`✓ Reset link sent to ${email} (Mock)`, 'Close', { duration: 5000 });
    } else {
      this.snackBar.open('Please enter your email address first', 'Close', { duration: 5000 });
    }
  }
}

