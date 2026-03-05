import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ImpactStoryService } from '../../services/impact-story.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-impact-story-detail',
  templateUrl: './impact-story-detail.component.html',
  styleUrls: ['./impact-story-detail.component.scss']
})
export class ImpactStoryDetailComponent implements OnInit, OnDestroy {
  story: any = null;
  loading = true;
  isBeforeShowing = true;
  isLiked = false;
  currentUser: any;
  beforeAfterState: { [key: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private impactStoryService: ImpactStoryService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(
      user => this.currentUser = user
    );

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadStory(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStory(storyId: string): void {
    this.loading = true;
    this.impactStoryService.getImpactStory(storyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.story = response.data || response;
          this.isLiked = this.story.engagement?.likes?.includes(this.currentUser?._id) || false;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading story:', error);
          this.snackBar.open('Failed to load story', 'Close', { duration: 3000 });
          this.router.navigate(['/impact-stories']);
          this.loading = false;
        }
      });
  }

  toggleBeforeAfter(): void {
    this.isBeforeShowing = !this.isBeforeShowing;
  }

  getStoryImage(): string {
    const photo = this.isBeforeShowing ? this.story?.beforePhoto : this.story?.afterPhoto;
    const defaultBefore = 'https://images.unsplash.com/photo-1488535695519-47d5f2cbf8b8?w=800&h=600&fit=crop&q=80';
    const defaultAfter = 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&h=600&fit=crop&q=80';
    
    if (!photo || !photo.url) {
      return this.isBeforeShowing ? defaultBefore : defaultAfter;
    }
    
    return photo.url;
  }

  likeStory(): void {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to like stories', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.impactStoryService.likeImpactStory(this.story._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data.liked) {
            this.isLiked = true;
            this.snackBar.open('Story liked! ❤️', 'Close', { duration: 2000 });
          } else {
            this.isLiked = false;
            this.snackBar.open('Like removed', 'Close', { duration: 2000 });
          }
          if (this.story) {
            this.story.engagement.likes = response.data.likes || [];
          }
        },
        error: (error: any) => {
          console.error('Error liking story:', error);
          this.snackBar.open('Failed to like story', 'Close', { duration: 3000 });
        }
      });
  }

  shareStory(): void {
    const shareUrl = `${window.location.origin}/impact-story/${this.story._id}`;
    navigator.clipboard.writeText(shareUrl);
    this.snackBar.open('Story link copied! Share with others 📤', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/impact-stories']);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDuration(months: number | undefined): string {
    if (!months) return '0 months';
    if (months === 1) return '1 month';
    if (months % 1 === 0) return `${months} months`;
    // For decimal values like 2.5, show as "2.5 months"
    return `${months} months`;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&h=600&fit=crop&q=80';
  }
}
