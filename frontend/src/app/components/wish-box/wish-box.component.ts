import { Component, OnInit } from '@angular/core';
import { WishService } from '../../services/wish.service';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../config';

declare var Razorpay: any;

@Component({
  selector: 'app-wish-box',
  templateUrl: './wish-box.component.html',
  styleUrls: ['./wish-box.component.scss']
})
export class WishBoxComponent implements OnInit {
  wishes: any[] = [];
  loading = false;
  statusFilter = 'ACTIVE';
  showCreateForm = false;
  isNGOAdmin = false;
  createForm: FormGroup;
  submitting = false;
  donationForm!: FormGroup;
  showDonationModal = false;
  selectedWish: any = null;
  donatingWishId = '';
  isDonating = false;
  editingWish: any = null;

  constructor(
    private wishService: WishService,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      occasion: ['', Validators.required],
      requiredAmount: ['', [Validators.required, Validators.min(100)]],
      deadline: ['', Validators.required]
    });
    this.donationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      isAnonymous: [false]
    });
  }

  ngOnInit() {
    this.checkUserRole();
    this.loadWishes();
  }

  checkUserRole() {
    const user = this.authService.getUser();
    this.isNGOAdmin = user?.role === 'ngo_admin' || user?.role === 'system_admin';
  }

  isPersonalWish(wish: any): boolean {
    if (!wish || !wish.occasion) return false;
    const personalKeywords = ['personal', 'amit', 'priya', 'sunita', 'karan', 'need', 'individual'];
    const occasion = wish.occasion.toLowerCase();
    const title = wish.title.toLowerCase();
    return personalKeywords.some(keyword => occasion.includes(keyword) || title.includes(keyword));
  }

  isNGOWish(wish: any): boolean {
    if (!wish || !wish.occasion) return false;
    const ngoKeywords = ['ngo', 'infrastructure', 'facility', 'equipment', 'playground', 'home'];
    const occasion = wish.occasion.toLowerCase();
    const title = wish.title.toLowerCase();
    return ngoKeywords.some(keyword => occasion.includes(keyword) || title.includes(keyword)) && !this.isPersonalWish(wish);
  }
  canManageWish(wish: any): boolean {
    const user = this.authService.getUser();
    if (!user) return false;
    if (user.role === 'system_admin') return true;
    if (user.role === 'ngo_admin') {
      // Check if this wish belongs to the user's NGO
      // wish.ngoId might be an ID string or an object with _id depending on population
      const wishNgoId = wish.ngoId?._id || wish.ngoId;
      return user.ngoId === wishNgoId;
    }
    return false;
  }

  loadWishes() {
    this.loading = true;
    const filters = this.statusFilter ? { status: this.statusFilter } : {};
    this.wishService.getWishes(filters).subscribe({
      next: (response) => {
        this.loading = false;
        this.wishes = response.data || [];
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading wishes', 'Close', { duration: 3000 });
      }
    });
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.loadWishes();
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.editingWish = null;
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

  submitWish() {
    if (this.createForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    let wishData: any;

    if (this.editingWish) {
      // For update, only send form fields
      wishData = this.createForm.value;
    } else {
      // For create, include defaults
      wishData = {
        ...this.createForm.value,
        collectedAmount: 0,
        status: 'ACTIVE'
      };
    }

    const request = this.editingWish
      ? this.wishService.updateWish(this.editingWish._id, wishData)
      : this.wishService.createWish(wishData);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.snackBar.open(
          this.editingWish ? 'Wish updated successfully' : 'Wish created successfully',
          'Close',
          { duration: 3000 }
        );
        this.editingWish = null;
        this.createForm.reset();
        this.showCreateForm = false;
        this.loadWishes();
      },
      error: (error) => {
        this.submitting = false;
        const errorMessage = error?.error?.message || 'Error saving wish';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        console.error('Error saving wish:', error);
      }
    });
  }

  editWish(wish: any) {
    this.editingWish = wish;
    this.createForm.patchValue({
      title: wish.title,
      description: wish.description,
      occasion: wish.occasion,
      requiredAmount: wish.requiredAmount,
      deadline: new Date(wish.deadline).toISOString().split('T')[0]
    });
    this.showCreateForm = true;
    this.scrollToForm();
  }

  deleteWish(wish: any) {
    if (confirm('Are you sure you want to delete this wish?')) {
      this.wishService.deleteWish(wish._id).subscribe({
        next: () => {
          this.snackBar.open('Wish deleted successfully', 'Close', { duration: 3000 });
          this.loadWishes();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Error deleting wish';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      });
    }
  }

  openDonationModal(wish: any) {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to donate', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.selectedWish = wish;
    this.donatingWishId = wish._id;
    this.showDonationModal = true;
    this.donationForm.reset();
  }

  closeDonationModal() {
    this.showDonationModal = false;
    this.selectedWish = null;
    this.donatingWishId = '';
    this.donationForm.reset();
  }

  showThankYou = false;
  lastDonationAmount = 0;

  closeThankYou() {
    this.showThankYou = false;
    this.closeDonationModal();
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
          colors: ['#4338ca', '#f43f5e', '#10b981', '#fbbf24']
        });
      }
      if (Math.random() > 0.5) {
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4338ca', '#f43f5e', '#10b981', '#fbbf24']
        });
      }
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  submitDonation() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to donate', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (this.donationForm.invalid) {
      this.snackBar.open('Please enter a valid amount', 'Close', { duration: 3000 });
      return;
    }

    this.isDonating = true;
    const amount = this.donationForm.value.amount;

    // Create Razorpay Order
    this.donationService.createRazorpayOrder(amount).subscribe({
      next: (response) => {
        const options = {
          key: environment.razorpayKeyId, // Using centralized config
          amount: response.order.amount,
          currency: response.order.currency,
          name: 'HeartBridge',
          description: `Donation for Wish: ${this.selectedWish.title}`,
          order_id: response.order.id,
          handler: (paymentResponse: any) => {
            this.verifyAndCompleteDonation(paymentResponse, amount);
          },
          prefill: {
            name: this.authService.getUser()?.name || '',
            email: this.authService.getUser()?.email || '',
          },
          theme: {
            color: '#4338ca' // Indigo
          },
          modal: {
            ondismiss: () => {
              this.isDonating = false;
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
            this.isDonating = false;
            this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
          });
        } catch (e) {
          this.isDonating = false;
          this.snackBar.open('Razorpay failed to load.', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isDonating = false;
        this.snackBar.open('Error initiating payment. Please try again.', 'Close', { duration: 3000 });
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
          // Finalize donation in database
          const donationData = {
            relatedId: this.donatingWishId,
            amount: amount,
            isAnonymous: this.donationForm.value.isAnonymous,
            donationType: 'wish',
            paymentMethod: 'online',
            transactionId: paymentResponse.razorpay_payment_id,
            razorpayOrderId: paymentResponse.razorpay_order_id
          };

          this.donationService.createDonation(donationData).subscribe({
            next: (response) => {
              this.isDonating = false;
              this.lastDonationAmount = amount;
              this.showThankYou = true; // Show success overlay
              this.triggerConfetti();
              this.loadWishes();
            },
            error: (error) => {
              this.isDonating = false;
              this.snackBar.open('Donation recorded but error updating stats.', 'Close', { duration: 3000 });
            }
          });
        }
      },
      error: (error) => {
        this.isDonating = false;
        this.snackBar.open('Payment verification failed.', 'Close', { duration: 3000 });
      }
    });
  }
  shareWish(wish: any) {
    const shareUrl = `${window.location.origin}/wish-box`;
    const title = `✨ Helping Hands: ${wish.title}`;
    const text = `Help us make this wish come true! ${wish.ngoId?.name} needs support for ${wish.title}. ${wish.description?.substring(0, 100)}...`;

    if (navigator.share) {
      navigator.share({ title, text, url: shareUrl }).then(() => {
        this.snackBar.open('Thanks for sharing the magic! ✨', 'Close', { duration: 3000 });
      }).catch(err => {
        if (err.name !== 'AbortError') this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Wish link copied! Share with others 📤', 'Close', { duration: 3000 });
    }).catch(err => {
      this.snackBar.open('Failed to copy link.', 'Close', { duration: 3000 });
    });
  }
}

declare var confetti: any;

