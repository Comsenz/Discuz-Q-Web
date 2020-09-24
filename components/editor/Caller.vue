<template>
  <message-box :title="$t('post.callFriends')" overflow="visible" @close="$emit('close')">
    <div class="top">
      <div class="container-selectedCaller">
        <div v-for="(username, index) in selectedFriends" :key="index" class="selectedCaller">
          <span>@ {{ username }}</span>
          <svg-icon
            style="font-size: 14px; cursor: pointer; fill: #6d6d6d"
            type="close"
            @click="selectedFriends.splice(selectedFriends.indexOf(username), 1)"
          />
        </div>
      </div>
      <div class="tip">{{ $t('post.searchFriends') }}</div>
      <div class="container-search-list">
        <label>
          <input :placeholder="$t('post.pleaseInput')" type="text" class="input-caller" @input="searchUser">
        </label>
        <div class="infinite-list-wrapper" style="overflow:auto">
          <ul v-infinite-scroll="load" infinite-scroll-disabled="disabled">
            <li
              v-for="(user, index) in searchList"
              :key="index"
              :class="{ 'infinite-list-item': true, selected: selectedFriends.indexOf(user.username) >= 0 }"
              @click="selectedFriends.indexOf(user.username) < 0 && selectedFriends.push(user.username)"
            >{{ user.username }}</li>
          </ul>
          <p v-if="loading" class="loading-tip">{{ $t('core.loading') }}</p>
          <p v-if="noMore" class="loading-tip">{{ $t('core.noMoreData') }}</p>
        </div>
      </div>
      <div class="friends">
        <div class="title">{{ $t('post.myFriends') }}</div>
        <div v-loading="friendsLoading" class="container-caller">
          <div
            v-for="(user, index) in friends"
            :key="index"
            :class="{ caller: true, selected: selectedFriends.indexOf(user.username) >= 0 }"
            @click="selectedFriends.indexOf(user.username) >= 0 ? selectedFriends.splice(selectedFriends.indexOf(user.username), 1) : selectedFriends.push(user.username)"
          >
            <avatar :user="user" size="30" round prevent-jump />
            <span>{{ user.username }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="container">
        <span class="text">{{ $t('post.chosen') + ' ' + selectedFriends.length + ' ' + $t('topic.personUnit') }}</span>
        <el-button size="medium" type="primary" @click="$emit('selectedCaller', formatValue())">{{ $t('post.confirmChoice') }}</el-button>
      </div>
    </div>
  </message-box>
</template>

<script>
const include = 'fromUser,toUser.groups'
import handleError from '@/mixin/handleError'
export default {
  name: 'Caller',
  mixins: [handleError],
  data() {
    return {
      friends: [],
      friendsLoading: true,
      selectedFriends: [],
      searchList: [],
      searchValue: '',
      searchTotal: 10,
      loading: false,
      setTimeoutId: null,
      pageLimit: 10,
      pageNumber: 1
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
    this.getFriends()
  },
  methods: {
    getFriends() {
      const params = { 'filter[type]': 2, include }
      return this.$store.dispatch('jv/get', ['follow', { params }]).then(data => {
        this.friendsLoading = false
        this.friends = data.filter(item => item.is_mutual === 1)
        this.friends = this.friends.map(item => item.fromUser)
      }, e => this.handleError(e))
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
        'page[number]': this.pageNumber
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(data => {
        const { _jv: { json: { meta }}} = data
        const { _jv: { json: { links }}} = data
        this.loading = false
        this.searchTotal = meta.total
        if (data.length > 0 && links.first.split('username')[1].split('%2A')[1] === this.searchValue) this.searchList.push(...data)
      }, e => this.handleError(e))
    },
    load() {
      // bug 避免无 searchList 是触发
      if (this.searchValue && this.searchList.length > 0) {
        this.loading = true
        this.pageNumber += 1
        this.getSearchList()
      }
    },
    formatValue() {
      let callerList = [...this.selectedFriends]
      callerList = callerList.map(item => item + ' ')
      return ' @' + callerList.join('@')
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

      > .container-caller {
        margin-top: 16px;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
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
            margin-left: 5px;
          }

          &.selected {
            background: #E5F2FF;
            border: 1px solid #CCDDFF;
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
