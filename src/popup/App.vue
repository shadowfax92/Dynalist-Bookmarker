<template>
  <div>
    <div class="app-header">
      <div>
        <img class="message-icon" v-bind:src="app_icon" />
      </div>
      <h2 class="header">{{ app_title }}</h2>
    </div>

    <div class="container">
      <div class="message-box" v-if="flags.show_message_box">
        <div>
          <img class="message-icon" v-bind:src="messages.display_icon" />
        </div>
        <p>{{ messages.display_text }}</p>
      </div>
      <div class="popup" v-if="flags.show_popup">
        <div>
          <label class="rows">Title</label>
          <input
            class="rows"
            type="text"
            placeholder="Title of the bookmark"
            v-model="bookmark.title"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Url</label>
          <input
            class="rows"
            type="url"
            placeholder="Url"
            v-model="bookmark.url"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Tags</label>
          <input
            class="rows"
            type="text"
            placeholder="Tags. Ex, #read"
            v-model="bookmark.tags"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Notes</label>
          <textarea
            class="rows"
            type="text"
            placeholder="Any notes"
            v-model="bookmark.notes"
            v-on:change="onChange()"
          ></textarea>
        </div>
        <div v-if="files.show_files_dropdown">
          <label class="rows">Folder</label>
          <select v-model="files.selected" @change="onConfigOverride()" class="rows">
            <option
              v-for="file in files.files_list"
              v-bind:key="file.id"
              v-bind:value="file"
            >{{ file.title }}</option>
          </select>
        </div>
        <div class="button-container">
          <button class="button button-1" v-on:click="onSubmit">Save</button>
          <button class="button button-1" v-on:click="onCancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//@flow
import { request } from 'http'
import { setTimeout } from 'timers'
import { page } from 'vue-analytics'

export default {
  data() {
    return {
      app_title: 'Dynalist Bookmarker',
      app_icon: 'assets/icons/icon_512.png',
      bookmark: {
        title: '',
        url: '',
        notes: '',
        tags: '',
        config_override: {},
      },
      dynalist_config: null,
      flags: {
        show_popup: true,
        show_message_box: false,
        is_config_overriden: false,
      },
      messages: {
        display_text: '',
        display_icon: '',
        success: {
          text: 'Successfully saved!',
          icon: 'assets/images/check-icon.png',
          timeout: 2,
        },
        settings: {
          text: 'Need to configure app before using!',
          icon: 'assets/images/settings-icon.png',
          timeout: 2,
        },
        failure: {
          text: 'Oh no, something went wrong when saving!',
          icon: 'assets/images/sad-emoji-icon.png',
          timeout: 3,
        },
      },
      files: {
        files_list: [],
        selected: '',
        send_to_inbox_config: {
          title: 'Send to Inbox',
          id: 'sendtoInboxId',
          is_inbox: true,
        },
        show_files_dropdown: false,
      },
    }
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'response-popup-get-session-data':
          if (request.data !== undefined) {
            this.setPageData(request.data)
          }
          break
        case 'response-dynalist-config':
          if (request.status) {
            this.dynalist_config = request.data

            // get list of files for dropdown
            if (this.dynalist_config) {
              let get_files = {
                action: 'fetch-all-documents',
              }
              chrome.runtime.sendMessage(get_files, response => {})
            }

            this.redirectToConfigureIfRequired()
          }
          break
        case 'response-fetch-documents':
          if (request.status) {
            let dynalist_documents = request.data
            this.files.files_list = []

            // populate dropdown model
            dynalist_documents.forEach(file => {
              let current_option = {
                id: file.id,
                title: file.title,
                is_inbox: false,
              }
              this.files.files_list.push(current_option)

              // selected is the default one configured.
              if (this.dynalist_config.document_id == file.id) {
                this.files.selected = current_option
              }
            })

            // push inbox
            this.files.files_list.push(this.files.send_to_inbox_config)

            // if inbox set to inbox
            if (this.dynalist_config.is_inbox) {
              this.files.selected = this.files.send_to_inbox_config
            }

            // display dropdown
            this.files.show_files_dropdown = true
          }
          break
        case 'send-to-dynalist-response':
          let save_successful = request.status

          if (save_successful) {
            this.showMessage('success')
            this.closePopup(this.messages.success.timeout)
          } else {
            this.showMessage('failure')
            this.closePopup(this.messages.success.timeout)
          }
          break
        default:
          break
      }
    })

    // get dynalist config
    let get_config = {
      action: 'get-config',
    }
    chrome.runtime.sendMessage(get_config, response => {})

    // get popup old session data if any.
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      var activeTab = tabs[0]
      this.bookmark.title = activeTab.title
      this.bookmark.url = activeTab.url
      this.page_url = activeTab.url

      let message = {
        action: 'popup-get-session-data',
        data: {
          key: this.page_url,
        },
      }

      chrome.runtime.sendMessage(message, response => {})
    })
    this.track()
  },
  methods: {
    onSubmit: function() {
      chrome.runtime.sendMessage(
        { action: 'send-to-dynalist', data: this.getPageData() },
        response => {
          // this.closePopup()
        }
      )
    },
    getPageData: function() {
      let data = {
        title: this.bookmark.title,
        tags: this.bookmark.tags,
        notes: this.bookmark.notes,
        url: this.bookmark.url,
        config: this.flags.is_config_overriden
          ? this.bookmark.config_override
          : null,
      }
      return data
    },
    setPageData: function(data) {
      if (data.title != '') {
        this.bookmark.title = data.title
      }
      if (data.url != '') {
        this.bookmark.url = data.url
      }
      if (data.tags != '') {
        this.bookmark.tags = data.tags
      }
      if (data.notes != '') {
        this.bookmark.notes = data.notes
      }

      // not setting config_override on purpose.
      // don't want to save the state of dynalist as
      // document might delete or change or what not.
    },
    onCancel: function() {
      this.clearSavedData()
      this.closePopup()
    },
    closePopup: function(timeout_seconds = 0) {
      this.clearSavedData()
      setTimeout(() => {
        window.close()
      }, timeout_seconds * 1000)
    },
    onChange: function() {
      chrome.runtime.sendMessage(
        {
          action: 'popup-store-session-data',
          data: {
            key: this.page_url,
            value: this.getPageData(),
          },
        },
        response => {}
      )
    },
    onConfigOverride: function() {
      if (this.files.selected.id != this.dynalist_config.document_id) {
        this.flags.is_config_overriden = true

        this.bookmark.config_override = {
          document_id: this.files.selected.id,
          is_inbox: this.files.selected.is_inbox,
        }
      } else {
        this.flags.is_config_overriden = false
      }
    },
    clearSavedData: function() {
      chrome.runtime.sendMessage(
        {
          action: 'popup-remove-session-data',
          data: {
            key: this.page_url,
          },
        },
        response => {}
      )
    },
    redirectToConfigureIfRequired: function() {
      if (
        this.dynalist_config === undefined ||
        this.dynalist_config.api_token === undefined ||
        (this.is_inbox == false && this.document_id === undefined)
      ) {
        this.showMessage('settings')
        let show_settings_message = {
          action: 'redirect-to-settings',
        }
        setTimeout(() => {
          chrome.runtime.sendMessage(show_settings_message, response => {})
        }, 2000)
      }
    },
    showMessage: function(message_type) {
      switch (message_type) {
        case 'success':
          this.messages.display_text = this.messages.success.text
          this.messages.display_icon = this.messages.success.icon
          break
        case 'settings':
          this.messages.display_text = this.messages.settings.text
          this.messages.display_icon = this.messages.settings.icon
          break
        case 'failure':
          this.messages.display_text = this.messages.failure.text
          this.messages.display_icon = this.messages.failure.icon
        default:
          break
      }
      this.flags.show_message_box = true
      this.flags.show_popup = false
    },
    track() {
      page({
        page: '/',
        title: 'Popup',
        location: window.location.href,
      })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
body {
  text-align: center;
  font-size: 12px;
  width: 400px;
  height: auto;
}

.container {
  width: 95%;
  margin: 5px;
}

.message-box {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;

  .message-icon {
    width: 30px;
    margin-right: 7px;
    box-shadow: none;
  }
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;

  .message-icon {
    width: 25px;
    margin-right: 10px;
    box-shadow: none;
  }

  .header {
    display: inline-flex;
    font-size: 15px;
    text-align: center;
    margin-top: 10px;
    border: 1px solid #007ee5;
    padding: 5px;
    border-radius: 5px;
  }
}

.rows {
  display: block;
  width: 100%;
  margin-top: 5px;
  text-align: left;
}

div > input,
div > textarea {
  width: 100%;
  height: 40px;
  // border-color: #007ee5;
  // border-radius: 5px;
  // border-width: 1px;

  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #007ee5;
}

input:hover,
textarea:hover {
  background: #f7ffff;
}

label {
  text-transform: uppercase;
}

input {
  width: 100%;
}

// .button-container {
//   margin-top: 10px;
// }

// buttons new css from https://codepen.io/woolandcotton/pen/mBmLwq
.button-container {
  text-align: center;
}

.button {
  width: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  color: #000;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 20px;
  margin-left: 30px;
  margin-bottom: 10px;
  cursor: pointer;
  display: inline-block;
}

.button-1 {
  background-color: transparent;
  border: 2px solid #007ee5; //#00d7c3;
  border-radius: 50px;
  -webkit-transition: all 0.15s ease-in-out;
  transition: all 0.15s ease-in-out;
  color: #007ee5; //#00d7c3;
}
.button-1:hover {
  //box-shadow: 0 0 5px 0 #00d7c3 inset, 0 0 5px 2px #007ee5; // #00d7c3;
  box-shadow: 0 0 5px 0 #007ee5 inset, 0 0 5px 2px #007ee5; // #00d7c3;
  border: 2px solid #007ee5; //#00d7c3;
}

.button:focus {
  outline: 0;
}

.button:active {
  outline: none;
  border: none;
}
</style>

