const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    age: Number,
    password: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
})
const userModel = mongoose.model('user', userSchema);

module.exports = userModel ;