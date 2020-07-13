import runtimeArgs from '~/runtime-args'

/**
   * 生成tree结构数据
   * @param {Array} menuData 原生数据
   */
export function GetTreeNode (menuData) {
  let treeNode = []
  const each = (recuData, sourceData) => {
    let children = []
    sourceData.map(sd => sd.pid === recuData.id && (each(sd, sourceData), children.push(sd)))

    if (children.length > 0) recuData.children = children
    return recuData
  }

  let rootNode = menuData.filter(parent => String(parent.pid) === String(0))
  rootNode.forEach(ad => {
    treeNode.push(each(ad, menuData))
  })
  return treeNode
}

/**
     * 获取第一个节点数据
     * @param {Array} treeData tree数据
     */
export function GetFirstNode (treeData) {
  let node = {}

  function each (data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].children && data[i].children.length > 0) {
        return each(data[i].children)
      } else {
        node = data[i]
        break
      }
    }
  }

  each(treeData)
  return node
}

/**
     * 获取路径
     * @param {Array} menuData 原生数据
     * @param {Number} clickId 点击id
     */
export function GetTreeRoutemsg (menuData, clickId) {
  let routes = []
  const each = (recuData, sourceData) => {
    sourceData.map(sd => sd.id === recuData.pid && (each(sd, sourceData), routes.push({
      id: sd.id,
      // code: sd.code,
      cnName: sd.cnName,
    })))
  }
  const currentdata = menuData.find(node => node.id === clickId)
  if (currentdata) {
    each(currentdata, menuData)
  }
  // 加入当前节点
  routes.push({
    id: currentdata.id,
    // code: currentdata.code,
    cnName: currentdata.cnName})
  return routes
}

export function toImgHref (val) {
  if (!val) return ''
  return `${runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT}/fileDownload?ambryId=${val}&show=true`
}
