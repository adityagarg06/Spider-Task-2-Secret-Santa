const express = require("express");
const path = require("path");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const { render } = require("express/lib/response");

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/secretSanta');
}

// var db = mongoose.connection;
// db.once('open', function () {
//     console.log("we are connected")
// })

const app = express();
const port = 8000;

//Define contact Schema
const personSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    confirmPassword: String
});
const Person = mongoose.model('Person', personSchema);

personSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
})
// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('statics'))
app.use(express.urlencoded())

// PUG SPECIFIC STUFF
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// ENDPOINTS


app.get('/', (req, res) => {
    res.status(200).render('index.pug');
})



app.post('/', async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const usermail = await Person.findOne({ email: email })
        if (usermail.password == password) {
            res.status(200).render("home.pug")
        }
        else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).send("invalid email")
    }

})

app.get('/signup', (req, res) => {
    res.status(200).render('signup.pug');
})



app.post('/signup', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if (password == cpassword) {
            const person = new Person({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            })
            const registered = await person.save()
            res.status(200).render("index.pug")
        }
        else {
            res.send("password not match")
        }
    } catch (error) {
        res.status(400).send(error);
    }
})
const groupSchema = new mongoose.Schema({
    name: String,
    date: Date,
    regisDate: Date,
    budget: Number,
    location: String,
    users: [{ userid: String, username: String }]

})

const Group = mongoose.model('Group', groupSchema)



app.get('/createGroup', (req, res) => {
    res.status(200).render('createGroup.pug');
})

app.post('/createGroup', async (req, res) => {
    try {
        const name = req.body.name
        const date = req.body.date
        const regisDate = req.body.regisDate
        const budget = req.body.budget
        const location = req.body.location

        const group = new Group({
                name: name,
                date: date,
                regisDate: regisDate,
                budget: budget,
                location: location,
            })
            const groupname = await group.save();
            res.status(200).render("home.pug")
    }
    catch (error) {
        res.status(400).send(error);
    }
})

app.get('/joinGroup', (req, res) => {
    res.status(200).render('joinGroup.pug');
})



// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});