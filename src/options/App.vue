<template>
  <div>
    <div class="container">
      <div class="message-box" v-if="display_flags.show_message_box">
        <div>
          <img class="message-icon" v-bind:src="messages.display_icon" alt="Success" />
        </div>
        <p>{{ messages.display_text }}</p>
      </div>
      <div v-if="display_flags.show_option">
        <div class="box">
          <label class="rows">Step-1: Paste Dynalist Token</label>
          <span class="rows">
            Please copy and paste the token from
            <a
              href="https://dynalist.io/developer"
            >dynalist link.</a>
          </span>
          <input
            class="rows"
            type="text"
            placeholder="Paste the API token"
            v-model="api_token"
            v-on:change="onApiTokenChange()"
            v-on:keyup.enter="onApiTokenChange()"
          />
          <div class="rows" v-if="showTokenResponse">
            <span v-if="isValidationSuccessful">Entered token is valid. Hurray! 🎉</span>
            <span
              v-if="!isValidationSuccessful"
            >Entered token is invalid 😢, clear the token and copy-paste the whole thing again.</span>
          </div>
          <br />
          <span class="rows">
            <b class="privacy">PRIVACY:</b> Note, the token is never upload. It's only used on this device.
          </span>
        </div>
        <div class="box" v-if="showBookmarksSelectionBox">
          <label class="rows">Step-2: Bookmarks location</label>
          <span class="rows">Please select the default location for your bookmarks.</span>
          <span class="rows">
            <input
              style="width: auto; margin-right: 5px;"
              type="checkbox"
              id="send-to-inbox-checkbox"
              v-model="isInboxCheckboxChecked"
              @change="onChangeBookmarkSelection('inbox')"
            />Send to Inbox
          </span>
          <label class="rows">OR</label>
          <select
            v-model="bookmarkDropdownSelected"
            @change="onChangeBookmarkSelection('dropdown')"
          >
            <option
              v-for="option in options"
              v-bind:key="option.id"
              v-bind:value="option"
            >{{ option.text }}</option>
          </select>
        </div>
      </div>
      <div class="button-container box" v-if="showButtons">
        <button class="myButtonSave" v-on:click="onSave">Save</button>
        <button class="myButtonCancel" v-on:click="onCancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
//@flow
export default {
  data() {
    return {
      bookmarkDropdownSelected: undefined,
      isInboxCheckboxChecked: false,
      api_token: '',
      isValidToken: undefined,
      showTokenResponse: false,
      defaultBookmarkLocationSelected: false,
      options: [],
      bookmarkLocation: {
        is_inbox: undefined,
        id: undefined,
        text: undefined,
      },
      display_flags: {
        show_option: true,
        show_message_box: false,
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
    showBookmarksSelectionBox: function() {
      return this.isValidToken
    },
    showButtons: function() {
      return this.defaultBookmarkLocationSelected && this.isValidToken
    },
    isValidationSuccessful: function() {
      if (this.isValidToken) {
        return true
      } else {
        return false
      }
    },
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'response-validate-token':
          this.isValidToken = request.status
          if (request.data) {
            let result = request.data
            this.showTokenResponse = true

            if (this.isValidToken) {
              this.extractDynalistDocuments(result['files'])
            }
          }
          break
        default:
          break
      }
    })
  },
  methods: {
    onApiTokenChange: function() {
      console.log('Api token changed to ' + this.api_token)
      chrome.runtime.sendMessage({
        action: 'validate-token',
        data: this.api_token,
      })
    },
    onSave: function() {
      let config = {
        api_token: this.api_token,
        is_inbox: this.bookmarkLocation.is_inbox,
        document_id: this.bookmarkLocation.id,
        document_name: this.bookmarkLocation.text
      }

      let eventMessage = {
        action: 'store-dynalist-config',
        data: config,
      }
      chrome.runtime.sendMessage(eventMessage, response => {})
      this.showMessage('success')
      this.closeOptionsWindow(this.messages.success.timeout)
    },
    onCancel: function() {
      this.showMessage('cancel')
      this.closeOptionsWindow(this.messages.cancel.timeout)
    },
    closeOptionsWindow: function(timeout_seconds = 0) {
      setTimeout(() => {
        window.close()
      }, timeout_seconds * 1000)
    },
    onChangeBookmarkSelection: function(caller) {
      console.log(caller)
      if (caller == 'inbox' && this.isInboxCheckboxChecked) {
        this.bookmarkLocation.is_inbox = true
        this.bookmarkLocation.text = 'Send to Inbox'
        this.bookmarkLocation.id = 'sendtoInboxId'
        this.bookmarkDropdownSelected = undefined
      } else if (caller == 'dropdown' || this.isInboxCheckboxChecked == false) {
        this.bookmarkLocation.is_inbox = false
        this.isInboxCheckboxChecked = false
        this.bookmarkLocation.id = this.bookmarkDropdownSelected.id
        this.bookmarkLocation.text = this.bookmarkDropdownSelected.text
      }
      this.defaultBookmarkLocationSelected = true
    },
    extractDynalistDocuments: function(dynalist_nodes) {
      // TODO: release this with fetch api.
      console.log(dynalist_nodes)
      let documents = []
      dynalist_nodes.forEach(node => {
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
    populateOptions: function(documents) {
      this.options = []
      this.defaultBookmarkLocationSelected = false

      documents.forEach(document => {
        this.options.push({
          text: document.title,
          id: document.id,
        })
      })
    },
    showMessage: function(message_type) {
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
      this.display_flags.show_message_box = true
      this.display_flags.show_option = false
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
  }
}

.header {
  display: inline-flex;
  font-size: 20px;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #79bcff;
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
  border-bottom: 1px solid #79bcff;
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

// generated using - https://www.bestcssbuttongenerator.com/#/1

.button-container {
  margin-top: 10px;
  text-align: center;
}

.myButtonSave {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0.05, #79bbff),
    color-stop(1, #378de5)
  );
  background: -moz-linear-gradient(top, #79bbff 5%, #378de5 100%);
  background: -webkit-linear-gradient(top, #79bbff 5%, #378de5 100%);
  background: -o-linear-gradient(top, #79bbff 5%, #378de5 100%);
  background: -ms-linear-gradient(top, #79bbff 5%, #378de5 100%);
  background: linear-gradient(to bottom, #79bbff 5%, #378de5 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#79bbff', endColorstr='#378de5',GradientType=0);
  background-color: #79bbff;
  -moz-border-radius: 15px;
  -webkit-border-radius: 15px;
  border-radius: 15px;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 12px;
  padding: 8px 20px;
  text-decoration: none;
}
.myButtonSave:hover {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0.05, #378de5),
    color-stop(1, #79bbff)
  );
  background: -moz-linear-gradient(top, #378de5 5%, #79bbff 100%);
  background: -webkit-linear-gradient(top, #378de5 5%, #79bbff 100%);
  background: -o-linear-gradient(top, #378de5 5%, #79bbff 100%);
  background: -ms-linear-gradient(top, #378de5 5%, #79bbff 100%);
  background: linear-gradient(to bottom, #378de5 5%, #79bbff 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#378de5', endColorstr='#79bbff',GradientType=0);
  background-color: #378de5;
}
.myButtonSave:active {
  position: relative;
  top: 1px;
}

.myButtonCancel {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0.05, #f9f9f9),
    color-stop(1, #e9e9e9)
  );
  background: -moz-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
  background: -webkit-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
  background: -o-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
  background: -ms-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
  background: linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#f9f9f9', endColorstr='#e9e9e9',GradientType=0);
  background-color: #f9f9f9;
  -moz-border-radius: 15px;
  -webkit-border-radius: 15px;
  border-radius: 15px;
  display: inline-block;
  cursor: pointer;
  color: #666666;
  font-family: Arial;
  font-size: 12px;
  padding: 8px 20px;
  text-decoration: none;
}
.myButtonCancel:hover {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0.05, #e9e9e9),
    color-stop(1, #f9f9f9)
  );
  background: -moz-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
  background: -webkit-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
  background: -o-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
  background: -ms-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
  background: linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#e9e9e9', endColorstr='#f9f9f9',GradientType=0);
  background-color: #e9e9e9;
}
.myButtonCancel:active {
  position: relative;
  top: 1px;
}
</style>
