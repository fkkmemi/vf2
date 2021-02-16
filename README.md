# vf2

vue&firebase 2

# install

## firebase use

```bash
$ firebase login # If you are not logged in
$ firebase use --add
? Which project do you want to add? xxx-site
? What alias do you want to use for this project? (e.g. staging) default

Created alias default for xxx-site.
Now using alias default (xxx-site)
```

## functions

### key download

functions/key.json download from console service account key

### setting

```bash
$ firebase functions:config:set admin.email=xx@abc.com admin.db_url=https://xxx-site.firebaseio.com admin.region=asia-northeast1 admin.bucket_url=memi-vf2.appspot.com
```

## algolia

```bash
$ firebase functions:config:set algolia.app_id=yourAppId algolia.api_key=yourAdminKey algolia.search_key=yourSearchKey
```

### serve

```bash
$ firebase functions:config:get > .runtimeconfig.json
$ firebase serve
```

## hosting

### Dependecies install

Dependencies installation

```bash
$ yarn # front-end install
$ cd functions && yarn # back-end install
$ cd ..
```

### firebaseConfig file make

make file on root

**./firebaseConfig.js**  
```javascript
export default {
  apiKey: "AIzaSyCMJGWDiuiV91DQOqscCXiVTf2iVNHQXXX",
  authDomain: "xxx-site.firebaseapp.com",
  databaseURL: "https://xxx-site.firebaseio.com",
  projectId: "xxx-site",
  storageBucket: "xxx-site.appspot.com",
  messagingSenderId: "654047601333",
  appId: "1:654047601222:web:8fcdc5ea4091ec77064111",
  measurementId: "G-Z05F3DT444"
}
```

## algolia search key

**.env.local**  
```
VUE_APP_ALGOLIA_APP_ID=your-id
VUE_APP_ALGOLIA_SEARCH_KEY=your-search-key
```

**.env.local**  
```
VUE_APP_SITE_TITLE=사이트 제목
VUE_APP_SITE_DESCRIPTION=사이트 설명
VUE_APP_SITE_IMAGE=사이트 이미지 eg) /logo.jpg
```

위 내용으로 /public/index.html -> /dist/index.html 변경됨

public/logo.png 추가 
public/favicon.ico 추가

없을 경우 resource 디렉토리에서 복사해서 넣어야함
