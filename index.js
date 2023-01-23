const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');


//conections mongodb
mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/loginDemo', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    console.log("MONGO CONNECTION OPEN!!!")
})
.catch(err => {
    console.log("OH NO MONGO ERROR!!!")
    console.log(err)
})

app.set('view engine', 'ejs');
app.set('views', 'views');

//sassion & passEncoded
app.use(express.urlencoded({extended: true}));
app.use(session({ secret: 'MySecret*_*' }))

//middleware
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}


//Routers
app.get('/', (req, res) => {
    res.send('This is the howe page')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
        //res.send('welcome back :)')
    }
    else {
        res.redirect('/login')
        //res.send('Try agin :(')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})
app.get('/topsecret', requireLogin, (req, res) => {
    res.send("TOP SECRET!!!")
})
app.listen(3000, () => {
    console.log("app connect on port 3000")
})