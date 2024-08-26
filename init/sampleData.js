const mongoose = require('mongoose');
const BloodCamp = require('../models/bloodCamp');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/blood-donation');

    const camps = [
        {
            name: 'City Blood Drive',
            location: 'City Hall',
            date: new Date('2024-08-20'),
            description: 'Join us at City Hall for a community blood drive.'
        },
        {
            name: 'University Blood Camp',
            location: 'University Grounds',
            date: new Date('2024-09-15'),
            description: 'Donate blood and save lives at our university camp.'
        },
    ];

    await BloodCamp.insertMany(camps);
    console.log("Sample blood camps added.");
    mongoose.connection.close();
}
