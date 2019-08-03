const axios = require('axios');


const API_TOKEN = 'BsECT6ckocUphrQFvDo6_H1WKa-5Ggy1DE1zq1kRMtRfZ6aen0DJAYH9DPzqjYXn9dlZZNkDA9FIbQTkMJCGuFJzKKaeWzSy3GBhDy3lmNbGnW8-0VZ9dI0KQaDZd2mS'

export function addToBookmarks(bookmarks_object, callback) {
    let dynalist_title = '[' + bookmarks_object.title + '](' + bookmarks_object.url + ')'
    let dynalist_note = '';
    if (bookmarks_object.tags !== '') {
        dynalist_title += ' ' + bookmarks_object.tags
    }

    if (bookmarks_object.notes !== '') {
        dynalist_note = bookmarks_object.notes
    }

    let bookmarks_file_id = 'jkKwmcyV5dt_fT1LLPRKShzT'
    let chrome_bookmarks_id = 'root'
    dynalistInsert(bookmarks_file_id, chrome_bookmarks_id, dynalist_title, dynalist_note, callback)
}

function dynalistInsert(file_id, parent_id, title, note, callback) {
    let dynalistInsertDocApi = 'https://dynalist.io/api/v1/doc/edit'
    let body = {
        'token': API_TOKEN,
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
    axios.post(dynalistInsertDocApi, body).then(function (response) {
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