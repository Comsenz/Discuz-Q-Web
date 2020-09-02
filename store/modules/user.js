
import service from '@/api/request'
// import { utils } from '@/library/jsonapi-vuex/index'

const state = {
  info: {}
}

const mutations = {
  SET_USER_INFO(state, info = {}) {
    console.log('stroe set user info => ', info)
    state.info = info
  }
}

const actions = {
  /**
   * 获取用户信息
   */
  getUserInfo: ({ dispatch, commit }, userId) => {
    return new Promise((resolve, reject) => {
      service.get(`/users/${userId}`).then(res => {
        if (res.status === 200 && res.data && res.data.data) {
          console.log('store get user info =>', res.data.data)
          commit('SET_USER_INFO', res.data.data)
          resolve(res.data.data)
        } else {
          reject()
        }
      }).catch(e => {
        reject()
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
