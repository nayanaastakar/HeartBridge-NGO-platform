import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiscussionService } from '../../services/discussion.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})
export class DiscussionsComponent implements OnInit {
  discussions: any[] = [];
  selectedDiscussion: any = null;
  newReply: string = '';
  newDiscussionTitle: string = '';
  newDiscussionContent: string = '';
  selectedCategory: string = 'All';
  searchQuery: string = '';
  currentPage: number = 1;
  loading: boolean = false;
  showNewDiscussionForm: boolean = false;
  showReplyForm: boolean = false;
  currentUser: any;

  // Edit states
  isEditingDiscussion: boolean = false;
  editingReplyId: string | null = null;
  editTitle: string = '';
  editContent: string = '';
  editReplyContent: string = '';

  categories = ['All', 'Fundraising', 'Volunteering', 'Impact', 'Resources', 'General'];

  constructor(
    private discussionService: DiscussionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadDiscussions();

    // Handle deep linking from share URL
    this.route.queryParams.subscribe(params => {
      const discussionId = params['id'];
      if (discussionId) {
        this.selectDiscussion({ _id: discussionId });
      }
    });
  }

  loadDiscussions(): void {
    this.loading = true;
    const category = this.selectedCategory !== 'All' ? this.selectedCategory : undefined;

    this.discussionService.getAllDiscussions(category, this.searchQuery, this.currentPage)
      .subscribe({
        next: (response) => {
          this.discussions = response.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading discussions:', err);
          this.loading = false;
        }
      });
  }

  selectDiscussion(discussion: any): void {
    console.log('[DiscussionsComponent] Selecting discussion:', discussion);
    this.selectedDiscussion = discussion;
    this.loading = true;

    // Ensure we are using the correct property for ID
    const discussionId = discussion._id || discussion.id;
    console.log(`[DiscussionsComponent] Using ID for fetch: ${discussionId}`);

    if (!discussionId) {
      console.error('[DiscussionsComponent] Error: Discussion has no ID!', discussion);
      this.loading = false;
      this.snackBar.open('Error: Cannot load discussion details (missing ID).', 'Close', { duration: 3000 });
      return;
    }

    this.discussionService.getDiscussion(discussionId).subscribe({
      next: (response) => {
        console.log('[DiscussionsComponent] Details loaded successfully:', response);
        this.selectedDiscussion = response.data;
        this.loading = false;
        // reset form
        this.newReply = '';
      },
      error: (err) => {
        console.error('[DiscussionsComponent] Error loading discussion details:', err);
        this.loading = false;
        this.snackBar.open('Error loading discussion details.', 'Close', { duration: 3000 });
      }
    });
  }

  addReply(): void {
    if (!this.newReply.trim()) return;

    this.discussionService.addReply(this.selectedDiscussion._id, this.newReply).subscribe({
      next: (response) => {
        this.selectedDiscussion = response.data;
        this.newReply = '';
        this.showReplyForm = false;
        this.snackBar.open('Reply posted successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error adding reply:', err);
        this.snackBar.open('Failed to post reply. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  scrollToReplyForm(): void {
    if (!this.currentUser) {
      this.snackBar.open('Please login to reply.', 'Login', { duration: 3000 });
      return;
    }
    const element = document.getElementById('reply-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus the textarea if possible
      const textarea = element.querySelector('textarea');
      if (textarea) (textarea as HTMLElement).focus();
    }
  }

  createDiscussion(): void {
    if (!this.newDiscussionTitle.trim() || !this.newDiscussionContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const discussionData = {
      title: this.newDiscussionTitle,
      content: this.newDiscussionContent,
      category: this.selectedCategory
    };

    this.discussionService.createDiscussion(discussionData).subscribe({
      next: () => {
        this.newDiscussionTitle = '';
        this.newDiscussionContent = '';
        this.showNewDiscussionForm = false;
        this.loadDiscussions();
        this.snackBar.open('Discussion created successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error creating discussion:', err);
        this.snackBar.open('Failed to create discussion.', 'Close', { duration: 3000 });
      }
    });
  }

  markAsHelpful(replyId: string): void {
    if (!this.currentUser) {
      this.snackBar.open('Please login to mark as helpful.', 'Close', { duration: 3000 });
      return;
    }
    this.discussionService.markHelpful(this.selectedDiscussion._id, replyId).subscribe({
      next: (response) => {
        const index = this.selectedDiscussion.replies.findIndex((r: any) => r._id === replyId);
        const wasHelpful = this.selectedDiscussion.replies[index].isHelpful;
        this.selectedDiscussion = response.data;
        this.snackBar.open(wasHelpful ? 'Removed helpful vote' : 'Marked as helpful!', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error marking helpful:', err);
        this.snackBar.open('Failed to update helpful status.', 'Close', { duration: 3000 });
      }
    });
  }

  shareDiscussion(event?: Event, discussion?: any): void {
    if (event) {
      event.stopPropagation();
    }

    const disc = discussion || this.selectedDiscussion;
    if (!disc) return;

    // Use query parameter for deep linking since a separate details route doesn't exist
    const shareUrl = `${window.location.origin}/discussions?id=${disc._id || disc.id}`;
    const title = `Discussion: ${disc.title}`;
    const text = `Check out this discussion on HeartBridge: "${disc.title}"`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: shareUrl
      }).then(() => {
        this.snackBar.open('Thanks for sharing! 📤', 'Close', { duration: 3000 });
      }).catch(err => {
        if (err.name !== 'AbortError') {
          this.copyToClipboard(shareUrl);
        }
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Link copied to clipboard! 📋', 'Close', { duration: 3000 });
    }).catch(err => {
      console.error('Failed to copy link:', err);
      this.snackBar.open('Failed to copy link. You can share the URL from your browser.', 'Close', { duration: 3000 });
    });
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadDiscussions();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDiscussions();
  }

  goBack(): void {
    this.selectedDiscussion = null;
    this.showReplyForm = false;
    this.isEditingDiscussion = false;
    this.editingReplyId = null;
    this.loadDiscussions();
  }

  // Permission Checks
  isDiscussionOwner(discussion: any): boolean {
    if (!this.currentUser || !discussion) return false;
    const creatorId = discussion.createdBy?._id || discussion.createdBy || discussion.userId;
    return creatorId === this.currentUser._id;
  }

  isReplyOwner(reply: any): boolean {
    if (!this.currentUser || !reply) return false;
    return reply.userId === this.currentUser._id;
  }

  canEditDiscussion(discussion: any): boolean {
    return this.isDiscussionOwner(discussion);
  }

  canDeleteDiscussion(discussion: any): boolean {
    if (!this.currentUser) return false;
    return this.isDiscussionOwner(discussion) || this.currentUser.role === 'system_admin';
  }

  canEditReply(reply: any): boolean {
    return this.isReplyOwner(reply);
  }

  canDeleteReply(reply: any): boolean {
    if (!this.currentUser) return false;
    return this.isReplyOwner(reply) || this.isDiscussionOwner(this.selectedDiscussion) || this.currentUser.role === 'system_admin';
  }

  // Actions
  deleteDiscussion(event: Event, discussionId: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this discussion? All replies will be lost.')) {
      this.discussionService.deleteDiscussion(discussionId).subscribe({
        next: () => {
          this.snackBar.open('Discussion deleted successfully', 'Close', { duration: 3000 });
          if (this.selectedDiscussion && (this.selectedDiscussion._id === discussionId)) {
            this.goBack();
          } else {
            this.loadDiscussions();
          }
        },
        error: (err) => {
          this.snackBar.open('Failed to delete discussion', 'Close', { duration: 3000 });
        }
      });
    }
  }

  startEditDiscussion(): void {
    this.isEditingDiscussion = true;
    this.editTitle = this.selectedDiscussion.title;
    this.editContent = this.selectedDiscussion.content;
  }

  saveEditDiscussion(): void {
    if (!this.editTitle.trim() || !this.editContent.trim()) return;

    this.discussionService.updateDiscussion(this.selectedDiscussion._id, {
      title: this.editTitle,
      content: this.editContent
    }).subscribe({
      next: (response) => {
        this.selectedDiscussion = response.data;
        this.isEditingDiscussion = false;
        this.snackBar.open('Discussion updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to update discussion', 'Close', { duration: 3000 });
      }
    });
  }

  deleteReply(replyId: string): void {
    if (confirm('Are you sure you want to delete this reply?')) {
      this.discussionService.deleteReply(this.selectedDiscussion._id, replyId).subscribe({
        next: (response) => {
          this.selectedDiscussion = response.data;
          this.snackBar.open('Reply removed', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Failed to delete reply', 'Close', { duration: 3000 });
        }
      });
    }
  }

  startEditReply(reply: any): void {
    this.editingReplyId = reply._id;
    this.editReplyContent = reply.content;
  }

  saveEditReply(replyId: string): void {
    if (!this.editReplyContent.trim()) return;

    this.discussionService.updateReply(this.selectedDiscussion._id, replyId, this.editReplyContent).subscribe({
      next: (response) => {
        this.selectedDiscussion = response.data;
        this.editingReplyId = null;
        this.snackBar.open('Reply updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to update reply', 'Close', { duration: 3000 });
      }
    });
  }
}

