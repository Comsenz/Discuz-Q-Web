export const state = () => ({

});

export const mutations = {

};

// https://github.com/mrichar1/jsonapi-vuex
import { jsonapiModule } from './modules/jsonapi-vuex/index';
import session from './modules/session';
import site from './modules/site';
import user from './modules/user';

import service from '../api/request';
export const modules = {
  jv: jsonapiModule(
    service,
    {
      preserveJson: true,
      mergeRecords: true,
      followRelationshipsData: true
      // clearOnUpdate: true
    }
  ),
  session,
  site,
  user
};
