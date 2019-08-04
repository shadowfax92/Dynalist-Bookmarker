// @flow
import type {
  DynalistConfig,
  DynalistBookmark,
  Callback,
  CallbackResponse
} from './interfaces'

const axios = require('axios')

const DYNALIST_APIS = {
  edit: 'https://dynalist.io/api/v1/doc/edit',
  list: 'https://dynalist.io/api/v1/file/list'
}

const SendToDynalist = (
  config: DynalistConfig,
  bookmark: DynalistBookmark,
  callback: Callback
) => {
  let dynalist_title = '[' + bookmark.title + '](' + bookmark.url + ')'
  let dynalist_note = ''
  if (bookmark.tags !== '') {
    dynalist_title += ' ' + bookmark.tags
  }

  if (bookmark.notes !== '') {
    dynalist_note = bookmark.notes
  }
  dynalist_insert_api(
    config.api_token,
    config.document_id,
    'root',
    dynalist_title,
    dynalist_note,
    callback
  )
}

const ValidateToken = (config: DynalistConfig, callback: Callback) => {
  dynalist_list_api(config.api_token, callback)
}

const FetchAllDocuments = (config: DynalistConfig, callback: Callback) => {
  dynalist_list_api(config.api_token, (response: CallbackResponse) => {
    let documents = []
    if (response.status) {
      let data: any = response.data
      let files = data['files']
      files.forEach(node => {
        if (node['type'] == 'document') {
          let document = {
            id: node.id,
            title: node.title
          }
          documents.push(document)
        }
      })
    }
    let result: CallbackResponse = {
      data: documents,
    }
    callback(result)
  })
}

const dynalist_insert_api = (
  api_token,
  file_id,
  parent_id,
  title,
  note,
  callback: Callback
) => {
  let body = {
    token: api_token,
    file_id: file_id,
    changes: [
      {
        action: 'insert',
        parent_id: parent_id,
        index: 0,
        content: title,
        note: note,
        checked: false
      }
    ]
  }
  axios.post(DYNALIST_APIS.edit, body).then(function (response) {
    if (callback !== undefined) {
      callback(dynalist_response_parser(response))
    }
  })
}

const dynalist_list_api = (api_token: string, callback: Callback) => {
  let body = {
    token: api_token
  }
  axios.post(DYNALIST_APIS.list, body).then(response => {
    if (callback !== undefined) {
      callback(dynalist_response_parser(response))
    }
  })
}

const dynalist_response_parser = (response: any): CallbackResponse => {
  let result: CallbackResponse = {}
  if (response.status == '200') {
    if (response.data !== undefined && response.data['_code'] == 'Ok') {
      result.status = true
      result.data = response.data
    } else {
      result.status = false
    }
  } else {
    result.status = false
  }
  return result
}

export { SendToDynalist, ValidateToken, FetchAllDocuments }
