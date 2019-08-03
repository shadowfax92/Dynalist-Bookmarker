const axios = require('axios');

const DYNALIST_APIS = {
    edit: 'https://dynalist.io/api/v1/doc/edit',
    list: 'https://dynalist.io/api/v1/file/list',
}

const addToBookmarks = (config, bookmarks_object, callback) => {
    let dynalist_title = '[' + bookmarks_object.title + '](' + bookmarks_object.url + ')'
    let dynalist_note = '';
    if (bookmarks_object.tags !== '') {
        dynalist_title += ' ' + bookmarks_object.tags
    }

    if (bookmarks_object.notes !== '') {
        dynalist_note = bookmarks_object.notes
    }
    dynalist_insert_api(config.api_token, config.bookmark_note_id, 'root', dynalist_title, dynalist_note, callback);
}

const validateToken = (api_token, callback) => {
    dynalist_list_api(api_token, callback)
}

const fetchDocuments = (api_token, callback) => {
    dynalist_list_api(api_token, (response) => {
        let documents = [];
        if (response.success) {
            let files = response.data['files'];
            files.forEach(node => {
                if (node['type'] == 'document') {
                    let document = {
                        id: node.id,
                        title: node.title,
                    }
                    documents.push(document)
                }
            })
        }
        callback({
            value: documents   
        })
    });
}

const dynalist_insert_api = (api_token, file_id, parent_id, title, note, callback) => {
    let body = {
        'token': api_token,
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

        if (callback !== undefined) {
            callback(dynalist_response_parser(response))
        }
    })
}

const dynalist_list_api = (api_token, callback) => {
    let body = {
        'token': api_token
    }
    axios.post(DYNALIST_APIS.list, body).then((response) => {
        if (callback !== undefined) {
            callback(dynalist_response_parser(response))
        }
    })
}

const dynalist_response_parser = (response) => {
    let status = {}
    if (response.status == '200') {
        if (response.data !== undefined && response.data['_code'] == 'Ok') {
            status['success'] = true;
            status['value'] = response.data
        }
        else {
            status['success'] = false;
        }
    }
    else {
        status['success'] = false;
    }
    return status;
}

export {
    addToBookmarks,
    validateToken,
    fetchDocuments
}