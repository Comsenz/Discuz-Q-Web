<template>
  <div class="global">
    <aside-header :author="author" :billboard="billboard" />
    <div class="recommend block">
      <div class="title">相关推荐</div>
      <div v-for="(item, index) in threeEssenceThread" :key="index" class="container-post">
        <div class="content-html" v-html="item.firstPost.summaryText" />
        <span class="view-count">{{ item.viewCount }} 读过</span>
        <a :href="'/topic/' + item._jv.id">去看看</a>
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
      default: () => {
      }
    }
  },
  data() {
    return {
      threeEssenceThread: [],
      EssenceThread: [],
      billboard: [
        { key: 'threadCount', count: '', text: '主题' },
        { key: 'likedCount', count: '', text: '点赞' },
        { key: 'fansCount', count: '', text: '粉丝' },
        { key: 'followCount', count: '', text: '关注了' }
      ]
    }
  },
  watch: {
    author: {
      handler(val) {
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
        console.log('Essence thread', data)
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
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .global {
    margin-left: 15px;
    background: transparent;

    > .block {
      margin-top: 15px;
      background: #fff;
      padding: 20px;

      > .title {
        font-size: 16px;
        font-weight: bolder;
        color: #6D6D6D;
      }

      &:last-child {
        background: transparent;
      }
    }

    > .recommend {
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
