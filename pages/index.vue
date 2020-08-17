<template>
  <div class="container">
    <main class="cont-left">
      <index-filter @onChangeFilter="onChangeFilter" @onChangeType="onChangeType" @onChangeSort="onChangeSort" />
      <div class="list-top">
        <div v-for="(item, index) in stickyList" :key="index" class="list-top-item">
          <div class="top-label">{{ $t('home.sticky') }}</div>
          <nuxt-link :to="'/user/login'" class="top-title text-hidden">
            <template v-if="item.type === 1">
              {{ item.title }}
            </template>
            <div v-else v-html="formatRichText(item.firstPost.summary)" />
          </nuxt-link>
        </div>
      </div>
      <div class="new-post">
        <div class="new-post-cont">有 3 条新发布的内容 <span class="refresh">点击刷新</span></div>
      </div>
      <loading v-if="loading" />
      <div class="post-list">
        <post-item v-for="(item, index) in threadsList" :key="index" :detail="item" />
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category @onChange="onChangeCategory" />
      </div>
      <div class="adv background-color">
        <img src="@/assets/qrcode.png" alt="二维码" class="qrcode">
        <div class="adv-info">
          <div class="adv-title">微信小程序版</div>
          DISCUZ! 分享、交流、共融
        </div>
      </div>
      <div class="recommend-user background-color">
        <recommend-user />
      </div>
    </aside>
  </div>
</template>

<script>
import s9e from '@/utils/s9e'
export default {
  layout: 'custom_layout',
  name: 'Index',
  data() {
    return {
      loading: false,
      stickyList: [], // 置顶主题列表
      threadsList: [], // 主题列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      threadType: '', // 主题类型 0普通 1长文 2视频 3图片（'' 不筛选）
      threadEssence: '' // 是否精华帖
    }
  },
  created() {
    this.getThreadsSticky()
    this.getThreadsList()
  },
  methods: {
    // 置顶主题
    getThreadsSticky() {
      const params = {
        'filter[isSticky]': 'yes',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        include: ['firstPost']
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(data => {
        this.stickyList = [...data]
        console.log(this.stickyList)
      })
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'filter[isSticky]': 'no',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[type]': this.threadType,
        'filter[isEssence]': this.threadEssence,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      if (this.threadType !== null) {
        params['filter[type]'] = this.threadType
      }
      Object.keys(params).forEach(item => {
        !params[item] && delete params[item]
      })
      this.$store.dispatch('jv/get', ['threads', { params }]).then(res => {
        console.log(res)
        this.threadsList = res
      }, e => {
        this.$message.error('列表加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    // 重新加载列表
    reloadThreadsList() {
      this.pageNum = 1
      this.threadsList = []
      this.getThreadsList()
    },
    // 点击分类
    onChangeCategory(id) {
      this.categoryId = id
      this.reloadThreadsList()
      this.stickyList = []
      this.getThreadsSticky()
    },
    // 筛选
    onChangeFilter(val) {
      console.log('val', val)
      this.threadEssence = ''
      if (val === 'isEssence') {
        this.threadEssence = 'yes'
      }
      this.reloadThreadsList()
    },
    // 类型
    onChangeType(val) {
      this.threadType = val
      this.reloadThreadsList()
    },
    // 排序
    onChangeSort() {

    },
    // 处理富文本里的图片宽度自适应
    // 1.去掉img标签里的style、width、height属性
    // 2.img标签添加style属性：max-width:100%;height:auto
    // 3.修改所有style里的width属性为max-width:100%
    // 4.去掉<br/>标签			 * @param html			 * @returns {void|string|*}
    formatRichText(html) {
      // eslint-disable-next-line no-param-reassign
      return s9e.parse(html)
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin background(){
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
}
.app-cont{
  box-shadow: none;
}
.container{
  display:flex;
  background: #F4F5F6;
  width: 100%;
  .cont-left{
    flex:auto;
    @include background();
    .list-top-item{
      border-bottom: 1px solid #EFEFEF;
      line-height: 1;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      .top-label{
        color:#8590A6;
        margin-right: 20px;
      }
      .top-title{
        color: #000;
        flex: 0 0 60%;
      }
      &:hover{
        .top-title{
          color: #FF0000;
        }
      }
    }
    .new-post{
      padding: 10px 20px;
      .new-post-cont{
        background: #FDF6EC;
        border-radius: 5px;
        text-align:center;
        line-height: 19px;
        color: #E6A23C;
        padding:8px 0;
        .refresh{
          color: #1878F3;
        }
      }

    }
  }
  .cont-right{
    margin-left:15px;
    width:300px;
    flex: 0 0 300px;
    .background-color{
      @include background();
       margin-bottom: 16px;
    }
    .adv{
      padding: 15px;
      display: flex;
      align-items: center;
      .qrcode{
        width:70px;
        height:70px;
        margin-right:6px;
      }
      .adv-title{
        font-size:18px;
        font-weight:bold;
        margin-bottom:6px;
      }
    }
  }
}
</style>
