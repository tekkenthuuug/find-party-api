const handleGetFeedEvents = (db) => (req, res) => {
  const offset = req.params.offset || 0;
  db.select('title', 'description', 'country', 'city', 'id')
    .from('events')
    .limit(10)
    .orderBy('id', 'desc')
    .offset(offset)
    .then((data) => {
      res.status(200).send(data);
    });
};

module.exports = {
  handleGetFeedEvents: handleGetFeedEvents
};
