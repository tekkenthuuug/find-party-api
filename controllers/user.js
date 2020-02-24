const handleGetUser = (db) => (req, res) => {
  const id = req.params.id;
  db.select('*')
    .from('users')
    .where('id', '=', id)
    .then(([user]) => {
      if (!user) {
        res.status(400).json('User not found');
        return;
      }
      res.status(200).json(user);
    });
};

const handleGetComments = (db) => (req, res) => {
  const targetID = req.params.id;
  db.select('senderName', 'senderID', 'content')
    .from('profileComments')
    .where('targetID', '=', targetID)
    .orderBy('id', 'desc')
    .then((data) => {
      res.status(200).send(data);
    });
};

const handleSendComment = (db) => (req, res) => {
  const { content, senderName, targetID, senderID } = req.body;
  db.insert({ content, senderName, senderID, targetID })
    .into('profileComments')
    .returning('id')
    .then((id) => {
      res.status(200).json(id[0]);
    });
};

const handleSignin = (db, bcrypt) => (req, res) => {
  const { username, password } = req.body;
  db.select('username', 'hash')
    .from('login')
    .where('username', '=', username)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('username', 'id')
          .from('users')
          .where('username', '=', username)
          .then((data) => {
            res.status(200).json(data[0]);
          })
          .catch((err) => console.log(err));
      } else {
        res.status(400).json({
          error: {
            details: 'Wrong credential'
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        error: 'Cannot get user'
      });
    });
};

const handleRegister = (db, bcrypt) => (req, res) => {
  const { username, country, city, firstName, lastName, password } = req.body;
  if (!username || !password) {
    res.sendStatus(500);
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({ hash, username })
      .into('login')
      .returning('id')
      .then((id) => {
        return trx('users')
          .returning('*')
          .insert({
            id: id[0],
            username,
            firstName,
            lastName,
            country,
            city,
            joined: new Date()
          })
          .then((data) => {
            res.status(200).json(data[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) =>
    res.status(400).json({
      error: {
        details: 'Username is taken'
      }
    })
  );
};

module.exports = {
  handleGetUser: handleGetUser,
  handleGetComments: handleGetComments,
  handleSendComment: handleSendComment,
  handleRegister: handleRegister,
  handleSignin: handleSignin
};
