const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['food', 'medicine', 'clothing', 'shelter_supplies', 'hygiene', 'education', 'other'],
    required: true
  },
  unit: { type: String, default: 'units' }, // kg, liters, pieces, boxes
  currentStock: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 0 }, // For low-stock alerts
  maximumCapacity: { type: Number },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  location: { type: String, trim: true }, // Warehouse/shelf location
  qrCode: { type: String, unique: true, sparse: true },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'out_of_stock', 'expired'],
    default: 'available'
  },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const inventoryTransactionSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'transfer_out', 'transfer_in', 'adjustment', 'expired'],
    required: true
  },
  quantity: { type: Number, required: true },
  balanceAfter: { type: Number },
  relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'AssistanceCase' },
  transferTo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  transferFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  notes: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

inventoryItemSchema.index({ ngo: 1, category: 1 });
inventoryItemSchema.index({ status: 1, ngo: 1 });
inventoryItemSchema.index({ expiryDate: 1 });
inventoryTransactionSchema.index({ item: 1, createdAt: -1 });
inventoryTransactionSchema.index({ ngo: 1, type: 1 });

const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
const InventoryTransaction = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = { InventoryItem, InventoryTransaction };
