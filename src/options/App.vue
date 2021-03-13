<template>
  <div>
    <div class="container">
      <div class="message-box" v-if="flags.show_message_box">
        <div>
          <img
            class="message-icon"
            v-bind:src="messages.display_icon"
            alt="Success"
          />
        </div>
        <p>{{ messages.display_text }}</p>
      </div>
      <div v-if="flags.show_option">
        <div class="box">
          <label class="rows">Step-1: Paste Dynalist Token</label>
          <span class="rows">
            Please copy and paste the token from
            <a href="https://dynalist.io/developer">dynalist link.</a>
          </span>
          <input
            class="rows"
            type="text"
            placeholder="Paste the API token"
            v-model="api_token"
            v-on:change="onApiTokenChange()"
            v-on:keyup.enter="onApiTokenChange()"
          />
          <div class="rows" v-if="flags.show_token_response">
            <span v-if="isValidationSuccessful"
              >Entered token is valid. Hurray! 🎉</span
            >
            <span v-if="!isValidationSuccessful"
              >Entered token is invalid 😢, clear the token and copy-paste the
              whole thing again.</span
            >
          </div>
          <br />
          <span class="rows">
            <b class="privacy">PRIVACY:</b> Note, the token is never upload.
            It's only used on this device.
          </span>
        </div>
        <div class="box" v-if="showBookmarksSelectionBox">
          <label class="rows">Step-2: Bookmarks location</label>
          <span class="rows"
            >Please select the default location for your bookmarks.</span
          >
          <span class="rows">
            <input
              style="width: auto; margin-right: 5px"
              type="checkbox"
              id="send-to-inbox-checkbox"
              v-model="flags.is_inbox_checkbox_checked"
              @change="onChangeBookmarkSelection('inbox')"
            />Send to Inbox
          </span>
          <label class="rows">OR</label>
          <select
            v-model="bookmark_dropdown_selection"
            @change="onChangeBookmarkSelection('dropdown')"
          >
            <option
              v-for="option in options"
              v-bind:key="option.id"
              v-bind:value="option"
            >
              {{ option.title }}
            </option>
          </select>
        </div>
        <div class="box" v-if="showBookmarksSelectionBox">
          <label class="rows">INFO</label>
          <span class="rows">
            How to use
            <a :href="app_wiki">wiki.</a>
          </span>
          <span class="rows">
            Report bug or feature request - Fill out the form
            <a :href="app_feedback">here.</a>
          </span>
        </div>
        <div class="button-container" v-if="showButtons">
          <button class="button button-1" v-on:click="onSave">Save</button>
          <button class="button button-1" v-on:click="onCancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//@flow

export default {
  data() {
    return {
      bookmark_dropdown_selection: undefined,
      api_token: '',
      app_feedback: 'https://forms.gle/YpAxQMCK7r4GL2Bt7',
      app_wiki: 'http://bit.ly/cdbwiki',
      options: [],
      existing_config: undefined,
      current_config: {
        is_inbox: undefined,
        id: undefined,
        text: undefined,
      },
      flags: {
        show_option: true,
        show_message_box: false,
        is_inbox_checkbox_checked: false,
        show_token_response: false,
        is_valid_token: undefined,
        bookmark_location_selected: false,
      },
      messages: {
        display_text: '',
        display_icon: '',
        success: {
          text: 'Saved settings!',
          icon: 'assets/images/check-icon.png',
          timeout: 2,
        },
        cancel: {
          text: 'Discarding settings',
          icon: 'assets/images/cancel-icon.png',
          timeout: 0.3,
        },
      },
    }
  },
  computed: {
    showBookmarksSelectionBox: function () {
      return this.flags.is_valid_token
    },
    showButtons: function () {
      return this.flags.bookmark_location_selected && this.flags.is_valid_token
    },
    isValidationSuccessful: function () {
      if (this.flags.is_valid_token) {
        return true
      } else {
        return false
      }
    },
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'validate-token-response':
          this.flags.is_valid_token = request.status
          this.flags.show_token_response = true

          if (request.data) {
            let result = request.data
            if (this.flags.is_valid_token) {
              this.extractDynalistDocuments(result['files'])
            }
          }
          break
        case 'get-config-response':
          if (request.data) {
            // config exists. prepopulate with existing config
            this.populateExistingConfig(request.data)
          }
          break
        default:
          break
      }
    })

    // as soon as mounted check if existing config exists
    let get_config_event = {
      action: 'get-config',
    }
    chrome.runtime.sendMessage(get_config_event, (response) => {})
  },
  methods: {
    onApiTokenChange: function () {
      chrome.runtime.sendMessage({
        action: 'validate-token',
        data: this.api_token,
      })
    },
    populateExistingConfig: function (config) {
      this.existing_config = config
      this.api_token = config.api_token
      // need to populate bookmark_dropdown_selection as
      // onChangeBookmarkSelection will be called manually and it requires this data.
      this.bookmark_dropdown_selection = {}
      this.bookmark_dropdown_selection.id = config.document_id
      this.bookmark_dropdown_selection.title = config.document_name
      this.bookmark_dropdown_selection.is_inbox = config.is_inbox
      this.onApiTokenChange()
    },
    onSave: function () {
      let config = {
        api_token: this.api_token,
        is_inbox: this.current_config.is_inbox,
        document_id: this.current_config.id,
        document_name: this.current_config.text,
      }

      let eventMessage = {
        action: 'store-dynalist-config',
        data: config,
      }
      chrome.runtime.sendMessage(eventMessage, (response) => {})
      this.showMessage('success')
      this.closeOptionsWindow(this.messages.success.timeout)
    },
    onCancel: function () {
      this.showMessage('cancel')
      this.closeOptionsWindow(this.messages.cancel.timeout)
    },
    closeOptionsWindow: function (timeout_seconds = 0) {
      setTimeout(() => {
        window.close()
      }, timeout_seconds * 1000)
    },
    onChangeBookmarkSelection: function (caller) {
      if (caller == 'inbox' && this.flags.is_inbox_checkbox_checked) {
        this.current_config.is_inbox = true
        this.current_config.text = 'Send to Inbox'
        this.current_config.id = 'sendtoInboxId'
        this.bookmark_dropdown_selection = undefined
      } else if (
        caller == 'dropdown' ||
        this.flags.is_inbox_checkbox_checked == false
      ) {
        this.current_config.is_inbox = false
        this.flags.is_inbox_checkbox_checked = false
        this.current_config.id = this.bookmark_dropdown_selection.id
        this.current_config.text = this.bookmark_dropdown_selection.text
      }
      this.flags.bookmark_location_selected = true
    },
    extractDynalistDocuments: function (dynalist_nodes) {
      // TODO: release this with fetch api.
      let documents = []
      dynalist_nodes.forEach((node) => {
        if (node['type'] == 'document') {
          let document = {
            id: node.id,
            title: node.title,
          }
          documents.push(document)
        }

        this.populateOptions(documents)
      })
    },
    populateOptions: function (documents) {
      this.options = []
      this.flags.bookmark_location_selected = false

      documents.forEach((document) => {
        let current_option = {
          title: document.title,
          id: document.id,
        }
        this.options.push(current_option)

        // if existing config exists selected the default option.
        if (
          this.existing_config &&
          this.existing_config.document_id == document.id
        ) {
          this.bookmark_dropdown_selection = current_option
        }
      })

      // trigger onchange if existing config exists.
      if (this.existing_config) {
        if (this.existing_config.is_inbox) {
          this.flags.is_inbox_checkbox_checked = true
          this.onChangeBookmarkSelection('inbox')
        } else {
          this.onChangeBookmarkSelection('dropdown')
        }
      }
    },
    showMessage: function (message_type) {
      switch (message_type) {
        case 'success':
          this.messages.display_text = this.messages.success.text
          this.messages.display_icon = this.messages.success.icon
          break
        case 'cancel':
          this.messages.display_text = this.messages.cancel.text
          this.messages.display_icon = this.messages.cancel.icon
        default:
          break
      }
      this.flags.show_message_box = true
      this.flags.show_option = false
    },
  },
  watch: {
    // api_token: function(old_val, new_val) {
    //   console.log("Api token: old_val = " + old_val + " new_val = " + new_val);
    // }
  },
}
</script>

<style lang="scss">
body {
  text-align: left;
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

.header {
  display: inline-flex;
  font-size: 20px;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #007ee5;
  padding: 5px;
  border-radius: 5px;
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
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #007ee5;
}

.privacy {
  color: red;
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

// buttons new css from https://codepen.io/woolandcotton/pen/mBmLwq
.button-container {
  text-align: center;
}

.button {
  width: 100px;
  padding-bottom: 10px;
  text-align: center;
  color: #000;
  text-transform: uppercase;
  margin-left: 20px;
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
  font-size: 11px;
  font-weight: 400;
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
