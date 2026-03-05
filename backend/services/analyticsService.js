const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const User = require('../models/User');
const Wish = require('../models/Wish');
const EmergencyFund = require('../models/EmergencyFund');
const AdoptADay = require('../models/AdoptADay');
const mongoose = require('mongoose');

class AnalyticsService {
  async getPlatformStats() {
    const [
      totalDonations,
      totalDonors,
      totalNGOs,
      totalWishes,
      totalEmergencyFunds,
      totalAdoptDays,
      categoryStats,
      monthlyStats
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      User.countDocuments({ role: 'donor' }),
      NGO.countDocuments(),
      Wish.countDocuments(),
      EmergencyFund.countDocuments(),
      AdoptADay.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $lookup: {
            from: 'ngos',
            localField: 'ngoId',
            foreignField: '_id',
            as: 'ngo'
          }
        },
        { $unwind: '$ngo' },
        {
          $group: {
            _id: '$ngo.category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    return {
      donations: totalDonations[0] || { totalAmount: 0, count: 0 },
      donors: totalDonors,
      ngos: totalNGOs,
      wishes: totalWishes,
      emergencyFunds: totalEmergencyFunds,
      adoptDays: totalAdoptDays,
      categoryStats,
      monthlyStats
    };
  }

  async getNGODashboard(ngoId) {
    const [
      donations,
      wishes,
      emergencyFunds,
      adoptDays,
      monthlyDonations,
      topDonors
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { ngoId: new mongoose.Types.ObjectId(ngoId), status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Wish.find({ ngoId }).sort({ createdAt: -1 }),
      EmergencyFund.find({ ngoId }).sort({ createdAt: -1 }),
      AdoptADay.find({ ngoId }).sort({ date: 1 }),
      Donation.aggregate([
        { $match: { ngoId: new mongoose.Types.ObjectId(ngoId), status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ]),
      Donation.aggregate([
        { $match: { ngoId: new mongoose.Types.ObjectId(ngoId), status: 'completed' } },
        {
          $group: {
            _id: '$donorId',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'donor'
          }
        },
        { $unwind: '$donor' },
        {
          $project: {
            donorName: '$donor.name',
            donorEmail: '$donor.email',
            totalAmount: 1,
            count: 1
          }
        }
      ])
    ]);

    return {
      donations: donations[0] || { totalAmount: 0, count: 0 },
      wishes,
      emergencyFunds,
      adoptDays,
      monthlyDonations,
      topDonors
    };
  }

  async getDonorDashboard(donorId) {
    try {
      const donorObjectId = new mongoose.Types.ObjectId(donorId);

      const [
        donations,
        totalDonated,
        ngosData,
        monthlyDonations
      ] = await Promise.all([
        Donation.find({ donorId: donorObjectId, status: 'completed' })
          .populate('ngoId', 'name category logo')
          .sort({ createdAt: -1 })
          .limit(10),
        Donation.aggregate([
          { $match: { donorId: donorObjectId, status: 'completed' } },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          }
        ]),
        Donation.aggregate([
          { $match: { donorId: donorObjectId, status: 'completed' } },
          {
            $group: {
              _id: '$ngoId'
            }
          },
          {
            $count: 'total'
          }
        ]),
        Donation.aggregate([
          { $match: { donorId: donorObjectId, status: 'completed' } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              totalAmount: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 }
        ])
      ]);

      return {
        recentDonations: donations,
        totalDonated: totalDonated[0] || { totalAmount: 0, count: 0 },
        ngosSupported: ngosData[0]?.total || 0,
        monthlyDonations
      };
    } catch (error) {
      console.error('Error in getDonorDashboard:', error);
      return {
        recentDonations: [],
        totalDonated: { totalAmount: 0, count: 0 },
        ngosSupported: 0,
        monthlyDonations: []
      };
    }
  }
  async getDonationTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return monthlyData.map(item => ({
      month: monthNames[item._id.month - 1],
      amount: item.totalAmount,
      count: item.count
    }));
  }

  async getDonationSizeBreakdown() {
    const sizeData = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          micro: {
            $sum: {
              $cond: [{ $lt: ['$amount', 500] }, 1, 0]
            }
          },
          small: {
            $sum: {
              $cond: [{ $and: [{ $gte: ['$amount', 500] }, { $lt: ['$amount', 2000] }] }, 1, 0]
            }
          },
          medium: {
            $sum: {
              $cond: [{ $and: [{ $gte: ['$amount', 2000] }, { $lt: ['$amount', 10000] }] }, 1, 0]
            }
          },
          large: {
            $sum: {
              $cond: [{ $gte: ['$amount', 10000] }, 1, 0]
            }
          },
          microAmount: {
            $sum: {
              $cond: [{ $lt: ['$amount', 500] }, '$amount', 0]
            }
          },
          smallAmount: {
            $sum: {
              $cond: [{ $and: [{ $gte: ['$amount', 500] }, { $lt: ['$amount', 2000] }] }, '$amount', 0]
            }
          },
          mediumAmount: {
            $sum: {
              $cond: [{ $and: [{ $gte: ['$amount', 2000] }, { $lt: ['$amount', 10000] }] }, '$amount', 0]
            }
          },
          largeAmount: {
            $sum: {
              $cond: [{ $gte: ['$amount', 10000] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const result = sizeData.length > 0 ? sizeData[0] : {
      micro: 0, small: 0, medium: 0, large: 0,
      microAmount: 0, smallAmount: 0, mediumAmount: 0, largeAmount: 0
    };

    const breakdown = [
      {
        size: 'Micro (< ₹500)',
        count: result.micro,
        amount: result.microAmount,
        percentage: result.micro > 0 ? ((result.micro / (result.micro + result.small + result.medium + result.large)) * 100).toFixed(1) : '0'
      },
      {
        size: 'Small (₹500-₹2k)',
        count: result.small,
        amount: result.smallAmount,
        percentage: result.small > 0 ? ((result.small / (result.micro + result.small + result.medium + result.large)) * 100).toFixed(1) : '0'
      },
      {
        size: 'Medium (₹2k-₹10k)',
        count: result.medium,
        amount: result.mediumAmount,
        percentage: result.medium > 0 ? ((result.medium / (result.micro + result.small + result.medium + result.large)) * 100).toFixed(1) : '0'
      },
      {
        size: 'Large (> ₹10k)',
        count: result.large,
        amount: result.largeAmount,
        percentage: result.large > 0 ? ((result.large / (result.micro + result.small + result.medium + result.large)) * 100).toFixed(1) : '0'
      }
    ];

    return breakdown;
  }

  async getUserGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [donorGrowth, ngoGrowth] = await Promise.all([
      User.aggregate([
        { $match: { role: 'donor', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      User.aggregate([
        { $match: { role: 'ngo_admin', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Combine and format data
    const combinedData = {};

    donorGrowth.forEach(item => {
      const month = monthNames[item._id.month - 1];
      if (!combinedData[month]) {
        combinedData[month] = { month, donors: 0, ngos: 0 };
      }
      combinedData[month].donors = item.count;
    });

    ngoGrowth.forEach(item => {
      const month = monthNames[item._id.month - 1];
      if (!combinedData[month]) {
        combinedData[month] = { month, donors: 0, ngos: 0 };
      }
      combinedData[month].ngos = item.count;
    });

    return Object.values(combinedData);
  }

  async getTopNGOs() {
    const topNGOs = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$ngoId',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'ngos',
          localField: '_id',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: '$ngo' },
      {
        $project: {
          name: '$ngo.name',
          donations: '$count',
          amount: '$totalAmount'
        }
      }
    ]);

    return topNGOs;
  }

  async getTopDonors() {
    const topDonors = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$donorId',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $project: {
          name: '$donor.name',
          donations: '$count',
          amount: '$totalAmount'
        }
      }
    ]);

    return topDonors;
  }
}

module.exports = new AnalyticsService();

