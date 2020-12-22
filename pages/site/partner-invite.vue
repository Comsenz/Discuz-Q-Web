<template>
  <div v-loading="loading" class="infocontainer">
    <div v-if="forums && forums.users" class="info">
      <!-- 有偿加入 -->
      <h2 :class="normal ? 'info-title' : 'info-title tcolor'">
        {{ codeTitle }}
      </h2>
      <!-- 站点内容部分-->
      <div class="content-info abs">
        <!-- 付费信息标题 -->
        <p class="payinfo-title">{{ codeTips }}</p>
        <!-- 创建时间 -->
        <p>
          <span class="color">{{ $t("site.creationtime") }}</span>
          <span class="workdate">{{
            forums.set_site && forums.set_site.site_install
          }}</span>
        </p>
        <!-- 圈子主人 -->
        <p>
          <span class="date color">{{ $t("site.circlemaster") }}</span>
          <span
            v-if="forums.set_site && forums.set_site.site_author"
            class="img"
          >
            <Avatar
              :user="{
                username:
                  (forums.set_site &&
                    forums.set_site.site_author &&
                    forums.set_site.site_author.username) ||
                  '',
                avatarUrl:
                  (forums.set_site &&
                    forums.set_site.site_author &&
                    forums.set_site.site_author.avatar) ||
                  ''
              }"
              :size="30"
              :round="true"
              class="avatar"
            />
          </span>
          <span v-else>
            <avatar
              :user="{ id: 0, username: '无', avatarUrl: '' }"
              :prevent-jump="true"
              :size="30"
              :round="true"
            />
          </span>
          <span class="workdate">{{
            (forums.set_site &&
              forums.set_site.site_author &&
              forums.set_site.site_author.username) ||
              ""
          }}</span>
        </p>
        <!-- 用户 -->
        <p>
          <span class="date color">{{ $t("home.theme") }}</span>
          <span class="workdate bold">{{
            forums.other && forums.other.count_users
          }}</span>
        </p>
        <p class="member-img">
          <span v-for="(item, index) in forums.users" :key="index" class="img">
            <Avatar :user="item" :size="30" :round="true" class="avatar" />
          </span>
        </p>
        <!-- 内容数量 -->
        <p>
          <span class="date color">{{ $t("manage.contents") }}</span>
          <span class="workdate bold">{{
            forums.other && forums.other.count_threads
          }}</span>
        </p>
        <!-- 站点模式 -->
        <p>
          <span class="date color ">{{ $t("site.circlemode") }}</span>
          <span class="workdate">
            {{
              forums.set_site && forums.set_site.site_mode === "pay"
                ? $t("site.paymentmode") +
                  "， " +
                  "¥" +
                  ((forums.set_site && forums.set_site.site_price) || 0) +
                  $t("post.yuan") +
                  "， " +
                  $t("site.periodvalidity") +
                  ((forums.set_site && forums.set_site.site_expire) || 0) +
                  $t("site.day")
                : $t("site.publicmode")
            }}
          </span>
        </p>
        <!-- 我的权利 -->
        <div class="myauthority">
          <div class="myauth-t ">{{ $t("site.myauthority") }}</div>
          <div class="myauth-c">
            <span v-for="(item, index) in permission" :key="index">{{
              $t(`permission.${item.permission}`)
            }}</span>
          </div>
        </div>

        <!-- 站点介绍 -->
        <p>
          <span class="date color rel">{{
            $t("manage.siteintroduction")
          }}</span>
          <span class="workdate2">{{
            forums.set_site && forums.set_site.site_introduction
          }}</span>
        </p>
      </div>
      <p>
        <span class="bold">{{
          inviteData.user && inviteData.user.username
        }}</span>
        邀请您，作为
        <span class="bold">{{
          `[ ${
            inviteData.group && inviteData.group.name
              ? inviteData.group.name
              : ""
          } ]`
        }}</span>加入
        <span class="bold">{{
          forums.set_site && forums.set_site.site_name
        }}</span>
        {{ $t("site.site") }}
      </p>
      <div>
        <el-button type="primary" class="r-button" @click="check">
          {{ $t("site.accepttheinvitationandbecome") }}
          {{ inviteData.group && inviteData.group.name }}
        </el-button>
      </div>
      <!-- 验证提示 -->
      <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <span>{{ codeTips }}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <div v-if="threadsData.length > 0" class="thread">
      <div class="threadtitle">部分内容预览</div>
      <template v-for="(item, index) in threadsData">
        <!-- 语音贴 -->
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
          :infoimage="true"
          :can-detail="canDetail"
          @audioPlay="audioPlay"
        />
        <post-item
          v-else
          :key="index"
          :item="item"
          :infoimage="true"
          :can-detail="canDetail"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { status } from '@/store/modules/jsonapi-vuex/index';
import loginAbout from '@/mixin/loginAbout';
import handleError from '@/mixin/handleError';
import head from '@/mixin/head';
export default {
  name: 'PartnerInvite',
  mixins: [loginAbout, handleError, head],
  data() {
    return {
      isLogin: this.$store.getters['session/get']('isLogin'),
      pageSize: 7,
      pageNum: 1,
      userList: [],
      threadsData: [],
      searchText: '',
      permission: [], // 权利
      inviteData: {}, // 邀请信息
      dialogVisible: false,
      codeTips: '',
      codeTitle: '',
      inviteCode: '', // 邀请码,
      normal: false,
      loading: true,
      canDetail: false,
      currentAudioId: '',
      title: this.$t('site.inviteJoin')
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  mounted() {
    const { code } = this.$route.query;
    this.inviteCode = code;
    this.getInviteInfo(this.inviteCode);
    this.loadThreads();
    if (
      (this.forums && this.forums.set_site && this.forums.set_site.site_mode)
      || !this.userId
    ) {
      this.canDetail = true;
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(() => {
          done();
        })
        .catch(() => {});
    },
    getInviteInfo(code) {
      status.run(() =>
        this.$store
          .dispatch('jv/get', `invite/${code}`)
          .then(res => {
            this.inviteData = res;
            this.check2();
            const permission = res.group.permission;
            const permissionfilter = permission.filter(item => {
              return item.permission !== 'createThread';
            });
            this.permission = permissionfilter.slice(0, 3);
          })
          .catch(e => {
            this.check2();
            console.log(e);
          })
      );
    },
    // 验证码验证
    check() {
      // 区分普通邀请和管理员邀请
      if (this.inviteCode && this.inviteCode.length !== 32) {
        if (!this.inviteData.id) {
          this.codeTips = this.$t('site.codenotfound');
          this.dialogVisible = true;
        } else {
          this.submit();
        }
        return;
      }
      // 处理邀请码状态 status 0 失效  1 未使用  2 已使用 3 已过期
      const statusVal
        = this.inviteData.status || this.inviteData.status === 0
          ? this.inviteData.status
          : 'error';
      switch (statusVal) {
        case 0: {
          this.codeTips = this.$t('site.codeinvalid');
          this.dialogVisible = true;
          break;
        }
        case 1: {
          this.submit();
          break;
        }
        case 2: {
          this.codeTips = this.$t('site.codeused');
          this.dialogVisible = true;

          break;
        }
        case 3: {
          this.codeTips = this.$t('site.codeexpired');
          this.dialogVisible = true;

          break;
        }
        case 'error': {
          this.codeTips = this.$t('site.codenotfound');
          this.dialogVisible = true;

          break;
        }
        default:
          return '';
      }
    },
    // 进入站点时邀请码的验证
    check2() {
      // 区分普通邀请和管理员邀请
      if (this.inviteCode && this.inviteCode.length !== 32) {
        if (!this.inviteData.id) {
          this.codeTitle = this.$t('site.codenotfound2');
          this.codeTips = this.$t('site.codenotfound');
        } else {
          this.codeTitle = this.$t('manage.payJoin');
          this.codeTips = this.$t('manage.inviteInfoTitle');
          this.normal = true;
          // this.submit()
        }
        return;
      }
      const statusVal
        = this.inviteData.status || this.inviteData.status === 0
          ? this.inviteData.status
          : 'error';
      switch (statusVal) {
        case 0: {
          this.codeTitle = this.$t('site.codeinvalid2');
          this.codeTips = this.$t('site.codeinvalid');
          break;
        }
        case 1: {
          this.codeTitle = this.$t('manage.payJoin');
          this.codeTips = this.$t('manage.inviteInfoTitle');
          this.normal = true;
          break;
        }
        case 2: {
          this.codeTitle = this.$t('site.codeused2');
          this.codeTips = this.$t('site.codeused');
          break;
        }
        case 3: {
          this.codeTitle = this.$t('site.codeexpired2');
          this.codeTips = this.$t('site.codeexpired');
          break;
        }
        case 'error': {
          this.codeTitle = this.$t('site.codenotfound2');
          this.codeTips = this.$t('site.codenotfound');
          break;
        }
        default:
          return '';
      }
    },
    // 验证码提交
    submit() {
      this.dialogVisible = false;
      // 未登陆的情况
      if (!this.$store.getters['session/get']('isLogin')) {
        // 需要引入mixins loginauth.js
        this.handleLogin('/', this.inviteCode);
      } else {
        // 已经登陆的情况
        this.$router.push('/');
      }
    },
    // 加载当前主题数据
    loadThreads() {
      this.loading = true;
      const params = {
        'filter[isDeleted]': 'no',
        sort: '-createdAt',
        // eslint-disable-next-line max-len
        include: `user,user.groups,firstPost,firstPost.images,firstPost.postGoods,category,threadVideo,threadAudio,question,question.beUser,question.beUser.groups`,
        'page[number]': 1,
        'page[limit]': 10,
        'filter[isApproved]': 1,
        'filter[isSite]': 'yes'
      };
      status
        .run(() => this.$store.dispatch('jv/get', ['threads', { params }]))
        .then(
          res => {
            this.loading = false;
            this.threadsData = [...this.threadsData, ...res];
          },
          e => {
            this.handleError(e);
          }
        )
        .finally(() => {
          this.loading = false;
        });
    },
    // 语音互斥播放
    audioPlay(id) {
      if (this.currentAudioId && this.currentAudioId !== id) {
        this.$refs[`audio${this.currentAudioId}`][0].pause();
      }
      this.currentAudioId = id;
    }
  }
};
</script>
<style lang="scss" scoped>
.bold {
  font-weight: bold;
}
.abs {
  position: relative;
}
.rel {
  position: absolute;
}
.color {
  color: #909399;
  margin-right: 15px;
}
.infocontainer {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.info {
  display: flex;
  width: 400px;
  margin-top: 62px;
  flex-direction: column;
  @media screen and (max-width: 1005px) {
    width: 308px;
  }
  .info-title {
    height: 35px;
    font-size: 26px;
  }
  .tcolor {
    color: #fa5151;
  }
  .payinfo {
    border-bottom: 1px solid #efefef;
    margin-top: 34px;
    color: #000000;
    padding-bottom: 30px;
  }
  .payinfo-title {
    font-size: 18px;
    font-family: Microsoft YaHei;
    font-weight: 400;
  }
  .date {
    width: 56px;
    text-align: right;
  }
  span {
    display: inline-block;
  }
  p {
    margin-top: 15px;
  }
  .paymoney {
    text-align: center;
    font-weight: bold;
    font-size: 16px;
  }
  .workdate {
    text-align: center;
    font-size: 16px;
    font-family: Microsoft YaHei;
  }
  .workdate2 {
    font-weight: 400;
    word-break: break-all;
    font-family: Microsoft YaHei;
    color: #6d6d6d;
    font-size: 14px;
    margin-left: 75px;
  }
  .workdate3 {
    font-weight: 400;
    word-break: break-all;
    font-family: Microsoft YaHei;
    color: #6d6d6d;
    font-size: 12px;
    margin-left: 75px;
    background: #efefef;
    margin-top: 5px;
  }
  .content-info {
    margin-top: 34px;
    .img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      vertical-align: bottom;
      margin-right: 5px;
      img {
        border-radius: 50%;
        width: 30px;
        vertical-align: middle;
      }
    }
    .member-img {
      margin-left: 76px;
    }
  }
  .r-button {
    width: 300px;
    margin-top: 20px;
    margin-bottom: 60px;
    background: #1878f3;
  }
  .myauthority {
    margin-top: 15px;
    display: flex;
    .myauth-t {
      flex: 1;
      color: #909399;
    }
    .myauth-c {
      flex: 4;
      font-size: 12px;
      font-family: Microsoft YaHei;
      margin-right: 11px;
      color: #777777;
      span {
        margin-right: 5px;
        background: #f7f7f7;
        padding: 4.5px 10px;
      }
    }
  }
}
.thread {
  margin-top: 145px;
  overflow-y: auto;
  width: 500px;
  height: 477px;
  background: #fbfbfb;
  margin-left: 35px;
  @media screen and (max-width: 1005px) {
    width: 395px;
  }
  .threadtitle {
    font-size: 14px;
    color: #000000;
    margin-left: 20px;
    margin-top: 13px;
  }
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 100px;
  -webkit-border-radius: 100px;
}
scrollbar {
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 100px;
}
</style>
