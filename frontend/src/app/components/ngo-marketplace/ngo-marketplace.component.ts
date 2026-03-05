import { Component, OnInit } from '@angular/core';
import { NGOService } from '../../services/ngo.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { handleImageError } from '../../utils/image-utils';

@Component({
  selector: 'app-ngo-marketplace',
  templateUrl: './ngo-marketplace.component.html',
  styleUrls: ['./ngo-marketplace.component.scss']
})
export class NGOMarketplaceComponent implements OnInit {
  ngos: any[] = [];
  filteredNGOs: any[] = [];
  categories = [
    'All',
    'Old Age Homes',
    'Children Welfare NGOs',
    'Physically Disabled Care NGOs',
    'Food and Basic Needs NGOs',
    'Animal Welfare',
    'Mentally Challenged Care NGOs'
  ];
  selectedCategory: any = 'All';
  searchQuery: any = '';
  loading = false;

  constructor(
    public ngoService: NGOService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadNGOs();
  }

  loadNGOs() {
    this.loading = true;
    this.filteredNGOs = []; // Clear current results for visual feedback

    const filters: any = {};
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filters.category = this.selectedCategory;
    }
    if (this.searchQuery) {
      filters.q = this.searchQuery;
    }

    this.ngoService.getNGOs(filters).subscribe({
      next: (response) => {
        this.loading = false;
        this.ngos = response.ngos || [];
        this.filteredNGOs = this.ngos;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading NGOs', 'Close', { duration: 3000 });
      }
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.loadNGOs();
  }

  filterByCategory(event: any) {
    // MatChipListboxChange provides the value in event.value
    this.selectedCategory = event.value || 'All';
    this.loadNGOs();
  }

  searchNGOs() {
    // Resetting category when searching to provide broader results or keeping it?
    // User probably wants to search within category, so we keep selectedCategory.
    this.loadNGOs();
  }

  onImageError(event: any, category: string): void {
    handleImageError(event, category);
  }

  getThemeClass(category: string): string {
    if (!category) return 'theme-default';
    const cat = category.toLowerCase();
    if (cat.includes('child')) return 'theme-child';
    if (cat.includes('old age')) return 'theme-senior';
    if (cat.includes('food')) return 'theme-food';
    if (cat.includes('health')) return 'theme-health';
    if (cat.includes('disab')) return 'theme-ability';
    if (cat.includes('animal')) return 'theme-animal';
    if (cat.includes('education')) return 'theme-edu';
    return 'theme-default';
  }
}

