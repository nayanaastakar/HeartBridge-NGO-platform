import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
import { ImpactStoryService } from '../../services/impact-story.service';
import { NGOService } from '../../services/ngo.service';

@Component({
  selector: 'app-add-impact-story-dialog',
  templateUrl: './add-impact-story-dialog.component.html',
  styleUrls: ['./add-impact-story-dialog.component.scss']
})
export class AddImpactStoryDialogComponent implements OnInit {
  storyForm: FormGroup;
  loading = false;
  isEditMode = false;
  selectedBeforeFile: File | null = null;
  selectedAfterFile: File | null = null;
  beforePreview: string | null = null;
  afterPreview: string | null = null;
  categories = [
    'Children Welfare',
    'Old Age Homes',
    'Education',
    'Healthcare',
    'Emergency Funds',
    'Women Empowerment',
    'Environment',
    'Animal Welfare',
    'Social Welfare',
    'Disaster Relief',
    'Physically Disabled Care NGOs',
    'Food and Basic Needs NGOs',
    'Mentally Challenged Care NGOs'
  ];

  // For selecting services provided
  availableServices = [
    'Medical Checkup', 'School Supplies', 'Tuition Fees', 'Counseling',
    'Emergency Relief', 'Tree Planting', 'Animal Rescue', 'Food Distribution',
    'Skill Training', 'Microfinance', 'Clean Water', 'Sanitation'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddImpactStoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private impactStoryService: ImpactStoryService,
    private ngoService: NGOService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data?.story;

    this.storyForm = this.fb.group({
      title: ['', Validators.required],
      ngoId: ['', Validators.required], // Will be set automatically
      category: ['Healthcare', Validators.required],
      problemStatement: ['', [Validators.required, Validators.minLength(20)]],
      solutionDescription: ['', [Validators.required, Validators.minLength(20)]],
      amountRaised: [0, [Validators.required, Validators.min(0)]],
      donorCount: [0, [Validators.required, Validators.min(0)]],
      amountRequired: [0, [Validators.required, Validators.min(0)]],
      beneficiariesReached: [0, [Validators.required, Validators.min(1)]],
      servicesProvided: [[], Validators.required],
      implementationMonths: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.story) {
      this.patchForm(this.data.story);
    } else if (this.data.ngoId) {
      this.storyForm.patchValue({ ngoId: this.data.ngoId });
    }
  }

  patchForm(story: any) {
    this.storyForm.patchValue({
      title: story.title,
      ngoId: story.ngoId._id || story.ngoId,
      // category: story.category || 'Health', // Assuming category is on root or NGO
      problemStatement: story.problemStatement,
      solutionDescription: story.solutionDescription,
      amountRaised: story.fundingDetails?.amountRaised,
      donorCount: story.fundingDetails?.donorCount,
      amountRequired: story.fundingDetails?.amountRequired,
      beneficiariesReached: story.impact?.beneficiariesReached,
      servicesProvided: story.impact?.servicesProvided || [],
      implementationMonths: story.impact?.implementationTimeline?.durationMonths
    });

    if (story.beforePhoto?.url) this.beforePreview = story.beforePhoto.url;
    if (story.afterPhoto?.url) this.afterPreview = story.afterPhoto.url;
  }

  onFileSelected(event: any, type: 'before' | 'after') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'before') {
          this.selectedBeforeFile = file;
          this.beforePreview = reader.result as string;
        } else {
          this.selectedAfterFile = file;
          this.afterPreview = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(type: 'before' | 'after') {
    if (type === 'before') {
      this.selectedBeforeFile = null;
      this.beforePreview = null;
    } else {
      this.selectedAfterFile = null;
      this.afterPreview = null;
    }
  }

  async onSubmit() {
    if (this.storyForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.storyForm.value;

    const storyData = {
      ngoId: formValue.ngoId,
      title: formValue.title,
      category: formValue.category,
      problemStatement: formValue.problemStatement,
      solutionDescription: formValue.solutionDescription,
      fundingDetails: {
        amountRequired: formValue.amountRequired,
        amountRaised: formValue.amountRaised,
        donorCount: formValue.donorCount
      },
      impact: {
        beneficiariesReached: formValue.beneficiariesReached,
        servicesProvided: formValue.servicesProvided,
        implementationTimeline: {
          durationMonths: formValue.implementationMonths
        }
      }
    };

    try {
      let storyId;
      console.log('Sending story data for save:', storyData);

      if (this.isEditMode) {
        storyId = this.data.story._id;
        console.log('Updating existing story:', storyId);
        await lastValueFrom(this.impactStoryService.updateImpactStory(storyId, storyData));
        this.snackBar.open('Story updated successfully! ✨', 'Close', { duration: 3000 });
      } else {
        console.log('Creating new story...');
        const res = await lastValueFrom(this.impactStoryService.createImpactStory(storyData));
        storyId = res.data._id;
        this.snackBar.open('Story created successfully! 💝', 'Close', { duration: 3000 });
      }

      // Handle Image Uploads with proper completion check
      console.log('Commencing image uploads for story:', storyId);
      await this.uploadImages(storyId);
      console.log('All updates complete.');

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('CRITICAL: Error saving impact story:', error);
      const msg = error.error?.message || 'Failed to save story. Please check fields.';
      this.snackBar.open(msg, 'Close', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  async uploadImages(storyId: string) {
    if (this.selectedBeforeFile) {
      console.log('Uploading before photo...');
      await lastValueFrom(this.impactStoryService.uploadBeforePhoto(storyId, this.selectedBeforeFile));
    }

    if (this.selectedAfterFile) {
      console.log('Uploading after photo...');
      await lastValueFrom(this.impactStoryService.uploadAfterPhoto(storyId, this.selectedAfterFile));
    }
  }
}
