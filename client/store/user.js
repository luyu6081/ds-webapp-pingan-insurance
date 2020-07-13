import QUERY_AUTH_NAME_CARD_LIST from '~/graphql/user/auth-name-card-query.gql'

export const state = () => ({
  userList: [],
})

export const getters = {
  userList (state) {
    return state.userList
  },
}

export const mutations = {
  setUserList (state, userList) {
    state.userList = userList
  },
}

export const actions = {
  async getUserList ({commit}, query) {
    const {$apollo: {auth}} = this
    let {data: {data}} = await auth.query({
      query: QUERY_AUTH_NAME_CARD_LIST,
      fetchPolicy: 'network-only',
      variables: {
        input: {
          keyWords: query,
        },
      },
    })
    data = JSON.parse(JSON.stringify(data || []))
    data.map(x => {
      x.label = x.name
      x.value = x.userId
    })
    commit('setUserList', data)
  },
}
