import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NGOService } from '../../services/ngo.service';

@Component({
  selector: 'app-review-docs-dialog',
  template: `
    <div class="review-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          Review NGO Documents: {{ data?.ngo?.name }}
        </h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="selection-view">
          <p class="select-hint">Click below to open the official documents:</p>
          
          <div class="doc-vertical-list">
            <div class="doc-card reg-card">
              <div class="doc-info">
                <mat-icon>verified_user</mat-icon>
                <div>
                  <h3>Registration Certificate</h3>
                  <p>Trust Act, 1882 Official Certificate</p>
                </div>
              </div>
              <button mat-raised-button (click)="openDoc('registration')">
                <mat-icon>open_in_new</mat-icon> Open Document
              </button>
            </div>

            <div class="doc-card tax-card">
              <div class="doc-info">
                <mat-icon>request_quote</mat-icon>
                <div>
                  <h3>80G Tax certificate</h3>
                  <p>Income Tax Exemption Validity Proof</p>
                </div>
              </div>
              <button mat-raised-button (click)="openDoc('tax')">
                <mat-icon>open_in_new</mat-icon> Open Document
              </button>
            </div>
          </div>
</div>

        <div *ngIf="(!data?.ngo?.verificationDocuments || data?.ngo?.verificationDocuments?.length === 0)" class="no-docs">
          <mat-icon>folder_off</mat-icon>
          <p>No verification documents found.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Dismiss</button>
        <button mat-flat-button color="primary" (click)="verify()" *ngIf="!data?.ngo?.isVerified" class="verify-btn">
          <mat-icon>verified</mat-icon>
          Approve Verification
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .review-dialog {
      width: 600px;
      max-width: 95vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;

      h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading);
        font-size: 1.25rem;
      }
    }

    mat-dialog-content {
      padding: 32px !important;
      background: #f8fafc;
    }

    /* Selection View */
    .select-hint {
      color: #64748b;
      margin-bottom: 24px;
      font-weight: 500;
    }

    .doc-vertical-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .doc-card {
      border-radius: 16px;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);

      &:hover {
        transform: translateX(8px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
      }

      .doc-info {
        display: flex;
        align-items: center;
        gap: 16px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }

        h3 { margin: 0; font-weight: 700; font-size: 1.1rem; }
        p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9; }
      }

      button {
        background: white;
        color: #ff758c;
        font-weight: 600;
        border-radius: 8px;
      }
    }

    .reg-card {
      background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
      button { color: #ff758c; }
    }

    .tax-card {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      button { color: #ff9a9e; }
    }

    .no-docs {
      text-align: center;
      padding: 40px 0;
      color: #94a3b8;
      mat-icon { font-size: 48px; width:48px; height:48px; margin-bottom: 12px; opacity: 0.3; }
    }

    mat-dialog-actions {
      padding: 16px 24px !important;
      border-top: 1px solid #eee;
    }
  `]
})
export class ReviewDocsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReviewDocsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public ngoService: NGOService
  ) { }

  openDoc(type: 'registration' | 'tax'): void {
    const url = this.getDocUrl(type);
    if (url) {
      const fullUrl = this.ngoService.getFullImageUrl(url);
      window.open(fullUrl, '_blank');
    } else {
      // Fallback logic for demo purposes if URL not in DB
      const fallbackUrl = type === 'registration'
        ? '/uploads/proof-documents/certificate.html'
        : '/uploads/proof-documents/tax_80g.html';
      window.open(this.ngoService.getFullImageUrl(fallbackUrl), '_blank');
    }
  }

  getDocUrl(type: string): any {
    if (!this.data?.ngo || !this.data?.ngo?.verificationDocuments) return null;
    const doc = this.data.ngo.verificationDocuments.find((d: any) =>
      d && d.title && d.title.toLowerCase().includes(type.toLowerCase())
    );
    return doc ? doc.url : null;
  }

  close(): void {
    this.dialogRef.close();
  }

  verify(): void {
    this.dialogRef.close('verify');
  }
}
