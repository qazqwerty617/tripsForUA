const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType'
    },
    itemType: {
        type: String,
        enum: ['Tour', 'Aviatur'],
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    },
    userAgent: {
        type: String
    },
    // Simplified device type
    device: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        default: 'unknown'
    },
    country: {
        type: String,
        default: 'Unknown'
    }
}, {
    timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ itemId: 1, itemType: 1 });
analyticsSchema.index({ viewedAt: -1 });
analyticsSchema.index({ itemType: 1, viewedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
