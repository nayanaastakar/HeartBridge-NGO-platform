import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  roles = ['donor', 'ngo_admin'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      ngoName: [''],
      registrationNumber: [''],
      adminKey: [''],
      phone: [''],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });

    // Conditional validators for NGO role
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const ngoName = this.registerForm.get('ngoName');
      const regNum = this.registerForm.get('registrationNumber');
      const adminKey = this.registerForm.get('adminKey');
      if (role === 'ngo_admin') {
        ngoName?.setValidators([Validators.required]);
        regNum?.setValidators([Validators.required]);
      } else {
        ngoName?.clearValidators();
        regNum?.clearValidators();
      }
      ngoName?.updateValueAndValidity();
      regNum?.updateValueAndValidity();
    });
  }

  /**
   * Set user role
   */
  setRole(role: string): void {
    this.registerForm.patchValue({ role });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Validate password match
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    console.log('Form submitted');
    console.log('Form valid:', this.registerForm.valid);

    if (this.registerForm.valid) {
      this.loading = true;
      const formValue = { ...this.registerForm.value };
      delete formValue.confirmPassword;
      delete formValue.terms;

      console.log('Sending registration data:', formValue);

      this.authService.register(formValue).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.loading = false;
          this.snackBar.open('✓ Account created! Please enter the OTP sent to your email.', 'Close', { duration: 10000 });
          setTimeout(() => {
            this.router.navigate(['/verify-email'], { queryParams: { email: formValue.email } });
          }, 3000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.snackBar.open('✗ ' + errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
    }
  }
}

