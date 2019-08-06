<template>
  <div>
    <div>
      <h2 class="header">{{ app_title }}</h2>
    </div>

    <div class="container">
      <div class="message-box" v-if="display_flags.show_message_box">
        <div>
          <img class="message-icon" v-bind:src="messages.display_icon"/>
        </div>
        <p>{{ messages.display_text }}</p>
      </div>
      <div class="popup" v-if="display_flags.show_popup">
        <div>
          <label class="rows">Title</label>
          <input
            class="rows"
            type="text"
            placeholder="Title of the bookmark"
            v-model="bookmark_title"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Url</label>
          <input
            class="rows"
            type="url"
            placeholder="Url"
            v-model="bookmark_url"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Tags</label>
          <input
            class="rows"
            type="text"
            placeholder="Tags. Ex, #read"
            v-model="bookmark_tags"
            v-on:change="onChange()"
          />
        </div>
        <div>
          <label class="rows">Notes</label>
          <textarea
            class="rows"
            type="text"
            placeholder="Any notes"
            v-model="bookmark_notes"
            v-on:change="onChange()"
          ></textarea>
        </div>
        <div class="button-container">
          <button class="myButtonSave" v-on:click="onSubmit">Save</button>
          <button class="myButtonCancel" v-on:click="onCancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//@flow
import { request } from 'http'
import { setTimeout } from 'timers'

export default {
  data() {
    return {
      app_title: 'Dynalist Bookmarker',
      bookmark_title: '',
      bookmark_url: '',
      bookmark_tags: '',
      bookmark_notes: '',
      page_url: '',
      dynalist_config: null,
      display_flags: {
        show_popup: true,
        show_message_box: false,
      },
      messages: {
        display_text: '',
        display_icon: '',
        success: {
          text: 'Successfully saved!',
          icon: 'assets/images/check-icon.png',
        },
        settings: {
          text: 'Need to configure app before using!',
          icon: 'assets/images/settings-icon.png',
        }
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
            this.redirectToConfigureIfRequired()
          }
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
      this.bookmark_title = activeTab.title
      this.bookmark_url = activeTab.url
      this.page_url = activeTab.url

      let message = {
        action: 'popup-get-session-data',
        data: {
          key: this.page_url,
        },
      }

      chrome.runtime.sendMessage(message, response => {})
    })
  },
  methods: {
    onSubmit: function() {
      chrome.runtime.sendMessage(
        { action: 'send-to-dynalist', data: this.getPageData() },
        response => {
          // this.closePopup()
        }
      )

      this.showMessage()
      this.closePopup(1)
    },
    getPageData: function() {
      let data = {
        title: this.bookmark_title,
        tags: this.bookmark_tags,
        notes: this.bookmark_notes,
        url: this.bookmark_url,
      }
      return data
    },
    setPageData: function(data) {
      if (data.title != '') {
        this.bookmark_title = data.title
      }
      if (data.url != '') {
        this.bookmark_url = data.url
      }
      if (data.tags != '') {
        this.bookmark_tags = data.tags
      }
      if (data.notes != '') {
        this.bookmark_notes = data.notes
      }
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
        response => {
          console.log(request.action)
        }
      )
    },
    clearSavedData: function() {
      chrome.runtime.sendMessage(
        {
          action: 'popup-remove-session-data',
          data: {
            key: this.page_url,
          },
        },
        response => {
          console.log(response.action)
        }
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
        }, 2000);
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
        default:
          break
      }
      this.display_flags.show_message_box = true
      this.display_flags.show_popup = false
    },
  },
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
  }
}

.header {
  display: inline-flex;
  font-size: 15px;
  text-align: center;
  margin-top: 10px;
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
  // border-color: #79bcff;
  // border-radius: 5px;
  // border-width: 1px;

  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #79bcff;
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

.button-container {
  margin-top: 10px;
}

// generated using - https://www.bestcssbuttongenerator.com/#/1
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

