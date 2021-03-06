const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/user');

dotenv.config();

const app = express();

mongoose.connect(process.env.DATABASE, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected to the db")
    }
})

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false } ));

const productRoutes = require('./routes/product');
const userRoutes = require("./routes/auth");
app.use('/api', productRoutes);
app.use("/api", userRoutes);



app.get('/', (req, res) => {
    res.json("Hello Amazon");
});

// app.post('/', (req, res) => {
//     console.log(req.body.name);
//     let user = new User();
//     user.name = req.body.name;
//     user.email = req.body.email;
//     user.password = req.body.password;

//     user.save((err) => {
//         if (err) {
//             res.json(err);
//         } else {
//             res.json('request sucess');
//         }
//     })
// })

app.listen(3000, err => {
    if (err) {
        console.log(err);
    } else {
        console.log("listening on port", 3000);
    }
});