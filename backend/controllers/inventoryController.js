const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { InventoryItem, InventoryTransaction } = require('../models/Inventory');

const addItem = asyncHandler(async (req, res) => {
  const { name, category, unit, currentStock, minimumStock, maximumCapacity,
    batchNumber, expiryDate, location } = req.body;
  const item = await InventoryItem.create({
    ngo: req.user.ngoId, name, category, unit: unit || 'units',
    currentStock: currentStock || 0, minimumStock: minimumStock || 0,
    maximumCapacity, batchNumber, expiryDate: expiryDate ? new Date(expiryDate) : undefined, location
  });
  // Initial stock transaction
  if (currentStock > 0) {
    await InventoryTransaction.create({
      item: item._id, ngo: req.user.ngoId, type: 'stock_in',
      quantity: currentStock, balanceAfter: currentStock, performedBy: req.user._id
    });
  }
  res.status(201).json({ success: true, data: item });
});

const listItems = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 20 } = req.query;
  const filter = { ngo: req.user.ngoId };
  if (category) filter.category = category;
  if (status) filter.status = status;

  // Auto-compute status
  const items = await InventoryItem.find(filter)
    .sort({ category: 1, name: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const updated = items.map(i => {
    const obj = i.toObject();
    if (obj.expiryDate && new Date(obj.expiryDate) < new Date()) obj.status = 'expired';
    else if (obj.currentStock === 0) obj.status = 'out_of_stock';
    else if (obj.currentStock <= obj.minimumStock) obj.status = 'low_stock';
    else obj.status = 'available';
    return obj;
  });

  res.json({ success: true, data: updated });
});

const updateStock = asyncHandler(async (req, res) => {
  const { type, quantity, notes, relatedCase } = req.body;
  if (!['stock_in', 'stock_out', 'adjustment', 'expired'].includes(type)) {
    throw new ApiError(400, 'Invalid transaction type');
  }
  const item = await InventoryItem.findOne({ _id: req.params.id, ngo: req.user.ngoId });
  if (!item) throw new ApiError(404, 'Item not found');

  const delta = (type === 'stock_in' || type === 'transfer_in') ? quantity : -quantity;
  const newStock = item.currentStock + delta;
  if (newStock < 0) throw new ApiError(400, 'Insufficient stock for this operation');

  item.currentStock = newStock;
  item.lastUpdated = new Date();
  await item.save();

  await InventoryTransaction.create({
    item: item._id, ngo: req.user.ngoId, type, quantity, balanceAfter: newStock,
    notes, relatedCase, performedBy: req.user._id
  });

  res.json({ success: true, data: item, newStock });
});

const getItemTransactions = asyncHandler(async (req, res) => {
  const transactions = await InventoryTransaction.find({ item: req.params.id })
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: transactions });
});

const getLowStockAlerts = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find({
    ngo: req.user.ngoId,
    $expr: { $lte: ['$currentStock', '$minimumStock'] }
  }).sort({ currentStock: 1 });
  res.json({ success: true, count: items.length, data: items });
});

const getInventorySummary = asyncHandler(async (req, res) => {
  const summary = await InventoryItem.aggregate([
    { $match: { ngo: req.user.ngoId } },
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalStock: { $sum: '$currentStock' },
        lowStockItems: { $sum: { $cond: [{ $lte: ['$currentStock', '$minimumStock'] }, 1, 0] } }
      }
    }
  ]);
  res.json({ success: true, data: summary });
});

module.exports = { addItem, listItems, updateStock, getItemTransactions, getLowStockAlerts, getInventorySummary };
