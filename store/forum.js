const SET_FORUM_ERROR = 'SET_FORUM_ERROR';

export const state = () => ({
  error: {
    loading: true
  }
});

export const actions = {
  setError(context, payload) {
    context.commit(SET_FORUM_ERROR, payload);
  }
};

export const mutations = {
  [SET_FORUM_ERROR](state, payload) {
    state.error = payload || {};
  }
};
