const admin = require('firebase-admin')
const db = admin.firestore()

module.exports = async (req, res, next) => {
  const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization)
  req.claims = decodedToken
  const sn = await db.collection('users').doc(decodedToken.user_id).get()
  req.user = sn.data()
  next()
}
