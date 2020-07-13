import {ApolloLink} from 'apollo-link'
import {onError} from 'apollo-link-error'
import {Message} from 'element-ui'

export const addDatesLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    // todo: 收到的返回值 优化, response.data.data
    // if (response.data) {
    //   return response.data.data
    // } else {
    //   return response
    // }
    return response
  })
})

export const errorLink = onError(({graphQLErrors, networkError}) => {
  /*
  * 我只接受几个共有的code
  * 服务器错误  500的
  * 如果是 graphQLErrors 错误 继续执行
  * 如果是 networkError 错误 断代码
  */
  if (graphQLErrors) {
    let extensions = graphQLErrors[0].extensions
    let {message} = graphQLErrors[0]
    if (extensions) {
      let code = graphQLErrors[0].extensions.code
      if (code) {
        if (code === '400') {
          Message({type: 'error', message: '参数错误'})
        } else if (code === '500') {
          Message({type: 'error', message: '后端服务不可用，请联系管理员 '})
        } else if (message) {
          Message({type: 'error', message})
        }
        console.log(extensions)
      }
    } else {
      // 其他的错误 去单独的接口中处理
    }
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    throw Error(networkError.message)
  }
})
