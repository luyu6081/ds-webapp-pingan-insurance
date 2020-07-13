import {WebSocketLink} from 'apollo-link-ws'
import {SubscriptionClient} from 'subscriptions-transport-ws'
import {split} from 'apollo-link'
import {getMainDefinition} from 'apollo-utilities'
import runtimeArgs from '~/runtime-args'

import {errorLink, addDatesLink} from '~/utils/http'

export default ctx => {
  // Name of the localStorage item
  const AUTH_TOKEN = 'apollo-token'
  // WS endpoint
  const wsEndpoint = runtimeArgs.NUXT_ENV_NOTIFY_WS_ENDPOINT

  const client = new SubscriptionClient(wsEndpoint, {
    reconnect: true,
  })

  const wsLink = new WebSocketLink(client)

  // 使用分割连接的功能
  // 你可以根据发送的操作类型将数据发送到不同的连接
  const link = split(
    // 根据操作类型分割
    ({query}) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    errorLink.concat(addDatesLink),
  )

  return {
    httpEndpoint: runtimeArgs.NUXT_ENV_HTTP_ENDPOINT,
    wsEndpoint,
    tokenName: AUTH_TOKEN,
    persisting: false,
    ssr: false,
    link,
    httpLinkOptions: {
      includeExtensions: true,
      credentials: 'include', // 作用：每个请求都携带cookie
    },
  }
}
