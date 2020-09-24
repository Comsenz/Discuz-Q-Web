
import axios from 'axios'
import cookie from '../utils/parserCookie'

export default function(context) {
  if (context && context.req && context.req.headers) {
    const token = cookie.get('token', context.req.headers.cookie)
    axios.defaults.headers['authorization'] = token ? `Bearer ${token}` : ''
  }
}
