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
    }],
    profilepic: {
        type: String,
        default: "default.png"
    }
})
const userModel = mongoose.model('user', userSchema);

module.exports = userModel ;