const handleCreateEvent = (db) => (req, res) => {
  const { title, contact, description, country, city, creatorID, creatorName } = req.body;
  db.transaction((trx) => {
    trx
      .insert({ title, contact, description, country, city, creatorID, creatorName })
      .into('events')
      .returning('id')
      .then((eventID) => {
        return trx('users')
          .increment('created', 1)
          .where('id', '=', creatorID)
          .returning('id')
          .then((id) => {
            res.status(200).json(eventID[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
};

const handleSendEventComment = (db) => (req, res) => {
  const { content, senderName, targetID, senderID } = req.body;
  db.insert({ content, senderName, senderID, targetID })
    .into('eventComments')
    .returning('id')
    .then(([id]) => {
      res.status(200).json(id);
    });
};

const handleGetEventComments = (db) => (req, res) => {
  const targetID = req.params.id;
  db.select('senderName', 'senderID', 'content')
    .from('eventComments')
    .where('targetID', '=', targetID)
    .orderBy('id', 'desc')
    .then((data) => {
      res.status(200).send(data);
    });
};

const handleGetEvent = (db) => (req, res) => {
  const targetID = req.params.id;
  db.select('*')
    .from('events')
    .where('id', '=', targetID)
    .then(([data]) => {
      if (!data) {
        res.status(200).json('Event not found');
      } else {
        res.status(200).send(data);
      }
    });
};

const handleEnroll = (db) => (req, res) => {
  const { eventID, userID } = req.body;
  db('users')
    .where('id', '=', userID)
    .increment('enrolled', 1)
    .then((d) => {});
  db('events')
    .where('id', '=', eventID)
    .update({ enrolledusers: db.raw(`array_append(enrolledusers, ?)`, [userID]) })
    .returning('id')
    .then(([id]) => {
      res.status(200).send(id);
    });
};

module.exports = {
  handleEnroll: handleEnroll,
  handleCreateEvent: handleCreateEvent,
  handleSendEventComment: handleSendEventComment,
  handleGetEventComments: handleGetEventComments,
  handleGetEvent: handleGetEvent
};
