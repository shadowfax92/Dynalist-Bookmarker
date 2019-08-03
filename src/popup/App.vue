<template>
  <div>
    <div>
      <h2 class="header">{{ app_title }}</h2>
    </div>

    <div class="container">
      <div>
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
      </div>
      <div class="button-container">
        <button class="myButtonSave" v-on:click="onSubmit">Save</button>
        <button class="myButtonCancel" v-on:click="onCancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from 'http'

export default {
  data() {
    return {
      app_title: 'Bookmarker',
      bookmark_title: '',
      bookmark_url: '',
      bookmark_tags: '',
      bookmark_notes: '',
      page_url: '',
    }
  },
  mounted() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      var activeTab = tabs[0]
      this.bookmark_title = activeTab.title
      this.bookmark_url = activeTab.url
      this.page_url = activeTab.url

      chrome.runtime.sendMessage({ action: 'session-store-get-data', key: this.page_url }, (response) => {});
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (true) {
          console.log(sender);
          console.log('received response-session-store-get-data')
          if (message.action == 'response-session-store-get-data' && message.value !== undefined) {
            console.log(message.value);
            this.setPageData(message.value);
          }
        }
      });
    })
  },
  methods: {
    onSubmit: function() {
      chrome.runtime.sendMessage(
        { action: 'send-to-dynalist', data: this.getPageData() },
        response => {
          console.log(request.action)
          this.closePopup()
        }
      )
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
    closePopup: function() {
      this.clearSavedData()
      window.close()
    },
    onChange: function() {
      chrome.runtime.sendMessage(
        {
          action: 'session-store-set-data',
          key: this.page_url,
          value: this.getPageData(),
        },
        response => {
          console.log(request.action)
        }
      )
    },
    clearSavedData: function() {
      chrome.runtime.sendMessage(
        {
          action: 'session-store-remove-data',
          key: this.page_url,
        },
        response => {
          console.log(request.action)
        });
    }
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

