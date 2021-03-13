# dynalist-bookmarker

Chrome extension for Dynalist bookmarking built using Vue.js

Store Link - https://chrome.google.com/webstore/detail/dynalist-bookmarker/mbempfckkkcncamnaopmfagmocdmlknf

### NOTE: I'm not actively working on this. For any new features, feel free to raise PR. I'm happy to review and include in the extension.

## How the extension works?

- It uses the Dynalist APIs (https://apidocs.dynalist.io/#general)
- The API needs a token which user is prompted to paste as soon as the app install. The token is available here - https://dynalist.io/developer

## Scripts

```json
// build extension and watch for changes
npm run dev

// build extension zip
npm run build

// lint all source files
npm run lint
```
