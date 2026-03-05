import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ImpactStoryService } from '../../services/impact-story.service';
import { NGOService } from '../../services/ngo.service';
import { AuthService } from '../../services/auth.service';
import { handleImageError } from '../../utils/image-utils';

interface ImpactStory {
  _id: string;
  title: string;
  problemStatement: string;
  solutionDescription: string;
  beforePhoto: { url: string; caption: string };
  afterPhoto: { url: string; caption: string };
  fundingDetails: {
    amountRequired: number;
    amountRaised: number;
    donorCount: number;
  };
  impact: {
    beneficiariesReached: number;
    servicesProvided: string[];
    implementationTimeline: { durationMonths: number };
  };
  engagement: {
    likes: any[];
    views: number;
  };
  ngoId: { _id: string; name: string; logo: string; category: string };
  publishedAt: Date;
}

@Component({
  selector: 'app-impact-stories',
  templateUrl: './impact-stories.component.html',
  styleUrls: ['./impact-stories.component.scss']
})
export class ImpactStoriesComponent implements OnInit, OnDestroy {
  stories: ImpactStory[] = [];
  loading = false;
  beforeAfterState: { [key: string]: boolean } = {};

  // Pagination
  pageSize = 9;
  pageSizeOptions = [6, 9, 12];
  currentPage = 0;
  totalStories = 0;

  private destroy$ = new Subject<void>();
  private likedStories = new Set<string>();
  private currentUser: any;

  constructor(
    private impactStoryService: ImpactStoryService,
    public ngoService: NGOService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(
      user => this.currentUser = user
    );
    this.loadStories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  loadStories(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: '-publishedAt'
    };

    this.impactStoryService
      .getAllImpactStories(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.stories = response.data || [];
          this.totalStories = response.total || 0;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading stories:', error);
          this.snackBar.open('Failed to load impact stories', 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStories();
  }

  toggleBeforeAfter(event: Event, storyId: string): void {
    event.stopPropagation();
    if (!this.beforeAfterState[storyId]) {
      this.beforeAfterState[storyId] = false;
    }
    this.beforeAfterState[storyId] = !this.beforeAfterState[storyId];
  }

  isBeforeShowing(storyId: string): boolean {
    return this.beforeAfterState[storyId] !== true;
  }

  getStoryImage(story: ImpactStory): string {
    const isBefore = this.isBeforeShowing(story._id);
    const photo = isBefore ? story?.beforePhoto : story?.afterPhoto;

    // Fallback images - Generic NGO style
    // Using reliable, verified Unsplash URLs
    const defaultBefore = 'https://images.unsplash.com/photo-1532330393533-443990a51d50?w=600&q=80'; // Generic poor condition/child
    const defaultAfter = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80'; // Generic volunteering/community

    if (!photo || !photo.url) {
      return isBefore ? defaultBefore : defaultAfter;
    }

    return this.ngoService.getFullImageUrl(photo.url);
  }

  openStoryDetail(eventOrId: any, storyId?: string): void {
    let id = storyId;
    if (typeof eventOrId === 'string') {
      id = eventOrId;
    } else if (eventOrId && eventOrId.stopPropagation) {
      eventOrId.stopPropagation();
    }
    this.router.navigate(['/impact-story', id]);
  }

  likeStory(event: any, storyId: string): void {
    event.stopPropagation();

    if (!this.currentUser) {
      this.snackBar.open('Please log in to like stories', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/login']);
      return;
    }

    this.impactStoryService
      .likeImpactStory(storyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data.liked) {
            this.likedStories.add(storyId);
            this.snackBar.open('Story liked! ❤️', 'Close', { duration: 2000 });
          } else {
            this.likedStories.delete(storyId);
            this.snackBar.open('Like removed', 'Close', { duration: 2000 });
          }

          // Update story likes count
          const story = this.stories.find(s => s._id === storyId);
          if (story) {
            story.engagement.likes.length = response.data.likes;
          }
        },
        error: (error: any) => {
          console.error('Error liking story:', error);
          this.snackBar.open('Failed to like story', 'Close', { duration: 3000 });
        }
      });
  }

  shareStory(event: any, storyId: string): void {
    if (event) event.stopPropagation();

    const shareUrl = `${window.location.origin}/impact-story/${storyId}`;
    const story = this.stories.find(s => s._id === storyId);
    const title = story ? `Impact Story: ${story.title}` : 'HeartBridge Impact Story';

    // Try native share first
    if (navigator.share) {
      navigator.share({
        title: title,
        text: story?.problemStatement || 'Check out this impact story on HeartBridge',
        url: shareUrl
      }).then(() => {
        this.snackBar.open('Thanks for sharing! 📤', 'Close', { duration: 3000 });
        if (this.currentUser) {
          this.impactStoryService.shareImpactStory(storyId).subscribe({
            error: (err) => console.warn('Could not record share on backend', err)
          });
        }
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          this.copyToClipboard(shareUrl);
        }
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Story link copied! Share with others 📤', 'Close', { duration: 3000 });
    }).catch(err => {
      console.error('Failed to copy link:', err);
      this.snackBar.open('Copy failed. You can share the URL from your browser.', 'Close', { duration: 3000 });
    });
  }

  isLiked(storyId: string): boolean {
    return this.likedStories.has(storyId);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onImageError(event: any, category: string = ''): void {
    handleImageError(event, category);
  }
}
