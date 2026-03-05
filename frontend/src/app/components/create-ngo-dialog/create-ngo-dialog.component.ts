import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../config';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-create-ngo-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ isEditMode ? '📝 Edit NGO' : '🏢 Create New NGO' }}</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="ngoForm" class="ngo-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>NGO Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter NGO name">
            <mat-error *ngIf="ngoForm.get('name')?.hasError('required')">NGO name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Registration Number</mat-label>
            <input matInput formControlName="registrationNumber" placeholder="Enter registration number">
            <mat-error *ngIf="ngoForm.get('registrationNumber')?.hasError('required')">Registration number is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="Children Welfare">Children Welfare</mat-option>
              <mat-option value="Old Age Homes">Old Age Homes</mat-option>
              <mat-option value="Education">Education</mat-option>
              <mat-option value="Healthcare">Healthcare</mat-option>
              <mat-option value="Emergency Funds">Emergency Funds</mat-option>
              <mat-option value="Women Empowerment">Women Empowerment</mat-option>
              <mat-option value="Environment">Environment</mat-option>
              <mat-option value="Animal Welfare">Animal Welfare</mat-option>
              <mat-option value="Social Welfare">Social Welfare</mat-option>
              <mat-option value="Disaster Relief">Disaster Relief</mat-option>
              <mat-option value="Physically Disabled Care NGOs">Physically Disabled Care NGOs</mat-option>
            </mat-select>
            <mat-error *ngIf="ngoForm.get('category')?.hasError('required')">Category is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Describe your NGO's mission and activities" rows="4"></textarea>
            <mat-error *ngIf="ngoForm.get('description')?.hasError('required')">Description is required</mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="Contact number">
              <mat-error *ngIf="ngoForm.get('phone')?.hasError('required')">Phone is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" placeholder="Email address">
              <mat-error *ngIf="ngoForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="ngoForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <textarea matInput formControlName="address" placeholder="Complete address" rows="3"></textarea>
            <mat-error *ngIf="ngoForm.get('address')?.hasError('required')">Address is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Website</mat-label>
            <input matInput formControlName="website" placeholder="https://www.example.com">
            <mat-error *ngIf="ngoForm.get('website')?.hasError('pattern')">Please enter a valid URL</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Target Amount (₹)</mat-label>
            <input matInput formControlName="fundingRequirement" type="number" placeholder="50000">
            <mat-error *ngIf="ngoForm.get('fundingRequirement')?.hasError('required')">Target amount is required</mat-error>
            <mat-error *ngIf="ngoForm.get('fundingRequirement')?.hasError('min')">Amount must be positive</mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Cancel</button>
        <button mat-raised-button color="primary" (click)="saveNGO()" [disabled]="!ngoForm.valid">
          {{ isEditMode ? 'Update NGO' : 'Create NGO' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      max-width: 600px;
    }
    
    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .ngo-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .half-width {
      flex: 1;
    }
    
    mat-form-field {
      margin-bottom: 8px;
    }
  `]
})
export class CreateNGODialogComponent {
  ngoForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateNGODialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.isEditMode = !!(this.data && this.data.ngo);
    const ngo = this.data?.ngo || {};

    this.ngoForm = this.fb.group({
      name: [ngo.name || '', Validators.required],
      registrationNumber: [ngo.registrationNumber || '', Validators.required],
      category: [ngo.category || '', Validators.required],
      description: [ngo.description || '', Validators.required],
      phone: [ngo.phone || '', Validators.required],
      email: [ngo.email || '', [Validators.required, Validators.email]],
      address: [ngo.address || '', Validators.required],
      website: [ngo.website || '', Validators.pattern(/https?:\/\/.+/)],
      fundingRequirement: [ngo.fundingRequirement || 50000, [Validators.required, Validators.min(1)]]
    });
  }

  saveNGO() {
    if (this.ngoForm.valid) {
      const formData = this.ngoForm.value;

      if (this.isEditMode) {
        this.http.put(`${API_URL}/ngos/${this.data.ngo._id}`, formData).subscribe({
          next: (response: any) => {
            this.snackBar.open('NGO updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.snackBar.open('Error updating NGO: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      } else {
        // Set default values for required fields
        formData.logo = '/assets/default-ngo-logo.png';
        this.http.post(`${API_URL}/ngos`, formData).subscribe({
          next: (response: any) => {
            this.snackBar.open('NGO created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.snackBar.open('Error creating NGO: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
