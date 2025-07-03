const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    room: String,
    user: String,
    date: Date,
    startTime: String,
    endTime: String,
    purpose: String,
    status: { type: String, default: 'pending' },
    createdBy: String,
    approvedBy: String,
    rejectionReason: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', ReservationSchema, 'reservations');