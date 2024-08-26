const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const User = require('./models/User');
const Volunteer = require('./models/Volunteer');
const BloodCamp = require('./models/bloodCamp');
const Admin = require('./models/admin');
const BloodStock = require('./models/bloodStock');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with your own secret
    resave: false,
    saveUninitialized: true
}));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/blood-donation');
    console.log('Connected to database');
}

main().catch(err => console.log(err));

// Select user or volunteer route
app.get('/', (req, res) => {
    res.render('index');
});

// Handle role selection
// Handle role selection
app.post('/role', (req, res) => {
    const role = req.body.role;
    
    if (role === 'user') {
        res.redirect('/user/login');
    } else if (role === 'volunteer') {
        res.redirect('/volunteer/login');
    } else if (role === 'admin') {
        res.redirect('/admin/login');
    } else {
        res.redirect('/');
    }
});
function isAdmin(req, res, next) {
    if (req.session.adminId) {
        return next();
    } else {
        res.redirect('/admin/login');
    }
}


// User routes
app.get('/user/login', (req, res) => {
    res.render('user/login');
});

app.get('/user/register', (req, res) => {
    res.render('user/register');
});

app.post('/user/register', async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.redirect('/user/login');
});

app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.userId = user._id; // Store user ID in session
        res.redirect('/user/dashboard');
    } else {
        res.redirect('/user/login');
    }
});

// User dashboard route
app.get('/user/dashboard', async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (user) {
        const camps = await BloodCamp.find();
        res.render('user/dashboard', { user, camps });
    } else {
        res.redirect('/user/login');
    }
});

// Volunteer routes
app.get('/volunteer/login', (req, res) => {
    res.render('volunteer/login');
});

// app.get('/volunteer/register', (req, res) => {
//     res.render('volunteer/register');
// });

// app.post('/volunteer/register', async (req, res) => {
//     const { username, email, password } = req.body;
//     const volunteer = new Volunteer({ username, email, password });
//     await volunteer.save();
//     res.redirect('/volunteer/login');
// });

app.post('/volunteer/login', async (req, res) => {
    const { email, password } = req.body;
    const volunteer = await Volunteer.findOne({ email, password });
    if (volunteer) {
        req.session.volunteerId = volunteer._id; // Store volunteer ID in session
        res.redirect('/volunteer/dashboard');
    } else {
        res.redirect('/volunteer/login');
    }
});

// Volunteer dashboard route
app.get('/volunteer/dashboard', async (req, res) => {
    const volunteer = await Volunteer.findById(req.session.volunteerId);
    if (volunteer) {
        res.render('volunteer/dashboard', { volunteer });
    } else {
        res.redirect('/volunteer/login');
    }
});

// Route to display the "Add Blood Camp" page
app.get('/volunteer/add-camp', (req, res) => {
    res.render('volunteer/addCamp');
});

// Route to handle the form submission of new blood camp
app.post('/volunteer/add-camp', async (req, res) => {
    const { name, location, date, description } = req.body;
    const newCamp = new BloodCamp({ name, location, date, description });
    await newCamp.save();
    res.redirect('/volunteer/dashboard'); // Redirect to volunteer dashboard
});
//rote to display blood stock
app.get('/volunteer/show-stock', async (req, res) => {
        const bloodStock = await BloodStock.find();
        res.render('volunteer/bloodStock', { bloodStock });
});






// Admin login route
app.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (admin) {
        req.session.adminId = admin._id; // Store admin ID in session
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin/login');
    }
});

// Admin dashboard route
app.get('/admin/dashboard', isAdmin, async (req, res) => {
    const admin = await Admin.findById(req.session.adminId);
    const users = await User.find();
    const volunteers = await Volunteer.find();
    res.render('admin/dashboard', { admin, users, volunteers });
});

// Route to display the "Add Volunteer" page
app.get('/admin/add-volunteer', isAdmin, (req, res) => {
    res.render('admin/addVolunteer');
});

// Route to handle adding a new volunteer
app.post('/admin/add-volunteer', isAdmin, async (req, res) => {
    const { username, email, password } = req.body;
    const newVolunteer = new Volunteer({ username, email, password });
    await newVolunteer.save();
    res.redirect('/admin/dashboard');
});

// Route to remove a volunteer
app.post('/admin/remove-volunteer/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    await Volunteer.findByIdAndDelete(id);
    res.redirect('/admin/dashboard');
});
// Admin logout route
app.post('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});





// Start server
app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
