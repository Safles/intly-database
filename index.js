const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const salt = 10;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended : true} ));

// Connection Checker
app.listen(3001, () => {
    console.log('Running on port 3001');
});

// Database Access
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "intly_database"
});
db.connect((err)=>{
    if(err){
        throw err
    }
    else{
        console.log('Database Connected')
    }
})

// Get user data for login
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.query(
        `SELECT * FROM users WHERE username = '${username}'`, (err, result) => {
            if(err){
                res.send({err:err});
            } else {
                console.log('User query finished');
            }
            if (result.length > 0) {
                res.send(result);
            } else {
                console.log('No user found');
                res.send({message: 'No Credentials Found!'});
            }
        }
    )
})

// Register Users
app.post("/user_register", (req, res) => {
    let isAdmin = 0;
    let isPermitted = 0;
    const password = req.body.pass;
    const acc = req.body.access;
    if(acc === 'full'){
        isAdmin = 1;
        isPermitted = 1;
    } else if(acc=== 'limited'){
        isAdmin = 0;
        isPermitted = 1;
    }
    bcrypt.hash(password.toString(), salt, (err,hash) => {
        if (err){
            console.log(err);
        }
        const info = [
            req.body.user,
            hash,
            req.body.full_name,
            req.body.gender,
            req.body.birth_day,
            req.body.pos,
            req.body.lic,
            req.body.emp_number,
            isAdmin,
            isPermitted
        ]
        const sql = "INSERT INTO users (`username`,`password`,`full_name`,`gender`,`birth_date`,`position`, `license`, `employee_number`,`isAdmin`,`isPermitted`) VALUES (?)";
        db.query(sql, [info], (err,data) => {
            if(err){
                console.log(err)
            } 
            console.log('Success!')
        })
    })
})

// Get user info
app.get('/getUserProfile', (req,res) => {
    const sql = 'SELECT username,position FROM users'
    db.query(sql, (err,data) => {
        if(err){
            console.log(err)
        }
        console.log(data)
        res.send(data);
    })
})