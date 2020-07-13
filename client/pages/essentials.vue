<template>
  <div class="essentials-view mx-auto flex-auto flex" v-ej-loading.fullscreen="loading">
    <div class="essentials-view-left">
      <ej-search-input v-model="keywords"
                       width="100%"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="search"/>
      <!-- draggable -->
      <menu-tree :data="tree"
                 ref="tree"
                 :filter-node-method="filterNode"
                 node-key="id"
                 :props="{children: 'children', label: 'cnName'}"
                 :default-expanded-keys="defaultExpandedKeys"
                 :expand-on-click-node="false"
                 :allow-drop="treeMenuAllowDrop"
                 :allow-drag="treeMenuAllowDrag"
                 @node-click="handleNodeClick"
                 @node-drag-end="handleNodeDragEnd"
                 @node-drop="handleDrop">
        <div :class="['tree-menu', {'is-leaf': !data.children || !data.children.length}, `level-${node.level}`]"
              slot-scope="{node, data}">
          <span class="tree-menu-title">
            <ej-icon v-if="data.type === 'FOLDER'" icon="folder"></ej-icon>
            <ej-icon v-if="data.type === 'CATALOG'" icon="file"></ej-icon>
            <!-- <i :class="['text-blue mr-1', data.dirType === dirType.file ? 'el-icon-document' : '']"></i> -->
          <span class="tree-menu-title__text">{{data.cnName}}</span></span>
          <div :class="['tree-menu-wrap', {'is-selected': data.showMore}]" @click.stop="onSetDropdownNode(data, node)">
            <el-dropdown trigger="click"  @command="handleCommand">
              <!-- <i class="el-icon-more"></i> -->
              <i class="icon-more"/>
              <el-dropdown-menu slot="dropdown" class="tree-dropdown-menu">
                <!-- 审核中 禁用状态-->
                <el-dropdown-item v-for="(value, index) in dropDownList"
                                  :key="index"
                                  :command="value.key"
                                  :disabled="value.disabled">{{ value.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </menu-tree>
    </div>
    <div class="essentials-view-right">
      <div class="operate-panel">
        <el-button type="text" @click="handleOperate('export')"><ej-icon icon="export"></ej-icon>上传</el-button>
        <el-button type="text" @click="handleOperate('import')" :disabled="downloading"><ej-icon icon="import"></ej-icon>下载</el-button>
      </div>
      <no-data v-if="noData"></no-data>
      <template v-else>
        <div class="essentials-view-right-header">
          <h3 class="essentials-view-right-title clearfix">
            {{curNode.cnName}}
            <span class="title-english">{{ subjectInfo.enName }}</span>
            <ej-icon icon="edit" class="title-edit-btn tree-menu-icon inline-block" @click="onNewStandardShow('edit')"/>
            <span :class="['audit-status', `is-${subjectInfo.auditStatus}`]"><i class="audit-status-point"></i>{{ DsAuditStatus[subjectInfo.auditStatus]}}</span>
            <div class="float-right text-blue text-normal clearfix">
              <em class="content-word version" @click="toHistory">历史版本：<i class="content-word">V{{ subjectInfo.version }}</i></em>
              <!-- 'question' -->
              <busi-buttons v-model="busiButtonsObj"
                            :show-button="['launch', 'collect', 'watched']"
                            :operaId="curNode.id || ''"
                            :title="curNode.cnName"
                            :type="type"
                            class="inline-block mr-6"
                            @click="onBusiHandler"/>
            </div>
          </h3>
          <div class="essentials-view-right-content">
            <div class="content-row content-first">
              <span class="content-word">编号：<i>{{ subjectInfo.number }}</i></span>
              <span class="content-word">别名：<i>{{ subjectInfo.anName }}</i></span>
            </div>
            <div class="content-row content-second">
              <span class="content-word">路径：</span>
              <el-breadcrumb separator-class="el-icon-right">
                <el-breadcrumb-item v-for="(item, idx) in routeMsg" :key="idx">{{item.cnName}}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="content-row content-third">
              <span class="content-word">描述：</span>
              <p class="content-word">{{ subjectInfo.description }}</p>
            </div>
          </div>
        </div>
        <div class="essentials-view-right-main">
          <div class="main-menu">
            <h3 class="main-menu__title">信息项标准</h3>
            <div class="main-menu__list">
              <el-tag v-for="(item, index) in attributeList" :key="index" :class="['clearfix', {'is_active': item.id === attributeForm.id}, {'is-delete': item.isDelete}]" @click="onAttributeItemClick(item)">
                {{item.cnName}}<i class="el-icon-close" @click.stop="onAttributeOperate('remove', item)"></i>
              </el-tag>
              <el-tag class="plus" @click="getEssentialsCards"><i class="el-icon-plus"></i></el-tag>
            </div>
          </div>
          <div class="main-content">
            <!-- 右侧form表单项 -->
            <essentials-card v-for="(item, index) in essentialsCards"
                            :key="index"
                            :info="item"
                            :is-edit="essentialsCardsEdit"
                            :buttonDisabled="buttonDisabled"
                            ref="essentials-card"
                            :onEdit="onEssentialsCardsEdit"></essentials-card>
            <busi-buttons v-if="attributeForm.id" :show-button="['new']" @click="onMapDialogShow"/>
            <template v-if="isAttributeEdit">
              <div class="btn-group">
                <el-button @click="onHandler('save')">保存</el-button>
                <el-button type="primary" @click="onHandler('submit')">提交</el-button>
                <el-button @click="onHandler('cancel')">取消</el-button>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <el-backtop class="z-50" :bottom="20"><i class="el-icon-thumb"></i></el-backtop>

    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
    <!-- 映射弹窗 -->
    <dialog-mapping title="信息项标准映射"
                    :visible.sync="mappingVisible" :info="mappingForm"></dialog-mapping>
    <!-- 新建标准项 -->
    <dialog-new-standard :visible.sync="newStandardVisible" :isEdit="standardEdit" :form="standardForm"></dialog-new-standard>
    <!-- 新建文件夹 -->
    <dialog-new-folder :visible.sync="newFolderVisible" :form="folderForm"></dialog-new-folder>
    <!-- 文件上传 -->
    <dialog-file-upload :visible.sync="fileUploadVisible"></dialog-file-upload>
  </div>
</template>

<script>

  import {
    Backtop as ElBacktop,
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
    Dropdown as ElDropdown,
    DropdownMenu as ElDropdownMenu,
    DropdownItem as ElDropdownItem,
    Tag as ElTag,
  } from 'element-ui'

  import {
    Icon as EjIcon,
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import {mapActions, mapGetters} from 'vuex'
  import runtimeArgs from '@/runtime-args'

  import QUERY_STANDARD_DS_SUBJECTS from '~/graphql/standard/ds-subjects-query.gql'
  import QUERY_STANDARD_DS_SUBJECT from '~/graphql/standard/ds-subject-query.gql'
  import QUERY_STANDARD_DS_ATTRIBUTES from '~/graphql/standard/ds-attributes-query.gql'
  import QUERY_STANDARD_DS_ATTRIBUTE from '~/graphql/standard/ds-attribute-query.gql'
  import QUERY_STANDARD_DS_ATTRIBUTE_MAPPINGS from '~/graphql/standard/ds-attribute-mappings-query.gql'
  import QUERY_DS_EXPORT_STANDARD_ALL from '~/graphql/common/ds-export-standard-all-query.gql'
  import QUERY_DS_IS_COLLECT_SUBSCRIBE from '~/graphql/common/ds-is-collect-subscribe-query.gql'
  import MUTATION_STANDARD_DS_SAVE_ATTRIBUTE from '~/graphql/standard/ds-save-attribute-mutation.gql'
  import MUTATION_STANDARD_DS_DEL_SUBJECT from '~/graphql/standard/ds-del-subject-mutation.gql'
  import MUTATION_STANDARD_DS_DEL_ATTRIBUTE from '~/graphql/standard/ds-del-attribute-mutation.gql'
  import MUTATION_STANDARD_DS_DEL_ATTRIBUTE_MAPPING from '~/graphql/standard/ds-del-attribute-mapping-mutation.gql'
  import MUTATION_STANDARD_DS_ENABLE_SUBJECT from '~/graphql/standard/ds-enable-subject-mutation'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'

  import MenuTree from '~/components/menu-tree/index'
  import BusiButtons from '~/components/busiButtons'
  import NoData from '~/components/common/no-data'
  import EssentialsCard from '~/components/essentials/card'
  import DialogMapping from '~/components/essentials/dialog-mapping'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogNewStandard from '~/components/essentials/dialog-new-standard'
  import DialogNewFolder from '~/components/essentials/dialog-new-folder'
  import DialogFileUpload from '~/components/stat-specs/dialog-upload'

  import MessageBoxMixins from '~/mixins/message-box'
  import {GetTreeNode, GetFirstNode, GetTreeRoutemsg} from '~/utils/tools'
  import {formatDate} from '~/utils/date'

  import {commconCodeFormList, commonCodeDetailList, levelList, essentialsCards, COLUMNS} from './essentials.data'
  import {DsAuditStatus, DsStandardStatus} from '~/components/standard-audit/detail/data'

  const DIR_TYPE = {
    dir: 'dir',
    file: 'file',
  }

  export default {
    name: 'EssentialsView',
    mixins: [MessageBoxMixins],

    components: {
      ElBacktop,
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      ElDropdown,
      ElDropdownMenu,
      ElDropdownItem,
      ElTag,
      MenuTree,
      BusiButtons,
      EssentialsCard,
      NoData,
      DialogMapping,
      DialogMessageBox,
      DialogNewStandard,
      DialogNewFolder,
      DialogFileUpload,
      EjIcon,
      EjSearchInput,
    },

    data () {
      return {
        type: 'STANDARD',
        fileUploadVisible: false,
        keywords: '',
        tree: [],
        attributeList: [], // 信息项列表
        curNode: {}, // 当前选中node节点
        defaultExpandedKeys: [],
        routeMsg: [],

        busiButtonsObj: {},
        essentialsCards,
        mappingVisible: false,
        newStandardVisible: false,
        newFolderVisible: false,
        standardEdit: false,
        noData: true,
        subjectInfo: {}, // 基础标准信息
        standardForm: {}, // 基础标准弹窗form
        folderForm: {}, // 新建文件夹
        DsAuditStatus,
        DsStandardStatus,
        treeDropDownList: [
          {key: 'folder', label: '新建文件夹'},
          {key: 'standard', label: '新建标准'},
          {key: 'run', label: '启用'},
          {key: 'stop', label: '禁用'},
          {key: 'delete', label: '删除'},
        ], // 树右侧下拉列表
        dropDownList: [],
        dropdownNode: null, // dropdown 操作的node节点
        dropdownLevel: null,
        attributeForm: {
          id: null, // 主键
          subjectId: null, // 标准项id
          cnName: null, // 中文名称  新建信息项标准
          enName: null, // 英文名称
          type: null, // 类型
          description: null, // 描述
          department: null, // 定义部门
          indicia: null, // 编号
          unit: null, // 单位
          managerId: null, // 管理员id
          accord: null, // 标准依据
          principle: null, // 定义原则
          dataType: null, // 数据类型
          dataLength: null, // 数据长度
          level: null, // 重要级别
          canEmpty: false, // 可否为空
          access: null, // 获取方式
          commonCodeId: null, // 公共代码Id
        },
        originData: [],
        isAttributeEdit: false,
        essentialsCardsEdit: false,
        mappingForm: {},
        downloading: false,
        loadingCount: 0,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
        attrIndexCondition: null,
      }
    },
    computed: {
      ...mapGetters({
        userList: 'user/userList',
        commonCodeList: 'common-code/commonCodeList',
      }),
      buttonDisabled () {
        const {auditStatus} = this.subjectInfo
        return auditStatus === 'AUDITING'
      },
      dirType () {
        return DIR_TYPE
      },
      loading () {
        return this.loadingCount !== 0
      },
    },

    mounted () {
      this.init()
    },

    methods: {
      ...mapActions({
        'getUserList': 'user/getUserList',
        'getCommonCodeList': 'common-code/getCommonCodeList',
      }),
      toHistory () {
        const {standardId} = this.subjectInfo
        if (!standardId) return
        this.$router.push({name: 'common-version', params: {id: standardId, type: this.type}})
      },
      async handleOperate (command) {
        switch (command) {
          case 'export': // 上传
            this.fileUploadVisible = true
            break
          case 'import': // 下载
            this.downloading = true
            this.$message.success('文件努力下载中...')
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_EXPORT_STANDARD_ALL,
              fetchPolicy: 'network-only',
              variables: {
                type: this.type,
              },
            })
            this.downloading = false
            if (data) {
              window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
            }
            break
        }
      },
      onAttributeItemClick (item) {
        if (this.essentialsCardsEdit) { // 有正在编辑中项
          this.onHandler('cancel', item)
          return
        }
        this.getAttribute(item.id)
      },
      initCardFormData () {
        essentialsCards[1].list = commconCodeFormList
        this.essentialsCards = essentialsCards.map((x, i) => {
          if (i === 0) {
            let modifyTm = null
            if (this.attributeForm.modifyTm) {
              modifyTm = formatDate(this.attributeForm.modifyTm)
            }
            x.modifyTm = modifyTm
          }
          x.form = this.attributeForm
          x.list.forEach(ii => { ii.value = this.attributeForm[ii.key] })
          x.list.map(ii => {
            if (ii.label === '公共代码') {
              if (ii.attrs.remote) {
                ii.attrs.remoteMethod = this.getCommonCodeList
              }
            } else if (ii.label === '管理员') {
              if (ii.attrs.remote) {
                ii.attrs.remoteMethod = this.getUserList
              }
            }
          })
          if (x.type === 'table') {
            x.columns = COLUMNS.bind(this)()
          }
          return x
        })
      },
      setEssestionCardStatus (isEdit) {
        this.essentialsCardsEdit = isEdit
        this.isAttributeEdit = isEdit
      },
      onEssentialsCardsEdit () {
        this.onAttributeOperate('edit')
      },
      onAttributeOperate (type, tag) {
        switch (type) {
          case 'edit':
            this.setEssestionCardStatus(true)
            // 初始化select
            this.initCardFormData()
            break
          case 'remove':
            if (this.buttonDisabled) {
              this.$message.error('不可编辑正在审核中的标准项！')
              return
            }
            tag.isDelete = true
            this.showMessageBox({
              title: '信息项标准删除提示',
              content: '确定要删除当前信息项标准吗？',
              confirm: () => {
                this.setEssestionCardStatus(false)
                if (!tag.id) {
                  this.attributeList.splice(this.attributeList.length - 1, 1)
                  // 清空右侧表单
                  if (this.attributeList.length) {
                    this.onAttributeItemClick(this.attributeList[this.attributeList.length - 1])
                  }
                  return
                }
                const validate = this.getEssentialsCards()
                if (validate) {
                  this.onDeleteAttribute(tag.id)
                }
              },
              cancel: () => {
                tag.isDelete = false
              },
            })
            break
        }
      },

      // 启用，禁用 params = {id, status}
      onEnableSubject (params, isTree) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_STANDARD_DS_ENABLE_SUBJECT,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              // this.getDsSubject(params.id)
              // 提交审核
              let cnName, id
              if (isTree) {
                cnName = this.dropdownNode.cnName
                id = this.dropdownNode.id
              } else {
                cnName = this.subjectInfo.cnName
                id = this.subjectInfo.id
              }
              this.onSubmitAttribute({
                title: cnName,
                id,
                type: this.type,
                operation: 'UPDATE',
              }, {cb: this.getDsSubject, cbParams: params.id})
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onDeleteAttributeMapping (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_STANDARD_DS_DEL_ATTRIBUTE_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.message()
              // 信息项
              this.getAttributeMapping(this.attributeForm.id)
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onDeleteAttribute (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_STANDARD_DS_DEL_ATTRIBUTE,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.message()
              this.attrIndexCondition = 0
              this.getDsSubject(this.subjectInfo.id)
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onDeleteSubject (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_STANDARD_DS_DEL_SUBJECT,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            this.curNode = {}
            if (data) {
              // 提交审核 草稿return
              const {auditStatus} = this.dropdownNode
              if (auditStatus !== 'UNAUDITED') { // 非草稿
                const {cnName, id} = this.dropdownNode
                const params = {
                  title: cnName,
                  id,
                  type: this.type,
                  operation: 'DEL',
                }
                this.onSubmitAttribute(params, {cb: this.getDsSubject, cbParams: id})
              } else {
                this.message({message: '删除成功！', type: 'success'})
                this.getDsSubject()
              }
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onSaveAttribute (cb) {
        const cards = this.$refs['essentials-card']
        Promise
          .all(cards.map(x => x.onFormSubmit()))
          .then((res) => {
            const validate = res.filter(x => x === true).length === cards.length
            if (!validate) {
              this.$message.error('必填项不能为空！')
              return
            }
            const {
              id,
              cnName,
              enName,
              type,
              description,
              department,
              indicia,
              unit,
              managerId,
              accord,
              principle,
              dataType,
              dataLength,
              level,
              canEmpty,
              access,
              commonCodeId,
            } = this.attributeForm
            const subjectId = this.subjectInfo.id
            const input = {
              id,
              subjectId,
              cnName,
              enName,
              type,
              description,
              department,
              indicia,
              unit,
              managerId,
              accord,
              principle,
              dataType,
              dataLength,
              level,
              canEmpty,
              access,
              commonCodeId,
            }
            this.loadingCount++
            this.$apollo.mutate({
              mutation: MUTATION_STANDARD_DS_SAVE_ATTRIBUTE,
              variables: {
                input,
              },
              update: (store, {data: {data}}) => {
                this.loadingCount--
                if (data) {
                  if (typeof cb !== 'function') {
                    this.message()
                  }
                  let index = this.attributeList.length - 1
                  if (id) {
                    index = this.attributeList.findIndex(x => x.id === id)
                  }
                  this.attrIndexCondition = index
                  this.getDsSubject(this.subjectInfo.id)
                  // 重置表单状态
                  this.setEssestionCardStatus(false)
                  if (typeof cb === 'function') {
                    const {cnName, id} = this.subjectInfo
                    let operation = 'ADD'
                    if (this.attributeForm.id) {
                      operation = 'UPDATE'
                    }
                    const params = {
                      title: cnName,
                      id,
                      type: this.type,
                      operation,
                    }
                    cb(params)
                  }
                }
              },
            }).catch(e => {
              this.loadingCount--
            })
          })
      },
      // 提交审核 params = {title, type, id, operation}
      onSubmitAttribute (params, {cb, cbParams} = {}) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBMIT_AUDIT,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              const {operation} = params
              if (operation === 'DEL') {
                this.message({message: '删除成功！', type: 'success'})
              } else {
                this.message()
              }
              if (typeof cb === 'function') {
                cb(cbParams)
              } else {
                this.getSubject()
              }
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onHandler (type, item) {
        switch (type) {
          case 'save':
            this.onSaveAttribute()
            break
          case 'submit':
            this.onSaveAttribute(this.onSubmitAttribute)
            break
          case 'cancel':
            this.showMessageBox({
              content: '当前信息项标准还没保存，确定要离开当前页面吗？',
              confirm: () => {
                this.setEssestionCardStatus(false)
                if (!this.attributeForm.id) { // 新建
                  this.attributeList.splice(this.attributeList.length - 1, 1)
                  if (!this.attributeList.length) {
                    this.essentialsCards = []
                    this.isAttributeEdit = false
                    return
                  }
                  item = this.attributeList[0]
                  this.onAttributeItemClick(item)
                } else { // 编辑
                  this.getAttribute(this.attributeForm.id)
                }
              },
            })
            break
        }
      },
      getEssentialsCards () {
        if (this.buttonDisabled) {
          this.$message.error('不可编辑正在审核中的标准项！')
          return false
        }
        if (this.isAttributeEdit) {
          this.$message.error('请先保存当前项后，再进行新增操作！')
          return false
        }
        // 清除之前的表单校验
        const $card = this.$refs['essentials-card']
        $card.map(x => x.onResetFields())
        let initCnName = null // 新建信息项标准
        this.attributeForm = {
          cnName: initCnName,
          subjectId: this.subjectInfo.id,
          canEmpty: false,
          modifyTm: null,
        }
        this.onAttributeOperate('edit')
        this.essentialsCards[2].list = []
        this.attributeList.push(this.attributeForm)
        return true
      },
      init () {
        this.getCommonCodeList()
        this.getUserList()
        const {id} = this.$route.query
        this.getDsSubject(id || undefined)
      },
      // dropdown操作的node
      onSetDropdownNode (data, node) {
        // 清除之前选中
        this.clearShowMoreStatus(this.tree)
        // 清除之前的编辑状态
        this.setEssestionCardStatus(false)
        this.getNodeDropDownList(data)
        data.showMore = true
        this.dropdownNode = data
        this.dropdownLevel = node.level
      },
      handleCommand (command) {
        const {id} = this.dropdownNode
        const commandObj = {
          folder: '文件夹',
          standard: '标准',
        }
        if ((command === 'folder' && this.dropdownLevel > 4 - 1) || (command === 'standard' && this.dropdownLevel > 4)) {
          this.$message.error(`最多只能新建${this.dropdownLevel - 1}级${commandObj[command]}`)
          return
        }
        switch (command) {
          case 'folder':
            this.newFolderVisible = true
            this.folderForm = {
              pid: id,
              type: 'FOLDER',
            }
            break
          case 'standard':
            this.onNewStandardShow('add')
            break
          case 'run':
          case 'stop':
            const stasObj = {
              'run': 'ENABLE',
              'stop': 'DEACTIVATE',
            }
            const params = {
              id,
              status: stasObj[command],
            }
            this.onEnableSubject(params, true)
            break
          case 'delete':
            this.showMessageBox({
              title: '基础项删除提示',
              content: '确定要删除当前节点吗？',
              confirm: () => {
                this.onDeleteSubject(id)
              },
            })
            break
        }
      },
      getNodeDropDownList (node) {
        const dropDownList = JSON.parse(JSON.stringify(this.treeDropDownList))
        dropDownList.forEach(x => {
          x.disabled = false
          x.show = true
        })
        const {type, status, auditStatus} = node
        const filterType = {
          'FOLDER': ['run', 'stop'], // 文件夹 type
          'CATALOG': ['folder', 'standard'], // 目录 type
        }
        const statusObj = {
          'ENABLE': ['run'], // 启用
          'DEACTIVATE': ['stop'], // 禁用
        }

        dropDownList
          .filter(x => filterType[type].includes(x.key))
          .forEach(x => {
            x.show = false
          })

        dropDownList
          .filter(x => statusObj[status].includes(x.key))
          .forEach(x => {
            x.show = false
          })

        if (auditStatus === 'AUDITING') { // 审核中
          dropDownList.forEach(x => { x.disabled = true })
        }
        this.dropDownList = dropDownList.filter(x => x.show)
      },
      async getDsSubject (subjectId) {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_STANDARD_DS_SUBJECTS,
          fetchPolicy: 'network-only',
        })
        this.loadingCount--
        data.forEach(x => { x.showMore = false })
        data.sort((a, b) => { return b.type.localeCompare(a.type) })
        this.originData = JSON.parse(JSON.stringify(data))
        if (subjectId) {
          this.curNode = this.originData.filter(x => x.id === subjectId)[0]
        }
        this.tree = GetTreeNode(JSON.parse(JSON.stringify(data)))
        this.getExpandedFirstNode()
      },
      // 新建标准弹窗
      onNewStandardShow (type) {
        // FOLDER, # 文件夹
        // CATALOG # 目录
        if (type === 'add') {
          const {id} = this.dropdownNode
          this.standardForm = {
            id: null,
            pid: id,
            type: 'CATALOG',
          }
        } else if (type === 'edit') { // 编辑
          if (this.buttonDisabled) {
            this.$message.error('不可编辑正在审核中的标准项！')
            return
          }
          this.standardForm = {
            ...this.subjectInfo,
          }
        }
        this.newStandardVisible = true
        this.standardEdit = type !== 'add'
      },
      onMapDialogShow (type, mappingForm = {}) {
        this.mappingVisible = true
        this.mappingForm = mappingForm
      },
      onTableHandler (e, row, type) {
        if (type === 'edit') { // 编辑
          this.onMapDialogShow('edit', JSON.parse(JSON.stringify(row)))
        } else if (type === 'delete') { // 删除
          this.onDeleteAttributeMapping(row.id)
        }
      },
      getExpandedFirstNode () {
        let node = this.curNode
        if (!node.id) {
          node = GetFirstNode(this.tree)
        }
        this.setCheckedKeys(node)
        this.defaultExpandedKeys.push(this.curNode.id)

        // 获取右侧数据
        this.getRightPageData()
      },
      setCheckedKeys (node) {
        const {id} = node
        this.curNode = node
        this.getRoutemsg(id)
        this.$refs['tree'].setCheckedKeys([id])
        this.$nextTick(() => {
          this.$refs['tree'].setCurrentKey(id)
        })
      },

      getRightPageData () {
        this.setEssestionCardStatus(false)
        this.noData = true
        if (this.curNode.type === 'CATALOG') { // 如果当前选中节点是目录
          this.getSubject()
        }
      },

      onBusiHandler ({command, value}) {
        if (this.buttonDisabled) {
          this.$message.error('不可编辑正在审核中的标准项！')
          return
        }
        const {id} = this.subjectInfo
        switch (command) {
          case 'lauch': // 启用，停用
            const params = {
              id,
              status: value ? 'ENABLE' : 'DEACTIVATE',
            }
            this.onEnableSubject(params, false)
            break
        }
      },
      async getCollectData () {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_IS_COLLECT_SUBSCRIBE,
          fetchPolicy: 'network-only',
          variables: {
            id: this.curNode.id,
            type: this.type,
          },
        })
        this.loadingCount--
        const {isCollect, isSubscribe: isWatched} = data
        this.busiButtonsObj = {
          isLaunch: this.subjectInfo.status === 'DEACTIVATE', // 禁用，显示启用
          isCollect,
          isWatched,
        }
      },
      async getSubject () {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_STANDARD_DS_SUBJECT,
          fetchPolicy: 'network-only',
          variables: {
            id: this.curNode.id,
          },
        })
        this.loadingCount--
        this.noData = data === null
        if (this.noData) return
        this.subjectInfo = data || {}
        this.getCollectData()
        // 信息项
        this.getAttributes()
      },
      // 获取指定基础标准的信息项列表
      async getAttributes () {
        this.attributeForm = {}
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_STANDARD_DS_ATTRIBUTES,
          fetchPolicy: 'network-only',
          variables: {
            subjectId: this.curNode.id,
          },
        })
        this.loadingCount--
        this.setEssestionCardStatus(false)
        const _data = JSON.parse(JSON.stringify(data || []))
        this.attributeList = _data
        if (_data && _data.length) {
          _data.forEach(x => { x.isDelete = false })
          if (this.attrIndexCondition === null) this.attrIndexCondition = 0
          this.getAttribute(_data[this.attrIndexCondition].id)
        } else {
          this.essentialsCards = []
        }
      },

      initEssentailsCard (data) {
        this.attributeForm = data
        let {commonCode, manager} = this.attributeForm
        commonCode = commonCode || {}
        manager = manager || {}
        if (!this.isAttributeEdit) { // 详情页
          this.essentialsCards[1].list = JSON.parse(JSON.stringify(commonCodeDetailList))
        }
        this.essentialsCards.map((x, i) => {
          if (x.type === 'form') {
            x.form = this.attributeForm
            x.list.map(l => {
              if (i === 0) {
                if (l.key === 'level') {
                  l.value = levelList[x.form[l.key] - 1]
                } else if (l.key === 'managerId') {
                  l.value = manager.name
                } else {
                  l.value = x.form[l.key]
                }
              } else if (i === 1) {
                l.value = commonCode[l.key]
              }
            })
          } else if (x.type === 'table') {
            x.columns = COLUMNS.bind(this)()
          }
        })
      },

      async getAttribute (id) {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_STANDARD_DS_ATTRIBUTE,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        const {
          manager, // todo
          commonCode, // todo
        } = data
        let managerId = null
        let commonCodeId = null
        if (manager) {
          managerId = manager.id
        }
        if (commonCode) {
          commonCodeId = commonCode.id
        }
        data.managerId = managerId
        data.commonCodeId = commonCodeId
        this.attributeForm = data
        this.initCardFormData()
        this.initEssentailsCard(data)
        this.getAttributeMapping(this.attributeForm.id)
      },

      async getAttributeMapping (id) {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_STANDARD_DS_ATTRIBUTE_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            attributeId: id,
          },
        })
        this.loadingCount--
        this.essentialsCards[2].list = data || []
      },

      getRoutemsg (clickId) {
        this.routeMsg = GetTreeRoutemsg(this.originData, clickId)
      },

      search (...args) {
        this.$refs.tree.filter(args[0])
      },

      filterNode (value, data) {
        if (!value) return true
        return data.cnName.indexOf(value) !== -1
      },

      clearShowMoreStatus (list) {
        list.forEach(x => {
          x.showMore = false
          if (x.children && x.children.length) {
            this.clearShowMoreStatus(x.children)
          }
        })
      },

      handleNodeClick (node) {
        // 清除之前的选中样式
        if (this.dropdownNode && this.dropdownNode.showMore) {
          this.dropdownNode.showMore = false
        }
        const {type} = node
        if (type === 'FOLDER') return
        const {pid} = node
        if (pid === '') { // 根节点`基础标准`

        } else {
          this.attributeList = []
          this.setCheckedKeys(node)
          // 获取右侧数据
          this.attrIndexCondition = 0
          this.getRightPageData()
        }
      },
      /**
       * 判断节点能否被拖拽
       */
      treeMenuAllowDrag (draggingNode) {
        return draggingNode.data.pid !== ''
      },

      /**
       * 拖拽时判定目标节点能否被放置
       */
      treeMenuAllowDrop (draggingNode, dropNode, type) {
        console.log(draggingNode, dropNode, type)
        if (dropNode.data.dirType === 'file') { // 文件内不能插入
          return type !== 'inner'
        } else if (dropNode.data.pid === '') { // 根节点前不能放置
          return type !== 'prev'
        } else {
          return true
        }
      },

      /**
       * 拖拽成功完成时触发的事件
       */
      handleDrop (draggingNode, dropNode, dropType, ev) {
        // this.getDsSubject()
        console.log('tree drop: ', draggingNode, dropNode, dropType, ev)
      },
      // before、after、inner
      handleNodeDragEnd (currentNode, targetNode, dragPosition, e) {
        console.log('tree drag end', arguments)
      },
    },
    watch: {
      userList: {
        handler (newVal) {
          if (!this.essentialsCards.length) return
          const item = this.essentialsCards[0].list.filter(x => x.key === 'managerId')[0]
          item.options = newVal
        },
        immediate: true,
        deep: true,
      },
      commonCodeList: {
        handler (newVal) {
          if (!this.essentialsCards.length) return
          // const item = this.essentialsCards[1].list.filter(x => x.key === 'commonCodeId')[0]
          commconCodeFormList[0].options = newVal
        },
        immediate: true,
        deep: true,
      },

      keywords (newVal) {
        this.search(newVal)
      },
    },
  }
</script>

<style lang="scss">
  .essentials-view {
    // min-height: 90vh;

    // &.w-page {
    //   width: auto;
    //   margin: 0 25px 20px;
    //   overflow: auto;
    // }

    &-left {
      @apply block flex-none bg-white relative p-6;

      width: 268px;
      padding: 16px 20px;
      margin-right: 20px;
    }

    &-right {
      @apply block flex-auto;

      width: 100%;

      .operate-panel {
        @apply absolute;

        // top: 24px;
        top: 2px;
        right: 24px;
        z-index: 1;

        .ej-icon {
          @apply text-blue inline-block;

          width: 12px;
          height: 12px;
          margin: 0 10px 0 0;
        }

        .el-button {

          margin-bottom: 0;

          &--text {
            font-size: 14px;

            * {
              outline: none;
            }

            &:not(.is-disabled) {
              @apply text-gray-darkest;
            }

            padding: 0;

            &:last-of-type {
              margin-left: 20px;
            }
          }
        }

      }

      .content-word {
        @apply text-gray-dark;

        font-size: 12px;
        font-style: normal;
        font-weight: normal;
        line-height: 20px;
        word-break: break-all;

        &.version {
          @apply text-blue cursor-pointer italic;
        }
      }
    }

    .tree-menu-wrap {
      display: none;

      &.is-selected {
        display: block;
      }

      .icon-more {
        @apply inline-block bg-center bg-no-repeat align-middle;

        width: 16px;
        height: 16px;
        background-color: #d4e4ff;
        background-image: url('../assets/icon-more.svg');
        border-radius: 2px;
      }
    }

    .el-tree-node__content:hover {
      > .tree-menu {
        > .tree-menu-wrap {
          display: block;
        }
      }
    }

    &-right-header {
      @apply block overflow-hidden;

      padding: 16px 20px;
      margin-top: 30px;
      margin-bottom: 20px;
      background: #E5EDFC;
    }

    &-right-title {
      @apply text-gray-darkest font-medium text-lg mb-4 relative;

      padding-left: 10px;

      &:before {
        @apply absolute bg-blue;

        content: '';
        width: 2px;
        height: 12px;
        top: 6px;
        left: 0;
      }

      .title-english {
        @apply text-sm text-gray-darker;

        margin-left: 9px;
      }
      .title-edit-btn {
        width: 16px;
        height: 16px;
        margin-left: 21px;
      }
      .audit-status {
        @apply text-yellow text-sm;

        margin-left: 16px;
        border-radius: 4px;
        padding: 4px 9px;
        // background: rgba(250, 173, 20, .1);
        &-point {
          @apply bg-yellow rounded-full inline-block align-middle;

          width: 4px;
          height: 4px;
          margin: 0px 8px 0px 2px;
        }

        &.is-AUDITING { // 审核中
          color: #faad14;
          background-color: #fef6e7;

          .audit-status-point {
            background-color: #faad14;
          }
        }

        &.is-REJECTED { // 审核中
          color: #fdb498;
          background-color: #fff2e8;

          .audit-status-point {
            background-color: #fdb498;
          }
        }

        &.is-UNAUDITED { // 未审核
          @apply text-blue;
          background-color: #ecf2fc;

          .audit-status-point {
            @apply bg-blue;
          }
        }

        &.is-PASSED { // 已通过
          color: #52C41A;
          background-color: #eef9e9;

          .audit-status-point {
            background-color: #52C41A;
          }
        }
      }
    }

    &-right-content {
      .content {
        &-word {
          @apply text-sm text-gray-darker flex-none;
          i {
            @apply text-gray-dark not-italic;
          }
        }
        &-row {
          @apply flex;

          line-height: 20px;
        }
        &-first {
          @apply flex;

          margin: 16px 0 8px;

          span:last-of-type {
            margin-left: 50px;
          }
        }
        &-second {
          .el-breadcrumb__item {
            @apply text-gray-dark text-sm;

            line-height: 20px;
            .el-breadcrumb__inner {
              @apply text-gray-dark;
            }
          }
          .el-breadcrumb__item:last-of-type {
            .el-breadcrumb__inner {
              @apply text-gray-darkest;
            }
          }
        }
        &-third {
          p {
            @apply text-gray-dark flex-1;
          }
        }
      }
    }

    &-right-main {
      @apply bg-white;

      padding: 0 17px;
      box-sizing: border-box;

      .main {
        &-menu {
          padding: 16px 0 8px;

          &__title {
            @apply text-lg text-gray-darkest font-medium font-bold;

            margin-bottom: 11px;
          }
          &__list {
            .el-tag {
              @apply inline-block text-gray-darker border-none;

              margin-bottom: 11px;
              line-height: 22px;
              padding: 5px 12px;
              margin: 4px 8px;
              background-color: #F5F8FF;

              &:first-of-type {
                margin-left: 0;
              }

              .el-icon-close {
                display: none;

                &:hover {
                  @apply bg-transparent text-blue;
                }
              }

              &:hover,
              &.is-active {
                @apply text-blue cursor-pointer;

                .el-icon-close {
                  display: inline-block;
                }
              }
              &.is-delete {
                .el-icon-close {
                  display: inline-block;
                }
              }

              &.is_active {
                @apply border-blue text-white bg-blue;

                .el-icon-close {
                  display: inline-block;

                  &:hover {
                    @apply text-white;
                  }
                }
              }

              &.plus {
                @apply bg-white border-dashed text-blue;

                padding-left: 9px;
                padding-right: 9px;
                box-sizing: border-box;
                border-color: #d9d9d9;
              }

              .point {
                @apply float-left;

                margin-left: 7px;
                margin-top: 10px;
              }
              .remove {
                @apply float-right;
              }

              .btn-opera:nth-of-type(1) {
                margin-left: 0;
              }
            }
          }
          &__btn {
            @apply cursor-pointer;

            padding-left: 24px;
          }
        }
        &-content {
          @apply flex-1;

          // padding: 16px 20px;

          .latest-time {
            @apply text-gray-dark text-sm;
          }

          &__wrap {
            margin-top: 36px;
            &:first-of-type {
              margin-top: 20px;
            }
          }

          .common-buttons {
            @apply text-center;

            margin-top: 16px;
            width: 100%;
            margin-bottom: 20px;
            font-size: 14px;
          }
        }
      }
    }

    .el-input__inner:hover,
    .el-input__inner:focus {
      @apply border-blue;
    }

    .el-button {
      @apply mb-6 mx-1 text-lg py-3 px-8 text-lg text-black ; // leading-tight
    }

    .el-table__header-wrapper tr th {
      @apply text-black; // bg-purple-lighter
    }

    .el-table td, .el-table th {
      padding: 8px 0;
    }

    .standard-info {
      max-height: 340px;
      overflow: hidden;
      transition: .5s;

      .el-button {
        outline: none !important;
      }
    }

    .tree-menu {
      @apply ml-3 w-full relative flex;

      &-wrap {
        @apply absolute right-0;
      }
      &-btns {
        @apply flex justify-end items-center;
      }
      &-btn {
        margin-left: 10px;
      }
      &-icon {
        @apply text-blue;
        width: 12px;
        height: 12px;
      }
      &-title {
        &:hover {
          @apply text-blue;
        }

        .ej-icon {
          @apply text-blue;

          width: 10px;
          height: 10px;
          display: inline-block;
        }
      }

      .el-icon-more {
        @apply inline-block font-bold;

        transform: rotate(90deg);
        font-size: 12px;
        color: #909399;
      }
    }

    .btn-group {
      @apply text-center;

      font-size: 0;
      padding: 65px 0;

      .el-button {
        margin: 0;
        margin-right: 20px;
      }
    }

    [icon=edit] {
      cursor: pointer;
    }
  }

</style>
