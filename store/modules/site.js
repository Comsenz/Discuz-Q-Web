
import service from '@/api/request'
// import { utils } from '@/library/jsonapi-vuex/index'

const state = {
  info: {}
}

const mutations = {
  SET_SITE_INFO(state, info = {}) {
    state.info = info
  }
}

const actions = {
  /**
   * 获取站点信息
   */
  getSiteInfo: ({ commit }) => {
    // context.commit(SET_USER_ID, payload)
    return new Promise((resolve, reject) => {
      service.get('/forum').then(res => {
        if (res.status === 200 && res.data && res.data.data) {
          commit('SET_SITE_INFO', res.data.data)
          resolve(res.data.data)
        } else {
          reject()
        }
      }).catch(e => {
        reject(e)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
