const admin = require('firebase-admin')
const db = admin.firestore()

module.exports = (err, req, res, next) => {
  console.error(err.message)
  db.collection('errors').add({ createdAt: new Date(), message: err.message })
  res.status(500).send(err.message)
}
