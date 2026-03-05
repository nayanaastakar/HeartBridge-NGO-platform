import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent {
  adminRegisterForm: FormGroup;
  loading = false;

  // Define validator as arrow function for proper 'this' binding
  passwordMatchValidator = (form: FormGroup) => {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword.hasError('required')) {
        confirmPassword.setErrors({ required: true });
      } else {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.adminRegisterForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      adminKey: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    console.log('Admin form submitted');
    console.log('Form valid:', this.adminRegisterForm.valid);
    console.log('Form errors:', this.adminRegisterForm.errors);
    console.log('All form controls:', {
      name: this.adminRegisterForm.get('name')?.value,
      email: this.adminRegisterForm.get('email')?.value,
      password: '***',
      confirmPassword: '***',
      adminKey: '***'
    });

    if (this.adminRegisterForm.valid) {
      this.loading = true;
      const formValue = { ...this.adminRegisterForm.value };
      delete formValue.confirmPassword;
      
      console.log('Sending to backend:', { ...formValue, password: '***', adminKey: '***' });

      this.authService.registerAdmin(formValue).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Admin registration successful!', response);
          this.snackBar.open('✅ Admin registration successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Admin registration error:', error);
          const errorMsg = error.error?.message || 'Admin registration failed';
          
          // Better error messages
          if (errorMsg.includes('Invalid admin registration key')) {
            this.snackBar.open('❌ Invalid Admin Key - Check key spelling exactly', 'Close', { duration: 5000 });
          } else if (errorMsg.includes('Email already registered')) {
            this.snackBar.open('❌ Email already registered', 'Close', { duration: 5000 });
          } else {
            this.snackBar.open('❌ ' + errorMsg, 'Close', { duration: 5000 });
          }
        }
      });
    } else {
      console.log('Form invalid - marking all fields as touched');
      // Mark all fields as touched to show validation errors
      Object.keys(this.adminRegisterForm.controls).forEach(key => {
        const control = this.adminRegisterForm.get(key);
        control?.markAsTouched();
        console.log(`${key}: touched=${control?.touched}, errors=`, control?.errors);
      });
    }
  }
}
