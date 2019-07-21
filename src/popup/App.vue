<template>
  <div>
    <h2>{{ app_title }}</h2>
    <div class="flex-container">
      <div>
        <div class="rows">
          <label>
            <b>Title</b>
          </label>
          <input type="text" placeholder="Title of the bookmark" v-model="bookmark_title" />
        </div>
        <div>
          <label>
            <b>Url</b>
          </label>
          <input type="url" placeholder="Url" v-model="bookmark_url" />
        </div>
        <div class="rows">
          <label>
            <b>Tags</b>
          </label>
          <input type="text" placeholder="Tags. Ex, #read" v-model="bookmark_tags" />
        </div>
        <div class="rows">
          <label>
            <b>Notes</b>
          </label>
          <input type="text" placeholder="Any notes" v-model="bookmark_notes" />
        </div>
      </div>
      <div>
        <button class="button" :v-on:click="onSubmit">Store!</button>
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
  },
}
</script>

<style>
body {
  text-align: center;
  font-family: monaco, monospace;
}

h2 {
  display: inline-block;
  font-size: 20px;
}

.flex-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
