
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');

const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = 3005;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SHAWINVERA',
    database: 'social' 
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/report', (req, res) => {
    res.sendFile(__dirname + '/public/report.html');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO members (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err) => {
        if (err) {
            console.error(err);
            res.send('Error registering member.');
        } else {
            res.redirect('/report.html');
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM members WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.members = results[0];
            res.redirect('/report.html'); 
        } else {
            // res.send('Invalid credentials');
            res.redirect('/register.html'); 
        }
    });
});

app.post('/report', (req, res) => {
    const { description, location } = req.body;


    const query = 'INSERT INTO reports (description, location) VALUES (?, ?)';
    db.query(query, [description, location], (err) => {
        if (err) {
            console.error(err);
            res.send('Error submitting report.');
        } else {
            res.send('Report submitted successfully!');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); // Redirect to the homepage or login page after logout
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
