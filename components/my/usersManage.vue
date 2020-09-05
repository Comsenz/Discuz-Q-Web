<template>
  <div class="user-manage">
    <div class="filter-cont">
      <el-select v-model="groupId" placeholder="请选择">
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          size="medium"
        />
      </el-select>
      <div class="content">共有15人</div>
      <el-input v-model="searchText" placeholder="请输入成员名称" class="search" @keyup.enter.native="onClickSearch">
        <i slot="suffix" class="el-icon-search el-input__icon" />
      </el-input>
      <el-select v-model="handleValue" placeholder="请选择">
        <el-option
          v-for="item in handleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          size="medium"
        />
      </el-select>
    </div>
    <el-table v-loading="loading" :data="userList">
      <el-table-column type="selection" width="35" />
      <el-table-column prop="username" label="成员名称" />
      <el-table-column label="身份">
        <template slot-scope="scope">{{ scope.row.groups && scope.row.groups.length > 0 && scope.row.groups[0] ? scope.row.groups[0].name : '' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="60">
        <template slot-scope="scope">
          <template v-if="scope.row.status === 0">{{ $t('manage.normal') }}</template>
          <span v-else class="red">{{ $t('manage.disable') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="圈龄" width="60" />
      <el-table-column label="加入方式" />
      <el-table-column label="最后发言时间" width="140">
        <template slot-scope="scope">{{ scope.row.updatedAt | formatDate }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template>
          {{ $t('manage.modifyRole') }}
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
import { formatDate } from '@/utils/time'
export default {
  filters: {
    formatDate(date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  mixins: [handleError],
  data() {
    return {
      loading: false,
      groupId: '',
      typeOptions: [
        {
          label: '所有身份',
          value: 'all'
        }
      ],
      handleValue: '',
      handleOptions: [
        {
          label: '批量操作',
          value: 'all'
        }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 10,
      searchText: '',
      userList: []
    }
  },
  mounted() {
    this.getUserList()
    this.getGroupList()
  },
  methods: {
    // 获取用户组
    getGroupList() {
      this.$store.dispatch('jv/get', ['groups', {}]).then(res => {
        console.log('groups', res)
      })
    },
    getUserList() {
      this.loading = true
      const params = {
        include: 'groups',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[group_id]': this.groupId,
        'filter[username]': `*${this.searchText}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then((res) => {
        console.log('res', res)
        if (res) {
          this.total = res._jv.json.meta.total
          this.userList = res
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    onClickSearch() {
      if (!this.searchText) {
        this.$message.error('请输入成员名称')
        return
      }
      this.pageNum = 1
      this.getUserList()
    },
    handleSizeChange(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUserList()
    }
  }
}
</script>
<style lang="scss" scoped>
.filter-cont {
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    margin-left: 10px;
  }
  .el-select {
    width: 140px;
  }
  .el-input {
    width: 220px;
  }
  .search {
    margin-right: 10px;
  }
}
.red{
  color: #fa5151;
}
::v-deep .el-table thead tr {
  color: #303133;
  background-color: #fafafa;
}
.pagination {
  text-align: right;
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>
