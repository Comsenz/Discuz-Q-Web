<template>
  <div class="global">
    <aside-header :author="author" :billboard="billboard" :followed="followed" @follow="follow" @unFollow="unFollow" @chat="chat" />
    <div class="recommend block">
      <div class="title">{{ $t('topic.recommend') }}</div>
      <div v-for="(item, index) in threeEssenceThread" :key="index" class="container-post">
        <div class="content-html" v-html="item.firstPost.summaryText" />
        <span class="view-count">{{ item.viewCount }} {{ $t('topic.readAlready') }}</span>
        <a :href="'/topic/' + item._jv.id">{{ $t('topic.toWatch') }}</a>
      </div>
    </div>
    <advertising />
    <copyright :forums="forums" />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  name: 'TopicAside',
  mixins: [handleError],
  props: {
    author: {
      type: Object,
      default: () => {
      }
    },
    forums: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      threeEssenceThread: [],
      EssenceThread: [],
      followed: false,
      billboard: [
        { key: 'threadCount', count: '', text: this.$t('home.thread') },
        { key: 'likedCount', count: '', text: this.$t('topic.getLike') },
        { key: 'fansCount', count: '', text: this.$t('profile.followers') },
        { key: 'followCount', count: '', text: this.$t('home.followed') }
      ]
    }
  },
  watch: {
    author: {
      handler(val) {
        this.followed = (val.follow === 1)
        this.billboard.forEach(item => {
          item.count = val[item.key]
        })
      },
      deep: true
    }
  },
  created() {
    this.getEssenceThread()
  },
  methods: {
    getEssenceThread() {
      return this.$store.dispatch('jv/get', [`threads`, {
        params: {
          'filter[isApproved]': 1,
          'filter[isEssence]': 'yes',
          'filter[isDeleted]': 'no'
        }
      }]).then(data => {
        this.EssenceThread = [...data]
        while (this.threeEssenceThread.length < 3) {
          const index = this.getRandom(this.EssenceThread.length)
          this.threeEssenceThread.push(this.EssenceThread[index])
          this.EssenceThread.splice(index, 1)
        }
      }, e => this.handleError(e))
    },
    getRandom(length) {
      return Math.floor(Math.random() * length)
    },
    follow() {
      const params = { _jv: { type: `follow` }, 'to_user_id': this.author.id.toString() }
      return this.$store.dispatch('jv/post', params).then(() => {
        this.followed = true
      }, e => this.handleError(e))
    },
    unFollow() {
      return this.$store.dispatch('jv/delete', [`follow/${this.author.id}/1`, {
        params: {}
      }]).then(() => {
        this.followed = false
      }, e => this.handleError(e))
    },
    chat() {
      // TODO 实时聊天
      alert('chat')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .global {
    width: 300px;
    margin-left: 15px;
    background: transparent;

    > .recommend {
      border-radius: 3px;
      margin-top: 15px;
      background: #fff;
      padding: 20px;
      > .title {
        font-size: 16px;
        font-weight: bolder;
        color: #6D6D6D;
      }
      > .container-post {
        padding-bottom: 20px;
        border-bottom: 1px solid $border-color-base;

        &:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        > .content-html {
          margin-top: 10px;
          margin-bottom: 10px;

          ::v-deep p {
            font-size: 16px;
          }

          ::v-deep img {
            height: 22px;
          }

          ::v-deep a {
            color: $color-blue-base;
          }
        }

        > .view-count {
          margin-top: 10px;
          color: $font-color-grey;
          font-size: 12px;
        }

        > a {
          float: right;
          font-size: 12px;
          color: $color-blue-base;
        }
      }

    }

  }

</style>
