import { Component, OnInit } from '@angular/core';
import { AdoptADayService } from '../../services/adopt-a-day.service';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../config';

declare var Razorpay: any;

@Component({
  selector: 'app-adopt-a-day',
  templateUrl: './adopt-a-day.component.html',
  styleUrls: ['./adopt-a-day.component.scss']
})
export class AdoptADayComponent implements OnInit {
  days: any[] = [];
  loading = false;
  showCreateForm = false;
  isNGOAdmin = false;
  createForm: FormGroup;
  submitting = false;
  adoptForm!: FormGroup;
  showAdoptModal = false;
  selectedDay: any = null;
  adoptingDayId = '';
  isAdopting = false;
  editingDay: any = null;

  constructor(
    private adoptADayService: AdoptADayService,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public router: Router
  ) {
    this.createForm = this.fb.group({
      date: ['', Validators.required],
      purpose: ['', Validators.required],
      requiredAmount: ['', [Validators.required, Validators.min(500)]],
      description: ['', Validators.required]
    });
    this.adoptForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      isAnonymous: [false]
    });
  }

  ngOnInit() {
    this.checkUserRole();
    this.loadAvailableDays();
  }

  checkUserRole() {
    const user = this.authService.getUser();
    this.isNGOAdmin = user?.role === 'ngo_admin' || user?.role === 'system_admin';
  }

  canManageDay(day: any): boolean {
    const user = this.authService.getUser();
    if (!user) return false;
    if (user.role === 'system_admin') return true;
    if (user.role === 'ngo_admin') {
      const dayNgoId = day.ngoId?._id || day.ngoId;
      return user.ngoId === dayNgoId;
    }
    return false;
  }

  loadAvailableDays() {
    this.loading = true;
    this.adoptADayService.getAvailableDays().subscribe({
      next: (response) => {
        this.loading = false;
        this.days = response.data || [];
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading adoptable days', 'Close', { duration: 3000 });
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.editingDay = null;
      this.createForm.reset();
    } else {
      this.scrollToForm();
    }
  }

  private scrollToForm() {
    setTimeout(() => {
      const element = document.querySelector('.create-form-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  submitAdoptADay() {
    if (this.createForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    let dayData: any;

    if (this.editingDay) {
      dayData = this.createForm.value;
    } else {
      dayData = {
        ...this.createForm.value,
        collectedAmount: 0,
        status: 'AVAILABLE'
      };
    }

    const request = this.editingDay
      ? this.adoptADayService.updateAdoptADay(this.editingDay._id, dayData)
      : this.adoptADayService.createAdoptADay(dayData);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.snackBar.open(
          this.editingDay ? 'Adopt-a-Day program updated successfully' : 'Adopt-a-Day program created successfully',
          'Close',
          { duration: 3000 }
        );
        this.editingDay = null;
        this.createForm.reset();
        this.showCreateForm = false;
        this.loadAvailableDays();
      },
      error: (error) => {
        this.submitting = false;
        const errorMessage = error?.error?.message || 'Error saving adopt-a-day program';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        console.error('Error saving adopt-a-day:', error);
      }
    });
  }

  editDay(day: any) {
    this.editingDay = day;
    this.createForm.patchValue({
      date: new Date(day.date).toISOString().split('T')[0],
      purpose: day.purpose,
      requiredAmount: day.requiredAmount,
      description: day.description
    });
    this.showCreateForm = true;
    this.scrollToForm();
  }

  deleteDay(day: any) {
    if (confirm('Are you sure you want to delete this adopt-a-day program?')) {
      this.adoptADayService.deleteAdoptADay(day._id).subscribe({
        next: () => {
          this.snackBar.open('Adopt-a-Day program deleted successfully', 'Close', { duration: 3000 });
          this.loadAvailableDays();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Error deleting adopt-a-day program';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      });
    }
  }

  openAdoptModal(day: any) {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to adopt a day', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.selectedDay = day;
    this.adoptingDayId = day._id;
    this.showAdoptModal = true;
    this.adoptForm.reset();
  }

  closeAdoptModal() {
    this.showAdoptModal = false;
    this.selectedDay = null;
    this.adoptingDayId = '';
    this.adoptForm.reset();
  }

  showThankYou = false;
  lastDonationAmount = 0;

  closeThankYou() {
    this.showThankYou = false;
    this.closeAdoptModal();
  }

  triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      if (Math.random() > 0.5) {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981'] // Golden/Happy theme
        });
      }
      if (Math.random() > 0.5) {
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981']
        });
      }
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  submitAdoption() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to adopt a day', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (this.adoptForm.invalid) {
      this.snackBar.open('Please enter a valid amount', 'Close', { duration: 3000 });
      return;
    }

    this.isAdopting = true;
    const amount = this.adoptForm.value.amount;

    // Create Razorpay Order
    this.donationService.createRazorpayOrder(amount).subscribe({
      next: (response) => {
        const options = {
          key: environment.razorpayKeyId, // Using centralized config
          amount: response.order.amount,
          currency: response.order.currency,
          name: 'HeartBridge',
          description: `Adopt a Day: ${this.selectedDay.purpose}`,
          order_id: response.order.id,
          handler: (paymentResponse: any) => {
            this.verifyAndCompleteDonation(paymentResponse, amount);
          },
          prefill: {
            name: this.authService.getUser()?.name || '',
            email: this.authService.getUser()?.email || '',
          },
          theme: {
            color: '#d97706' // Amber-600
          },
          modal: {
            ondismiss: () => {
              this.isAdopting = false;
            }
          }
        };

        if (response.demoMode) {
          this.snackBar.open('Demo Mode: Simulating secure payment popup...', 'Close', { duration: 2000 });
          setTimeout(() => {
            const mockResponse = {
              razorpay_order_id: response.order.id,
              razorpay_payment_id: `pay_demo_${Date.now()}`,
              razorpay_signature: 'demo_signature'
            };
            this.verifyAndCompleteDonation(mockResponse, amount);
          }, 2500);
          return;
        }

        try {
          const rzp = new Razorpay(options);
          rzp.open();

          rzp.on('payment.failed', (response: any) => {
            this.isAdopting = false;
            this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
          });
        } catch (e) {
          this.isAdopting = false;
          this.snackBar.open('Razorpay failed to load.', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isAdopting = false;
        this.snackBar.open('Error initiating payment.', 'Close', { duration: 3000 });
      }
    });
  }

  verifyAndCompleteDonation(paymentResponse: any, amount: number) {
    const paymentData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    };

    this.donationService.verifyRazorpayPayment(paymentData).subscribe({
      next: (verification) => {
        if (verification.success) {
          const adoptionData = {
            relatedId: this.adoptingDayId,
            amount: amount,
            isAnonymous: this.adoptForm.value.isAnonymous,
            donationType: 'adopt_a_day',
            paymentMethod: 'online',
            transactionId: paymentResponse.razorpay_payment_id,
            razorpayOrderId: paymentResponse.razorpay_order_id
          };

          this.donationService.createDonation(adoptionData).subscribe({
            next: (response) => {
              this.isAdopting = false;
              this.lastDonationAmount = amount;
              this.showThankYou = true;
              this.triggerConfetti();
              this.loadAvailableDays();
            },
            error: (error) => {
              this.isAdopting = false;
              this.snackBar.open('Adoption recorded but error updating stats.', 'Close', { duration: 3000 });
            }
          });
        }
      },
      error: (error) => {
        this.isAdopting = false;
        this.snackBar.open('Payment verification failed.', 'Close', { duration: 3000 });
      }
    });
  }
  shareDay(day: any) {
    const shareUrl = `${window.location.origin}/adopt-a-day`;
    const title = `📅 Special Day: ${day.purpose}`;
    const text = `Sponsor a day of joy! ${day.ngoId?.name} is looking for someone to adopt ${day.date} for ${day.purpose}. ${day.description?.substring(0, 100)}...`;

    if (navigator.share) {
      navigator.share({ title, text, url: shareUrl }).then(() => {
        this.snackBar.open('Thanks for sharing the love! 📅', 'Close', { duration: 3000 });
      }).catch(err => {
        if (err.name !== 'AbortError') this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Program link copied! Share with others 📤', 'Close', { duration: 3000 });
    }).catch(err => {
      this.snackBar.open('Failed to copy link.', 'Close', { duration: 3000 });
    });
  }
}

declare var confetti: any;

