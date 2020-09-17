<template>
  <div class="shield-container">
    <el-tabs v-model="activeName">
      <el-tab-pane
        :label="isSearch ? $t('profile.addshield'): $t('profile.myshield')"
        name="all"
      />
    </el-tabs>
    <div
      v-if="isSearch"
      class="shieldtop"
    >
      <div class="shieldnum">
        找到"{{ inputVal }}"搜索结果3条
      </div>
      <el-input
        v-model="inputVal"
        autocomplete="off"
        size="small"
        placeholder="请输入要搜索的用户名"
        class="shieldsearch"
        @keyup.enter.native="onClickSearch"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
          @click="onClickSearch"
        />
      </el-input>
    </div>
    <div
      v-else
      class="shieldtop"
    >
      <div class="shieldnum">
        共屏蔽{{ shieldTotal }}人
      </div>
      <el-button
        type="primary"
        size="small"
        class="shieldbtn"
        @click="addShield"
      >添加屏蔽用户</el-button>
    </div>
    <div
      v-if="!isSearch"
      class="shieldtable"
    >
      <!-- 黑名单列表表格 -->
      <el-table
        v-loading="loading"
        :data="shieldList"
        style="width:100%"
      >
        <el-table-column
          prop="cash_status"
          label="成员名称"
          min-width="100"
        >
          <template slot-scope="scope">
            <div class="flex">
              <avatar
                :user="{ id: scope.row.id, username: scope.row.username, avatarUrl: scope.row.avatarUrl}"
                :size="30"
                :round="true"
              />
              <nuxt-link
                :to="`/profile?userId=${scope.row.id}`"
                class="user-name"
              >{{ scope.row.username }}</nuxt-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="身份"
          width="140"
          prop="created_at"
        />
        <el-table-column
          label="操作"
          width="97"
          prop="id"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="changeshield(scope.row.id)"
            >解除屏蔽</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :current-page="pageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="shieldTotal"
        style="margin-top:15px;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>

</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  mixins: [handleError],
  data() {
    return {
      activeName: 'all',
      shieldList: [],
      shieldTotal: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: false,
      unbundlingArry: [], // 解绑用户组
      unbundUserData: [], // 已屏蔽用户组
      shieldType: '', // 屏蔽类型 user 用户列表 sheild 黑名单
      isSearch: false,
      inputVal: '',
      time: null,
      userList: []
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    }
  },
  mounted() {
    this.getShieldList()
    this.getShieldData()
  },
  methods: {
    handleSizeChange(val) {
      console.log(`当前页: ${val}`)
      this.pageNum = 1
      this.pageSize = val
      this.getShieldList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getShieldList()
    },
    // 获取黑名单数据
    getShieldData() {
      this.loading = true
      this.$store.dispatch('jv/get', `users/${this.userId}/deny`).then(res => {
        if (res._jv) {
          delete res._jv
        }
        this.unbundUserData = []
        this.unbundUserData.push(Number(this.userId))
        res.forEach((v, i) => {
          this.unbundUserData.push(res[i].id)
        })
        console.log('和名单数据', res)
        this.shieldTotal = res.length
      }, e => this.handleError(e)).finally(() => { this.loading = false })
    },
    // 获取黑名单列表
    getShieldList() {
      this.loading = true
      const params = {
        'page[limit]': this.pageSize,
        'page[number]': this.pageNum
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}/deny`, { params }]).then(res => {
        if (res._jv) {
          delete res._jv
        }
        console.log('获取黑名单', res)
        this.shieldList = res
      }, e => this.handleError(e)).finally(() => { this.loading = false })
    },
    changeshield(uid) {
      this.$confirm('是否解除屏蔽该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.unbundlingUser(uid)
        console.log(uid)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解除屏蔽'
        })
      })
    },
    // 解绑用户
    unbundlingUser(uid) {
      this.$store.dispatch('jv/delete', `users/${uid}/deny`).then(() => {
        this.unbundlingArry.push(uid)
        this.$t('profile.unboundsucceed')
        this.getShieldList()
        this.getShieldData()
      })
    },
    // 添加屏蔽
    addShield() {
      this.isSearch = true
    },
    onClickSearch(e) {
      this.inputVal = e.target.value
      this.unbundlingArry = []
      if (this.time) clearTimeout(this.time)
      this.time = setTimeout(() => {
        this.userList = []
        this.pageNum = 1
        this.getUserList(e.target.value)
      }, 250)
    },
    // 搜索用户列表
    getUserList(key, type) {
      this.loadingType = 'loading'
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[username]': `*${key}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        if (res._jv) {
          delete res._jv
        }
        console.log('用户搜索', res)
        this.isSearch = false
        res.forEach((v, i) => {
          res[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        this.uloadingType = res.length === this.uPageSize ? 'more' : 'nomore'
        // 过滤搜索用户中已屏蔽的用户和当前登录用户
        const data = res.filter(item => this.unbundUserData.indexOf(item.id) === -1)
        if (type && type === 'clear') {
          this.userList = data
        } else {
          this.userList = [...this.userList, ...data]
        }
      })
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.shield-container {
  .el-tabs ::v-deep {
    .el-tabs__header {
      margin: 0;
    }
    .el-tabs__active-bar,
    .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap {
      border-bottom: 1px solid $border-color-base;
      padding-bottom: 5px;
      padding-left: 30px;
    }
    .el-tabs__item {
      font-size: 16px;
      color: #b5b5b5;
      &.is-active {
        color: #000;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
  .shieldtop {
    display: flex;
    justify-content: space-between;
    margin: 11px 31px 0px 33px;
    align-items: center;
    .shieldsearch {
      width: 225px;
    }
    .shieldnum {
      color: #777777;
    }
    .shieldbtn {
      color: #fff;
      background: #409eff;
      width: 100px;
      padding: 8px 14px;
      height: 32px;
      font-size: 12px;
      border-radius: 2px;
    }
  }
  .shieldtable {
    padding: 0 30px;
    position: relative;
  }
  .post-list {
    .delete {
      color: $font-color-grey;
      cursor: pointer;
      .svg-icon-delete {
        margin-right: 6px;
      }
    }
    .load-more {
      color: $color-blue-base;
      border: 1px solid $color-blue-base;
      font-size: 16px;
      text-align: center;
      padding: 12px 0;
      line-height: 1;
      cursor: pointer;
      margin: 20px;
      border-radius: 2px;
    }
  }
}
.flex {
  display: flex;
  align-items: center;
}
.user-name {
  margin-left: 10px;
}

::v-deep .el-table {
  margin-top: 15px;
}
::v-deep.el-table .cell {
  padding-left: 10px;
  font-weight: 400;
}
::v-deep .el-table thead {
  color: #303133;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #fafafa !important;
}
::v-deep .el-pagination .btn-prev {
  margin-left: 110px;
}
::v-deep .el-pagination__jump {
  position: absolute;
  right: 35px;
}
::v-deep .el-button {
  color: #606266;
}
</style>
