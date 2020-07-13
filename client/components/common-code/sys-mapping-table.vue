<template>
  <div class="mapping-table">
    <h3 class="text-2xl font-bold mb-3">{{mappingInfo.systemName}}_系统映射情况</h3>
    <el-table :data="mappingInfo.mappingList"
              :span-method="objectSpanMethod"
              border
              style="width: 98%">
      <el-table-column prop="dbName" label="库名" width="180"/>
      <el-table-column prop="tableName" label="表名" width="180"/>
      <el-table-column prop="fieldName" label="字段" width="180"/>
      <el-table-column prop="fieldId" label="值">
        <template #default="scope">
          <el-button type="text"
                     size="small"
                     class="outline-none"
                     @click="handleSysMapper(scope.row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

  import {
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  export default {
    name: 'MappingTable',
    components: {
      ElButton,
      ElTable,
      ElTableColumn,
    },

    props: {
      mappingInfo: {},
      mergeCellData: {},
    },

    methods: {
      handleSysMapper (rows) {
        this.$emit('code-mapper', rows)
      },

      objectSpanMethod ({row, column, rowIndex, columnIndex}) {
        // 库名列
        if (columnIndex === 0) {
          const _row = this.mergeCellData[0][rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col,
          }
        }

        // 表名列
        if (columnIndex === 1) {
          const _row = this.mergeCellData[1][rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col,
          }
        }
      },
    },
  }
</script>

<style lang="scss">
  .mapping-table {
    .el-table td, .el-table th {
      padding: 10px 0;
    }

    .el-table__header-wrapper tr th {
      @apply text-black; // bg-purple-lighter
    }
  }
</style>
