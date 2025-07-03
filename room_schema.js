const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: String, // e.g., "Room A101"
    location: String, // e.g., "Building A, Floor 1"
    capacity: Number,
    equipment: String, // e.g., "Projector, Whiteboard, Computer"
    availability: { type: String, default: 'available' },
    notes: String, // optional remarks
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema, 'rooms');
