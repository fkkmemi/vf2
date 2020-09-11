const admin = require('firebase-admin')
const db = admin.firestore()
module.exports = async () => {
  const boardSn = await db.collection('boards').limit(100).get()
  const userSn = await db.collection('users').limit(100).get()
  if (boardSn.empty) return { status: 'board empty' }
  if (userSn.empty) return { status: 'user empty' }
  const userSets = userSn.docs.map(doc => {
    const item = {
      uid: doc.id,
      counts: {
        articleCount: 0,
        commentCount: 0,
        likeCount: 0
      }
    }
    return item
  })
  const batch = db.batch()
  for (const boardDoc of boardSn.docs) {
    // const board = boardDoc.data()
    console.log('board update: ' + boardDoc.id)

    const boardSet = {
      count: 0,
      readCount: 0,
      commentCount: 0,
      likeCount: 0
    }

    const articleSn = await db.collection('boards').doc(boardDoc.id)
      .collection('articles').limit(1000).get()
    if (articleSn.empty) {
      batch.update(boardDoc.ref, boardSet)
      continue
    }
    boardSet.count = articleSn.docs.length
    for (const articleDoc of articleSn.docs) {
      const article = articleDoc.data()
      console.log('article update: ' + article.title)

      const articleSet = {
        commentCount: 0
      }

      boardSet.readCount += article.readCount
      boardSet.likeCount += article.likeCount
      if (boardSet[`categoryCount.${article.category}`] === undefined) {
        boardSet[`categoryCount.${article.category}`] = 1
      } else {
        boardSet[`categoryCount.${article.category}`]++
      }

      const findUser = userSets.find(user => user.uid === article.uid)
      if (findUser) findUser.counts.articleCount++
      article.likeUids.forEach(uid => {
        const findUser = userSets.find(user => user.uid === uid)
        if (findUser) findUser.counts.likeCount++
      })

      article.boardId = boardDoc.id
      batch.set(db.collection('articles').doc(articleDoc.id), article)

      const commentSn = await db.collection('boards').doc(boardDoc.id)
        .collection('articles').doc(articleDoc.id)
        .collection('comments').limit(1000).get()
      if (commentSn.empty) {
        batch.update(articleDoc.ref, articleSet)
        continue
      }

      boardSet.commentCount += commentSn.docs.length
      articleSet.commentCount += commentSn.docs.length

      for (const commentDoc of commentSn.docs) {
        const comment = commentDoc.data()
        console.log('comment update: ' + comment.comment)
        comment.boardId = boardDoc.id
        comment.articleId = articleDoc.id
        batch.set(db.collection('comments').doc(commentDoc.id), comment)
        const findUser = userSets.find(user => user.uid === comment.uid)
        if (findUser) {
          findUser.counts.commentCount++
        }
      }
      batch.update(articleDoc.ref, articleSet)
    }
    batch.update(boardDoc.ref, boardSet)
  }
  userSets.forEach(user => {
    batch.update(db.collection('users').doc(user.uid), user.counts)
  })

  await batch.commit()
  console.log('done')
  return { status: 'done' }
}
