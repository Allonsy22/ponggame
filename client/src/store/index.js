import Vue from 'vue';
import Vuex from 'vuex';
import session from '@/store/modules/session';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    session
  }
});
