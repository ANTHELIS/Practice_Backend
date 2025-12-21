const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require("./config/db");
connectToDB();
const userModel = require("./models/user.model");
const postModel = require("./models/post.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/', (req, res)=>{
    res.render('index');
})
app.post('/register', async (req, res)=>{
    const {username, name, email, age, password} = req.body;
    const user = await userModel.findOne({email})
    if(user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
            const newUser = await userModel.create({
                username, name, email, age, password: hash
            })
            const token = jwt.sign({email, userid: newUser._id}, process.env.JWT_SECRET);
            res.cookie('token', token);
            res.redirect("/profile");
        });
    });
})

app.get('/login', (req, res)=>{
    res.render('login');
})
app.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    const user = await userModel.findOne({email})
    if(!user) return res.status(500).send("Something went Wrong!");

    bcrypt.compare(password, user.password, (err, result)=>{
        if(!result) return res.status(200).redirect('/login');
        const token = jwt.sign({email, userid: user._id}, process.env.JWT_SECRET);
        res.cookie('token', token);
        res.redirect("/profile");
    });
    
})

app.get('/logout', (req, res)=>{
    res.cookie('token', '');
    res.redirect('/login');
})

function isLoggedIn(req, res, next){
    if(req.cookies.token===""){
        return res.redirect("/login");
    }
    else{
        const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.user = data;
        next();
    }
}

app.get('/profile', isLoggedIn, async (req, res)=>{
    const user = await userModel.findOne({_id: req.user.userid}).populate("posts");

    res.render('profile', {user});
})

app.post('/post', isLoggedIn, async (req, res)=>{
    const user = await userModel.findOne({_id: req.user.userid});

    const {content} = req.body;
    const newPost = await postModel.create({
        user: user._id,
        content
    })

    user.posts.push(newPost._id);
    await user.save();
    res.redirect('profile');
})


app.get('/like/:postId', isLoggedIn, async (req, res)=>{
    const post = await postModel.findOne({_id: req.params.postId}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();

    res.redirect('/profile');
})


app.get('/edit/:postId', isLoggedIn, async (req, res)=>{
    const post = await postModel.findOne({_id: req.params.postId}).populate("user");
    res.render("edit", {post});
})

app.post('/update/:postId', isLoggedIn, async (req, res)=>{
    const {content} = req.body;
    await postModel.findOneAndUpdate({_id: req.params.postId},{content});
    res.redirect("/profile");
})
app.get('/delete/:postId', isLoggedIn, async (req, res)=>{
    await postModel.findOneAndDelete({_id: req.params.postId});
    const user = await userModel.findOne({_id: req.user.userid});
    user.posts.splice(user.posts.indexOf(req.params.postId), 1);
    await user.save();
    res.redirect("/profile");
})


app.listen(3000, ()=>{
    console.log("server is running at port 3000");
})