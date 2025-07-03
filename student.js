const express = require('express');
const app = express();

// Use built-in Express JSON parser instead of body-parser
app.use(express.json());

const dbconnect = require('./dbconnect.js');
const { StudentModel, StaffModel } = require('./person_schema.js');
const RoomModel = require('./room_schema.js');
const ReservationModel = require('./reservation_schema.js');

function uniqueid(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

/*
In the postman use the following URL
localhost:5004/rooms
*/
// GET ALL ROOMS API
app.get('/rooms', (req, res) => {
    console.log("INSIDE GET ALL ROOMS API")
    RoomModel.find()
        .then(rooms => {
            res.status(200).send(rooms);
        })
        .catch(err => {
            res.status(500).send('Error fetching rooms');
        });
});

// GET ROOM BY ID API
app.get('/rooms/:id', (req, res) => {
    console.log("INSIDE GET ROOM BY ID API");

    const roomId = req.params.id;

    RoomModel.findById(roomId)
        .then(room => {
            if (!room) {
                return res.status(404).send('Room not found');
            }
            res.status(200).send(room);
        })
        .catch(err => {
            console.error('Error fetching room:', err);
            res.status(500).send('Error fetching room');
        });
});
/*
In the postman use the following URL
localhost:5004/rooms/60f7b3b3b3b3b3b3b3b3b3b3

{
  "name": "Room A101 - Updated",
  "location": "Building A, Floor 1",
  "capacity": 30,
  "equipment": "Projector, Whiteboard, Computer, Smart Board",
  "availability": "available",
  "notes": "Updated quiet study room with new equipment"
}
*/

/* -------------------------------------------------------------
                        RESERVATION
-------------------------------------------------------------*/

//MAKE RESERVATION API - Simple version with easy time validation
// MAKE RESERVATION API - Simplified
app.post('/reservations', (req, res) => {
    console.log("INSIDE MAKE RESERVATION API");

    const roomId = req.body.roomId;
    const userId = req.body.userId;
    const date = req.body.date;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const purpose = req.body.purpose;
    const notes = req.body.notes;

    // Check required fields
    if (!roomId || !userId || !date || !startTime || !endTime) {
        return res.status(400).send('Room ID, User ID, date, start time, and end time are required');
    }

    // Create reservation directly
    const reservation = new ReservationModel({
        room: roomId,
        user: userId,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
        purpose: purpose,
        notes: notes,
        createdBy: userId,
        status: 'pending'
    });

    reservation.save()
        .then(saved => {
            res.status(201).send('RESERVATION CREATED SUCCESSFULLY | ' + saved._id);
        })
        .catch(err => {
            console.error("Error:", err);
            res.status(500).send('Error creating reservation');
        });
});

/*
In the postman use the following URL
localhost:5004/reservations/60f7b3b3b3b3b3b3b3b3b3b5/cancel

{
  "userId": "60f7b3b3b3b3b3b3b3b3b3b4"
}
*/
//CANCEL RESERVATION API
// CANCEL RESERVATION API - Simplified
app.put('/reservations/:id/cancel', (req, res) => {
    console.log("INSIDE CANCEL RESERVATION API");

    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    ReservationModel.findById(req.params.id)
        .then(reservation => {
            if (!reservation) {
                return res.status(404).send('Reservation not found');
            }

            // Check if the user who made the reservation is canceling
            if (reservation.user.toString() !== userId) {
                return res.status(403).send('Unauthorized to cancel this reservation');
            }

            reservation.status = 'cancelled';
            return reservation.save();
        })
        .then(cancelled => {
            res.status(200).send('RESERVATION CANCELLED SUCCESSFULLY | ' + cancelled._id);
        })
        .catch(err => {
            console.error("Error:", err);
            res.status(500).send('Error cancelling reservation');
        });
});


// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
app.listen(5004, () =>
    console.log('EXPRESS Server Started at Port No: 5004'));