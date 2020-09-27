<template>
  <div class="notice-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="(item, index) in noticeTypeList" :key="index" :name="item.value">
        <span slot="label">
          <el-badge :is-dot="item.value !== 'chat' && userInfo.typeUnreadNotifications && userInfo.typeUnreadNotifications[item.value] ? true : false" class="badge-item">{{ item.label }}</el-badge>
        </span>
      </el-tab-pane>
    </el-tabs>
    <div class="notice-list">
      <template v-if="activeName === 'chat'">
        <chat-item v-for="(item, index) in dialog.list" :key="index" :user-id="userInfo.id" :item="item" @show-chat-box="showChatBox" />
        <list-load-more :loading="dialog.loading" :has-more="dialog.hasMore" :page-num="dialog.pageNum" :surplus="surplus" :length="dialog.list.length" @loadMore="loadMoreDialog" />
      </template>
      <template v-else>
        <div v-for="(item, index) in noticeList" :key="index" class="notice-item">
          <notice-item :item="item" />
          <div class="delete" @click="handleDelete(item.id, index)">
            <svg-icon type="close" />
          </div>
        </div>
        <list-load-more :loading="loading" :has-more="hasMore" :page-num="pageNum" :surplus="surplus" :length="noticeList.length" @loadMore="loadMore" />
      </template>
    </div>
    <!-- 聊天框 -->
    <chat-box v-if="chatting" :dialog="dialogData || {}" @close="closeChatBox" />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  layout: 'center_layout',
  mixins: [handleError],
  data() {
    return {
      activeName: 'chat',
      // 消息类型
      noticeTypeList: [
        {
          label: this.$t('notice.message'),
          value: 'chat'
        }, {
          label: this.$t('notice.relate'),
          value: 'related'
        }, {
          label: this.$t('notice.reply'),
          value: 'replied'
        }, {
          label: this.$t('notice.like'),
          value: 'liked'
        }, {
          label: this.$t('notice.reward'),
          value: 'rewarded'
        }, {
          label: this.$t('notice.system'),
          value: 'system'
        }
      ],
      noticeList: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: false,
      surplus: 0, // 剩余多少
      dialog: {
        pageNum: 1,
        pageSize: 10,
        list: [],
        hasMore: false,
        loading: false
      },
      chatting: false,
      dialogData: { id: '', name: '' }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.getDialogList()
  },
  methods: {
    // 获取会话列表
    getDialogList() {
      this.dialog.loading = true
      const params = {
        'include': 'dialogMessage,sender,recipient,sender.groups,recipient.groups',
        'sort': '-dialogMessageId',
        'page[number]': this.dialog.pageNum,
        'page[limit]': this.dialog.pageSize
      }
      this.$store.dispatch('jv/get', ['dialog', { params }]).then(async(data) => {
        this.dialog.hasMore = data.length === this.dialog.pageSize
        if (this.dialog.pageNum === 1) {
          this.dialog.list = data
        } else {
          this.dialog.list = [...this.dialog.list, ...data]
        }
        if (data._jv && data._jv.json && data._jv.json.meta) {
          this.dialog.hasMore = this.dialog.list.length < data._jv.json.meta.total
          this.surplus = data._jv.json.meta.total - this.dialog.list.length
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.dialog.loading = false
      })
    },
    // 获取消息列表
    getNoticeList() {
      this.loading = true
      const params = {
        'filter[type]': this.activeName,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      // 财务通知里面包括提现信息
      if (this.activeName === 'rewarded') {
        params['filter[type]'] = 'rewarded,withdrawal'
      }
      this.$store.dispatch('jv/get', ['notification', { params }]).then(async(data) => {
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.noticeList = data
        } else {
          this.noticeList = [...this.noticeList, ...data]
        }
        if (data._jv && data._jv.json && data._jv.json.meta) {
          this.hasMore = this.noticeList.length < data._jv.json.meta.total
          this.surplus = data._jv.json.meta.total - this.noticeList.length
        }
        try {
          await this.$store.dispatch('user/getUserInfo', this.userInfo.id)
        } catch (err) {
          console.log('getuUserInfo err', err)
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore() {
      this.pageNum += 1
      this.getNoticeList()
    },
    loadMoreDialog() {
      this.dialog.pageNum += 1
      this.getDialogList()
    },
    // 删除
    handleDelete(id, index) {
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel')
      }).then(_ => {
        this.$store.dispatch('jv/delete', `notification/${id}`).then(res => {
          if (res) {
            this.$message.success(this.$t('topic.deleteSuccess'))
            this.noticeList.splice(index, 1)
          }
        })
      }).catch(_ => {})
    },
    handleClick(e) {
      if (e.name !== 'chat') {
        this.pageNum = 1
        this.noticeList = []
        this.getNoticeList()
      } else {
        this.dialog.pageNum = 1
        this.dialog.list = []
        this.getDialogList()
      }
    },
    // 显示聊天框
    showChatBox(item) {
      if (!item) return
      this.dialogData.id = item._jv ? item._jv.id : ''
      if (this.userId !== item.sender_user_id) {
        this.dialogData.name = item.sender ? item.sender.username : ''
      } else {
        this.dialogData.name = item.recipient ? item.recipient.username : ''
      }
      this.chatting = true
    },
    // 关闭聊天框
    closeChatBox() {
      this.chatting = false
      this.dialog.pageNum = 1
      this.getDialogList()
    }
  },
  head() {
    return {
      title: this.$t('profile.notice')
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.notice-container{
  .el-tabs ::v-deep{
    .el-tabs__header{
      margin: 0;
    }
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid $line-color-base;
      padding-bottom:5px;
      padding-left: 30px;
    }
    .el-tabs__item{
      font-size: 16px;
      color: #B5B5B5;
      &.is-active{
        color:#000;
        font-size: 18px;
        font-weight:bold;
      }
    }
  }
  .badge-item{
    ::v-deep .el-badge__content.is-fixed{
      top: 10px;
    }
  }
  .notice-list{
    min-height: 400px;
    .notice-item{
      position: relative;
      transition: all 0.2s ease-in-out;
      &:hover{
        background: #FAFBFC;
        .delete{
          display: block;
        }
      }
      .delete{
        display: none;
        position: absolute;
        top:32px;
        right: 32px;
        cursor: pointer;
        color: #6d6d6d;
      }
    }
  }
}
</style>
