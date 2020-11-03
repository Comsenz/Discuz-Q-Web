<template>
  <div class="topic-content-container">
    <div class="container">
      <main class="cont-left">
        <div class="topic-detail">
          <div class="title">
            #<span class="topic-name">{{ topic.content }}</span>#
            <svg-icon v-if="topic.recommended === 1" type="recommend" />
          </div>
          <div class="info">
            <div class="item">{{ $t('home.topicCount', {total: topic.thread_count}) }}</div>
            <div class="item">{{ $t('home.topicViewCount', {total: topic.view_count }) }}</div>
            <share-popover type="topic">
              <div class="item hover">
                <svg-icon type="link" class="icon" />
                {{ $t("topic.share") }}
              </div>
            </share-popover>
            <nuxt-link to="/pages/topic/list" class="item hover">{{ $t('topic.allTopics') }}</nuxt-link>
          </div>
        </div>
        <div class="thread-list">
          <template v-for="(item, index) in threadsData">
            <!-- 语音贴 -->
            <post-item v-if="item.type === 4" :ref="`audio${ item && item.threadAudio && item.threadAudio._jv && item.threadAudio._jv.id}`" :key="index" :item="item" @audioPlay="audioPlay" />
            <post-item v-else :key="index" :item="item" />
          </template>
          <list-load-more
            :loading="loading"
            :has-more="hasMore"
            :page-num="pageNum"
            :length="threadsData.length"
            @loadMore="loadMore"
          />
        </div>
      </main>
      <aside class="cont-right">
        <div class="background-color">
          <advertising />
        </div>
        <div class="recommend-user background-color">
          <recommend-user :list="recommendUserData" />
        </div>
        <copyright :forums="forums" />
      </aside>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import env from '@/utils/env'
const threadInclude = 'user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser,question.beUser.groups,firstPost.postGoods,threadAudio'
export default {
  layout: 'custom_layout',
  name: 'TopicContent',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ store, query }, callback) {
    if (!env.isSpider) {
      callback(null, {})
    }
    const threadsParams = {
      include: threadInclude,
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'filter[isDisplay]': 'yes',
      'page[limit]': 10,
      'filter[topicId]': query.id
    }
    const userParams = {
      include: 'groups',
      limit: 4
    }
    try {
      const resData = {}
      const topicData = await store.dispatch('jv/get', [`topics/${query.id}`, {}])
      const threadsData = await store.dispatch('jv/get', ['threads', { params: threadsParams }])
      const recommendUser = await store.dispatch('jv/get', ['users/recommended', { params: userParams }])
      // 处理一下data
      resData.topic = { ...topicData }
      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData.slice(0, 10)
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        const _threadsData = threadsData._jv.json.data || []
        _threadsData.forEach((item, index) => {
          _threadsData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships && item.relationships.firstPost && item.relationships.firstPost.data,
            user: item.relationships && item.relationships.user && item.relationships.user.data,
            groups: item.relationships && item.relationships.groups && item.relationships.groups.data,
            _jv: { id: item.id }
          }
        })
        resData.threadsData = _threadsData
      }
      if (Array.isArray(recommendUser)) {
        resData.recommendUserData = recommendUser
      } else if (recommendUser && recommendUser._jv && recommendUser._jv.json) {
        const _recommendUser = recommendUser._jv.json.data || []
        _recommendUser.forEach((item, index) => {
          _recommendUser[index] = { ...item, ...item.attributes }
        })
        resData.recommendUserData = _recommendUser
      }
      callback(null, resData)
    } catch (error) {
      callback(null, {})
    }
  },
  data() {
    return {
      loading: false,
      threadsData: [], // 主题列表
      total: 0,
      recommendUserData: [], // 推荐用户列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      hasMore: false,
      topicId: '',
      topic: {}, // 话题详情
      currentAudioId: ''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    $route: 'init'
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.threadsData = []
      if (this.$route.query && this.$route.query.id) {
        this.topicId = this.$route.query.id
        this.getTopicDetail(this.$route.query.id)
        this.getThreadsList()
      }
    },
    // 话题详情
    getTopicDetail(id) {
      this.$store.dispatch('jv/get', [`topics/${id}`, {}]).then((res) => {
        if (res) {
          this.topic = res
        }
      })
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: threadInclude,
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[isDisplay]': 'yes',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[topicId]': `${this.topicId}`
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then((res) => {
        this.hasMore = res.length === this.pageSize
        this.total = res._jv.json.meta.threadCount
        if (this.pageNum === 1) {
          this.threadsData = res
          if (!this.address && res.length > 0) {
            this.address = res[0].address
          }
          if (!this.location && res.length > 0) {
            this.location = res[0].location
          }
        } else {
          this.threadsData = [...this.threadsData, ...res]
        }
        this.pageNum += 1
        if (res._jv) {
          this.hasMore = this.threadsData.length < res._jv.json.meta.threadCount
        }
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    loadMore() {
      this.getThreadsList()
    },
    // 语音互斥播放
    audioPlay(id) {
      if (this.currentAudioId && this.currentAudioId !== id) {
        this.$refs[`audio${this.currentAudioId}`][0].pause()
      }
      this.currentAudioId = id
    }
  },
  head() {
    return {
      title: this.forums && this.forums.set_site && this.forums.set_site.site_name ? this.topic.content + ' - ' + this.forums.set_site.site_name : this.topic.content,
      meta: [
        { hid: 'keywords', name: 'keywords', content: (this.topic.content) || '' },
        { hid: 'description', name: 'description', content: (this.topic.content) || '' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.app-cont{
  box-shadow: none;
}
.topic-content-container{
  background: #F4F5F6;
  width: 100%;
  .container{
    display:flex;
    width: 100%;
  }
  .cont-left{
    flex:auto;

    .topic-detail{
      @include background();
      margin-bottom: 15px;
      padding: 22px 20.5px 24px;
      .title{
        font-size:18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .info{
        color: $font-color-grey;
        display:flex;
        .item{
          margin-right: 40px;
          &.hover:hover{
            color: $color-blue-base;
            cursor: pointer;
          }
        }
      }
    }
    .thread-list{
      @include background();
    }
  }
  .cont-right{
    margin-left:15px;
    width:300px;
    flex: 0 0 300px;
    @media screen and ( max-width: 1005px ) {
      width:220px;
      flex: 0 0 220px;
    }
    .background-color{
      @include background();
       margin-bottom: 3px;
    }
    .category{
      margin-bottom: 0;
    }
  }
}
.empty-icon{
  margin-right: 6px;
}
</style>
