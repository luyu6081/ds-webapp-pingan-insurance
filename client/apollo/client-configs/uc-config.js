import runtimeArgs from '~/runtime-args'
import {errorLink, addDatesLink} from '~/utils/http'

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint
export default () => {
  return {
    httpEndpoint: runtimeArgs.NUXT_ENV_AUTH_HTTP_ENDPOINT,
    tokenName: AUTH_TOKEN,
    persisting: false,
    websocketsOnly: false,
    ssr: false,
    link: errorLink.concat(addDatesLink),
    httpLinkOptions: {
      includeExtensions: true,
      credentials: 'include', // 作用：每个请求都携带cookie
    },
  }
}
