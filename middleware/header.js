
import axios from 'axios'
import cookie from '../utils/parserCookie'
import env from '@/utils/env.js'

export default function(context) {
  if (context && context.req && context.req.headers) {
    const token = cookie.get('token', context.req.headers.cookie)

    if (token) {
      axios.defaults.headers['authorization'] = `Bearer ${token}`
    }

    // Set Host
    env.host = context.req.headers.host || ''
  }
}
