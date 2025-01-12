const mongoose = require('mongoose');

const collectRequestSchema = new mongoose.Schema({
    school_id: { type: String, required: true },
    trustee_id: { type: String, required: true },
    gateway: { type: String, required: true },
    order_amount: { type: Number, required: true },
    custom_order_id: { type: String, required: true, unique: true }
}, { 
    timestamps: true,
    collection: 'collect_request' 
});

module.exports = mongoose.model('CollectRequest', collectRequestSchema);