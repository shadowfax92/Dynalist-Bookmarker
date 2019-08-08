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
  setup_google_analytics()
})

const setup_google_analytics = function () {
  ;(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r
    ;(i[r] =
      i[r] ||
      function () {
        ;(i[r].q = i[r].q || []).push(arguments)
      }),
    (i[r].l = 1 * new Date())
    ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
    a.async = true
    a.src = g
    if (m.parentNode) {
      m.parentNode.insertBefore(a, m)
    }

  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga'
  )
  window.ga('create', 'UA-145327406-1', 'auto')
  window.ga('send', 'pageview')
}

chrome.runtime.onMessage.addListener(
  (request: EventMessage, sender: any, sendResponse: Function) => {
    let data: any = request.data
    switch (request.action) {
      case 'get-config':
        get_dynalist_config((response: CallbackResponse) => {
          let dynalist_config: DynalistConfig = (response.data: any)
          let response_to_get_config: EventMessage = {
            action: 'response-dynalist-config',
            data: dynalist_config,
            status: true
          }

          send_runtime_message(response_to_get_config)
        })
        break
      case 'redirect-to-settings':
        open_settings()
        break
      case 'fetch-all-documents':
        get_dynalist_config((response: CallbackResponse) => {
          let dynalist_config: DynalistConfig = (response.data: any)
          FetchAllDocuments(
            dynalist_config,
            (fetch_documents_response: CallbackResponse) => {
              let result_response: EventMessage = {
                action: 'response-fetch-documents',
                data: fetch_documents_response.data,
                status: fetch_documents_response.status
                  ? fetch_documents_response.status
                  : true
              }

              send_runtime_message(result_response)
            }
          )
        })
        break
      case 'send-to-dynalist':
        get_dynalist_config((response: CallbackResponse) => {
          let dynalist_config: DynalistConfig = (response.data: any)
          let bookmark_object: DynalistBookmark = (request.data: any)
          SendToDynalist(
            dynalist_config,
            bookmark_object,
            (response: CallbackResponse) => {
              let response_message: EventMessage = {
                action: 'send-to-dynalist-response',
                status: response.status,
                data: response.data
              }

              send_runtime_message(response_message)
            }
          )
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
        let dynalist_config: DynalistConfig = {
          api_token: data,
          document_id: '',
          document_name: '',
          is_inbox: false
        }
        ValidateToken(dynalist_config, (result: CallbackResponse) => {
          let validate_token_reponse: EventMessage = {
            action: 'response-validate-token',
            data: result.data,
            status: result.status !== undefined ? result.status : true
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
