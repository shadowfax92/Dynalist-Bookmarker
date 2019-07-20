<template>
  <div>
    <h2>{{ app_title }}</h2>
    <form @submit.prevent="onSubmit">
      <label>
        <b>Title</b>
      </label>
      <input type="text" placeholder="Title of the bookmark" v-model="bookmark_title" />
      <br />
      <label>
        <b>Url</b>
      </label>
      <input type="url" placeholder="Url" v-model="bookmark_url" />
      <br />
      <label>
        <b>Tags</b>
      </label>
      <input type="text" placeholder="Tags. Ex, #read" v-model="bookmark_tags" />
      <br />
      <label>
        <b>Notes</b>
      </label>
      <input type="text" placeholder="Any notes" v-model="bookmark_notes" />
      <br />
      <button :v-on:click="onSubmit">Store!</button>
      <br />
    </form>
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

<style lang="stylus"></style>
