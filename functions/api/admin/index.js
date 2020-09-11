const router = require('express').Router()

router.post('/indexing', async (req, res) => {
  const indexing = require('../../util/indexing')
  const result = await indexing()
  console.log(result)
  res.send(result)
})

module.exports = router
