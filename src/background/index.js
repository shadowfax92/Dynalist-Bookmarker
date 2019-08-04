// @flow
import {
  SendToDynalist,
  ValidateToken,
  FetchAllDocuments
} from '../utils/dynalist'

import type {
  DynalistConfig,
  EventMessage,
  DynalistBookmark,
  CallbackResponse
} from '../utils/interfaces'

// OnInstall handler
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'install') {
    open_settings()
  }
})

chrome.runtime.onMessage.addListener(
  (request: EventMessage, sender: any, sendResponse: Function) => {
    let data: any = request.data
    switch (request.action) {
      case 'send-to-dynalist':
        get_dynalist_config((response: CallbackResponse) => {
          let dynalist_config: DynalistConfig = (response.data: any)
          SendToDynalist(dynalist_config, request.data)
        })

        // response is not sent back to popup.js as it's not doesn't have a tab-id.
        // you need a listener in popup.js to get data.
        // sendResponse({ action: "saved" });
        break
      case 'popup-store-session-data':
        chrome_local_store_data(data['key'], data['value'])
        break
      case 'popup-get-session-data':
        chrome_local_get_data(data['key'], (result: CallbackResponse) => {
          let popup_session_data_response: EventMessage = {
            action: 'response-popup-get-session-data',
            data: result.data,
            status: true
          }
          send_runtime_message(popup_session_data_response)
        })
        break
      case 'popup-remove-session-data':
        chrome_local_remove_data(data['key'])
        break
      case 'store-dynalist-config':
        let config: DynalistConfig = (data: any)
        chrome_local_store_data('config', config)
        break
      case 'validate-token':
        ValidateToken(data, result => {
          let validate_token_reponse: EventMessage = {
            action: 'response-validate-token',
            data: result,
            status: true
          }
          send_runtime_message(validate_token_reponse)
        })
        break
      default:
        break
    }
  }
)

const open_settings = () => {
  chrome.tabs.create({
    url: 'chrome://extensions/?options=' + chrome.runtime.id
  })
  //   chrome.tabs.create({ url: "options.html" });
}

const get_dynalist_config = callback => {
  chrome_local_get_data('config', (result: CallbackResponse) => {
    let response: CallbackResponse = {
      status: result.status,
      data: (result.data: any)
    }

    callback(response)
  })
}

const send_runtime_message = value => {
  chrome.runtime.sendMessage(value, response => {
    console.log('send_runtime_message: response = ' + response)
  })
}

const chrome_local_store_data = (key, value) => {
  // window.sessionStorage.setItem(key, value)
  let obj = {}
  obj[key] = value
  chrome.storage.local.set(obj)
}

const chrome_local_get_data = (key, callback) => {
  // let value = window.sessionStorage.getItem(key);
  chrome.storage.local.get(key, key_value => {
    if (key_value) {
      let response: CallbackResponse = {
        status: true,
        data: key_value[key]
      }
      callback(response)
    } else {
      let response: CallbackResponse = {
        status: false,
        data: undefined
      }
      callback(response)
    }
  })
}

const chrome_local_remove_data = key => {
  chrome.storage.local.remove(key, () => {
    let error = chrome.runtime.lastError
    if (error && error.message) {
      console.error('chrome_local_remove_data' + error.message)
    }
  })
}
