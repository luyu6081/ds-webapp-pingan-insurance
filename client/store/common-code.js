import QUERY_DS_COMMON_CODES from '~/graphql/common-code/ds-common-codes-query.gql'

export const state = () => ({
  commonCodeList: [],
})

export const getters = {
  commonCodeList (state) {
    return state.commonCodeList
  },
}

export const mutations = {
  setCommonCodeList (state, commonCodeList) {
    state.commonCodeList = commonCodeList
  },
}

export const actions = {
  async getCommonCodeList ({commit}, query) {
    const input = {
      keyWord: query,
      offset: 0,
      limit: 999999,
    }
    const {data: {data}} = await this.$apollo.query({
      query: QUERY_DS_COMMON_CODES,
      fetchPolicy: 'network-only',
      variables: {
        input,
      },
    })
    let dsCommonCodeInfos = data.dsCommonCodeInfos || []
    dsCommonCodeInfos.map(x => {
      x.label = x.cnName
      x.value = x.id
    })
    commit('setCommonCodeList', dsCommonCodeInfos)
  },
}
