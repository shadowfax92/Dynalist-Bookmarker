<template>
  <div>
    <div class="container">
      <div class="api-box">
        <label class="rows">Step-1: Paste Dynalist Token</label>
        <span class="rows">Please copy and paste the token from <a href="https://dynalist.io/developer">dynalist link.</a></span>
          <input
            class="rows"
            type="text"
            placeholder="Paste the API token"
          />
        <span class="rows"><b class="privacy">PRIVACY POLICY: </b>Note, the token is never upload and is only accessible on this browser.</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  }
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
