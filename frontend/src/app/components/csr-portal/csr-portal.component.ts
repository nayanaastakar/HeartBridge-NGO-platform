import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CsrService } from '../../services/csr.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-csr-portal',
  templateUrl: './csr-portal.component.html',
  styleUrls: ['./csr-portal.component.scss']
})
export class CsrPortalComponent implements OnInit {
  grants: any[] = [];
  myApplications: any[] = [];
  myCorporate: any = null;
  loading = true;
  activeTab = 0;
  showCorporateForm = false;
  showGrantForm = false;
  showApplyForm = false;
  selectedGrant: any = null;
  isNgoAdmin = false;
  isCorporate = false;

  corporateForm: FormGroup;
  grantForm: FormGroup;
  applyForm: FormGroup;

  grantColumns = ['title', 'amount', 'deadline', 'status', 'actions'];
  appColumns = ['grant', 'ngo', 'amount', 'status', 'appliedAt', 'actions'];

  sectorOptions = ['Education', 'Healthcare', 'Environment', 'Rural Development', 'Women Empowerment', 'Child Welfare', 'Technology', 'Other'];

  constructor(
    private fb: FormBuilder,
    private csrService: CsrService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.corporateForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      website: [''],
      annualCsrBudget: [0, Validators.min(0)],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      description: ['']
    });

    this.grantForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      totalFunding: [0, [Validators.required, Validators.min(1)]],
      focusAreas: [[]],
      applicationDeadline: ['', Validators.required],
      maxApplications: [10],
      eligibilityCriteria: ['']
    });

    this.applyForm = this.fb.group({
      projectTitle: ['', Validators.required],
      projectDescription: ['', Validators.required],
      requestedAmount: [0, [Validators.required, Validators.min(1)]],
      expectedOutcomes: ['', Validators.required],
      projectDurationMonths: [6]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isNgoAdmin = user?.role === 'ngo_admin' || user?.role === 'system_admin';
    this.isCorporate = user?.role === 'corporate';
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.csrService.getGrants().subscribe({
      next: (res) => {
        this.grants = res.data || res.grants || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.csrService.getMyApplications().subscribe({
      next: (res) => { this.myApplications = res.data || res.applications || res || []; },
      error: () => {}
    });

    this.csrService.getMyCorporate().subscribe({
      next: (res) => { this.myCorporate = res.data || res.corporate || res; },
      error: () => {}
    });
  }

  registerCorporate(): void {
    if (this.corporateForm.invalid) return;
    this.csrService.registerCorporate(this.corporateForm.value).subscribe({
      next: (res) => {
        this.myCorporate = res.data || res.corporate || res;
        this.showCorporateForm = false;
        this.snackBar.open('Corporate profile created!', 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  createGrant(): void {
    if (this.grantForm.invalid) return;
    this.csrService.createGrant(this.grantForm.value).subscribe({
      next: () => {
        this.showGrantForm = false;
        this.grantForm.reset({ maxApplications: 10, focusAreas: [] });
        this.snackBar.open('Grant created!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  openApplyForm(grant: any): void {
    this.selectedGrant = grant;
    this.showApplyForm = true;
  }

  applyForGrant(): void {
    if (!this.selectedGrant || this.applyForm.invalid) return;
    this.csrService.applyForGrant(this.selectedGrant._id, this.applyForm.value).subscribe({
      next: () => {
        this.showApplyForm = false;
        this.selectedGrant = null;
        this.applyForm.reset({ projectDurationMonths: 6 });
        this.snackBar.open('Application submitted!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  getStatusColor(status: string): string {
    const c: any = { approved: 'primary', pending: 'accent', under_review: 'accent', rejected: 'warn', open: 'primary', closed: 'warn' };
    return c[status] || 'primary';
  }
}
