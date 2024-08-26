
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: String,
    email: String,
    password: String
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
