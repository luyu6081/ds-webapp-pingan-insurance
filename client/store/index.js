import _ from 'lodash'
import {GetTreeNode} from '@/utils/tools'
import QUERY_CATEGORIES_LISTS from '@/graphql/categories_lists_new_interface.gql'

export const Mutation = {}

export const state = () => ({
  categories: [],
  notifications: 0,
  userData: {},
  currentRouteName: 'home',
})

export const getters = {
  techTree (state) {
    return state.categories
  },
}

export const mutations = {
  [Mutation.setCurrentRouteName = 'setCurrentRouteName'] (state, data) {
    state.currentRouteName = data
  },
  [Mutation.setTechCategoriesTree = 'setTechCategoriesTree'] (state, data) {
    state.categories = data
  },
}

export const actions = {
  async categoriesTechList ({commit}) {
    const _techData = await this.app.$apollo.query({
      query: QUERY_CATEGORIES_LISTS,
      fetchPolicy: 'no-cache',
      variables: {
        input: {
          type: 'TECHONLOGY',
          status: 'AVAILABLE',
        },
      },
    })

    if (_techData.data.categoriesLists) {
      // 技术类目加入tree
      let copyObj = _.cloneDeep(_techData.data.categoriesLists).filter(od => od)
      console.log('GetTreeNode(copyObj)', GetTreeNode(copyObj))
      commit('setTechCategoriesTree', GetTreeNode(copyObj))
    }
  },
}
