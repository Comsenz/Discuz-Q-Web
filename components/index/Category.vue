<template>
  <div class="category-container">
    <div v-for="(item, index) in list" :key="index" class="category-item" :class="{'active': selectId === item._jv.id}" @click="onChange(item._jv.id)">
      <i v-if="selectId === item._jv.id" class="el-icon-arrow-left arrow-icon" />
      <div class="flex">
        <div class="title">{{ item.name }}</div>
        <div class="count">{{ item.thread_count }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [],
      selectId: 0
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    getCategoryList() {
      this.$store.dispatch('jv/get', ['categories', {}]).then(res => {
        const resData = [...res] || []
        this.list = [
          {
            _jv: {
              id: 0
            },
            name: this.$t('topic.whole')
          },
          ...resData
        ]
        console.log(this.list)
      }, e => {
        this.$message.error('列表加载失败')
      })
    },
    onChange(id) {
      this.selectId = id
      this.$emit('onChange', id)
    }
  }
}
</script>
<style lang="scss" scoped>
$colurBlue: #1878F3;
.category-container{
  padding: 0 20px;
  .category-item{
    position: relative;
    padding: 16px 0;
    border-bottom: 1px solid #F5F5F5;
    line-height: 1;
    font-size: 16px;
    color: #6D6D6D;
    cursor: pointer;
    &.last-child{
      border-bottom: none;
    }
    &.active{
      color: #1878F3;
    }
    .flex{
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title{
        flex: 1;
        margin-right: 10px;
      }
      .count{
        color: #B5B5B5;
        font-size: 14px
      }
    }
  }
  .arrow-icon{
    position: absolute;
    top:50%;
    left: -12px;
    transform: translateY(-50%);
    color: $colurBlue;
    font-size: 8px;
  }

}

</style>
