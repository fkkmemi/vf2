const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
app.use(cors({ origin: true }))

app.use(require('./middlewares/verifyToken'))
app.use((req, res, next) => {
  if (req.user.level === undefined || req.user.level > 0) return res.status(403).send({ message: 'not authorized' })
  next()
})
app.use('/admin', require('./admin/'))

app.use(require('./middlewares/error'))

module.exports = app
