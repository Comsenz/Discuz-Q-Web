<template>
  <div class="container-search-list">
    <label>
      <input type="text" class="input-topic" :placeholder="$t('post.topicInputTip')" @input="searchTopics">
    </label>
    <div class="infinite-list-wrapper" style="overflow:auto">
      <ul v-infinite-scroll="load" infinite-scroll-disabled="disabled">
        <li v-if="searchList.length === 0 && searchValue && !loading" @click="$emit('selectedTopic', ' #' + searchValue + '# ')">
          <span>#{{ searchValue }}#</span>
          <span>{{ $t('topic.newTopic') }}</span>
        </li>
        <li
          v-for="(topic, index) in searchList"
          :key="index"
          class="infinite-list-item"
          @click="$emit('selectedTopic', ' #' + topic.content + '# ')"
        >
          <span>#{{ topic.content }}#</span>
          <span>{{ topic.view_count + $t('topic.hot') }}</span>
        </li>
      </ul>
      <p v-if="loading" class="loading-tip">{{ $t('core.loading') }}</p>
      <p v-if="noMore" class="loading-tip">{{ $t('core.noMoreData') }}</p>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  name: 'TopicList',
  mixins: [handleError],
  data() {
    return {
      searchValue: '',
      searchList: [],
      searchTotal: 0,
      pageNumber: 1,
      pageLimit: 5,
      setTimeoutId: null,
      loading: false
    }
  },
  computed: {
    noMore() {
      if (!this.loading) {
        return this.searchList.length >= this.searchTotal
      }
      return false
    },
    disabled() {
      return this.loading || this.noMore
    }
  },
  mounted() {
    this.getTopics()
  },
  methods: {
    searchTopics(e) {
      if (this.setTimeoutId) window.clearTimeout(this.setTimeoutId)
      this.searchValue = e.target.value
      this.pageNumber = 1
      this.searchList = []
      this.setTimeoutId = setTimeout(() => {
        this.loading = true
        this.getTopics()
        this.setTimeoutId = null
      }, 300)
    },
    getTopics() {
      const params = {
        'page[limit]': this.pageLimit,
        'page[number]': this.pageNumber,
        'sort': '-viewCount'
      }
      if (this.searchValue) params['filter[content]'] = this.searchValue
      return this.$store.dispatch('jv/get', ['topics', { params }]).then(data => {
        const { _jv: { json: { meta }}} = data
        this.loading = false
        this.searchTotal = meta.total
        if (data.length > 0) this.searchList.push(...data)
      }, e => this.handleError(e))
    },
    load() {
      console.log('load')
      // bug 避免无 searchList 是触发
      if (this.searchList.length > 0) {
        this.loading = true
        this.pageNumber += 1
        this.getTopics()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  $font-color: #6D6D6D;
  .container-search-list {
    min-height: 45px;
    min-width: 200px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, .3);
    border-radius: 8px;
    &::after {
      content: '';
      display: block;
      width: 20px;
      height: 20px;
      position: absolute;
      border-radius: 5px;
      transform: rotate(45deg);
      background: #ffffff;
      border-left: 1px solid $border-color-base;
      border-top: 1px solid $border-color-base;
      top: -10px;
      left: 20px;
      z-index: 2;
    }
    .input-topic {
      height: 45px;
      line-height: 45px;
      width: 100%;
      border: none;
      background: #ffffff;
      padding: 0 10px;
      color: #6D6D6D;
      font-size: 14px;
      border-bottom: 1px solid $border-color-base;
    }
    > .infinite-list-wrapper {
      background: #ffffff;
      min-width: 200px;
      max-height: 200px;
      overscroll-behavior: contain;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      ul {
        display: flex;
        flex-direction: column;
        > li {
          display: inline-flex;
          justify-content: space-between;
          height: 50px;
          width: 100%;
          border-bottom: 1px solid $border-color-base;
          padding: 0 10px;
          color: #6D6D6D;
          font-size: 14px;
          cursor: pointer;
          > span {
            line-height: 50px;
            &:last-child {
              margin-left: 20px;
            }
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
</style>
