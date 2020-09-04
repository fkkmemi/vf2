const functions = require('firebase-functions')
const admin = require('firebase-admin')
const algoliasearch = require('algoliasearch')
const serviceAccount = require('./key.json')
const region = functions.config().admin.region || 'us-central1'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().admin.db_url,
  storageBucket: functions.config().admin.bucket_url
})

const rdb = admin.database()
const db = admin.firestore()

// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
// App ID and API Key are stored in functions config variables
let index
if (functions.config().algolia) {
  const ALGOLIA_ID = functions.config().algolia.app_id
  const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key

  const ALGOLIA_INDEX_NAME = 'boards'
  const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)
  index = client.initIndex(ALGOLIA_INDEX_NAME)
}

const initialize = async () => {
  if (!index) return
  await index.setSettings({
    searchableAttributes: [
      'title',
      'unordered(content)',
      'category',
      'tags',
      'displayName'
    ],
    indexLanguages: ['ko'],
    queryLanguages: ['ko'],
    ranking: [
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom'
    ],
    customRanking: [
      'desc(articleId)',
      'asc(boardId)',
      'asc(category)',
      'asc(title)'
    ]
  }).catch(e => console.error('algolia init err: ' + e.message))
  console.log('initialized')
}

// initialize()

exports.createUser = functions.region(region).auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL, providerData, emailVerified } = user
  const time = new Date()
  const u = {
    email,
    displayName,
    photoURL: photoURL || '/user.png',
    createdAt: time,
    updatedAt: time,
    level: email === functions.config().admin.email ? 0 : 5,
    visitedAt: time,
    visitCount: 0,
    emailVerified,
    articleCount: 0,
    commentCount: 0,
    likeCount: 0
  }
  if (!displayName) u.displayName = email.split('@')[0]
  if (providerData && providerData.length) u.providerId = providerData[0].providerId
  if (u.providerId !== 'password' && u.providerId !== 'google.com') {
    u.emailVerified = true
    await admin.auth().updateUser(uid, { emailVerified: u.emailVerified }).catch(e => console.error('user update err: ' + e.message))
  }
  await db.collection('users').doc(uid).set(u).catch(e => console.error('user db create err: ' + e.message))
  u.createdAt = time.getTime()
  await rdb.ref('users').child(uid).set(u).catch(e => console.error('user rdb create err: ' + e.message))

  try {
    await db.collection('meta').doc('users').update({ count: admin.firestore.FieldValue.increment(1) })
  } catch (e) {
    await db.collection('meta').doc('users').set({ count: 1 }).catch(e => console.error('meta update err: ' + e.message))
  }
  if (u.level > 0) return
  await initialize()
  await setSitemap()
})

exports.deleteUser = functions.region(region).auth.user().onDelete(async (user) => {
  const { uid } = user
  await rdb.ref('users').child(uid).remove().catch(e => console.error('user rdb remove err: ' + e.message))
  await db.collection('users').doc(uid).delete().catch(e => console.error('user db remove err: ' + e.message))
  await db.collection('meta').doc('users').update({ count: admin.firestore.FieldValue.increment(-1) })
    .catch(e => console.error('meta update err: ' + e.message))
})

exports.onCreateBoard = functions.region(region).firestore
  .document('boards/{bid}').onCreate(async (snap, context) => {
    try {
      await db.collection('meta').doc('boards').update({ count: admin.firestore.FieldValue.increment(1) })
    } catch (e) {
      await db.collection('meta').doc('boards').set({ count: 1 })
        .catch(e => console.error('meta boards update err: ' + e.message))
    }
  })

exports.onDeleteBoard = functions.region(region).firestore
  .document('boards/{bid}').onDelete(async (snap, context) => {
    await db.collection('meta').doc('boards').update({ count: admin.firestore.FieldValue.increment(-1) })
      .catch(e => console.error('meta boards update err: ' + e.message))
    try {
      const sn = await db.collection('boards').doc(context.params.bid).collection('articles').get()
      if (sn.empty) return
      const batch = db.batch()
      sn.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    } catch (e) {
      console.error('board articles remove err: ' + e.message)
    }
  })

// const download = async () => {
//   const ps = []
//   ps.push('boards')
//   ps.push('talk')
//   ps.push('1597138520334-fzukPbXJZCR0NrtxHBaXd2oR7jX2.md')
//   console.log('down')
//   try {
//     const r = await admin.storage().bucket().file(ps.join('/'))
//       .download()
//       .catch(e => console.error('storage remove err: ' + e.message))
//     console.log(r)
//   } catch (e) {
//     console.error('storage remove err: ' + e.message)
//   }
// }
// download()

exports.onCreateBoardArticle = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}')
  .onCreate(async (snap, context) => {
    const doc = snap.data()

    let content = doc.summary
    if (doc.summary && doc.summary.length >= 3000) { // todo: 테스트중 전체 게시물일 때 300으로..
      const ps = []
      ps.push('boards')
      ps.push(context.params.bid)
      ps.push(context.params.aid + '-' + doc.uid + '.md')
      const bf = await admin.storage().bucket().file(ps.join('/'))
        .download()
        .catch(e => console.error('storage download err: ' + e.message))
      content = bf.toString().substr(0, 5000) // reason: https://www.algolia.com/doc/faq/indexing/how-do-i-reduce-the-size-of-my-records/
    }

    const algoliaDoc = {
      // objectId: `${context.params.bid}-${context.params.aid}`,
      boardId: context.params.bid,
      articleId: context.params.aid,
      createdAt: doc.createdAt.toDate(),
      updatedAt: doc.updatedAt.toDate(),
      title: doc.title,
      content: content,
      email: doc.user.email,
      displayName: doc.user.displayName,
      category: doc.category,
      tags: doc.tags
    }

    try {
      if (index) {
        const r = await index.saveObject(algoliaDoc, { autoGenerateObjectIDIfNotExist: true })
        // r is objectID, taskID
        await snap.ref.update({ objectID: r.objectID })
      }
    } catch (e) {
      console.log('algolia err: ' + e.message)
    }

    const set = {
      count: admin.firestore.FieldValue.increment(1)
    }

    set[`categoryCount.${doc.category}`] = admin.firestore.FieldValue.increment(1)

    // if (doc.category) set.categories = admin.firestore.FieldValue.arrayUnion(doc.category)
    if (doc.tags.length) set.tags = admin.firestore.FieldValue.arrayUnion(...doc.tags)
    try {
      // await db.collection('boards').doc(context.params.bid).update(set)
      const batch = db.batch()
      batch.update(db.collection('boards').doc(context.params.bid), set)
      doc.boardId = context.params.bid
      batch.set(db.collection('articles').doc(context.params.aid), doc)
      batch.update(
        db.collection('users').doc(doc.uid),
        { articleCount: admin.firestore.FieldValue.increment(1) }
      )
      await batch.commit()
    } catch (e) {
      console.error('article create err: ' + e.message)
    }

    if (doc.images.length) {
      const ids = []
      const thumbIds = []
      doc.images.forEach(image => {
        ids.push(image.id)
        thumbIds.push(image.thumbId)
      })
      try {
        const batch = db.batch()
        const sn = await db.collection('tempFiles').where('id', 'in', ids).get()
        sn.docs.forEach(d => batch.delete(d.ref))
        const snt = await db.collection('tempFiles').where('id', 'in', thumbIds).get()
        snt.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      } catch (e) {
        console.error('tempFiles remove err: ' + e.message)
      }
    }
  })

// const test = async () => {
//   const algoliaDoc = {
//     // objectId: '1597110382006',
//     title: 'test',
//     content: 'abcd efg abcd',
//     email: 'fkkmemi@gmail.com',
//     displayName: 'memi dev',
//     category: 'cat test',
//     tags: ['abc', 'xxx']
//   }

//   // Write to the algolia index
//   const index = client.initIndex(ALGOLIA_INDEX_NAME)
//   try {
//     const r = await index.saveObject(algoliaDoc, { autoGenerateObjectIDIfNotExist: true })
//     console.log(r)
//   } catch (e) {
//     console.log('eeeee')
//     console.log(e.message)
//   }
// }
// test()
const getRemainItem = (a, b) => {
  if (a.length > b.length) return a.filter(x => !b.includes(x))[0]
  else return b.filter(x => !a.includes(x))[0]
}

exports.onUpdateBoardArticle = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}')
  .onUpdate(async (change, context) => {
    const isEqual = require('lodash').isEqual
    const set = {}
    const beforeDoc = change.before.data()
    const doc = change.after.data()

    const readCountDiff = doc.readCount - beforeDoc.readCount
    if (readCountDiff !== 0) {
      // await db.collection('boards').doc(context.params.bid)
      //   .update({ readCount: admin.firestore.FieldValue.increment(readCountDiff) })
      //   .catch(e => console.error('boards update err: ' + e.message))
      const up = { readCount: admin.firestore.FieldValue.increment(readCountDiff) }
      const batch = db.batch()
      batch.update(db.collection('boards').doc(context.params.bid), up)
      batch.update(db.collection('articles').doc(context.params.aid), {
        readCount: doc.readCount
      })
      await batch.commit().catch(e => console.error('readCount update err: ' + e.message))
      return
    }
    const likeCountDiff = doc.likeCount - beforeDoc.likeCount
    if (likeCountDiff !== 0) {
      // await db.collection('boards').doc(context.params.bid)
      //   .update({ likeCount: admin.firestore.FieldValue.increment(likeCountDiff) })
      //   .catch(e => console.error('boards update err: ' + e.message))
      const up = { likeCount: admin.firestore.FieldValue.increment(likeCountDiff) }
      const batch = db.batch()
      batch.update(db.collection('boards').doc(context.params.bid), up)
      batch.update(db.collection('articles').doc(context.params.aid), {
        likeCount: doc.likeCount,
        likeUids: doc.likeUids
      })
      const uid = getRemainItem(doc.likeUids, beforeDoc.likeUids)
      batch.update(db.collection('users').doc(uid), up)
      await batch.commit().catch(e => console.error('likeCount update err: ' + e.message))
      return
    }
    if (index && (doc.objectID !== beforeDoc.objectID)) return

    if (doc.category && beforeDoc.category !== doc.category) {
      // set.categories = admin.firestore.FieldValue.arrayUnion(doc.category)
      set[`categoryCount.${beforeDoc.category}`] = admin.firestore.FieldValue.increment(-1)
      set[`categoryCount.${doc.category}`] = admin.firestore.FieldValue.increment(1)
    }
    if (doc.tags.length && !isEqual(beforeDoc.tags, doc.tags)) set.tags = admin.firestore.FieldValue.arrayUnion(...doc.tags)
    if (Object.keys(set).length) await db.collection('boards').doc(context.params.bid).update(set)

    const deleteImages = beforeDoc.images.filter(before => {
      return !doc.images.some(after => before.id === after.id)
    })

    const imgs = []
    imgs.push('images')
    imgs.push('boards')
    imgs.push(context.params.bid)
    imgs.push(context.params.aid)
    const p = imgs.join('/') + '/'
    for (const image of deleteImages) {
      await admin.storage().bucket().file(p + image.id)
        .delete()
        .catch(e => console.error('storage deleteImages remove err: ' + e.message))
      await admin.storage().bucket().file(p + image.thumbId)
        .delete()
        .catch(e => console.error('storage deleteImages remove err: ' + e.message))
    }

    const ids = []
    const thumbIds = []
    doc.images.forEach(image => {
      ids.push(image.id)
      thumbIds.push(image.thumbId)
    })
    if (ids.length) {
      try {
        const batch = db.batch()
        const sn = await db.collection('tempFiles').where('id', 'in', ids).get()
        sn.docs.forEach(d => batch.delete(d.ref))
        const snt = await db.collection('tempFiles').where('id', 'in', thumbIds).get()
        snt.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      } catch (e) {
        console.error('tempFiles remove err: ' + e.message)
      }
    }

    doc.boardId = context.params.bid
    await db.collection('articles').doc(context.params.aid).update(doc)
      .catch(e => console.error('articles update err: ' + e.message))

    if (!doc.objectID) return
    const algoliaDoc = {
      objectID: doc.objectID,
      updatedAt: doc.updatedAt.toDate()
    }
    if (beforeDoc.title !== doc.title) algoliaDoc.title = doc.title
    // if (beforeDoc.content !== doc.content) algoliaDoc.content = doc.content
    if (beforeDoc.category !== doc.category) algoliaDoc.category = doc.category
    if (!isEqual(beforeDoc.tags, doc.tags)) algoliaDoc.tags = doc.tags

    let content = doc.summary
    if (doc.summary && doc.summary.length >= 3000) { // todo: 테스트중 전체 게시물일 때 300으로..
      const ps = []
      ps.push('boards')
      ps.push(context.params.bid)
      ps.push(context.params.aid + '-' + doc.uid + '.md')
      const bf = await admin.storage().bucket().file(ps.join('/'))
        .download()
        .catch(e => console.error('storage download err: ' + e.message))
      content = bf.toString().substr(0, 5000) // reason: https://www.algolia.com/doc/faq/indexing/how-do-i-reduce-the-size-of-my-records/
    }
    if (beforeDoc.summary !== content) algoliaDoc.content = content

    await index.partialUpdateObject(algoliaDoc).catch(e => console.error('algolia update err: ' + e.message))
  })

exports.onDeleteBoardArticle = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}')
  .onDelete(async (snap, context) => {
    const doc = snap.data()
    const set = {
      count: admin.firestore.FieldValue.increment(-1)
      // commentCount: admin.firestore.FieldValue.increment(-doc.commentCount)
    }
    set[`categoryCount.${doc.category}`] = admin.firestore.FieldValue.increment(-1)
    if (doc.likeCount > 0) set.likeCount = admin.firestore.FieldValue.increment(-doc.likeCount)
    await db.collection('boards').doc(context.params.bid)
      .update(set)
      .catch(e => console.error('boards update err: ' + e.message))

    await db.collection('articles').doc(context.params.aid).delete()
      .catch(e => console.error('articles delete err: ' + e.message))

    try {
      const batch = db.batch()
      doc.likeUids.forEach(uid => {
        const userUpdate = { likeCount: admin.firestore.FieldValue.increment(-1) }
        if (doc.uid === uid) userUpdate.articleCount = admin.firestore.FieldValue.increment(-1)
        batch.update(db.collection('users').doc(uid), userUpdate)
      })
      await batch.commit()
    } catch (e) {
      console.error('users like count update err: ' + e.message)
    }

    try {
      // remove comment
      const sn = await db.collection('boards').doc(context.params.bid)
        .collection('articles').doc(context.params.aid)
        .collection('comments').get()
      if (!sn.empty) {
        const batch = db.batch()
        sn.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      }
    } catch (e) {
      console.error('comment remove err: ' + e.message)
    }

    // remove storage
    const ps = []
    ps.push('boards')
    ps.push(context.params.bid)
    ps.push(context.params.aid + '-' + doc.uid + '.md')

    await admin.storage().bucket().file(ps.join('/'))
      .delete()
      .catch(e => console.error('storage remove err: ' + e.message))

    const imgs = []
    imgs.push('images')
    imgs.push('boards')
    imgs.push(context.params.bid)
    imgs.push(context.params.aid)
    await admin.storage().bucket().deleteFiles({
      prefix: imgs.join('/')
    }).catch(e => console.error('storage deleteFiles err: ' + e.message))

    if (!doc.objectID) return
    await index.deleteObject(doc.objectID).catch(e => console.error('algolia update err: ' + e.message))
  })

exports.onCreateBoardComment = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}/comments/{cid}')
  .onCreate(async (snap, context) => {
    const comment = snap.data()
    const batch = db.batch()
    batch.update(
      db.collection('boards').doc(context.params.bid)
        .collection('articles').doc(context.params.aid),
      { commentCount: admin.firestore.FieldValue.increment(1) }
    )
    batch.update(
      db.collection('boards').doc(context.params.bid),
      { commentCount: admin.firestore.FieldValue.increment(1) }
    )
    comment.boardId = context.params.bid
    comment.articleId = context.params.aid
    batch.set(db.collection('comments').doc(context.params.cid), comment)
    batch.update(
      db.collection('users').doc(comment.uid),
      { commentCount: admin.firestore.FieldValue.increment(1) }
    )
    await batch.commit().catch(e => console.error('commentCount increment err: ' + e.message))

    if (!comment.image) return
    if (!comment.image.id) return
    const sn = await db.collection('tempFiles')
      .where('id', '==', comment.image.id).get()
      .catch(e => console.error('tempFiles get err: ' + e.message))
    if (sn.empty) return
    await sn.docs[0].ref.delete()
      .catch(e => console.error('tempFiles remove err: ' + e.message))
  })
exports.onUpdateBoardComment = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}/comments/{cid}')
  .onUpdate(async (change, context) => {
    const comment = change.after.data()
    comment.boardId = context.params.bid
    comment.articleId = context.params.aid
    await db.collection('comments').doc(context.params.cid).update(comment)
      .catch(e => console.error('comment update err: ' + e.message))
  })

exports.onDeleteBoardComment = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}/comments/{cid}')
  .onDelete(async (snap, context) => {
    const comment = snap.data()

    await db.collection('boards').doc(context.params.bid)
      .update({ commentCount: admin.firestore.FieldValue.increment(-1) })
      .catch(e => console.error('boards commentCount decrement err: ' + e.message))

    await db.collection('boards').doc(context.params.bid)
      .collection('articles').doc(context.params.aid)
      .update({ commentCount: admin.firestore.FieldValue.increment(-1) })
      .catch(e => console.log('articles commentCount decrement err: ' + e.message))

    await db.collection('comments').doc(context.params.cid).delete()
      .catch(e => console.error('comments delete err: ' + e.message))

    await db.collection('users').doc(comment.uid)
      .update({ commentCount: admin.firestore.FieldValue.increment(-1) })
      .catch(e => console.error('users update err: ' + e.message))

    if (!comment.image) return
    if (!comment.image.id) return
    if (!comment.image.size) return
    const ps = []
    ps.push('images')
    ps.push('boards')
    ps.push(context.params.bid)
    ps.push(context.params.aid)
    ps.push(comment.image.id)
    await admin.storage().bucket().file(ps.join('/')).delete()
      .catch(e => console.error('comment image remove err: ' + e.message))
  })

exports.saveTempFiles = functions.region(region).storage
  .object().onFinalize(async (object) => {
    const last = require('lodash').last
    const name = object.name
    if (last(name.split('.')) === 'md' || last(name.split('.')) === 'xml') return
    const createdAt = new Date()
    const id = createdAt.getTime().toString()
    const set = {
      name,
      contentType: object.contentType,
      size: object.size,
      crc32c: object.crc32c,
      createdAt,
      id: last(name.split('/'))
    }
    await db.collection('tempFiles').doc(id).set(set)
  })

// exports.onDeleteTempFile = functions.region(region).firestore
//   .document('tempFiles/{tid}')
//   .onDelete(async (snap, context) => {
//     const moment = require('moment')
//     const sn = await db.collection('tempFiles')
//       .where('createdAt', '<', moment().subtract(1, 'hours'))
//       .orderBy('createdAt')
//       .limit(5)
//     if (!sn.empty) return
//     for (const doc of sn.docs) {
//       await admin.storage().bucket().file(doc.name).delete()
//         .catch(e => console.error('tempFile remove err: ' + e.message))
//     }
//   })
exports.seo = functions.https.onRequest(async (req, res) => {
  const { parse } = require('node-html-parser')
  const fs = require('fs')
  const pluralize = require('pluralize')
  const html = fs.readFileSync('index.html').toString()
  const root = parse(html)

  const ps = req.path.split('/')
  ps.shift()
  if (ps.length !== 3) return res.send(html)
  const mainCollection = pluralize(ps.shift())
  const board = ps.shift()
  const article = ps.shift()
  if (!article) return res.send(html)

  const doc = await db.collection(mainCollection).doc(board).collection('articles').doc(article).get()

  if (!doc.exists) return res.send(html)
  const item = doc.data()

  const child = root.lastChild.childNodes[0]
  const titleNode = child.childNodes[0]
  const descriptionNode = child.childNodes[1]
  const ogTitleNode = child.childNodes[2]
  const ogDescriptionNode = child.childNodes[3]
  const ogImageNode = child.childNodes[4]

  const title = item.title + ' : memi'
  const description = item.summary.substr(0, 80).replace(/(<([^>]+)>)/gi, '')

  const getImageUrlFromMd = (md) => {
    const ds = md.split('\n')
    for (const d of ds) {
      const us = d.split('](')
      if (us.length !== 2) continue
      if (us[0].indexOf('!') < 0) continue
      const i = us[1].indexOf(')')
      return us[1].substr(0, i)
    }
  }
  let imgSrc = '/logo.png'
  if (item.images.length) imgSrc = item.images[0].thumbUrl
  else {
    let content = item.summary
    if (item.summary && item.summary.length >= 300) { // todo: 테스트중 전체 게시물일 때 300으로..
      const ps = []
      ps.push(mainCollection)
      ps.push(board)
      ps.push(article + '-' + item.uid + '.md')
      const bf = await admin.storage().bucket().file(ps.join('/'))
        .download()
        .catch(e => console.error('storage download err: ' + e.message))
      content = bf.toString()
    }
    const src = getImageUrlFromMd(content)
    if (src) imgSrc = src
  }
  const image = imgSrc
  titleNode.set_content(title)
  descriptionNode.setAttribute('content', description)
  ogTitleNode.setAttribute('content', title)
  ogDescriptionNode.setAttribute('content', description)
  ogImageNode.setAttribute('content', image)
  res.status(200).send(root.toString())
})

exports.sitemap = functions.https.onRequest(async (req, res) => {
  const builder = require('xmlbuilder')

  // var xml = builder.create('root')
  //   .ele('xmlbuilder')
  //   .ele('repo', { type: 'git' }, 'git://github.com/oozcitak/xmlbuilder-js.git')
  //   .end({ pretty: true })

  // console.log(xml)
  // return res.send(xml)

  const xml = builder
    .create('sitemapindex', { encoding: 'UTF-8' })
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  res.set('Content-Type', 'text/xml')

  const sn = await db.collection('boards').get()
  if (sn.empty) {
    return res.send(
      xml.end({
        pretty: true,
        indent: '  ',
        newline: '\n',
        allowEmpty: false
      }).toString()
    )
  }
  const url = 'https://' + functions.config().admin.domain

  sn.docs.forEach(doc => {
    const sm = xml.ele('sitemap')
    sm.ele('loc', url + '/sitemap/' + doc.id + '.xml')
    sm.ele('lastmod', doc.data().updatedAt.toDate().toISOString())
  })

  return res.send(
    xml.end({
      pretty: true,
      indent: '  ',
      newline: '\n',
      allowEmpty: false
    }).toString()
  )
})

exports.sitemapBoard = functions.https.onRequest(async (req, res) => {
  const path = require('path')
  const id = path.basename(req.path, path.extname(req.path))

  // const xml = await writeSitemap(id)
  try {
    const xml = await admin.storage().bucket().file('sitemaps/' + id + '.xml').download()
      .catch(e => console.error('storage xml upload err: ' + e.message))
    res.set('Content-Type', 'text/xml')
    res.send(xml.toString())
  } catch (e) {
    console.error('storage xml download err: ' + e.message)
    res.send('storage xml download err: ' + e.message)
  }
})

const removeOldTempFiles = async () => {
  const moment = require('moment')
  const sn = await db.collection('tempFiles')
    .where('createdAt', '<', moment().subtract(1, 'hours').toDate())
    .orderBy('createdAt')
    .limit(10)
    .get()
  if (sn.empty) return
  const batch = db.batch()
  for (const doc of sn.docs) {
    const file = doc.data()
    await admin.storage().bucket().file(file.name).delete()
      .catch(e => console.error('tempFile remove err: ' + e.message))
    batch.delete(doc.ref)
  }
  await batch.commit()
}

const writeSitemap = async (id, items) => {
  const builder = require('xmlbuilder')
  const xml = builder
    .create('urlset', { encoding: 'UTF-8' })
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    .att('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9')
    .att('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
    .att('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
    .att('xmlns:video', 'http://www.google.com/schemas/sitemap-video/1.1')

  // const sn = await db.collection('boards').doc(id).collection('articles').get()
  // if (sn.empty) return xml
  const url = 'https://' + functions.config().admin.domain
  // sn.docs.forEach(doc => {
  items.forEach(item => {
    if (item.level > 5) {
      const sm = xml.ele('url')
      sm.ele('loc', url + '/board/' + id + '/' + item.id)
      sm.ele('lastmod', item.updatedAt.toDate().toISOString())
    }
  })
  return xml.end({
    pretty: true,
    indent: '  ',
    newline: '\n',
    allowEmpty: false
  })
}

const setSitemap = async () => {
  const boards = await db.collection('boards').limit(100).get()
    .catch(e => console.error('boards err:' + e.message))
  if (boards.empty) return null

  const sitemapLogs = await db.collection('sitemapLogs').orderBy('createdAt', 'desc').limit(1).get()
    .catch(e => console.error('sitemapLogs get err:' + e.message))
  let sitemap = null
  if (!sitemapLogs.empty) sitemap = sitemapLogs.docs[0].data()

  const createdAt = new Date()
  const set = { createdAt }

  for (const doc of boards.docs) {
    const board = doc.data()
    set[doc.id] = {}
    set[doc.id].count = board.count
    set[doc.id].readCount = board.readCount
    set[doc.id].commentCount = board.commentCount
    set[doc.id].likeCount = board.likeCount
    if (board.level < 6) continue
    if (sitemap && sitemap[doc.id] && sitemap[doc.id].count === board.count) continue
    const sn = await db.collection('boards').doc(doc.id).collection('articles').limit(10000).get()
    if (sn.empty) continue

    set[doc.id].readCount = 0
    set[doc.id].commentCount = 0
    set[doc.id].likeCount = 0
    const items = []
    sn.docs.forEach(d => {
      const item = d.data()
      item.id = d.id
      set[doc.id].readCount += item.readCount
      set[doc.id].commentCount += item.commentCount
      set[doc.id].likeCount += item.likeCount
      items.push(item)
    })
    await doc.ref.update({
      readCount: set[doc.id].readCount,
      commentCount: set[doc.id].commentCount,
      likeCount: set[doc.id].likeCount
    }).catch(e => console.error('count update err: ' + e.message))

    const xml = await writeSitemap(doc.id, items)
      .catch(e => console.error('writeSitemap err: ' + e.message))
    const bpath = 'sitemaps/' + doc.id + '.xml'
    await admin.storage().bucket().file(bpath).save(xml)
      .catch(e => console.error('storage xml upload err: ' + e.message))
    console.log('storage updated ' + bpath)
  }
  await db.collection('sitemapLogs').doc(createdAt.getTime().toString()).set(set)
    .catch(e => console.error('sitemapLogs add err:' + e.message))

  console.log('setSitemap done')
  return null
}
// setSitemap()

exports.sitemapScheduled = functions.runWith({ timeoutSeconds: 300, memory: '512MB' }).pubsub.schedule('0 4 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    // every 4:00 run
    console.log('sitemapScheduled ' + new Date().toLocaleString())
    await removeOldTempFiles().catch(e => console.error('removeOldTempFile err: ' + e.message))
    await setSitemap().catch(e => console.error('setSitemap err: ' + e.message))
    return null
  })

// const initData = async () => {
//   // 2020.8.31
//   const boardSn = await db.collection('boards').limit(100).get()
//     .catch(e => console.error('boards err:' + e.message))
//   if (boardSn.empty) return null
//   const batch = db.batch()
//   for (const boardDoc of boardSn.docs) {
//     // const board = boardDoc.data()
//     console.log('board update')
//     batch.update(boardDoc.ref, { level: 6 })
//     const articleSn = await db.collection('boards').doc(boardDoc.id)
//       .collection('articles').limit(1000).get()
//     if (articleSn.empty) continue
//     for (const articleDoc of articleSn.docs) {
//       batch.update(articleDoc.ref, { level: 6 })
//       const article = articleDoc.data()
//       console.log('article update ' + article.title)
//       article.boardId = boardDoc.id
//       article.level = 6
//       batch.set(db.collection('articles').doc(articleDoc.id), article)

//       const commentSn = await db.collection('boards').doc(boardDoc.id)
//         .collection('articles').doc(articleDoc.id)
//         .collection('comments').limit(1000).get()
//       if (commentSn.empty) continue
//       for (const commentDoc of commentSn.docs) {
//         const comment = commentDoc.data()
//         console.log('comment update ' + comment.comment)
//         comment.boardId = boardDoc.id
//         comment.articleId = articleDoc.id
//         batch.set(db.collection('comments').doc(commentDoc.id), comment)
//       }
//     }
//   }

//   await batch.commit()
//   console.log('done')
// }
// initData().catch(e => console.error(e.message))
