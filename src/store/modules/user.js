const state = {
  user: {}

}

const mutations = {
  // 设置用户信息
  SET_USER_INFO(state, user) {
    state.user = user || {}
  }
}

const actions = {
  // 获取用户信息
  getUserInfo({ commit }) {
    return new Promise((resolve, reject) => {
      resolve({
        name: 'test'
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
