<template>
  <div class="index-top-conttainer">
    <div class="index-filter">
      <div v-for="(item, index) in filterQuery" :key="index" class="filter-btn" :class="{ 'active': query.filter === item.value }" @click="onClickFilter(item.value)">{{ item.label }}</div>
      <el-dropdown class="filter-dropdown" placement="bottom" @command="handleCommandType">
        <span class="el-dropdown-link" :class="{'active': query.filterType !== ''}">
          {{ $t('home.filterType') }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item,index) in filterType" :key="index" :command="item.value" :class="{'active': item.value === query.filterType}">{{ item.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="filter-dropdown" placement="bottom" @command="handleCommandSort">
        <span class="el-dropdown-link">
          {{ $t('core.sort') }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item,index) in filterSort" :key="index" :command="item.value" :class="{'active': item.value === query.filterSort}">{{ item.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <nuxt-link to="/" class="new-post">+{{ $t('profile.post') }}</nuxt-link>
  </div>
</template>
<script>
export default {
  data() {
    return {
      filterQuery: [{
        label: this.$t('home.all'),
        value: ''
      }, {
        label: this.$t('home.essence'),
        value: 'isEssence'
      }, {
        label: this.$t('home.followed'),
        value: 'followed'
      }, {
        label: '最新评论',
        value: 'new_comment'
      }],
      filterType: [{
        label: '不限',
        value: ''
      }, {
        label: this.$t('home.text'),
        value: 0
      }, {
        label: this.$t('home.invitation'),
        value: 1
      }, {
        label: this.$t('home.video'),
        value: 2
      }, {
        label: this.$t('home.picture'),
        value: 3
      }],
      filterSort: [{
        label: '不限',
        value: ''
      }, {
        label: '按发帖时间',
        value: 'article'
      }, {
        label: '按评论时间',
        value: 'comment'
      }],
      query: {
        filter: '',
        filterType: '',
        filterSort: ''
      }
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    }
  },
  methods: {
    onClickFilter(val) {
      if (val === 'followed' && (!this.userId || +this.userId === 0)) {
        if (process.client) {
          this.$message.error('请登录后再操作')
        } else {
          console.log('请登录后再操作')
        }
        return
      }
      this.query.filter = val
      this.$emit('onChangeFilter', val)
    },
    handleCommandType(command) {
      this.query.filterType = command
      this.$emit('onChangeType', command)
    },
    handleCommandSort(command) {
      this.query.filterSort = command
      this.$emit('onChangeSort', command)
    }
  }
}
</script>
<style lang="scss" scoped>
.index-top-conttainer{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}
.index-filter{
  display: flex;
  align-items: center;
  line-height: 1;
  .filter-btn{
    color:#8590A6;
    padding:8px 14px;
    margin-right: 5px;
    line-height: 1;
    cursor: pointer;
    &.active, &:hover{
      color:#1878F3;
      background: #E5F2FF;
      transition: all 0.2s ease-in-out;
    }
  }
  .filter-dropdown{
    margin: 0 0 0 10px;
    padding:8px 14px;
    color: #8590A6;
  }
}
.el-dropdown-link{
  outline: none;
  &.active{
    color:#1878F3;
  }
}

.new-post{
  background-color: #1878F3;
  width:70px;
  height:35px;
  border-radius:2px;
  color: #ffffff;
  line-height: 35px;
  text-align: center;
}
.el-dropdown-menu{
  padding: 0 10px;
  .el-dropdown-menu__item{
    border-top: 1px solid #EDEDED;
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
    color: #1878F3;
  }
}
</style>
