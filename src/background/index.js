import { addToBookmarks, validateToken } from '../utils/dynalist'

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
    case "popup-store-session-data":
      chrome_local_store_data(request.key, request.value);
      break;
    case "popup-get-session-data":
      let key = request.key;

      chrome_local_get_data(request.key, (value) => {
        send_runtime_message({ action: 'response-popup-get-session-data', value: value[key] });
      });
      break;
    case "popup-remove-session-data":
      chrome_local_remove_data(request.key);
      break;
    case "store-dynalist-config":
      chrome_local_store_data("config", request.value);
      break;
    case 'validate-token':
      validateToken(request.value, (response) => {
        send_runtime_message({
          action: 'response-validate-token',
          value: response,
        });
      })
      break;
    default:
      break;
  }
}
);

const get_dynalist_config = (callback) => {
  chrome_local_get_data('config', (value) => {
    callback({ value: value['config'] });
  })
}

const send_runtime_message = (value) => {
  chrome.runtime.sendMessage(value, (response) => {
    console.log("send_runtime_message: response = " + response);
  });
}

const chrome_local_store_data = (key, value) => {
  // window.sessionStorage.setItem(key, value)
  let obj = {};
  obj[key] = value;
  chrome.storage.local.set(obj);
};

const chrome_local_get_data = (key, callback) => {
  // let value = window.sessionStorage.getItem(key);
  chrome.storage.local.get(key, (value) => {
    callback(value)
  });
};

const chrome_local_remove_data = (key) => {
  chrome.storage.local.remove(key, () => {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error("chrome_local_remove_data" + error);
    }
  });
};