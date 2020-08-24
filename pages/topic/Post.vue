<template>
  <div class="page-post">
    <div class="title">发话题</div>
    <div class="category-list">
      <template v-for="(category, index) in categoryList">
        <span
          v-if="category.canCreateThread"
          :key="index"
          :class="{ category: true, selected: categorySelected === category}"
          @click="categorySelected = category"
        >{{ category.name }}</span>
      </template>
    </div>
    <editor />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  name: 'Post',
  mixins: [handleError],
  data() {
    return {
      categoryList: [],
      categorySelected: {}
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    getCategoryList() {
      this.$store.dispatch('jv/get', ['categories', {}]).then(res => {
        this.categoryList = res
      }, e => this.handleError(e))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.page-post {
  width: 100%;
  height: 100%;
  margin: 60px 140px 30px 140px;
  > .title {
    font-weight: bold;
    font-size: 26px;
  }
  > .category-list {
    margin-top: 50px;
    > .category {
      display: inline-block;
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      border-radius: 12.5px;
      background: #F7F7F7;
      font-size: 14px;
      color: #777777;
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      &.selected {
        color: white;
        background: $color-blue-base;
      }
    }
  }
}
</style>
