import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-beneficiary-management',
  templateUrl: './beneficiary-management.component.html',
  styleUrls: ['./beneficiary-management.component.scss']
})
export class BeneficiaryManagementComponent implements OnInit {
  beneficiaries: any[] = [];
  cases: any[] = [];
  loading = true;
  activeTab = 0;
  showBeneficiaryForm = false;
  showCaseForm = false;
  selectedBeneficiary: any = null;

  beneficiaryForm: FormGroup;
  caseForm: FormGroup;

  beneficiaryColumns = ['name', 'age', 'gender', 'location', 'status', 'actions'];
  caseColumns = ['caseNumber', 'beneficiary', 'type', 'priority', 'status', 'assignedTo', 'actions'];

  genderOptions = ['male', 'female', 'other'];
  statusOptions = ['active', 'inactive', 'closed'];
  caseTypes = ['food', 'shelter', 'medical', 'education', 'livelihood', 'psychosocial', 'other'];
  priorityOptions = ['low', 'medium', 'high', 'critical'];

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.beneficiaryForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      location: this.fb.group({
        address: [''],
        city: [''],
        state: ['']
      }),
      contactNumber: [''],
      needs: [''],
      vulnerabilityScore: [5, [Validators.min(1), Validators.max(10)]]
    });

    this.caseForm = this.fb.group({
      beneficiaryId: ['', Validators.required],
      type: ['', Validators.required],
      priority: ['medium'],
      description: ['', Validators.required],
      assistanceRequired: [''],
      estimatedCost: [0]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (res) => {
        this.beneficiaries = res.beneficiaries || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.beneficiaryService.getCases().subscribe({
      next: (res) => { this.cases = res.cases || res || []; },
      error: () => {}
    });
  }

  createBeneficiary(): void {
    if (this.beneficiaryForm.invalid) return;
    this.beneficiaryService.createBeneficiary(this.beneficiaryForm.value).subscribe({
      next: () => {
        this.showBeneficiaryForm = false;
        this.beneficiaryForm.reset({ vulnerabilityScore: 5 });
        this.snackBar.open('Beneficiary registered!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  createCase(): void {
    if (this.caseForm.invalid) return;
    this.beneficiaryService.createCase(this.caseForm.value).subscribe({
      next: () => {
        this.showCaseForm = false;
        this.caseForm.reset({ priority: 'medium', estimatedCost: 0 });
        this.snackBar.open('Case created!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  viewBeneficiary(b: any): void {
    this.selectedBeneficiary = b;
  }

  getPriorityColor(priority: string): string {
    const c: any = { critical: 'warn', high: 'accent', medium: 'primary', low: '' };
    return c[priority] || 'primary';
  }
}
