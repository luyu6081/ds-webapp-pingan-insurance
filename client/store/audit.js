export const state = () => ({
  activeTab: 'OPEN',
  paneList: [
    {label: '待审批', name: 'OPEN', total: null},
    {label: '与我相关', name: 'RELATED', total: null},
    {label: '已完成', name: 'CLOSED', total: null},
  ],
})

export const getters = {
  activeTab (state) {
    return state.activeTab
  },
  paneList (state) {
    return state.paneList
  },
}

export const mutations = {
  setActiveTab (state, activeTab) {
    state.activeTab = activeTab
  },
  setPaneList (state, paneList) {
    state.paneList = paneList
  },
}

export const actions = {
  setActiveTab ({commit}, activeTab) {
    commit('setActiveTab', activeTab)
  },
  setPaneList ({commit}, paneList) {
    commit('setPaneList', paneList)
  },
}
