const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();

const feed = require('./controllers/feed.js');
const event = require('./controllers/event.js');
const user = require('./controllers/user.js');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'find-party'
  }
});

// Get user by id
app.get('/api/users/:id', user.handleGetUser(db));
// Register user
app.post('/api/register', user.handleRegister(db, bcrypt));
// Sign in user
app.post('/api/signin', user.handleSignin(db, bcrypt));
// Sets profile info
app.put('/api/users/settings', (req, res) => {
  const { userID, description } = req.body;
  db('users')
    .update({ description })
    .where('id', '=', userID)
    .returning('id')
    .then(([id]) => {
      res.status(200).json(id);
    });
});
// Get user profile comments by user id
app.get('/api/users/comments/:id', user.handleGetComments(db));
// Send comment to user profile
app.post('/api/users/comments', user.handleSendComment(db));
// Creating an event
app.post('/api/events/create', event.handleCreateEvent(db));
// Gets and event info
app.get('/api/events/info/:id', event.handleGetEvent(db));
// Gets comments for event
app.get('/api/events/comments/:id', event.handleGetEventComments(db));
// Send comment to event
app.post('/api/events/comments', event.handleSendEventComment(db));
// Enroll user to event
app.put('/api/events/enroll', event.handleEnroll(db));
// Get events for feed
app.get('/api/feed/:offset', feed.handleGetFeedEvents(db));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('App is listening on port ' + port);
});
