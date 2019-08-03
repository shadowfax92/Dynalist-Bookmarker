<template>
  <div>
    <div class="container">
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
        />
        <div class="rows" v-if="showTokenResponse">
          <span v-if="isValidToken">Is a valid token. Hurray! 🎉</span>
          <span
            v-if="!isValidToken"
          >Entered token is invalid 😢. Clear the token and copy-paste the whole thing again.</span>
        </div>
        <br />
        <span class="rows">
          <b class="privacy">PRIVACY:</b>Note, the token is never upload and is only accessible on this browser.
        </span>
      </div>
      <div class="box" v-if="isValidToken">
        <label class="rows">Step-2: Bookmarks location</label>
        <span class="rows">Please select the location for your bookmarks.</span>
        <span class="rows">
          <input
            style="width: auto; margin-right: 5px;"
            type="checkbox"
            id="send-to-inbox-checkbox"
          />Send to Inbox
        </span>
        <label class="rows">OR</label>
        <span class="rows">Choose a note from dropdown. Selected = {{ selected }}</span>
        <select v-model="selected">
          <option
            v-for="option in options"
            v-bind:key="option.text"
            v-bind:value="option.value"
          >{{ option.text }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { validateToken } from '../utils/dynalist'

export default {
  data() {
    return {
      selected: 'None',
      api_token: '',
      isValidToken: undefined,
      showTokenResponse: false,
      options: [
        { text: 'One', value: 'A' },
        { text: 'Two', value: 'B' },
        { text: 'Three', value: 'C' },
      ],
    }
  },
  methods: {
    onApiTokenChange: function() {
      console.log('Api token changed to ' + this.api_token)
      validateToken(this.api_token, response => {
        console.log(response)
        this.isValidToken = response.success
        this.showTokenResponse = true
      })
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
</style>
