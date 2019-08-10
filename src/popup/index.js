import Vue from 'vue'
// import 'bulma-fluent/bulma.sass'

import App from './App.vue'
import VueAnalytics from 'vue-analytics'

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: h => h(App),
})

Vue.use(VueAnalytics, {
  id: 'UA-145327406-1',
  // debug: {
  //   enabled: true
  // }
})
