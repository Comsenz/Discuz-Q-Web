<template>
  <div class="container">
    <main class="cont-left">
      <div class="search-header">
        <div class="result-count">
          {{ $t("search.find") }}
          <span v-if="q" class="keyword">"{{ q }}"</span>
          {{ $t("search.searchresult") }} {{ userCount + threadCount }}
          {{ $t("topic.item") }}
        </div>
        <create-post-popover />
      </div>
      <div class="count">
        {{ $t("search.users") + userCount + $t("search.usercount") }}
      </div>
      <div class="user-list">
        <div class="user-flex">
          <nuxt-link
            v-for="(item, index) in userList.slice(0, userPageSize)"
            :key="index"
            :to="`/user/${item.id}`"
            class="user-item"
          >
            <avatar :user="item" :size="45" />
            <div class="info">
              <div class="name text-hidden">{{ item.username }}</div>
              <div class="fans">
                {{ $t("profile.followers") }} {{ item.fansCount || 0 }}
              </div>
            </div>
          </nuxt-link>
        </div>
        <loading v-if="userLoading" />
        <template v-else>
          <div
            v-if="userCount > userPageSize"
            class="user-load-more"
            @click="toUserList"
          >
            {{ $t("topic.showMore") }}{{ $t("search.users") }}
          </div>
          <div v-if="userList.length === 0" class="no-more">
            <svg-icon type="empty" class="empty-icon" />{{
              $t("search.norelatedusersfound")
            }}
          </div>
        </template>
      </div>
      <div class="count">
        {{ $t("home.invitation") }} {{ threadCount }} {{ $t("topic.item") }}
      </div>
      <!-- 长列表优化 -->
      <dynamic-scroller :items="threadsList" :min-item-size="120" page-mode>
        <template v-slot="{ item, index, active }">
          <dynamic-scroller-item
            :item="item"
            :active="active"
            :data-index="index"
          >
            <post-item
              v-if="item.type === 4"
              :ref="
                `audio${item &&
                  item.threadAudio &&
                  item.threadAudio._jv &&
                  item.threadAudio._jv.id}`
              "
              :key="index"
              :item="item"
              :lazy="false"
              @audioPlay="audioPlay"
            />
            <post-item
              v-else
              :key="index"
              :item="item"
              :lazy="false"
              @showVideoFn="showVideoFn"
            />
          </dynamic-scroller-item>
        </template>
        <template #after>
          <list-load-more
            :loading="loading"
            :has-more="hasMore"
            :page-num="pageNum"
            :length="threadsList.length"
            @loadMore="loadMore"
          />
        </template>
      </dynamic-scroller>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category
          :post-loading="loading"
          :list="categoryData"
          @onChange="onChangeCategory"
        />
      </div>
      <advertising />
      <copyright :forums="forums" />
    </aside>
    <!-- 视频播放弹窗 -->
    <video-pop
      v-if="showVideoPop"
      :cover-url="threadVideo.cover_url"
      :url="threadVideo.media_url"
      @remove="showVideoPop = false"
    />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError';
import env from '@/utils/env';
import head from '@/mixin/head';
export default {
  layout: 'custom_layout',
  name: 'Search',
  mixins: [head, handleError],
  // 异步数据用法
  async asyncData({ store }, callback) {
    if (!env.isSpider) {
      callback(null, {});
    }
    try {
      const resData = {};
      const categoryData = await store.dispatch('jv/get', ['categories', {}]);
      if (Array.isArray(categoryData)) {
        resData.categoryData = categoryData;
      } else if (categoryData && categoryData._jv && categoryData._jv.json) {
        const _categoryData = categoryData._jv.json.data || [];
        _categoryData.forEach((item, index) => {
          _categoryData[index] = {
            ...item,
            ...item.attributes,
            _jv: { id: item.id }
          };
        });
        resData.categoryData = _categoryData;
      }
      callback(null, resData);
    } catch (error) {
      callback(null, {});
    }
  },
  data() {
    return {
      title: this.$t('search.search'),
      loading: false,
      categoryData: [],
      threadsList: [], // 主题列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      q: '',
      hasMore: false,
      threadCount: 0,
      userCount: 0,
      userList: [],
      userLoading: false,
      userPageSize: 3,
      currentAudioId: '',
      showVideoPop: false, // 显示视频弹窗
      threadVideo: {} // 当前显示的视频信息
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  watch: {
    $route: 'init'
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.$route.query.categoryId) {
        this.categoryId = this.$route.query.categoryId;
      }
      if (this.$route.query.q) {
        this.q = this.$route.query.q;
        this.getUserList();
        this.pageNum = 1;
        this.getThreadsList();
      }
    },
    getUserList() {
      this.userList = [];
      this.userLoading = true;
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[limit]': this.userPageSize,
        'filter[status]': 'normal',
        'filter[username]': `*${this.q}*`
      };
      this.$store
        .dispatch('jv/get', ['users', { params }])
        .then(
          res => {
            const data = res;
            res
              && data.forEach((v, i) => {
                data[i].groupName = v.groups[0] ? v.groups[0].name : '';
              });
            this.userCount = data._jv.json.meta.total;
            this.userList = data;
          },
          e => {
            this.handleError(e);
          }
        )
        .finally(() => {
          this.userLoading = false;
        });
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true;
      const params = {
        // eslint-disable-next-line max-len
        include: `user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser,question.beUser.groups,firstPost.postGoods,threadAudio`,
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[q]': this.q,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      };
      this.$store
        .dispatch('jv/get', ['threads', { params }])
        .then(
          res => {
            this.hasMore = res.length === this.pageSize;
            this.threadCount = res._jv.json.meta.threadCount;
            const _res = res;
            Array.isArray(_res)
              && _res.forEach(item => {
                item.id = item._jv && item._jv.id;
              });
            if (this.pageNum === 1) {
              this.threadsList = _res;
            } else {
              this.threadsList = [...this.threadsList, ..._res];
            }
            this.pageNum += 1;
            if (_res._jv) {
              this.hasMore
                = this.threadsList.length < _res._jv.json.meta.threadCount;
            }
          },
          e => {
            this.handleError(e);
          }
        )
        .finally(() => {
          this.loading = false;
        });
    },
    loadMore() {
      this.getThreadsList();
    },
    // 重新加载列表
    reloadThreadsList() {
      this.pageNum = 1;
      this.threadsList = [];
      this.getThreadsList();
    },
    // 点击分类
    onChangeCategory(id) {
      this.categoryId = id;
      this.reloadThreadsList();
    },
    toUserList() {
      if (this.$route.query.q) {
        this.$router.push(`/site/search-user?value=${this.$route.query.q}`);
      }
    },
    // 语音互斥播放
    audioPlay(id) {
      if (this.currentAudioId && this.currentAudioId !== id) {
        this.$refs[`audio${this.currentAudioId}`][0].pause();
      }
      this.currentAudioId = id;
    },
    // 视频播放弹窗
    showVideoFn(video) {
      this.threadVideo = video;
      this.showVideoPop = true;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
@mixin background() {
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
}
.app-cont {
  box-shadow: none;
}
.container {
  display: flex;
  background: #f4f5f6;
  width: 100%;
  .cont-left {
    flex: auto;
    @include background();
    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      border-bottom: 1px solid #efefef;
      .result-count {
        font-size: 16px;
        margin-right: 20px;
        .keyword {
          color: #fa5151;
        }
      }
    }
    .count {
      font-size: 16px;
      padding: 18px 20px 0;
    }
    .user-list {
      padding: 18px 20px;
      border-bottom: 1px solid #efefef;
      .user-flex {
        display: flex;
        align-items: center;
      }
      .user-item {
        display: flex;
        align-items: center;
        margin-right: 80px;
        @media screen and (max-width: 1005px) {
          margin-right: 20px;
        }
        .info {
          margin-left: 10px;
          .name {
            font-size: 16px;
            max-width: 100px;
            @media screen and (max-width: 1005px) {
              max-width: 80px;
            }
          }
          .fans {
            color: #8590a6;
            margin-top: 2px;
          }
        }
      }
      .user-load-more {
        color: #8590a6;
        margin-top: 40px;
        display: inline-block;
        cursor: pointer;
      }
    }
  }
  .cont-right {
    margin-left: 15px;
    width: 300px;
    flex: 0 0 300px;
    @media screen and (max-width: 1005px) {
      width: 220px;
      flex: 0 0 220px;
    }
    .background-color {
      @include background();
      margin-bottom: 16px;
    }
    .category {
      margin-bottom: 0;
    }
  }
}
.empty-icon {
  margin-right: 6px;
}
</style>
