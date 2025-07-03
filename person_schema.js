const schema_mongoose = require('mongoose');

const PersonSchema = schema_mongoose.Schema({
       id: Number,
       name: String,
       emailid: String,
       pass: String,
       mobile: Number,
       role: String,
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now }
    });

const StudentModel = schema_mongoose.model('Student', PersonSchema, 'students');
const StaffModel = schema_mongoose.model('Staff', PersonSchema, 'staffs');

module.exports = { StudentModel, StaffModel };