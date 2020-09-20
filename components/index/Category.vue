<template>
  <div v-if="categoryList.length > 0" class="category-container">
    <div v-for="(item, index) in categoryList" :key="index" class="category-item" :class="{'active': selectId === (item._jv && item._jv.id), 'loading': postLoading}" @click="onChange(item._jv && item._jv.id)">
      <i v-if="selectId === (item._jv && item._jv.id)" class="el-icon-arrow-left arrow-icon" />
      <div class="flex">
        <div class="title">{{ item.name }}</div>
        <div class="count">{{ item.thread_count }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
export default {
  name: 'Category',
  mixins: [handleError],
  props: {
    postLoading: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      selectId: 0,
      categoryList: []
    }
  },
  watch: {
    list: {
      handler(val) {
        let thread_count = 0 // 计算全部帖子数
        val.forEach(item => {
          thread_count += item.thread_count
        })
        this.categoryList = [{ _jv: { id: 0 }, name: this.$t('topic.whole'), thread_count: thread_count }, ...val]
      },
      deep: true
    }
  },
  mounted() {
    if (this.list.length === 0) {
      this.getCategoryList()
    } else {
      let thread_count = 0 // 计算全部帖子数
      this.list.forEach(item => {
        thread_count += item.thread_count
      })
      this.categoryList = [{ _jv: { id: 0 }, name: this.$t('topic.whole'), thread_count: thread_count }, ...this.list]
    }
    if (this.$route.query.categoryId) {
      this.onChange(this.$route.query.categoryId)
    }
  },
  methods: {
    getCategoryList() {
      this.$store.dispatch('jv/get', ['categories', {}]).then(res => {
        const resData = [...res] || []
        let thread_count = 0 // 计算全部帖子数
        resData.forEach(item => {
          thread_count += item.thread_count
        })
        this.categoryList = [{ _jv: { id: 0 }, name: this.$t('topic.whole'), thread_count: thread_count }, ...resData]
      }, e => {
        this.handleError(e)
      })
    },
    onChange(id) {
      if (this.postLoading) return
      this.selectId = id
      this.$emit('onChange', id)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.category-container{
  padding: 5px 20px;
  margin-bottom: 16px;
  // max-height: 490px;
  // overflow-y: auto;
  @media screen and ( max-width: 1005px ) {
    padding: 0 14px;
    // max-height: 470px;
  }
  .category-item{
    position: relative;
    padding: 13.5px 0;
    border-bottom: 1px solid #F5F5F5;
    font-size: 16px;
    color: #6D6D6D;
    cursor: pointer;
    &:last-child{
      border-bottom: none;
    }
    &:hover,&.active{
      color: $color-blue-base;
    }
    &.loading{
      cursor: no-drop;
    }
    @media screen and ( max-width: 1005px ) {
      font-size: 14px;
    }
    .flex{
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title{
        flex: 1;
        margin-right: 10px;
        @include text-hidden();
      }
      .count{
        color: #B5B5B5;
        font-size: 14px
      }
    }
  }
  .arrow-icon{
    position: absolute;
    top:55%;
    left: -13px;
    transform: translateY(-50%);
    color: $color-blue-base;
    font-size: 12px;
  }

}

</style>
