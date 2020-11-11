<template>
  <message-box :title="$t('post.callAnswer')" overflow="visible" @close="$emit('close')">
    <div class="top">
      <div class="container-selectedCaller">
        <div v-show="Object.keys(selectedFriend).length > 0" class="selectedCaller">
          <span>@ {{ selectedFriend.username }}</span>
          <svg-icon style="font-size: 14px; cursor: pointer; fill: #6d6d6d" type="close" @click="selectedFriend = {}" />
        </div>
      </div>
      <div class="tip">{{ $t('post.searchFriendsCanBeAsd') }}</div>
      <div class="container-search-list">
        <label>
          <input ref="inputCaller" :placeholder="$t('post.pleaseInput')" type="text" class="input-caller" @input="searchUser">
        </label>
        <div class="infinite-list-wrapper" style="overflow:auto">
          <ul v-infinite-scroll="load" infinite-scroll-disabled="disabled">
            <li
              v-for="(user, index) in searchList"
              :key="index"
              :class="{ 'infinite-list-item': true, selected: selectedFriend.username === user.username }"
              @click="selectFriendFromUl(user)"
            >{{ user.username }}</li>
          </ul>
          <p v-if="loading" class="loading-tip">{{ $t('core.loading') }}</p>
          <p v-if="noMore" class="loading-tip">{{ $t('core.noMoreData') }}</p>
        </div>
      </div>
      <div class="friends">
        <div class="title">{{ $t('post.recommendAnswer') }}</div>
        <div class="container-user-list">
          <div ref="preQaUser" v-loading="preQaUsers.loading" class="container-caller prePage">
            <div v-for="(user, index) in preQaUsers.list" :key="index" :class="{ caller: true, selected: selectedFriend.username === user.username }" @click="selectedFriend = user">
              <avatar :user="user" size="30" round prevent-jump />
              <span>{{ user.username }}</span>
            </div>
          </div>
          <div ref="currentQaUser" v-loading="currentQaUsers.loading" class="container-caller currentPage">
            <div v-for="(user, index) in currentQaUsers.list" :key="index" :class="{ caller: true, selected: selectedFriend.username === user.username }" @click="selectedFriend = user">
              <avatar :user="user" size="30" round prevent-jump />
              <span>{{ user.username }}</span>
            </div>
          </div>
          <div ref="nextQaUser" v-loading="nextQaUsers.loading" class="container-caller nextPage">
            <div v-for="(user, index) in nextQaUsers.list" :key="index" :class="{ caller: true, selected: selectedFriend.username === user.username }" @click="selectedFriend = user">
              <avatar :user="user" size="30" round prevent-jump />
              <span>{{ user.username }}</span>
            </div>
          </div>
        </div>
        <div v-if="totalPage" class="pagination">
          <div v-show="pageNumberPagination > 1" class="pageButton" @click="prePage">上一页</div>
          <span>{{ pageNumberPagination }}</span>
          <div v-show="pageNumberPagination < totalPage" class="pageButton" @click="nextPage">下一页</div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="container">
        <el-button :disabled="Object.keys(selectedFriend).length === 0" size="medium" type="primary" @click="$emit('selectedQaCaller', selectedFriend)">{{ $t('post.confirmChoice') }}</el-button>
      </div>
    </div>
  </message-box>
</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  name: 'Caller',
  mixins: [handleError],
  data() {
    return {
      preQaUsers: { loading: true, list: [] },
      currentQaUsers: { loading: true, list: [] },
      nextQaUsers: { loading: true, list: [] },
      preTimerId: null,
      nextTimerId: null,
      qaFriendsLoading: false,
      selectedFriend: {},
      searchList: [],
      searchValue: '',
      searchTotal: 10,
      loading: false,
      setTimeoutId: null,
      pageLimit: 10,
      pageNumber: 1,
      pageLimitPagination: 10,
      pageNumberPagination: 1,
      totalPage: ''
    }
  },
  computed: {
    noMore() {
      if (this.searchValue && !this.loading) {
        return this.searchList.length >= this.searchTotal
      }
      return false
    },
    disabled() {
      return this.loading || this.noMore
    }
  },
  mounted() {
    this.initUserList()
  },
  methods: {
    initUserList() {
      if (this.pageNumberPagination === 1) { // 第一页
        this.getUserList(this.pageNumberPagination, this.currentQaUsers)
        this.getUserList(this.pageNumberPagination + 1, this.nextQaUsers)
      } else if (this.pageNumberPagination === (this.totalPage || 10)) { // 最后一页
        this.getUserList(this.pageNumberPagination - 1, this.preQaUsers)
        this.getUserList(this.pageNumberPagination + 1, this.currentQaUsers)
      } else { // 中间页
        this.getUserList(this.pageNumberPagination - 1, this.preQaUsers)
        this.getUserList(this.pageNumberPagination, this.currentQaUsers)
        this.getUserList(this.pageNumberPagination + 1, this.nextQaUsers)
      }
    },
    getUserList(page, obj) {
      if (obj.list.length > 0) return // 减少请求
      obj.loading = true
      const params = {
        'filter[canBeAsked]': 'yes',
        'page[limit]': this.pageLimitPagination,
        'page[number]': page
      }
      return this.$store.dispatch('jv/get', ['/users', { params }]).then(data => {
        // TODO 响应页数判断
        const { _jv: { json: { meta }}} = data
        const xxx = JSON.parse(JSON.stringify(data))
        xxx.forEach(item => { item.username += `--${page}` }) // 检查页码用的
        this.totalPage = meta.pageCount
        obj.loading = false
        obj.list = xxx
      }, e => this.handleError(e))
    },
    prePage() {
      this.$refs.currentQaUser.classList.add('transfer-right')
      this.$refs.preQaUser.classList.add('transfer-right')
      setTimeout(() => {
        this.$refs.currentQaUser.classList.remove('transfer-right')
        this.$refs.preQaUser.classList.remove('transfer-right')
        this.nextQaUsers = this.currentQaUsers
        this.currentQaUsers = this.preQaUsers
        this.preQaUsers = { loading: true, list: [] }
      }, 300)
      this.pageNumberPagination -= 1
      if (this.preTimerId) window.clearTimeout(this.preTimerId)
      this.preTimerId = setTimeout(() => {
        this.preTimerId = null
        this.initUserList()
      }, 310)
    },
    nextPage() {
      this.$refs.currentQaUser.classList.add('transfer-left')
      this.$refs.nextQaUser.classList.add('transfer-left')
      setTimeout(() => {
        this.$refs.currentQaUser.classList.remove('transfer-left')
        this.$refs.nextQaUser.classList.remove('transfer-left')
        this.preQaUsers = this.currentQaUsers
        this.currentQaUsers = this.nextQaUsers
        this.nextQaUsers = { loading: true, list: [] }
      }, 300)
      this.pageNumberPagination += 1
      if (this.nextTimerId) window.clearTimeout(this.nextTimerId)
      this.nextTimerId = setTimeout(() => {
        this.initUserList()
        this.nextTimerId = null
      }, 310)
    },
    searchUser(e) {
      this.searchValue = e.target.value
      this.pageNumber = 1
      this.searchList = []
      if (this.setTimeoutId) window.clearTimeout(this.setTimeoutId)
      if (!this.searchValue) return
      this.setTimeoutId = setTimeout(() => {
        this.loading = true
        this.getSearchList()
        this.setTimeoutId = null
      }, 300)
    },
    getSearchList() {
      const params = {
        'filter[username]': '*' + this.searchValue + '*',
        'filter[status]': 'normal',
        'page[limit]': this.pageLimit,
        'page[number]': this.pageNumber,
        'filter[canBeAsked]': 'yes'
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(data => {
        const { _jv: { json: { meta }}} = data
        this.loading = false
        this.searchTotal = meta.total
        if (data.length > 0) this.searchList.push(...data)
      }, e => this.handleError(e))
    },
    load() {
      // bug 避免无 searchList 时触发
      if (this.searchValue && this.searchList.length > 0) {
        this.loading = true
        this.pageNumber += 1
        this.getSearchList()
      }
    },
    selectFriendFromUl(user) {
      this.selectedFriend = user
      this.clear()
    },
    clear() {
      this.$refs.inputCaller.value = ''
      this.searchValue = ''
      this.searchList = []
    }
  }
}
</script>

<style lang="scss" scoped>
 @import '@/assets/css/variable/color.scss';
 $font-color: #6D6D6D;
  .top {
    z-index: 100;
    padding: 40px;
    color: $font-color;

    > .container-selectedCaller {
      min-height: 45px;
      > .selectedCaller {
        display: inline-block;
        padding: 0 15px;
        background: $background-color-grey;
        border-radius: 17.5px;
        margin-right: 10px;
        margin-bottom: 10px;
        height: 35px;
        line-height: 35px;
        font-size: 16px;
      }
    }

    > .tip {
      font-size: 16px;
      margin-top: 10px;
    }

    > .container-search-list {
      margin-top: 10px;
      position: relative;
      height: 35px;
      width: 100%;
      .input-caller {
        height: 100%;
        width: 100%;
        border: none;
        background: transparent;
        color: #333;
        font-size: 14px;
        border-bottom: 1px solid $border-color-base;
      }
      > .infinite-list-wrapper {
        z-index: 100;
        position: absolute;
        top: 40px;
        left: 0;
        background: #ffffff;
        min-width: 200px;
        max-height: 300px;
        box-shadow: 0 5px 10px rgba(0, 0, 0, .3);
        border-radius: 3px;
        overscroll-behavior: contain;
        ul {
          > li {
            height: 50px;
            width: 100%;
            line-height: 50px;
            border-bottom: 1px solid $border-color-base;
            padding: 0 10px;
            color: #6D6D6D;
            font-size: 14px;
            cursor: pointer;
            white-space: nowrap;
            margin-right: 15px;
            &.selected {
              background: #E5F2FF;
            }
            &:hover {
              background: #EDEDED;
            }
          }
        }
        .loading-tip {
          height: 50px;
          width: 100%;
          line-height: 50px;
          padding: 0 10px;
          color: #333;
          font-size: 14px;
        }
      }
    }

    > .friends {
      margin-top: 20px;

      > .title {
        font-size: 16px;
      }
      > .pagination {
        display: flex;
        > .pageButton {
          cursor: pointer;
        }
      }
      > .container-user-list {
        margin-top: 16px;
        width: 740px;
        height: 150px;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        > .container-caller {
          width: 740px;
          height: 150px;
          display: inline-flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          position: absolute;
          &.prePage {
            top: 0;
            left: -740px
          }
          &.nextPage {
            top: 0;
            left: 740px
          }
          &.currentPage {
            top: 0;
            left: 0;
          }
          &.transfer-left {
            transform: translateX(-740px);
            transition: all .3s ease;
          }
          &.transfer-right {
            transform: translateX(740px);
            transition: all .3s ease;
          }
          > .caller {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            margin-right: 10px;
            margin-bottom: 10px;
            padding: 0 5px;
            height: 40px;
            line-height: 40px;
            min-width: 120px;
            background: $background-color-grey;
            font-size: 14px;
            border-radius: 20px;
            > span {
              margin: 0 5px;
            }

            &.selected {
              background: #E5F2FF;
              border: 1px solid #CCDDFF;
            }
          }
        }
      }
    }
  }

  .bottom {
    height: 55px;
    padding: 0 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background: $background-color-editor;

    > .container {
      height: 36px;

      .text {
        margin-right: 20px;
      }
    }

  }
</style>
