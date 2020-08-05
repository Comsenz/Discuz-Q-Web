import {
  default as r
} from '../request'

class user {
  static _get(params) {
    return r.get(`url`, { params })
  }

  static _post(data) {
    return r.get(`url`, data)
  }

  static _put(data) {
    return r.put(`url`, data)
  }

  static _delete(id) {
    return r.delete(`/user/${id}`)
  }

  static getForumInfo() {
    return r.get(`/forum`)
  }
}

export default user
