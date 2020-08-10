export const state = () => ({

})

export const mutations = {

}

// https://github.com/mrichar1/jsonapi-vuex
import { jsonapiModule } from '../library/jsonapi-vuex/index';
import service from '../api/request';
export const modules = {
  jv: jsonapiModule(service, { preserveJson: true, mergeRecords: true }),
}
