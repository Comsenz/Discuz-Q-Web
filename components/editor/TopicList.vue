<template>
  <div class="container-search-list" @click.self="() => {}">
    <label>
      <input type="text" :value="searchValue" class="input-topic" :placeholder="$t('post.topicInputTip')" @input="searchTopics">
    </label>
    <div class="infinite-list-wrapper" style="overflow:auto">
      <ul v-infinite-scroll="load" infinite-scroll-disabled="disabled">
        <li v-if="searchList.length === 0 && searchValue && !loading" @click="emitValue(searchValue)">
          <span>#{{ searchValue }}#</span>
          <span>{{ $t('topic.newTopic') }}</span>
        </li>
        <li
          v-for="(topic, index) in searchList"
          :key="index"
          class="infinite-list-item"
          @click="emitValue(topic.content)"
        >
          <span>#{{ topic.content }}#</span>
          <svg-icon v-show="topic.recommended === 1" type="recommend" style="font-size: 16px" />
          <span>{{ topic.view_count + $t('topic.hot') }}</span>
        </li>
      </ul>
      <p v-if="loading" class="loading-tip">{{ $t('core.loading') }}</p>
      <!--      <p v-if="noMore" class="loading-tip">{{ $t('core.noMoreData') }}</p>-->
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
        'sort': 'recommended'
      }
      if (this.searchValue) params['filter[content]'] = this.searchValue
      if (!this.searchValue) params['filter[recommended]'] = 1
      return this.$store.dispatch('jv/get', ['topics', { params }]).then(data => {
        const { _jv: { json: { meta }}} = data
        this.loading = false
        this.searchTotal = meta.total
        if (data.length > 0) this.searchList.push(...data)
      }, e => this.handleError(e))
    },
    load() {
      // bug 避免无 searchList 是触发
      if (this.searchList.length > 0) {
        this.loading = true
        this.pageNumber += 1
        this.getTopics()
      }
    },
    emitValue(value) {
      this.$emit('selectedTopic', ' #' + value + '# ')
      this.searchValue = ''
      this.searchList = []
      this.getTopics()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  $font-color: #6D6D6D;
  .container-search-list {
    height: 245px;
    min-width: 300px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, .3);
    border-radius: 6px;
    background: white;
    .input-topic {
      height: 45px;
      line-height: 45px;
      width: 100%;
      border: none;
      background: #ffffff;
      padding: 0 10px;
      color: #6D6D6D;
      font-size: 14px;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      border-bottom: 1px solid $border-color-base;
    }
    > .infinite-list-wrapper {
      z-index: 100;
      background: #ffffff;
      min-width: 200px;
      max-height: 200px;
      overscroll-behavior: contain;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      ul {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        > li {
          display: flex;
          align-items: center;
          height: 50px;
          width: 100%;
          border-bottom: 1px solid $border-color-base;
          padding: 0 10px;
          color: #6D6D6D;
          font-size: 14px;
          cursor: pointer;
          > span {
            white-space: nowrap;
            line-height: 50px;
            margin-right: 15px;
            &:first-child {
              max-width: 700px;
              overflow: hidden;
              text-overflow: ellipsis;
              /*flex: 0 1 auto;*/
            }
            &:last-child {
              margin-left: auto;
              margin-right: 0;
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
