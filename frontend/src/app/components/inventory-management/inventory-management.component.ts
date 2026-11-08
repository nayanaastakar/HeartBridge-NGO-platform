import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent implements OnInit {
  items: any[] = [];
  lowStockItems: any[] = [];
  transactions: any[] = [];
  loading = true;
  showItemForm = false;
  showTransactionForm = false;
  selectedItem: any = null;
  activeTab = 0;

  itemForm: FormGroup;
  transactionForm: FormGroup;

  itemColumns = ['name', 'category', 'quantity', 'unit', 'condition', 'location', 'actions'];
  txColumns = ['date', 'type', 'quantity', 'notes'];

  categoryOptions = ['food', 'medicine', 'clothing', 'shelter', 'hygiene', 'education', 'tools', 'electronics', 'other'];
  conditionOptions = ['new', 'good', 'fair', 'poor'];
  txTypeOptions = ['received', 'distributed', 'damaged', 'returned', 'adjustment'];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['pieces'],
      condition: ['good'],
      location: ['Warehouse'],
      minimumStockLevel: [10],
      description: [''],
      expiryDate: ['']
    });

    this.transactionForm = this.fb.group({
      type: ['received', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: [''],
      recipient: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.inventoryService.getItems().subscribe({
      next: (res) => {
        this.items = res.items || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.inventoryService.getLowStock().subscribe({
      next: (res) => { this.lowStockItems = res.items || res || []; },
      error: () => {}
    });
  }

  createItem(): void {
    if (this.itemForm.invalid) return;
    this.inventoryService.createItem(this.itemForm.value).subscribe({
      next: () => {
        this.showItemForm = false;
        this.itemForm.reset({ quantity: 0, unit: 'pieces', condition: 'good', minimumStockLevel: 10 });
        this.snackBar.open('Item added to inventory!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  openTransactionForm(item: any): void {
    this.selectedItem = item;
    this.showTransactionForm = true;
  }

  addTransaction(): void {
    if (!this.selectedItem || this.transactionForm.invalid) return;
    this.inventoryService.addTransaction(this.selectedItem._id, this.transactionForm.value).subscribe({
      next: () => {
        this.showTransactionForm = false;
        this.selectedItem = null;
        this.transactionForm.reset({ type: 'received', quantity: 1 });
        this.snackBar.open('Transaction recorded!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  viewTransactions(item: any): void {
    this.selectedItem = item;
    this.inventoryService.getTransactions(item._id).subscribe({
      next: (res) => { this.transactions = res.transactions || res || []; this.activeTab = 2; },
      error: () => {}
    });
  }

  getStockClass(item: any): string {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= (item.minimumStockLevel || 10)) return 'low-stock';
    return 'in-stock';
  }
}
