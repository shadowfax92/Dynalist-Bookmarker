<template>
  <div>
    <h2> {{ app_title }} </h2>
    <form>
    <label><b>Title</b></label>
    <input type="text" placeholder="Title of the bookmark" v-model="bookmark_title">
    <br>
    <label><b>Tags</b></label>
    <input type="text" placeholder="Tags. Ex, #read" v-model="bookmark_tags">
    <br>
    <label><b>Notes</b></label>
    <input type="text" placeholder="Any notes" v-model="bookmark_notes">
    <button :v-on:click="storeData">Store!</button>
    <br>
    </form>
  </div>
</template>

<script>
export default {
  data: {
    app_title: 'Bookmarker',
      bookmark_title: '',
      bookmark_tags: '',
      bookmark_notes: '',
  },
  methods: {
    storeData: function() {
      console.log("Storing data for " + bookmark_title);
    }
  },
}
</script>

<style lang="stylus">
</style>
