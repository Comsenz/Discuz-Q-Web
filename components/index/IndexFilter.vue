<template>
  <div class="index-top-conttainer">
    <div class="index-filter">
      <template v-for="(item, index) in filterQuery">
        <div
          v-if="item.isShow"
          :key="index"
          class="filter-btn"
          :class="{ 'active': query.filter === item.value }"
          @click="onClickFilter(item.value)"
        >
          {{ item.label }}
        </div>
      </template>
      <el-dropdown class="filter-dropdown" placement="bottom" @command="handleCommandType">
        <span class="el-dropdown-link" :class="{'active': query.filterType !== ''}">
          {{ $t('home.filterType') }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(item,index) in filterType"
            :key="index"
            :command="item.value"
            :class="{'active': item.value === query.filterType}"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="filter-dropdown" placement="bottom" @command="handleCommandSort">
        <span class="el-dropdown-link" :class="{'active': query.filterSort !== ''}">
          {{ $t('core.sort') }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(item,index) in filterSort"
            :key="index"
            :command="item.value"
            :class="{'active': item.value === query.filterSort}"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <create-post-popover />
  </div>
</template>
<script>
export default {
  name: 'IndexFilter',
  data() {
    return {
      // 筛选按钮
      filterQuery: [{
        label: this.$t('home.all'), // 所有
        value: '',
        isShow: true
      }, {
        label: this.$t('home.essence'), // 精华
        value: 'isEssence',
        isShow: true
      }, {
        label: this.$t('home.followed'), // 已关注
        value: 'followed',
        isShow: false
      }],
      // 类型
      filterType: [{
        label: this.$t('home.noLimit'), // 不限
        value: ''
      }, {
        label: this.$t('home.text'), // 文本
        value: 0
      }, {
        label: this.$t('home.invitation'), // 帖子
        value: 1
      }, {
        label: this.$t('home.video'), // 视频
        value: 2
      }, {
        label: this.$t('home.picture'), // 图片
        value: 3
      }, {
        label: this.$t('home.voice'), // 语音
        value: 4
      }, {
        label: this.$t('home.question'), // 问答
        value: 5
      }, {
        label: this.$t('home.product'), // 商品
        value: 6
      }],
      // 排序
      filterSort: [{
        label: this.$t('home.noLimit'), // 不限
        value: ''
      }, {
        label: this.$t('home.sortCreatedAt'), // 发布时间
        value: '-createdAt'
      }, {
        label: this.$t('home.sortUpdatedAt'), // 更新时间
        value: '-updatedAt'
      }],
      query: {
        filter: '',
        filterType: '',
        filterSort: ''
      }
    };
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId');
    }
  },
  watch: {
    userId(val) {
      // 登录才显示“已关注”
      if (val > 0) {
        this.filterQuery[2].isShow = true;
      } else {
        this.filterQuery[2].isShow = false;
      }
    }
  },
  mounted() {
    if (this.userId > 0) {
      this.filterQuery[2].isShow = true;
    } else {
      this.filterQuery[2].isShow = false;
    }
  },
  methods: {
    // 点击筛选，传值给父组件
    onClickFilter(val) {
      if (val === 'followed' && (!this.userId || +this.userId === 0)) {
        if (process.client) {
          this.$message.error(this.$t('core.not_authenticated'));
        }
        return;
      }
      this.query.filter = val;
      this.$emit('onChangeFilter', val);
    },
    // 点击类型筛选，传值给父组件
    handleCommandType(command) {
      this.query.filterType = command;
      this.$emit('onChangeType', command);
    },
    // 点击排序，传值给父组件
    handleCommandSort(command) {
      this.query.filterSort = command;
      this.$emit('onChangeSort', command);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.index-top-conttainer{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 10px;
}
.index-filter{
  display: flex;
  align-items: center;
  line-height: 1;
  .filter-btn{
    color:#8590A6;
    padding:10.5px 16px;
    margin-right: 15px;
    line-height: 1;
    cursor: pointer;
    &.active{
      color: $color-blue-base;
      background: #E5F2FF;
      transition: all 0.2s ease-in-out;
      border-radius: 2px;
      font-weight: bold;
    }
    &:hover{
      color: $color-blue-base;
    }
    @media screen and ( max-width: 1005px ) {
      margin-right: 0;
    }
  }
  .filter-dropdown{
    margin: 0 0 0 10px;
    padding:8px 14px;
    color: #8590A6;
    cursor: default;
    @media screen and ( max-width: 1005px ) {
      margin: 0;
    }
  }
}
.el-dropdown-link{
  outline: none;
  &.active, &:hover{
    color: $color-blue-base;
  }
}

.el-dropdown-menu{
  padding: 5px 10px;
  .el-dropdown-menu__item{
    border-top: 1px solid rgba(237,237,237,0.6);
    min-width: 100px;
    padding: 0;
    color: #6D6D6D;
    text-align: center;
    &:first-child{
      border-top: 0;
    }
  }
  .el-dropdown-menu__item:not(.is-disabled):hover,.el-dropdown-menu__item:not(.is-disabled).active {
    background-color: transparent;
    color:  $color-blue-base;
  }
}
</style>
