
import service from '@/api/request';

const state = () => {
  return {
    info: {} // 用户信息
  };
};

const mutations = {
  SET_USER_INFO(state, info = {}) {
    state.info = info;
  }
};

const actions = {
  /**
   * 获取用户信息
   * @param {*} userId 用户id
   */
  getUserInfo: ({ dispatch, commit }, userId) => {
    return new Promise((resolve, reject) => {
      service.get(`/users/${userId}`).then(res => {
        if (res.status === 200 && res.data && res.data.data) {
          const _data = res.data.data;
          // 头像修改的时候路径没改变
          // _data.attributes.avatarUrl = _
          // data.attributes.avatarUrl ? _data.attributes.avatarUrl + '?t=' + new Date().getTime() : ''
          commit('SET_USER_INFO', _data);
          resolve(_data);
        } else {
          reject();
        }
      }).catch(e => {
        reject();
      });
    });
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
