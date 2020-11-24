<template>
  <div class="shield-container">
    <div v-if="shieldList.length >= 0">
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
        <div :class="userList.length === 0 ? 'shieldnum hide':'shieldnum'">
          {{ $t('manage.find') }}
          <span class="searchusr">"{{ inputVal }}"</span>
          {{ $t('profile.searchresult') }}{{ searchTotal }}{{ $t('topic.item') }}
        </div>
        <el-input
          v-model="inputVal"
          autocomplete="off"
          size="small"
          :placeholder="$t('invite.searchPlaceholder')"
          class="shieldsearch"
          @input="searchinput"
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
          {{ $t('profile.totalshield') }}{{ shieldTotal }}{{ $t('profile.person') }}
        </div>
        <el-button
          type="primary"
          size="small"
          class="shieldbtn"
          @click="addShield"
        >{{ $t('profile.addshield') }}</el-button>
      </div>
      <div
        v-if="!isSearch"
        class="shieldtable"
      >
        <!-- 黑名单列表表格 -->
        <div v-if="shieldTotal > 0">
          <el-table
            v-loading="loading"
            :data="shieldList"
            style="width:100%"
          >
            <el-table-column
              :label="$t('manage.userName')"
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
                    :to="`/user/${scope.row.id}`"
                    class="user-name"
                  >{{ scope.row.username }}</nuxt-link>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column
          label="身份"
          width="140"
        /> -->
            <el-table-column
              :label="$t('manage.operate')"
              width="97"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  class="operabtn"
                  @click="changeshield(scope.row.id)"
                >{{ $t('profile.deleteshield') }}</el-button>
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
            class="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
        <template v-else>
          <div
            v-if="hasMore"
            class="load-more"
            @click="loadMore"
          >{{ $t('topic.showMore') }}</div>
          <div
            v-else
            class="no-more"
          >
            <svg-icon
              v-if="shieldList.length === 0"
              type="empty"
              class="empty-icon"
            />{{ shieldList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noshield') }}
          </div>
        </template>
      </div>
      <!-- 搜索结果表格 -->
      <div
        v-else-if="searchTotal>0"
        class="shieldtable"
      >
        <div>
          <el-table
            v-loading="loading2"
            :data="userList"
            style="width:100%"
          >
            <el-table-column
              :label="$t('manage.userName')"
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
                    :to="`/user/${scope.row.id}`"
                    class="user-name"
                  >{{ scope.row.username }}</nuxt-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('manage.identity')"
              min-width="100"
            >
              <template slot-scope="scope">
                {{ scope.row.groupName }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('manage.operate')"
              width="97"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  class="operabtn"
                  @click="shieldUser(scope.row.id)"
                >{{ $t('profile.shield') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页器 -->
          <el-pagination
            background
            :pager-count="5"
            :current-page="pageNum"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="searchTotal"
            class="pagination"
            @size-change="handleSizeChange2"
            @current-change="handleCurrentChange2"
          />
        </div>
      </div>
      <template v-else>
        <div
          v-if="hasMore"
          class="load-more"
          @click="loadMore"
        >{{ $t('topic.showMore') }}</div>
        <div
          v-else
          class="no-more"
        >
          <svg-icon
            v-if="userList.length === 0"
            type="empty"
            class="empty-icon"
          />{{ userList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}
        </div>
      </template>
    </div>
  </div>

</template>

<script>
import head from '@/mixin/head'
import handleError from '@/mixin/handleError'
export default {
  name: 'Shield',
  layout: 'center_layout',
  mixins: [head, handleError],
  data() {
    return {
      title: this.$t('profile.myshield'),
      activeName: 'all',
      shieldList: [],
      shieldTotal: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      loading2: false,
      hasMore: false,
      unbundlingArry: [], // 解绑用户组
      unbundUserData: [], // 已屏蔽用户组
      shieldType: '', // 屏蔽类型 user 用户列表 sheild 黑名单
      isSearch: false,
      inputVal: '',
      time: null,
      userList: [],
      searchTotal: 0
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
      this.pageNum = 1
      this.pageSize = val
      this.getShieldList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getShieldList()
    },
    handleSizeChange2(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getUserList(this.inputVal)
    },
    handleCurrentChange2(val) {
      this.pageNum = val
      this.getUserList(this.inputVal)
    },
    // 获取黑名单数据
    getShieldData() {
      this.loading = true
      this.$store.dispatch('jv/get', `users/${this.userId}/deny`).then((res) => {
        this.unbundUserData = []
        this.unbundUserData.push(Number(this.userId))
        res.forEach((v, i) => {
          this.unbundUserData.push(res[i].id)
        })
        this.shieldTotal = res.length
      }, e => this.handleError(e))
        .finally(() => {
          this.loading = false
        })
    },
    // 获取黑名单列表
    getShieldList() {
      this.loading = true
      const params = {
        'page[limit]': this.pageSize,
        'page[number]': this.pageNum
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}/deny`, { params }]).then((res) => {
        this.shieldList = res
      }, e => this.handleError(e))
        .finally(() => {
          this.loading = false
        })
    },
    changeshield(uid) {
      this.$confirm('是否解除屏蔽该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.unbundlingUser(uid)
      })
        .catch(() => {
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
        this.$message.success(this.$t('profile.unboundsucceed'))
        this.getShieldList()
        this.getShieldData()
      })
    },
    // 添加屏蔽
    addShield() {
      this.isSearch = true
      this.userList = []
      this.searchTotal = 0
    },
    onClickSearch(e) {
      this.inputVal = e.target.value
      this.unbundlingArry = []
      this.userList = []
      this.pageNum = 1
      this.getUserList(e.target.value)
    },
    searchinput() {
      this.userList = []
      this.searchTotal = 0
    },
    // 搜索用户列表
    getUserList(key) {
      this.loading2 = true
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[username]': `*${key}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then((res) => {
        const resp = res
        resp.forEach((v, i) => {
          resp[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        // 过滤搜索用户中已屏蔽的用户和当前登录用户
        const data = resp.filter(item => this.unbundUserData.indexOf(item.id) === -1)
        this.userList = data
        this.searchTotal = resp._jv.json.meta.total
      }, e => this.handleError(e))
        .finally(() => {
          this.loading2 = false
        })
    },
    // 屏蔽用户
    shieldUser(uid) {
      this.uid = uid
      this.$confirm('是否屏蔽该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleShield()
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消屏蔽'
          })
        })
    },
    handleShield() {
      const params = {
        _jv: {
          type: `users/${this.uid}/deny`
        }
      }
      this.$store.dispatch('jv/post', params).then(() => {
        if (this.unbundlingID(this.uid)) {
          this.unbundlingArry.splice(
            this.unbundlingArry.findIndex(item => item === this.uid),
            1
          )
        }
        this.inputVal = ''
        this.pageNum = 1
        this.getUserList('')
        this.getShieldData()
        this.getShieldList()
        this.isSearch = false
        this.$message.success(this.$t('profile.boundsucceed'))
      })
    },
    // 判断是否已解绑某个用户
    unbundlingID(uid) {
      if (this.unbundlingArry && this.unbundlingArry.includes(uid)) {
        return true
      }
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
    .hide {
      visibility: hidden;
    }
    .shieldnum {
      color: #777777;
      .searchusr {
        color: #000000;
        font-weight: bold;
      }
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
    .pagination {
      margin-top: 15px;
      margin-bottom: 15px;
      text-align: right;
      @media screen and (max-width: 1005px) {
        ::v-deep .el-pagination__sizes {
          display: none;
        }
      }
    }
  }
  .post-list {
    .delete {
      color: $font-color-grey;
      cursor: pointer;
      .svg-icon-delete {
        margin-right: 6px;
      }
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
.operabtn {
  color: #8590a6;
}

::v-deep .el-table {
  margin-top: 15px;
}
::v-deep.el-table .cell {
  padding-left: 10px;
  font-weight: 400;
  white-space: nowrap;
}
::v-deep .el-table thead {
  color: #303133;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #fafafa !important;
}
// ::v-deep .el-pagination .btn-prev {
//   margin-left: 65px;
// }
// ::v-deep .el-pagination__jump {
//   position: absolute;
//   right: 35px;
// }
::v-deep .el-button {
  color: #606266;
}
</style>
