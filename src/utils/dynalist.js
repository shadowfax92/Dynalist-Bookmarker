const axios = require('axios');

const DYNALIST_APIS = {
    edit: 'https://dynalist.io/api/v1/doc/edit',
    list: 'https://dynalist.io/api/v1/file/list',
}

const DYNALIST_CONFIG = {
    note_id: 'jkKwmcyV5dt_fT1LLPRKShzT',
    api_token: 'BsECT6ckocUphrQFvDo6_H1WKa-5Ggy1DE1zq1kRMtRfZ6aen0DJAYH9DPzqjYXn9dlZZNkDA9FIbQTkMJCGuFJzKKaeWzSy3GBhDy3lmNbGnW8-0VZ9dI0KQaDZd2mS'

}

const addToBookmarks = (bookmarks_object, callback) => {
    let dynalist_title = '[' + bookmarks_object.title + '](' + bookmarks_object.url + ')'
    let dynalist_note = '';
    if (bookmarks_object.tags !== '') {
        dynalist_title += ' ' + bookmarks_object.tags
    }

    if (bookmarks_object.notes !== '') {
        dynalist_note = bookmarks_object.notes
    }

    let chrome_bookmarks_id = 'root'
    dynalist_insert_api(DYNALIST_CONFIG.note_id, chrome_bookmarks_id, dynalist_title, dynalist_note, callback)
}

const validateToken = (api_token, callback)=> {
    dynalist_list_api(api_token, callback)
}

const dynalist_insert_api = (file_id, parent_id, title, note, callback) => {
    let body = {
        'token': DYNALIST_CONFIG.api_token,
        'file_id': file_id,
        'changes': [
            {
                'action': 'insert',
                'parent_id': parent_id,
                'index': 0,
                'content': title,
                'note': note,
                'checked': false
            }
        ]
    }
    axios.post(DYNALIST_APIS.edit, body).then(function (response) {
        let status = {}
        if (response._code == 'Ok') {
            status = { success: true }
        }
        else {
            status = { success: false, error: response._code }
        }
        if (callback !== undefined) {
            callback(status)
        }
    })
}

const dynalist_list_api = (api_token, callback) => {
    let body = {
        'token': api_token
    }
    axios.post(DYNALIST_APIS.list, body).then((response) => {
        let status = {}
        if (response._code == 'Ok') {
            status = { success: true, value: response }
        }
        else {
            status = { success: false }
        }

        if (callback !== undefined) {
            callback(status)
        }
    })
}

export {
    addToBookmarks,
    validateToken
}