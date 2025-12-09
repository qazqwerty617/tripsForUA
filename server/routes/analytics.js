const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Tour = require('../models/Tour');
const Aviatur = require('../models/Aviatur');
const { protect, admin } = require('../middleware/auth');
const geoip = require('geoip-lite');

// Helper to detect device type from user agent
const getDeviceType = (userAgent) => {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) return 'mobile';
    if (/ipad|tablet/.test(ua)) return 'tablet';
    return 'desktop';
};

// @route   POST /api/analytics/view
// @desc    Record a view for a tour or aviatur
// @access  Public
router.post('/view', async (req, res) => {
    try {
        const { itemId, itemType } = req.body;

        if (!itemId || !itemType) {
            return res.status(400).json({ message: 'itemId and itemType are required' });
        }

        if (!['Tour', 'Aviatur', 'Social'].includes(itemType)) {
            return res.status(400).json({ message: 'itemType must be Tour, Aviatur or Social' });
        }

        const userAgent = req.headers['user-agent'] || '';
        const device = getDeviceType(userAgent);

        // Detect country from IP
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Handle comma-separated list of IPs (e.g. "client, proxy1, proxy2")
        if (ip && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : 'Unknown';

        await Analytics.create({
            itemId,
            itemType,
            userAgent: userAgent.substring(0, 200), // Limit length
            device,
            country
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// @route   GET /api/analytics/stats
// @desc    Get analytics statistics for admin dashboard
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        // Calculate date range
        let startDate = new Date();
        switch (period) {
            case '24h':
                startDate.setHours(startDate.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Total views in period
        const totalViews = await Analytics.countDocuments({
            viewedAt: { $gte: startDate }
        });

        // Views by type
        const viewsByType = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate } } },
            { $group: { _id: '$itemType', count: { $sum: 1 } } }
        ]);

        // Views per day for chart
        const viewsPerDay = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Device breakdown
        const deviceStats = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate } } },
            { $group: { _id: '$device', count: { $sum: 1 } } }
        ]);

        // Country breakdown
        const countryStats = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Social clicks
        const socialStats = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate }, itemType: 'Social' } },
            { $group: { _id: '$itemId', count: { $sum: 1 } } }
        ]);

        res.json({
            totalViews,
            viewsByType: viewsByType.reduce((acc, v) => ({ ...acc, [v._id]: v.count }), {}),
            viewsPerDay,
            deviceStats: deviceStats.reduce((acc, v) => ({ ...acc, [v._id]: v.count }), {}),
            countryStats: countryStats.reduce((acc, v) => ({ ...acc, [v._id]: v.count }), {}),
            socialStats: socialStats.reduce((acc, v) => ({ ...acc, [v._id]: v.count }), {}),
            period
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// @route   GET /api/analytics/all-items
// @desc    Get ALL tours and aviatury with their view counts
// @access  Private/Admin
router.get('/all-items', protect, admin, async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        // Calculate date range
        let startDate = new Date();
        switch (period) {
            case '24h':
                startDate.setHours(startDate.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get view counts per item
        const viewCounts = await Analytics.aggregate([
            { $match: { viewedAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { itemId: '$itemId', itemType: '$itemType' },
                    views: { $sum: 1 }
                }
            }
        ]);

        // Create a map for quick lookup
        const viewsMap = {};
        viewCounts.forEach(v => {
            viewsMap[`${v._id.itemType}-${v._id.itemId}`] = v.views;
        });

        // Get ALL tours
        const tours = await Tour.find({ status: 'active' })
            .select('title city country images price startDate')
            .lean();

        // Get ALL aviatury
        const aviatury = await Aviatur.find({ status: 'active' })
            .select('name country flag image price')
            .lean();

        // Combine with view counts - ALL items shown, even with 0 views
        const toursWithViews = tours.map(tour => ({
            ...tour,
            itemType: 'Tour',
            views: viewsMap[`Tour-${tour._id}`] || 0
        }));

        const aviaturyWithViews = aviatury.map(aviatur => ({
            ...aviatur,
            itemType: 'Aviatur',
            views: viewsMap[`Aviatur-${aviatur._id}`] || 0
        }));

        // Sort by views (descending)
        const sortedTours = toursWithViews.sort((a, b) => b.views - a.views);
        const sortedAviatury = aviaturyWithViews.sort((a, b) => b.views - a.views);

        res.json({
            tours: sortedTours,
            aviatury: sortedAviatury,
            period
        });
    } catch (error) {
        console.error('Analytics all-items error:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
