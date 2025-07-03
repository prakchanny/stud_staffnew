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

//GET ALL STUDENTS API - New endpoint for staff to view all students
app.get('/students', (req, res) => {
    console.log("INSIDE GET ALL STUDENTS API")
    StudentModel.find()
    .then(students => {
        res.status(200).send(students);
    })
    .catch(err => {
        res.status(500).send('Error fetching students from database');
    });
});

//GET ALL STAFF API - New endpoint for staff to view all staff members
app.get('/staff', (req, res) => {
    console.log("INSIDE GET ALL STAFF API")
    StaffModel.find()
    .then(staff => {
        res.status(200).send(staff);
    })
    .catch(err => {
        res.status(500).send('Error fetching staff from database');
    });
});

/*
LIBRARY ROOM MANAGEMENT ENDPOINTS FOR STAFF
*/

/*
In the postman use the following URL
localhost:5003/rooms

{
  "name": "Room A101",
  "location": "Building A, Floor 1",
  "capacity": 25,
  "equipment": "Projector, Whiteboard, Computer",
  "notes": "Quiet study room"
}
*/
// ADD NEW ROOM API
app.post('/rooms', (req, res) => {
    console.log("INSIDE ADD NEW ROOM API")
    const name = req.body.name;
    const location = req.body.location;
    const capacity = req.body.capacity;
    const equipment = req.body.equipment;
    const notes = req.body.notes;

    if (!name || !location || !capacity) {
        return res.status(400).send('Name, location, and capacity are required');
    }

    const roomObj = new RoomModel();
    roomObj.name = name;
    roomObj.location = location;
    roomObj.capacity = capacity;
    roomObj.equipment = equipment || "";
    roomObj.notes = notes;
    roomObj.availability = 'available';

    roomObj.save()
        .then(insertedRoom => {
            const successMessage = 'Room added successfully';
            const roomId = insertedRoom._id;
            res.status(201).send(successMessage + '|' + roomId);
        })
        .catch(err => {
            res.status(500).send('Error adding room');
        });
});

/*
In the postman use the following URL
localhost:5003/rooms
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

/*
In the postman use the following URL
localhost:5003/rooms/60f7b3b3b3b3b3b3b3b3b3b3

{
  "name": "Room A101 - Updated",
  "location": "Building A, Floor 1",
  "capacity": 30,
  "equipment": "Projector, Whiteboard, Computer, Smart Board",
  "availability": "available",
  "notes": "Updated quiet study room with new equipment"
}
*/
// UPDATE ROOM API
app.put('/rooms/:id', (req, res) => {
    console.log("INSIDE UPDATE ROOM API")
    const name = req.body.name;
    const location = req.body.location;
    const capacity = req.body.capacity;
    const equipment = req.body.equipment;
    const availability = req.body.availability;
    const notes = req.body.notes;

    // Simple update without nested objects
    const updateName = name || null;
    const updateLocation = location || null;
    const updateCapacity = capacity || null;
    const updateEquipment = equipment || null;
    const updateAvailability = availability || null;
    const updateNotes = notes || null;

    RoomModel.findById(req.params.id)
        .then(room => {
            if (!room) {
                return res.status(404).send('Room not found');
            }
            if (name) room.name = name;
            if (location) room.location = location;
            if (capacity) room.capacity = capacity;
            if (equipment) room.equipment = equipment;
            if (availability) room.availability = availability;
            if (notes !== undefined) room.notes = notes;
            return room.save();
        })
        .then(savedRoom => {
            const successMessage = 'Room updated successfully';
            const roomId = savedRoom._id;
            res.status(200).send(successMessage + '|' + roomId);
        })
        .catch(err => {
            res.status(500).send('Error updating room');
        });
});

/*
In the postman use the following URL
localhost:5003/rooms/60f7b3b3b3b3b3b3b3b3b3b3
*/
// DELETE ROOM API
app.delete('/rooms/:id', (req, res) => {
    console.log("INSIDE DELETE ROOM API")

    // First check if there are any active reservations for this room
    ReservationModel.find()
    .then(activeReservations => {
        if (activeReservations.length > 0) {
            const errorMessage = 'Cannot delete room with active reservations';
            const reservationCount = activeReservations.length;
            return res.status(400).send(errorMessage + '|' + reservationCount);
        }

        return RoomModel.findByIdAndDelete(req.params.id);
    })
    .then(deletedRoom => {
        if (!deletedRoom) {
            return res.status(404).send('Room not found');
        }
        res.status(200).send({
            message: 'Room deleted successfully',
            deletedRoom: deletedRoom
        });
    })
    .catch(err => {
        res.status(500).send('Error deleting room');
    });
});

/*
RESERVATION MANAGEMENT ENDPOINTS FOR STAFF
*/

/*
In the postman use the following URL
localhost:5003/reservations
localhost:5003/reservations?status=pending
localhost:5003/reservations?date=2024-12-25
localhost:5003/reservations?roomId=60f7b3b3b3b3b3b3b3b3b3b3
*/
// GET ALL RESERVATIONS API - Simple version for beginners
app.get('/reservations', (req, res) => {
    console.log("INSIDE GET ALL RESERVATIONS API");

    ReservationModel.find()
        .then(reservations => {
            res.status(200).send(reservations);
        })
        .catch(err => {
            res.status(500).send('Error fetching reservations');
        });
});

/*
In the postman use the following URL
localhost:5003/reservations/pending
*/
// GET PENDING RESERVATIONS API - Simple version for beginners
app.get('/reservations/pending', (req, res) => {
    console.log("INSIDE GET PENDING RESERVATIONS API");

    ReservationModel.find({ status: 'pending' })
        .then(pendingReservations => {
            res.status(200).send(pendingReservations);
        })
        .catch(err => {
            console.error("Error:", err);
            res.status(500).send('Error fetching pending reservations');
        });
});

/*
In the postman use the following URL
localhost:5003/reservations/60f7b3b3b3b3b3b3b3b3b3b5/approve

{
  "approvedBy": "60f7b3b3b3b3b3b3b3b3b3b6",
  "notes": "Approved for study session"
}
*/
// APPROVE RESERVATION API - Simple version for beginners
app.put('/reservations/:id/approve', (req, res) => {
    console.log("INSIDE APPROVE RESERVATION API");
    const approvedBy = req.body.approvedBy;
    const notes = req.body.notes;

    if (!approvedBy) {
        return res.status(400).send('ApprovedBy staff ID is required');
    }

    ReservationModel.findById(req.params.id)
        .then(reservation => {
            if (!reservation) {
                // Throw a custom error to be caught by the .catch block
                const error = new Error('Reservation not found');
                error.statusCode = 401;
                throw error;
            }

            if (reservation.status !== 'pending') {
                // Throw another custom error
                const error = new Error(`Cannot approve reservation with status: ${reservation.status}`);
                error.statusCode = 400;
                throw error;
            }

            reservation.status = 'approved';
            reservation.approvedBy = approvedBy;
            if (notes) {
                reservation.notes = notes;
            }
            return reservation.save();
        })
        .then(approvedReservation => {
            const successMessage = 'Reservation approved successfully';
            const reservationId = approvedReservation._id;
            res.status(200).send(successMessage + '|' + reservationId);
        })
        .catch(err => {
            // All errors are now handled here
            console.error(err); // Good practice to log the actual error
            const statusCode = err.statusCode || 500;
            res.status(statusCode).send('Error approving reservation');
        });
});

/*
In the postman use the following URL
localhost:5003/reservations/60f7b3b3b3b3b3b3b3b3b3b5/reject

{
  "rejectedBy": "60f7b3b3b3b3b3b3b3b3b3b6",
  "rejectionReason": "Room not available for requested time"
}
*/
// REJECT RESERVATION API - Simple version for beginners
app.put('/reservations/:id/reject', (req, res) => {
    console.log("INSIDE REJECT RESERVATION API")
    const rejectedBy = req.body.rejectedBy;
    const rejectionReason = req.body.rejectionReason;

    if (!rejectedBy || !rejectionReason) {
        return res.status(400).send('RejectedBy staff ID and rejection reason are required');
    }

    ReservationModel.findById(req.params.id)
        .then(reservation => {
            if (!reservation) {
                return res.status(404).send('Reservation not found');
            }

            if (reservation.status !== 'pending') {
                const errorMessage = 'Cannot reject reservation with status: ' + reservation.status;
                return res.status(400).send(errorMessage);
            }

            reservation.status = 'rejected';
            reservation.approvedBy = rejectedBy; // Using approvedBy field to store who processed it
            reservation.rejectionReason = rejectionReason;

            return reservation.save();
        })
        .then(rejectedReservation => {
            const successMessage = 'Reservation rejected successfully';
            const reservationId = rejectedReservation._id;
            res.status(200).send(successMessage + '|' + reservationId);
        })
        .catch(err => {
            res.status(500).send('Error rejecting reservation');
        });
});

// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
app.listen(5003, () =>
    console.log('EXPRESS Server Started at Port No: 5003'));
