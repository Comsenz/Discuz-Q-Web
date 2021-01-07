<template>
  <div v-loading="loading" class="profile">
    <!-- 个人主页头部 -->
    <div v-show="headFixed" class="isFixed">
      <div class="headcon">
        <div class="hinfo">
          <Avatar :user="userInfo" :size="40" class="avatar" />
          <div class="profile-info">
            <span class="info-name">{{ userInfo.username || "" }}</span>
            <span class="info-actor">
              {{
                userInfo.groups &&
                  userInfo.groups[0] &&
                  userInfo.groups[0].isDisplay
                  ? userInfo.groupsName
                  : ""
              }}
            </span>
          </div>
        </div>
        <el-tabs
          v-model="activeName"
          class="register-select"
          type="border-card"
          @tab-click="changeactive"
        >
          <el-tab-pane
            :label="$t('profile.topic') + ` (${userInfo.threadCount || 0})`"
            name="1"
          />
          <el-tab-pane
            :label="
              $t('profile.question') + ` (${userInfo.questionCount || 0})`
            "
            name="2"
          />
          <el-tab-pane
            :label="$t('profile.likes') + ` (${userInfo.likedCount || 0})`"
            name="3"
          />
          <el-tab-pane
            :label="$t('profile.following') + ` (${userInfo.followCount || 0})`"
            name="4"
          />
          <el-tab-pane
            :label="$t('profile.followers') + ` (${userInfo.fansCount || 0})`"
            name="5"
          />
        </el-tabs>
        <div v-if="userId !== currentLoginId" class="profile-btn2">
          <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->
          <el-button
            type="primary"
            plain
            size="small"
            class="h-button2"
            :disabled="!currentLoginId"
            @click="
              userInfo.follow == 0
                ? addFollow(userInfo)
                : deleteFollow(userInfo)
            "
          >
            {{
              userInfo.follow == 0
                ? `+ ${$t("profile.following")}`
                : userInfo.follow == 1
                  ? $t("profile.followed")
                  : $t("profile.mutualfollow")
            }}</el-button>
          <el-button
            v-if="can_create_dialog"
            type="primary"
            plain
            size="small"
            class="h-button1"
            @click="chat"
          >{{ $t("profile.privateMessage") }}</el-button>
        </div>
      </div>
    </div>
    <!-- 个人主页头部2 -->
    <div v-if="userInfo && forums" class="profile-h">
      <Avatar :user="userInfo" :size="100" class="avatar" />
      <div class="profile-info">
        <span class="info-name">
          {{ userInfo.username || "" }}
        </span>
        <span class="info-actor">
          <svg-icon
            v-if="userInfo && userInfo.isReal"
            type="auth"
            class="auth-icon"
          />
          <span class="groupname">
            {{
              userInfo.groups &&
                userInfo.groups[0] &&
                userInfo.groups[0].isDisplay
                ? userInfo.groupsName
                : ""
            }}
          </span>
        </span>
        <p v-if="userInfo.signature" class="info-content">
          {{ userInfo.signature }}
        </p>
      </div>
      <div v-if="userId != currentLoginId" class="profile-btn">
        <div v-if="!isShield" class="shield" @click="handleShield">
          <svg-icon type="canshield" class="canshield-icon" />{{
            $t("profile.shield")
          }}
        </div>
        <div v-else class="shield" @click="unbundlingUser">
          <svg-icon type="unshield" class="unshield-icon" />{{
            $t("profile.deleteshield")
          }}
        </div>
        <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->
        <el-button
          v-if="userInfo"
          type="primary"
          plain
          size="small"
          class="h-button2"
          :disabled="!currentLoginId"
          @click="
            userInfo.follow == 0 ? addFollow(userInfo) : deleteFollow(userInfo)
          "
        >
          {{
            userInfo.follow == 0
              ? `+ ${$t("profile.following")}`
              : userInfo.follow == 1
                ? $t("profile.followed")
                : $t("profile.mutualfollow") || ""
          }}</el-button>
        <el-button
          v-if="can_create_dialog"
          type="primary"
          plain
          size="small"
          class="h-button1"
          @click="chat"
        >{{ $t("profile.privateMessage") }}</el-button>
        <el-button
          v-if="can_create_thread_question && canBeAsked"
          type="primary"
          plain
          size="small"
          class="h-button1"
          @click="ask"
        >向Ta提问</el-button>
      </div>
      <chat-box
        v-if="chatting"
        :dialog="dialog || {}"
        @close="chatting = false"
      />
    </div>
    <div v-if="userInfo && forums" class="profile-c">
      <div class="profile-cc">
        <el-tabs
          v-model="activeName"
          type="border-card"
          class="register-select"
          @tab-click="changeactive"
        >
          <el-tab-pane
            :label="$t('profile.topic') + ` (${userInfo.threadCount || 0})`"
            name="1"
          >
            <topic
              v-if="activeName === '1'"
              ref="topic"
              :user-id="userId"
              :thread-data="threadsData"
              @changeLike="changeLike"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="
              $t('profile.question') + ` (${userInfo.questionCount || 0})`
            "
            name="2"
          >
            <question
              v-if="activeName === '2'"
              ref="question"
              :user-id="userId"
              @changeLike="changeLike"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.likes') + ` (${userInfo.likedCount || 0})`"
            name="3"
          >
            <like
              v-if="activeName === '3'"
              ref="like"
              :user-id="userId"
              :likethreads-data="likethreadsData"
              @changeFollow="changeFollow"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.following') + ` (${userInfo.followCount || 0})`"
            name="4"
          >
            <following
              v-if="activeName === '4'"
              ref="following"
              :user-id="userId"
              @changeFollow="changeFollow"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.followers') + ` (${userInfo.fansCount || 0})`"
            name="5"
          >
            <follwers
              v-if="activeName === '5'"
              ref="followers"
              :user-id="userId"
              @changeFollow="changeFollow"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="profileside">
        <advertising />
        <recommend-user class="recomusr" />
        <copyright :forums="forums" />
      </div>
    </div>
  </div>
</template>

<script>
import { status } from '@/store/modules/jsonapi-vuex/index';
import handleError from '@/mixin/handleError';
import env from '@/utils/env';
// eslint-disable-next-line max-len
const threadInclude = `user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser,question.beUser.groups,firstPost.postGoods,threadAudio,vote`;
export default {
  name: 'Index',
  layout: 'custom_layout',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ store, params }, callback) {
    if (!env.isSpider) {
      callback(null, {});
    }
    const threadparams = {
      'filter[isDeleted]': 'no',
      sort: '-createdAt',
      include: threadInclude,
      'page[number]': 1,
      'page[limit]': 10,
      'filter[isApproved]': 1,
      'filter[userId]': params.id
    };
    const likethreadsparams = {
      include: threadInclude,
      'page[number]': 1,
      'page[limit]': 10,
      'filter[isApproved]': 1,
      'filter[user_id]': params.id
    };
    const askthreadsparams = {
      include: threadInclude,
      'page[number]': 1,
      'page[limit]': 20,
      'filter[isApproved]': 1,
      'filter[userId]': params.id,
      'filter[type]': 5,
      'filter[answer]': 'yes'
    };
    try {
      const resData = {};
      const threadsData = await store.dispatch('jv/get', [
        'threads',
        { params: threadparams }
      ]);
      const likethreadsData = await store.dispatch('jv/get', [
        'threads/likes',
        { params: likethreadsparams }
      ]);
      const askthreadData = await store.dispatch('jv/get', [
        'threads',
        { params: askthreadsparams }
      ]);
      const userInfo = await store.dispatch('jv/get', [
        `users/${params.id}`,
        {}
      ]);
      if (Object.keys(userInfo).length > 0) {
        resData.profilename = userInfo.username;
      }
      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData;
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        const _threadsData = threadsData._jv.json.data || [];
        _threadsData.forEach((item, index) => {
          _threadsData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships.firstPost.data,
            user: item.relationships.user.data,
            _jv: { id: item.id }
          };
        });
        resData.threadsData = _threadsData;
      }

      if (Array.isArray(likethreadsData)) {
        resData.likethreadsData = likethreadsData;
      } else if (
        likethreadsData
        && likethreadsData._jv
        && likethreadsData._jv.json
      ) {
        const _likethreadsData = likethreadsData._jv.json.data || [];
        _likethreadsData.forEach((item, index) => {
          _likethreadsData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships.firstPost.data,
            user: item.relationships.user.data,
            _jv: { id: item.id }
          };
        });
        resData.likethreadsData = _likethreadsData;
      }

      if (Array.isArray(askthreadData)) {
        resData.askthreadData = askthreadData;
      } else if (askthreadData && askthreadData._jv && askthreadData._jv.json) {
        const _askthreadData = askthreadData._jv.json.data || [];
        _askthreadData.forEach((item, index) => {
          _askthreadData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships.firstPost.data,
            user: item.relationships.user.data,
            _jv: { id: item.id }
          };
        });
        resData.askthreadData = _askthreadData;
      }
      callback(null, resData);
      // return { threadsData: threadsData }
    } catch (error) {
      callback(null, {
        _error__abc: {
          error_keys: Object.keys(error),
          error: String(error),
          errno: error.errno,
          code: error.code,
          syscall: error.syscall,
          address: error.address,
          port: error.port,
          config: error.config,
          request_domain: (error.request || {}).domain,
          request_keys: Object.keys(error.request || {}),
          response_keys: Object.keys(error.response || {})
        }
      });
    }
  },
  data() {
    return {
      userId: '', // 路由获取的用户id
      userInfo: '',
      current: '', // 当前激活的tab
      activeName: '1', // 默认激活tab
      profilename: '\u200E',
      can_create_dialog: false, // 创建私信权利
      can_create_thread_question: false, // 发起提问权利
      canBeAsked: false,
      headFixed: false,
      loading: false,
      dialog: { id: '', name: '' },
      chatting: false,
      offsetTop: 0,
      isShield: false,
      site_name: '',
      threadsData: [],
      likethreadsData: [],
      askthreadData: [],
      unbundlingArry: [], // 解绑用户组
      unbundUserData: [] // 已屏蔽用户组
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    },
    currentLoginId() {
      return this.$store.getters['session/get']('userId'); // 当前登录用户id
    }
  },
  watch: {
    $route() {
      this.$router.go(0);
    },
    forums: {
      handler(val) {
        if (val.other && val.other.can_create_dialog) {
          this.can_create_dialog = true;
        }
        if (val.set_site && val.set_site.site_name) {
          this.site_name = val.set_site.site_name;
        }
        if (val.other && val.other.can_create_thread_question) {
          this.can_create_thread_question = true;
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    const { current } = this.$route.query;
    this.userId = this.$route.params.id || '';
    this.current = current;
    this.activeName = this.current ? this.current : this.activeName;
  },
  mounted() {
    this.getAuth();
    this.getUserInfo(this.userId);
    window.addEventListener('scroll', this.handleScroll);
    if (this.currentLoginId) {
      this.getShieldData();
    }
    // this.$nextTick(() => {
    //   this.offsetTop = document.querySelector('.profile-h').offsetTop
    // })
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    ask() {
      this.$router.push(`/thread/post?type=5&beaskId=${this.userId}`);
    },
    handleScroll() {
      const scrollTop
        = window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop;
      if (scrollTop > 220) {
        this.headFixed = true;
      } else {
        this.headFixed = false;
      }
    },
    // tab激活
    changeactive() {},
    // 私信权限判断
    getAuth() {
      // 用户组等改变会改变私信权限
      if (this.forums.other && this.forums.other.can_create_dialog) {
        this.can_create_dialog = true;
      } else {
        this.can_create_dialog = false;
      }
    },
    // 获取用户信息
    getUserInfo(userId) {
      this.loading = true;
      const params = {
        include: 'groups,dialog'
      };
      status
        .run(() =>
          this.$store
            .dispatch('jv/get', [`users/${userId}`, { params }])
            .then(res => {
              if (res.isDeleted) {
                this.$message.error('用户不存在');
              } else {
                this.loading = false;
                this.dialog.id = res.dialog ? res.dialog._jv.id : 0;
                this.dialog.name = res.username;
                this.profilename = `${this.dialog.name
                  + this.$t('profile.myperson')} - ${this.site_name}`;
                this.userInfo = res;
                this.userInfo.groupsName = this.userInfo.groups
                  ? this.userInfo.groups[0].name
                  : '';
                this.canBeAsked = res.canBeAsked;
              }
            })
        )
        .catch(err => {
          this.loading = false;
          this.handleError(err);
        });
    },
    // 添加关注
    addFollow(userInfo) {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return;
        }
      }
      if (this.isShield2) {
        this.$message.error('你已被屏蔽');
        return;
      }
      const params = {
        _jv: {
          type: 'follow'
        },
        type: 'user_follow',
        to_user_id: userInfo.id.toString()
      };
      this.$store.dispatch('jv/post', params).then(
        () => {
          this.getUserInfo(this.userId);
          if (this.$refs.followers) {
            this.$refs.followers.getFollowerList('change');
          }
        },
        e => this.handleError(e)
      );
    },
    // 取消关注
    deleteFollow(userInfo) {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return;
        }
      }
      this.$store.dispatch('jv/delete', `follow/${userInfo.id}/1`).then(() => {
        this.getUserInfo(this.userId);
        if (this.$refs.followers) {
          this.$refs.followers.getFollowerList('change');
        }
      });
    },
    changeFollow(e) {
      this.getUserInfo(e.userId);
    },
    changeLike(e) {
      this.changeFollow(e);
      // this.$refs.like.changelike()
    },
    // 私信
    chat() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return;
        }
      }
      this.chatting = true;
    },
    // 当前登录用户已屏蔽用户
    // 获取黑名单数据
    getShieldData() {
      this.loading = true;
      this.$store
        .dispatch('jv/get', `users/${this.currentLoginId}/deny`)
        .then(
          res => {
            this.unbundUserData = [];
            this.unbundUserData.push(Number(this.currentLoginId));
            const ress = JSON.parse(JSON.stringify(res));
            ress.forEach((v, i) => {
              this.unbundUserData.push(ress[i].id);
            });
            const data = ress.filter(
              item => item.id.toString() === this.userId
            );
            this.isShield = data.length > 0;
          },
          e => this.handleError(e)
        )
        .finally(() => {
          this.loading = false;
        });
    },
    // 屏蔽用户
    handleShield() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return;
        }
      }
      const params = {
        _jv: {
          type: `users/${this.userId}/deny`
        }
      };
      this.$store.dispatch('jv/post', params).then(() => {
        this.getShieldData();
      });
    },
    // 解绑用户
    unbundlingUser() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return;
        }
      }
      this.$store
        .dispatch('jv/delete', `users/${this.userId}/deny`)
        .then(() => {
          this.$t('profile.unboundsucceed');
          this.getShieldData();
        });
    }
  },
  head() {
    return {
      title: this.profilename
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.profile {
  width: 100%;
  .profile-h {
    width: 100%;
    display: flex;
    padding: 20px;
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    .profile-info {
      flex: 4;
      margin-left: 20px;
      margin-right: 0px;
      margin-top: 20px;
      .info-name {
        font-size: 18px;
        font-weight: bold;
        margin-right: 5px;
        color: #000000;
        line-height: 24px;
        display: inline-block;
      }
      .info-actor {
        color: #aaaaaa;
        line-height: 19px;
        display: inline-block;
        .auth-icon {
          width: 11px;
          height: 13px;
          /* margin-right: 9px; */
          vertical-align: unset;
        }
        .groupname {
          vertical-align: text-top;
        }
      }
      .info-content {
        color: #333333;
        margin-top: 10px;
        width: 628px;
        overflow: hidden;
        /* height: 80px; */
        overflow-wrap: break-word;
        /* line-break: anywhere; */
        text-overflow: ellipsis;
        @media screen and (max-width: 1005px) {
          width: 548px;
        }
        @media screen and (max-width: 950px) {
          width: 458px;
        }
        @media screen and (max-width: 830px) {
          width: 372px;
        }
      }
    }
  }
  .profile-btn {
    display: flex;
    align-items: flex-end;
    position: relative;
    .shield {
      position: absolute;
      right: 1px;
      top: 24px;
      color: #b5b5b5;
      cursor: pointer;
      width: 100%;
      min-width: 80px;
      text-align: right;
    }
    .canshield-icon {
      width: 14px;
      height: 7px;
      margin-bottom: 2px;
      margin-right: 6px;
    }
    .unshield-icon {
      width: 14px;
      height: 11px;
      margin-bottom: 1px;
      margin-right: 6px;
    }
    .h-button1 {
      width: 70px;
      height: 35px;
      color: #1878f3;
      background: #ffffff !important;
      border: 1px solid #1878f3 !important;
      border-color: #1878f3 !important;
      font-size: 14px;
      border-radius: 0px;
      margin-left: 5px;
      padding: 9px 0px;
      &:hover {
        background: #e5f2ff !important;
        border-color: #d4e6fc !important;
      }
    }
    .h-button2 {
      width: 70px;
      height: 35px;
      color: #ffff;
      background: #1878f3;
      border-color: #1878f3;
      font-size: 14px;
      border-radius: 0px;
      padding: 9px 0px;
    }
  }
}
.profile-c {
  display: flex;
  .profileside {
    width: 300px;
    margin-top: 15px;
    .recomusr {
      background: white;
      // margin-top: 16px;
      border-radius: 5px;
    }
  }
  .register-select {
    border: none;
    background: #ffffff;
    box-shadow: none;
    border-radius: 5px;
    ::v-deep.el-tabs__header {
      padding: 8px 20px 5px;
      border-bottom: 1px solid #f5f5f5;
    }
  }
  .profile-cc {
    width: 700px;
    margin: 15px 15px 0 0;
  }
}
.isFixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.03);
  z-index: 8;
  .headcon {
    margin: 0 auto;
    padding: 15px 0;
    width: 1005px;
    height: 65px;
    display: flex;
    justify-content: space-between;
    @media screen and (max-width: 1005px) {
      width: 100%;
      min-width: 768px;
      padding: 15px 14px;
      height: 50px;
    }
    .hinfo {
      display: flex;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
      // flex: 1;
      margin-left: 10px;
      .info-name {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
        color: #000000;
      }
      .info-actor {
        font-size: 12px;
        color: #aaaaaa;
      }
    }
    .register-select {
      border: none;
      background: transparent;
      box-shadow: none;
      // flex: 3;
    }
    .profile-btn2 {
      // flex: 1;
      .h-button1 {
        width: 70px;
        height: 35px;
        color: #1878f3;
        background: #ffffff !important;
        border: 1px solid #1878f3 !important;
        border-color: #1878f3 !important;
        font-size: 14px;
        border-radius: 0px;
        margin-left: 0px;
        padding: 9px 0px;
      }
      .h-button2 {
        width: 70px;
        height: 35px;
        color: #ffff;
        background: #1878f3;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
        padding: 9px 0px;
      }
    }
    ::v-deep .el-tabs__content {
      display: none;
    }
    ::v-deep .el-tabs__header {
      border-bottom: none;
    }
  }
}
::v-deep.el-tabs {
  .el-tabs__header {
    background: transparent;
  }
  .el-tabs__header .el-tabs__item {
    border: none;
    color: #b5b5b5;
    padding: 0 52px 0 0px;
    font-size: 14px;
    transition: none;
  }
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 16px;
  }
  .el-tabs__header .el-tabs__item:hover {
    color: $color-blue-deep;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
    height: 40px;
  }
  .el-input__inner {
    border-radius: 2px;
  }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
}
</style>
