const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Import all models for real data operations
const User = require('../models/User');
const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Wish = require('../models/Wish');
const EmergencyFund = require('../models/EmergencyFund');
const AdoptADay = require('../models/AdoptADay');
const Gratitude = require('../models/Gratitude');
const Discussion = require('../models/Discussion');
const ImpactStory = require('../models/ImpactStory');
const ImpactUpdate = require('../models/ImpactUpdate');
const TeamMember = require('../models/TeamMember');
const Testimonial = require('../models/Testimonial');
const Utilization = require('../models/Utilization');

// In-memory log store (populated by server activity)
const recentLogs = [];
const MAX_LOGS = 100;

// Hook into console to capture logs
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => {
    recentLogs.push({ level: 'info', message: args.join(' '), timestamp: new Date().toISOString() });
    if (recentLogs.length > MAX_LOGS) recentLogs.shift();
    originalLog(...args);
};
console.error = (...args) => {
    recentLogs.push({ level: 'error', message: args.join(' '), timestamp: new Date().toISOString() });
    if (recentLogs.length > MAX_LOGS) recentLogs.shift();
    originalError(...args);
};

// @desc    Get system health
// @route   GET /api/v1/system-maintenance/health
// @access  Private (system_admin)
exports.getSystemHealth = async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

        // Ping the database
        let dbPing = 'N/A';
        try {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            dbPing = `${Date.now() - start}ms`;
        } catch (e) { }

        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        const memUsage = process.memoryUsage();

        res.json({
            success: true,
            data: {
                database: dbStateMap[dbState] || 'Unknown',
                dbPing,
                api: 'Running',
                uptime: `${hours}h ${minutes}m ${seconds}s`,
                lastBackup: 'Not yet backed up',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: os.platform(),
                hostname: os.hostname(),
                memory: {
                    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
                    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
                },
                cpuLoad: os.loadavg().map(v => v.toFixed(2)),
                freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
                totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Clear application cache
// @route   POST /api/v1/system-maintenance/clear-cache
// @access  Private (system_admin)
exports.clearCache = async (req, res) => {
    try {
        const before = Object.keys(require.cache).length;

        // Clear non-core Node.js module cache entries (app modules only)
        const cleared = [];
        const nodeModulesPath = `${path.sep}node_modules${path.sep}`;

        Object.keys(require.cache).forEach(key => {
            // Check for node_modules in a way that handles both / and \
            const normalizedKey = path.normalize(key);
            if (!normalizedKey.includes('node_modules')) {
                delete require.cache[key];
                cleared.push(path.basename(key));
            }
        });

        const after = Object.keys(require.cache).length;

        console.log(`[Maintenance] Cache Cleared: ${cleared?.length || 0} modules flushed. Registry size: ${before} -> ${after}`);

        // Clear in-memory logs
        const logsClearedCount = recentLogs ? recentLogs.length : 0;
        if (recentLogs) recentLogs.length = 0;

        // Check for temp uploads
        const tempUploadsDir = path.join(__dirname, '..', 'uploads', 'tmp');
        let tempFilesCount = 0;
        try {
            if (fs.existsSync(tempUploadsDir)) {
                const files = fs.readdirSync(tempUploadsDir);
                tempFilesCount = files.length;
                files.forEach(file => {
                    try {
                        const filePath = path.join(tempUploadsDir, file);
                        if (fs.lstatSync(filePath).isFile()) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (e) { }
                });
            }
        } catch (err) {
            console.error('[Maintenance] Error clearing temp files:', err);
        }

        const data = {
            message: 'System cache and temporary data cleared successfully',
            cacheCleared: true,
            itemsCleared: cleared || [],
            logsCleared: logsClearedCount || 0,
            tempFilesCleared: tempFilesCount || 0,
            modulesBefore: before || 0,
            modulesAfter: after || 0,
            modulesCleared: (before - after) || 0,
            timestamp: new Date().toISOString()
        };

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Check database health and collection stats
// @route   GET /api/v1/system-maintenance/check-database
// @access  Private (system_admin)
exports.checkDatabase = async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

        // Ping
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        const pingMs = Date.now() - pingStart;

        // Get real collection counts
        const [users, ngos, donations, wishes, emergencyFunds, adoptADays, gratitudes] = await Promise.all([
            User.countDocuments(),
            NGO.countDocuments(),
            Donation.countDocuments(),
            Wish.countDocuments(),
            EmergencyFund.countDocuments(),
            AdoptADay.countDocuments(),
            Gratitude.countDocuments(),
        ]);

        // Get DB stats
        const dbStats = await mongoose.connection.db.stats();

        res.json({
            success: true,
            data: {
                status: dbStateMap[dbState],
                ping: `${pingMs}ms`,
                databaseName: mongoose.connection.name,
                collections: {
                    users,
                    ngos,
                    donations,
                    wishes,
                    emergencyFunds,
                    adoptADays,
                    gratitudes,
                    total: users + ngos + donations + wishes + emergencyFunds + adoptADays + gratitudes
                },
                dbStats: {
                    collections: dbStats.collections,
                    dataSize: `${(dbStats.dataSize / 1024).toFixed(2)} KB`,
                    storageSize: `${(dbStats.storageSize / 1024).toFixed(2)} KB`,
                    indexes: dbStats.indexes,
                    indexSize: `${(dbStats.indexSize / 1024).toFixed(2)} KB`,
                    objects: dbStats.objects,
                },
                checkedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    View recent system logs
// @route   GET /api/v1/system-maintenance/view-logs
// @access  Private (system_admin)
exports.viewLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;

        // Add some recent activity logs from DB
        let recentDonations = [];
        try {
            recentDonations = await Donation.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('donorId', 'name')
                .populate('ngoId', 'name')
                .lean();
        } catch (e) {
            console.error('[Maintenance] Error fetching donations for logs:', e.message);
        }

        let recentUsers = [];
        try {
            recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('name email role createdAt')
                .lean();
        } catch (e) {
            console.error('[Maintenance] Error fetching users for logs:', e.message);
        }

        const activityLogs = [
            ...(recentDonations || []).map(d => ({
                level: 'info',
                message: `Donation of ₹${d.amount} by ${d.donorId?.name || 'Anonymous'} to ${d.ngoId?.name || 'Unknown NGO'}`,
                timestamp: d.createdAt || new Date(),
                type: 'donation'
            })),
            ...(recentUsers || []).map(u => ({
                level: 'info',
                message: `New user registered: ${u.name} (${u.role})`,
                timestamp: u.createdAt || new Date(),
                type: 'user'
            })),
            ...(recentLogs || []).slice(-limit).map(l => {
                if (typeof l === 'string') return { level: 'info', message: l, timestamp: new Date(), type: 'system' };
                return { ...l, type: 'system' };
            })
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

        res.json({
            success: true,
            data: {
                totalLogs: activityLogs.length,
                logs: activityLogs,
                serverStartTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
                retrievedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('[Maintenance] View Logs Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Backup all data (export summary)
// @route   POST /api/v1/system-maintenance/backup-data
// @access  Private (system_admin)
exports.backupData = async (req, res) => {
    try {
        // Fetch counts and summaries for all 13 collections for a TRULY complete backup
        const [
            users, ngos, donations, wishes, emergencyFunds,
            adoptADays, gratitudes, discussions, impactStories,
            impactUpdates, teamMembers, testimonials, utilizations
        ] = await Promise.all([
            User.find().lean(),
            NGO.find().lean(),
            Donation.find().lean(),
            Wish.find().lean(),
            EmergencyFund.find().lean(),
            AdoptADay.find().lean(),
            Gratitude.find().lean(),
            Discussion.find().lean(),
            ImpactStory.find().lean(),
            ImpactUpdate.find().lean(),
            TeamMember.find().lean(),
            Testimonial.find().lean(),
            Utilization.find().lean()
        ]);

        const backupData = {
            backupId: `full_backup_${Date.now()}`,
            createdAt: new Date().toISOString(),
            info: {
                platform: 'HeartBridge',
                version: '1.0.0',
                type: 'Production-Grade Full Data Export'
            },
            summary: {
                users: users.length,
                ngos: ngos.length,
                donations: donations.length,
                wishes: wishes.length,
                emergencyFunds: emergencyFunds.length,
                adoptADays: adoptADays.length,
                gratitudes: gratitudes.length,
                discussions: discussions.length,
                impactStories: impactStories.length,
                impactUpdates: impactUpdates.length,
                teamMembers: teamMembers.length,
                testimonials: testimonials.length,
                utilizations: utilizations.length,
                totalRecords: users.length + ngos.length + donations.length + wishes.length + emergencyFunds.length +
                    adoptADays.length + gratitudes.length + discussions.length + impactStories.length +
                    impactUpdates.length + teamMembers.length + testimonials.length + utilizations.length
            },
            financialSummary: {
                totalDonationsAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
                totalWishesCollected: wishes.reduce((sum, w) => sum + (w.collectedAmount || 0), 0),
                totalEmergencyCollected: emergencyFunds.reduce((sum, e) => sum + (e.collectedAmount || 0), 0),
            },
            data: {
                users,
                ngos,
                donations,
                wishes,
                emergencyFunds,
                adoptADays,
                gratitudes,
                discussions,
                impactStories,
                impactUpdates,
                teamMembers,
                testimonials,
                utilizations
            },
            note: 'HeartBridge Core Data Snapshot. This file contains all primary database records.'
        };

        // Save physical file to disk
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = `${backupData.backupId}.json`;
        const filePath = path.join(backupDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        res.json({
            success: true,
            data: {
                ...backupData,
                serverPath: filePath,
                fileName: fileName
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Reset/recalculate platform statistics
// @route   POST /api/v1/system-maintenance/reset-stats
// @access  Private (system_admin)
exports.resetStats = async (req, res) => {
    try {
        // Recalculate real stats from DB
        const [
            totalUsers,
            totalNGOs,
            verifiedNGOs,
            totalDonations,
            totalWishes,
            fulfilledWishes,
            totalEmergencyFunds,
            totalAdoptADays,
            totalGratitudes,
            donationAgg,
        ] = await Promise.all([
            User.countDocuments(),
            NGO.countDocuments(),
            NGO.countDocuments({ isVerified: true }),
            Donation.countDocuments(),
            Wish.countDocuments(),
            Wish.countDocuments({ status: 'FULFILLED' }),
            EmergencyFund.countDocuments(),
            AdoptADay.countDocuments(),
            Gratitude.countDocuments(),
            Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, avg: { $avg: '$amount' } } }]),
        ]);

        const totalAmount = donationAgg[0]?.total || 0;
        const avgDonation = donationAgg[0]?.avg || 0;

        const stats = {
            recalculatedAt: new Date().toISOString(),
            users: {
                total: totalUsers,
                donors: await User.countDocuments({ role: 'donor' }),
                ngoAdmins: await User.countDocuments({ role: 'ngo_admin' }),
                systemAdmins: await User.countDocuments({ role: 'system_admin' }),
            },
            ngos: {
                total: totalNGOs,
                verified: verifiedNGOs,
                pending: totalNGOs - verifiedNGOs,
            },
            donations: {
                count: totalDonations,
                totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
                averageAmount: `₹${Math.round(avgDonation).toLocaleString('en-IN')}`,
            },
            wishes: {
                total: totalWishes,
                fulfilled: fulfilledWishes,
                active: await Wish.countDocuments({ status: 'ACTIVE' }),
                expired: await Wish.countDocuments({ status: 'EXPIRED' }),
            },
            emergencyFunds: { total: totalEmergencyFunds },
            adoptADays: { total: totalAdoptADays },
            gratitudes: { total: totalGratitudes },
            message: 'Statistics successfully recalculated from live database'
        };

        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
