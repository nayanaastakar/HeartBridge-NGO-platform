import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
    otpForm: FormGroup;
    loading = false;
    email: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        });
    }

    ngOnInit(): void {
        this.email = this.route.snapshot.queryParamMap.get('email') || '';
        if (!this.email) {
            this.snackBar.open('No email provided. Please register first.', 'Close', { duration: 5000 });
            this.router.navigate(['/register']);
        }
    }

    onSubmit(): void {
        if (this.otpForm.valid && this.email) {
            this.loading = true;
            const otp = this.otpForm.value.otp;

            this.authService.verifyOTP(this.email, otp).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.snackBar.open('✓ Email verified successfully! You can now log in.', 'Close', { duration: 5000 });
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.loading = false;
                    const msg = err.error?.message || 'Invalid or expired OTP. Please try again.';
                    this.snackBar.open('✗ ' + msg, 'Close', { duration: 5000 });
                }
            });
        }
    }
}
