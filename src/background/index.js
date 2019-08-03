import { addToBookmarks } from '../utils/dynalist'

// OnInstall handler
chrome.runtime.onInstalled.addListener(details => {
  console.log(details);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "send-to-dynalist":
      get_dynalist_config((response) => {
        let dynalist_config = response.value;
        addToBookmarks(dynalist_config, request.data);
      })

      // response is not sent back to popup.js as it's not doesn't have a tab-id.
      // you need a listener in popup.js to get data.
      // sendResponse({ action: "saved" });
      break;
    case "session-store-set-data":
      sessionStorageSetItem(request.key, request.value);
      break;
    case "session-store-get-data":
      let key = request.key;
      
      SessionStorageGetItem(request.key, (value) => {
        sendResponse({ action:'', value: value[key] });
        sendMessageToPopup(sender, { action:'response-session-store-get-data', value: value[key] });
      });
      break;
      case "session-store-remove-data":
          SessionStorageDeleteItem(request.key);
          break;
      case "store-dynalist-config":
          sessionStorageSetItem("config", request.value);
          break;
    default:
      break;
  }
}
);

const get_dynalist_config = (callback) => {
  SessionStorageGetItem('config', (value) => {
    callback({value: value['config'] });
  })
}

function sendMessageToPopup(tab_id, value) {
  chrome.runtime.sendMessage(value, (response) => {
    console.log("sendMessageToPopup: response = " + response);
  });
}

function sessionStorageSetItem(key, value) {
  // window.sessionStorage.setItem(key, value)
  let obj = {};
  obj[key] = value;
  chrome.storage.local.set(obj);
};

function SessionStorageGetItem(key, callback) {
  // let value = window.sessionStorage.getItem(key);
  chrome.storage.local.get(key, (value) => {
    callback(value)
  });
};

function SessionStorageDeleteItem(key) {
  chrome.storage.local.remove(key, () => {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error("SessionStorageDeleteItem" + error);
    }
  });
};