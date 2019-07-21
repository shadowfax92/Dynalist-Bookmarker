<template>
  <div>
    <div>
      <h2 class="header">{{ app_title }}</h2>
    </div>
    
    <div class="container">
      <div>
        <div>
          <label class="rows">
            Title
          </label>
          <input class="rows" type="text" placeholder="Title of the bookmark" v-model="bookmark_title" />
        </div>
        <div>
          <label class="rows">
            Url
          </label>
          <input class="rows" type="url" placeholder="Url" v-model="bookmark_url" />
        </div>
        <div>
          <label class="rows">
            Tags
          </label>
          <input class="rows" type="text" placeholder="Tags. Ex, #read" v-model="bookmark_tags" />
        </div>
        <div>
          <label class="rows">
            Notes
          </label>
          <textarea class="rows"  type="text" placeholder="Any notes" v-model="bookmark_notes"></textarea>
        </div>
      </div>
      <div class="button-container">
        <button class="button" v-on:click="onSubmit">Save</button>
        <button class="button" v-on:click="onCancel">Cancel</button>
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
    }
  },
  mounted() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      var activeTab = tabs[0]
      this.bookmark_title = activeTab.title
      this.bookmark_url = activeTab.url
    })
  },
  methods: {
    onSubmit: function() {
      console.log('Storing data for ' + this.bookmark_title)
      let new_bookmark = {
        title: this.bookmark_title,
        tags: this.bookmark_tags,
        notes: this.bookmark_notes,
        url: this.bookmark_url,
      }

      chrome.runtime.sendMessage(
        { action: 'store-data', data: new_bookmark },
        response => {
          console.log(request.action)
        }
      )
    },
    onCancel: function() {
      window.close()
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
  border: 1px solid #4CAF50;
  padding: 5px; 
  border-radius: 5px;
}

.rows {
  display: block;
  width: 100%;
  margin-top: 5px;
  text-align: left;
}

div > input, div > textarea {
  width: 100%;
  height: 40px;
  border-color: #4CAF50;
  border-radius: 5px;
  border-width: 1px;
}

input:hover, textarea:hover{
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
</style>

