<template>
  <div class="global">
    <aside-header
      :author="author"
      :billboard="billboard"
      :follow-status="followStatus"
      :follow-loading="followLoading"
      :can-opera="canOpera"
      @follow="follow"
      @unFollow="unFollow"
    />
    <div v-loading="threeEssenceThread.length === 0" class="recommend block">
      <div class="title">{{ $t('topic.recommend') }}</div>
      <div v-for="(item, index) in threeEssenceThread" :key="index" class="container-post">
        <div v-if="item.title && item.firstPost.summaryText" class="content-html">{{ item.title || item.firstPost.summaryText }}</div>
        <div v-else class="content-html" v-html="item.firstPost.summary" />
        <span class="view-count">{{ item.viewCount }} {{ $t('topic.readAlready') }}</span>
        <a target="_blank" :href="'/topic/index?id=' + item._jv.id">{{ $t('topic.toWatch') }}</a>
      </div>
    </div>
    <advertising style="margin-top: 15px;margin-bottom:3px;" />
    <copyright />
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
      default: () => {}
    }
  },
  data() {
    return {
      threeEssenceThread: [],
      EssenceThread: [],
      followStatus: 0,
      followLoading: false,
      billboard: [
        { key: 'threadCount', count: '', text: this.$t('home.thread') },
        { key: 'likedCount', count: '', text: this.$t('topic.getLike') },
        { key: 'fansCount', count: '', text: this.$t('profile.followers') },
        { key: 'followCount', count: '', text: this.$t('home.followed') }
      ]
    }
  },
  computed: {
    canOpera() {
      if (this.author.id) {
        const userId = this.$store.getters['session/get']('userId')
        return userId > 0 && userId !== this.author.id.toString()
      }
      return false
    }
  },
  watch: {
    author: {
      handler(val) {
        if (Object.keys(val).length === 0) return
        this.followStatus = val.follow
        this.billboard.forEach(item => {
          item.count = val[item.key]
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
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
      if (this.followLoading) return
      this.followLoading = true
      const params = { _jv: { type: `follow` }, 'to_user_id': this.author.id.toString() }
      return this.$store.dispatch('jv/post', params).then(res => {
        this.followLoading = false
        this.followStatus = res.is_mutual === 0 ? 1 : 2
      }, e => this.handleError(e))
    },
    unFollow() {
      if (this.followLoading) return
      this.followLoading = true
      this.$store.dispatch('jv/delete', `follow/${this.author.id}/1`).then(() => {
        this.followLoading = false
        this.followStatus = 0
      })
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
      min-height: 100px;
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
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
          word-break: break-all;
          margin-top: 10px;
          margin-bottom: 10px;
          font-size: 16px;
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
          &:hover {
            color: $color-blue-deep
          }
        }
      }

    }
  }

  @media screen and ( max-width: 1005px ) {
    .global {
      width: 220px;
    }
  }

</style>
