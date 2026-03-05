import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EmergencyFundService } from '../../services/emergency-fund.service';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from '../../config';

const API_URL = environment.apiUrl;

declare var Razorpay: any;

@Component({
  selector: 'app-emergency-funds',
  templateUrl: './emergency-funds.component.html',
  styleUrls: ['./emergency-funds.component.scss']
})
export class EmergencyFundsComponent implements OnInit {
  funds: any[] = [];
  loading = false;
  showCreateForm = false;
  isNGOAdmin = false;
  createForm: FormGroup;
  submitting = false;
  donationForm!: FormGroup;
  showDonationModal = false;
  selectedFund: any = null;
  donatingFundId = '';
  isDonating = false;
  editingFund: any = null;
  selectedFile: File | null = null;
  uploadingDocument = false;
  documentUploadError = '';
  showThankYou = false;
  lastDonationAmount = 0;

  readonly baseUrl = environment.apiUrl;

  emergencyTypes = [
    'Natural Disaster',
    'Medical Emergency',
    'Food Crisis',
    'Shelter Emergency',
    'Infrastructure Damage',
    'Other'
  ];

  constructor(
    private emergencyFundService: EmergencyFundService,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      emergencyType: ['', Validators.required],
      priority: ['high', Validators.required],
      requiredAmount: ['', [Validators.required, Validators.min(1000)]],
      deadline: ['', Validators.required]
    });
    this.donationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      isAnonymous: [false]
    });
  }

  ngOnInit() {
    this.checkUserRole();
    this.route.queryParams.subscribe(params => {
      const filters: any = {};
      if (params['ngoId']) filters.ngoId = params['ngoId'];
      this.loadEmergencyFunds(filters);
    });
  }

  checkUserRole() {
    const user = this.authService.getUser();
    this.isNGOAdmin = user?.role === 'ngo_admin' || user?.role === 'system_admin';
  }

  canManageFund(fund: any): boolean {
    const user = this.authService.getUser();
    if (!user) return false;
    if (user.role === 'system_admin') return true;
    if (user.role === 'ngo_admin') {
      const fundNgoId = fund.ngoId?._id || fund.ngoId;
      return user.ngoId === fundNgoId;
    }
    return false;
  }

  loadEmergencyFunds(filters = {}) {
    this.loading = true;
    const queryFilters = { status: 'ACTIVE', ...filters };
    this.emergencyFundService.getEmergencyFunds(queryFilters).subscribe({
      next: (response) => {
        this.loading = false;
        this.funds = response.data || [];
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading emergency funds', 'Close', { duration: 3000 });
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.editingFund = null;
      this.createForm.reset({ priority: 'high' });
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

  submitEmergencyFund() {
    if (this.createForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    this.submitting = true;
    let fundData: any;

    if (this.editingFund) {
      fundData = this.createForm.value;
    } else {
      fundData = {
        ...this.createForm.value,
        collectedAmount: 0,
        status: 'ACTIVE'
      };
    }

    const request = this.editingFund
      ? this.emergencyFundService.updateEmergencyFund(this.editingFund._id, fundData)
      : this.emergencyFundService.createEmergencyFund(fundData);
    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.snackBar.open(this.editingFund ? 'Emergency fund updated successfully' : 'Emergency fund created successfully', 'Close', { duration: 3000 });
        this.editingFund = null;
        this.createForm.reset({ priority: 'high' });
        this.showCreateForm = false;
        this.loadEmergencyFunds();
      },
      error: (error) => {
        this.submitting = false;
        const errorMessage = error?.error?.message || 'Error saving emergency fund';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  editFund(fund: any) {
    this.editingFund = fund;
    this.createForm.patchValue({
      title: fund.title,
      description: fund.description,
      emergencyType: fund.emergencyType,
      priority: fund.priority,
      requiredAmount: fund.requiredAmount,
      deadline: new Date(fund.deadline).toISOString().split('T')[0]
    });
    this.showCreateForm = true;
    this.scrollToForm();
  }

  deleteFund(fund: any) {
    if (confirm('Are you sure you want to delete this emergency fund?')) {
      this.emergencyFundService.deleteEmergencyFund(fund._id).subscribe({
        next: () => {
          this.snackBar.open('Emergency fund deleted successfully', 'Close', { duration: 3000 });
          this.loadEmergencyFunds();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message || 'Error deleting emergency fund', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openDonationModal(fund: any) {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to donate', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.selectedFund = fund;
    this.donatingFundId = fund._id;
    this.showDonationModal = true;
    this.donationForm.reset();
  }

  closeDonationModal() {
    this.showDonationModal = false;
    this.selectedFund = null;
    this.donatingFundId = '';
    this.donationForm.reset();
  }

  closeThankYou() {
    this.showThankYou = false;
    this.closeDonationModal();
  }

  triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      if (Math.random() > 0.5) { confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'] }); }
      if (Math.random() > 0.5) { confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'] }); }
      if (Date.now() < end) { requestAnimationFrame(frame); }
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
    this.donationService.createRazorpayOrder(amount).subscribe({
      next: (response) => {
        if (response.demoMode) {
          this.snackBar.open('Demo Mode: Simulating secure payment popup...', 'Close', { duration: 2000 });
          setTimeout(() => {
            this.verifyAndCompleteDonation({ razorpay_order_id: response.order.id, razorpay_payment_id: 'pay_demo_' + Date.now(), razorpay_signature: 'demo_signature' }, amount);
          }, 2500);
          return;
        }
        try {
          const rzp = new Razorpay({
            key: environment.razorpayKeyId,
            amount: response.order.amount,
            currency: response.order.currency,
            name: 'HeartBridge',
            description: 'Emergency Donation: ' + this.selectedFund.title,
            order_id: response.order.id,
            handler: (paymentResponse: any) => { this.verifyAndCompleteDonation(paymentResponse, amount); },
            prefill: { name: this.authService.getUser()?.name || '', email: this.authService.getUser()?.email || '' },
            theme: { color: '#ef4444' },
            modal: { ondismiss: () => { this.isDonating = false; } }
          });
          rzp.open();
          rzp.on('payment.failed', () => { this.isDonating = false; this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 }); });
        } catch (e) {
          this.isDonating = false;
          this.snackBar.open('Razorpay failed to load.', 'Close', { duration: 3000 });
        }
      },
      error: () => { this.isDonating = false; this.snackBar.open('Error initiating payment. Please try again.', 'Close', { duration: 3000 }); }
    });
  }

  verifyAndCompleteDonation(paymentResponse: any, amount: number) {
    this.donationService.verifyRazorpayPayment({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    }).subscribe({
      next: (verification) => {
        if (verification.success) {
          this.donationService.createDonation({
            relatedId: this.donatingFundId,
            amount: amount,
            isAnonymous: this.donationForm.value.isAnonymous,
            donationType: 'emergency',
            paymentMethod: 'online',
            transactionId: paymentResponse.razorpay_payment_id,
            razorpayOrderId: paymentResponse.razorpay_order_id
          }).subscribe({
            next: () => { this.isDonating = false; this.lastDonationAmount = amount; this.showThankYou = true; this.triggerConfetti(); this.loadEmergencyFunds(); },
            error: () => { this.isDonating = false; this.snackBar.open('Donation recorded but error updating stats.', 'Close', { duration: 3000 }); }
          });
        }
      },
      error: () => { this.isDonating = false; this.snackBar.open('Payment verification failed.', 'Close', { duration: 3000 }); }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { this.documentUploadError = 'File size must be less than 10MB'; return; }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) { this.documentUploadError = 'Allowed formats: PDF, JPG, PNG, DOC, DOCX'; return; }
      this.documentUploadError = '';
      this.selectedFile = file;
    }
  }

  clearSelectedFile() { this.selectedFile = null; this.documentUploadError = ''; }

  openDocumentUploadDialog(fund: any) {
    this.selectedFund = fund;
    this.editingFund = fund;
    this.showCreateForm = true;
    this.createForm.patchValue({
      title: fund.title,
      description: fund.description,
      emergencyType: fund.emergencyType,
      priority: fund.priority,
      requiredAmount: fund.requiredAmount,
      deadline: new Date(fund.deadline).toISOString().split('T')[0]
    });
    // Use centralized scrollToForm method
    this.scrollToForm();
  }

  uploadProofDocument(fundId: string) {
    if (!this.selectedFile) { this.snackBar.open('Please select a document', 'Close', { duration: 3000 }); return; }
    this.uploadingDocument = true;
    const formData = new FormData();
    formData.append('proof-document', this.selectedFile);
    this.emergencyFundService.uploadProofDocument(fundId, formData).subscribe({
      next: () => { this.uploadingDocument = false; this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 }); this.selectedFile = null; this.documentUploadError = ''; this.loadEmergencyFunds(); },
      error: (error) => { this.uploadingDocument = false; const msg = error?.error?.message || 'Error uploading document'; this.snackBar.open(msg, 'Close', { duration: 3000 }); this.documentUploadError = msg; }
    });
  }

  deleteProofDocument(fund: any) {
    if (confirm('Are you sure you want to delete the proof document?')) {
      this.emergencyFundService.deleteProofDocument(fund._id).subscribe({
        next: () => { this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 }); this.loadEmergencyFunds(); },
        error: (error) => { this.snackBar.open(error?.error?.message || 'Error deleting document', 'Close', { duration: 3000 }); }
      });
    }
  }

  viewProofDocument(fund: any) {
    if (fund.proofDocument && fund.proofDocument.filename) {
      const url = `${this.baseUrl}/emergency-funds/${fund._id}/proof-document`;
      window.open(url, '_blank');
    }
  }

  getCurrentNGOId(): string {
    const user = this.authService.getUser();
    return (user as any)?.ngoId || localStorage.getItem('ngoId') || '';
  }
  shareFund(fund: any) {
    const shareUrl = `${window.location.origin}/emergency-funds`;
    const title = `🚨 EMERGENCY: ${fund.title}`;
    const text = `Please help! ${fund.ngoId?.name} needs ₹${fund.requiredAmount} for ${fund.title}. ${fund.description?.substring(0, 100)}...`;

    if (navigator.share) {
      navigator.share({ title, text, url: shareUrl }).then(() => {
        this.snackBar.open('Thanks for spreading the word! 🙏', 'Close', { duration: 3000 });
      }).catch(err => {
        if (err.name !== 'AbortError') this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Emergency link copied! Share with others 📤', 'Close', { duration: 3000 });
    }).catch(err => {
      this.snackBar.open('Failed to copy link.', 'Close', { duration: 3000 });
    });
  }
}

declare var confetti: any;
