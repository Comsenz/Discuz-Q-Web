<template>
  <div
    v-loading="loading"
    class="myprofile"
  >
    <div
      v-if="userInfo"
      class="myprofile-c"
      style="padding-bottom:0px"
    >
      <div class="myprofile-top mtop">
        <Avatar
          :user="{ id: userInfo.id, username: userInfo.username, avatarUrl: userInfo.avatarUrl}"
          :size="50"
          :round="true"
          class="avatar"
          :is-real="userInfo.isReal"
        />

        <div class="usr">
          <span class="usrname">{{ userInfo.username }}</span>
          <span class="usrid">{{ userInfo && userInfo.groupsName ? userInfo.groupsName : '' }}</span>
        </div>
        <span
          v-if="userInfo && userInfo.isReal"
          class="iden"
        >
          <svg-icon
            type="auth"
            class="auth-icon"
          />
          <span class="real">已实名认证</span>
        </span>
        <span
          v-else-if="userInfo && !userInfo.isReal && forums &&forums.qcloud && forums.qcloud.qcloud_faceid"
          class="iden"
        >
          <svg-icon
            class="auth-icon"
            type="warning"
          /> <span class="nreal">未实名认证</span>
        </span>
        <span
          class="setavatar"
          @click="setAvatar"
        >设置头像</span>
        <show-avatar
          v-if="isShowAvatar"
          :user-id="userId"
          @change="changeShow"
        />
      </div>
      <div class="myprofile-bottom">
        <div
          class="myprofile-title marglef"
          @click="toTopic"
        >
          <span>{{ $t('profile.topic') }}</span>
          <span class="num">{{ userInfo.threadCount }}</span>
        </div>
        <div
          class="myprofile-title"
          @click="toFollowing"
        >
          <span>{{ $t('profile.following') }}</span>
          <span class="num">{{ userInfo.fansCount }}</span>
        </div>
        <div
          class="myprofile-title"
          @click="toFollowers"
        >
          <span>{{ $t('profile.followers') }}</span>
          <span class="num">{{ userInfo.followCount }}</span>
        </div>
        <div
          class="myprofile-title"
          @click="toLikes"
        >
          <span>{{ $t('profile.likes') }}</span>
          <span class="num">{{ userInfo.likedCount }}</span>
        </div>
      </div>
    </div>
    <!-- 用户名 -->
    <div
      v-if="userInfo"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.username') }}</span>
        <span
          v-show="userInfo && userInfo.canEditUsername"
          class="setavatar"
          @click="usernameModify"
        >{{ (!isNameModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div
        v-show="!isNameModify"
        class="myprofile-btom2"
      >
        {{ userInfo && userInfo.username ? userInfo.username:'' }}
      </div>
      <div
        v-show="isNameModify"
        class="myprofile-btom"
      >
        <form>
          <el-input
            ref="username"
            v-model="newName"
            :placeholder="$t('modify.numbermodifitions')"
            class="passbtom"
          />
          <el-button
            type="primary"
            class="ebutton"
            @click="nameSub"
          >确定修改</el-button>
        </form>
      </div>
    </div>

    <!-- 签名 -->
    <div
      v-if="userInfo"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('modify.signaturetitle') }}</span>
        <span
          class="setavatar"
          @click="signModify"
        >{{ (!isSignModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div
        v-show="!isSignModify"
        class="myprofile-btom"
      >
        {{ userInfo.signature ? userInfo.signature : '暂无签名' }}
      </div>
      <div v-show="isSignModify">
        <textarea
          ref="sign"
          v-model="inputVal"
          type="text"
          placeholder="请输入签名内容"
          class="myprofile-btom textarea"
          @input="fun"
        />
        {{ $t('modify.canalsoinput') }}
        {{ num - wordnumber }}{{ $t('modify.wordnumber') }}
        <el-button
          type="primary"
          class="sigbutton"
          @click="sigComfirm"
        >确定修改</el-button>
      </div>
    </div>
    <!-- 手机号 -->
    <div
      v-if="userInfo"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.mobile') }}</span>
        <span
          class="setavatar"
          @click="mobileModify"
        >{{ (!isMobileModify ?!userInfo.mobile ? '绑定手机': $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div
        v-show="!isMobileModify"
        class="myprofile-btom2"
      >
        {{ userInfo.mobile ? userInfo.mobile : $t('modify.setphontitle') }}
      </div>
      <!-- 修改手机号 -->
      <div
        v-show="(isMobileModify && userInfo.mobile)"
        class="myprofile-btom"
      >
        <div class="pmobile">
          {{ userInfo.mobile }}
        </div>
        <div>
          <el-input
            ref="oldphone"
            v-model="oldVerifyCode"
            placeholder="请输入旧手机验证码"
            class="phone-input"
          />

          <el-button
            class="count-b"
            size="middle"
            @click="sendsms2"
          >{{ content }}</el-button>

          <el-input
            v-model="newphon"
            :placeholder="$t('modify.setphontitle')"
            class="passbtom"
            @input="changeinput"
          />
          <el-input
            v-model="newVerifyCode"
            placeholder="请输入新手机验证码"
            class="phone-input"
          />
          <el-button
            class="count-b"
            :class="{disabled: !canClick2}"
            :disabled="!canClick2"
            size="middle"
            @click="sendsms"
          >{{ content2 }}</el-button>
        </div>

        <el-button
          type="primary"
          class="ebutton"
          @click="mobileComfirm"
        >确定修改</el-button>
      </div>
      <!-- 新用户绑定手机号 -->
      <div
        v-show="(isMobileModify && !userInfo.mobile)"
        class="myprofile-btom"
      >
        <div>
          <el-input
            ref="oldphone"
            v-model="newphon"
            maxlength="11"
            placeholder="请输入绑定的手机号"
            class="phone-input"
            @input="changeinput"
          />

          <el-button
            class="count-b"
            :class="{disabled: !canClick}"
            :disabled="!canClick"
            size="middle"
            @click="sendsms"
          >{{ content }}</el-button>

          <el-input
            v-model="setnum"
            placeholder="请输入手机验证码"
            class="passbtom"
          />
        </div>

        <el-button
          type="primary"
          class="ebutton"
          @click="dingphon"
        >确定修改</el-button>
      </div>
    </div>
    <!-- 密码 -->
    <div
      v-if="userInfo"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.password') }}</span>
        <span
          class="setavatar"
          @click="passModify"
        >{{ (!isPassModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div
        v-show="!isPassModify"
        class="myprofile-btom2"
      >
        {{ userInfo && userInfo.hasPassword ?'已设置':'未设置密码' }}
      </div>
      <div
        v-show="isPassModify"
        class="myprofile-btom"
      >

        <form>

          <el-input
            ref="oldpass"
            v-model="oldPassWord"
            :placeholder="$t('modify.enterold')"
            class="passbtom"
            type="password"
            show-password
          />
          <el-input
            v-model="newPassWord"
            :placeholder="$t('modify.enterNew')"
            class="passbtom"
            type="password"
            show-password
          />
          <el-input
            v-model="renewPassword"
            :placeholder="$t('modify.enterNewRepeat')"
            class="passbtom"
            type="password"
            show-password
          />

          <el-button
            type="primary"
            class="ebutton"
            @click="passSub"
          >确定修改</el-button>
        </form>
      </div>
    </div>

    <!-- 微信 -->
    <div
      v-if="userInfo"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.wechat') }}</span>
        <span
          class="setavatar"
          @click="wechatModify"
        >{{ (!isWechatModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div
        v-show="!isWechatModify"
        class="myprofile-btom2"
      >
        {{ userInfo && userInfo.wechat ?userInfo.wechat.nickname :'未绑定微信' }}
      </div>
    </div>

    <!-- 实名验证 -->
    <!-- qcloud_faceid是否开启实名认证 -->
    <div
      v-if="userInfo && !userInfo.realname && forums &&forums.qcloud && forums.qcloud.qcloud_faceid"
      class="myprofile-c"
      style="border-bottom:0px;"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('modify.realnametitle') }}</span>
        <span
          class="setavatar"
          @click="realModify"
        >{{ (!isRealModify ? $t('profile.tocertification') : '暂不认证') }}</span>
      </div>
      <div
        v-show="!isRealModify"
        class="myprofile-btom2"
      >
        {{ userInfo && userInfo.realname ?'已设置':'未实名认证' }}
      </div>
      <div
        v-show="isRealModify"
        class="myprofile-btom"
      >

        <div>
          <el-input
            ref="realname"
            v-model="realName"
            :placeholder="$t('modify.realname')"
            class="passbtom"
          />
          <el-input
            v-model="idNumber"
            :placeholder="$t('modify.enteridnumber')"
            class="passbtom"
          />

        </div>

        <el-button
          type="primary"
          class="ebutton"
          @click="realSub"
        >确定提交</el-button>
      </div>
    </div>
    <div
      v-if="userInfo && userInfo.realname && forums &&forums.qcloud && forums.qcloud.qcloud_faceid"
      class="myprofile-c"
    >
      <div class="myprofile-top">
        <span class="sig">{{ $t('modify.realnametitle') }}</span>
      </div>
      <div class="myprofile-btom2">
        {{ userInfo && userInfo.realname ?userInfo.realname:'' }}
      </div>
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''
export default {
  mixins: [handleError, tcaptchs],
  data() {
    return {
      userId: this.$store.getters['session/get']('userId'),
      userInfo: '',
      num: 140,
      wordnumber: '',
      signcontent: '',
      content: this.$t('modify.sendVerifyCode'),
      content2: this.$t('modify.sendVerifyCode'),
      canClick: false,
      canClick2: false,
      captcha: null, // 腾讯云验证码实例
      ticket: '',
      randstr: '',
      newVerifyCode: '', // 新手机验证码
      oldVerifyCode: '', // 旧手机验证码
      newPhoneNumber: '', // 新绑定的手机
      newphon: '', // 初始绑定的手机号
      setnum: '', // 初始绑定手机号时收到的验证码
      novice: '',
      oldPassWord: '',
      newPassWord: '',
      renewPassword: '', // 重复新密码
      realName: '', // 真实姓名
      idNumber: '', // 身份证
      newName: '',
      isSignModify: false,
      isMobileModify: false,
      isPassModify: false,
      isWechatModify: false,
      isRealModify: false,
      isNameModify: false,
      loading: true,
      rebind: false, // 是否修改手机号
      isShowAvatar: false // 是否设置头像
    }
  },
  computed: {
    inputVal: {
      get() {
        return this.signcontent
      },
      set(newValue) {
        this.signcontent = newValue
      }
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    this.userinfo()
  },
  methods: {
    countDown(interval) {
      console.log('倒计时')
      if (!this.canClick) return
      console.log('倒计时2')
      this.canClick = false
      this.content = interval + this.$t('modify.retransmission')
      const clock = window.setInterval(() => {
        interval--
        this.content = interval + this.$t('modify.retransmission')
        if (interval < 0) {
          window.clearInterval(clock)
          this.content = this.$t('modify.sendVerifyCode')
          // this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
    },
    countDown2(interval) {
      if (!this.canClick2) return
      this.canClick2 = false
      this.content2 = interval + this.$t('modify.retransmission')
      const clock = window.setInterval(() => {
        interval--
        this.content2 = interval + this.$t('modify.retransmission')
        if (interval < 0) {
          window.clearInterval(clock)
          this.content2 = this.$t('modify.sendVerifyCode')
          // this.totalTime = 60
          this.canClick2 = true
        }
      }, 1000)
    },
    userinfo() {
      if (this.userId === '0') {
        return
      }
      const params = {
        include: 'groups,wechat'
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}`, { params }]).then(res => {
        console.log('useriinfo', res)
        this.loading = false
        this.userInfo = res
        this.signcontent = this.userInfo.signature
        this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
        this.wordnumber = this.signcontent.length
      }, e => {
        this.handleError(e)
      })
    },
    setAvatar() {
      this.isShowAvatar = true
    },
    changeShow(val) {
      this.isShowAvatar = val
    },
    // 获取输入字数长度
    fun(e) {
      this.wordnumber = e.target.value.length
    },
    // 修改签名
    signModify() {
      this.isSignModify = !this.isSignModify
      this.$nextTick(() => {
        this.$refs.sign.focus()
      })
      console.log('签名', this.inputVal)
      // this.inputVal = this.signcontent
    },
    // 签名确认修改
    sigComfirm() {
      const params = {
        _jv: {
          type: 'users',
          id: this.userId
        },
        signature: this.inputVal
      }
      status.run(() => this.$store.dispatch('jv/patch', params)).then(res => {
        if (res) {
          this.isSignModify = !this.isSignModify
          this.$message.success(this.$t('modify.modificationsucc'))
          this.userinfo()
        }
      }, e => {
        this.handleError(e)
      })
    },
    // 手机位数简单校验
    changeinput() {
      setTimeout(() => {
        this.newphon = this.newphon.replace(/[^\d]/g, '')
      }, 30)
      if (this.newphon.length < 11) {
        this.canClick = false
        this.canClick2 = false
      } else if (this.newphon.length === 11) {
        this.canClick = true
        this.canClick2 = true
        this.novice = this.newphon.replace(/\s+/g, '')
      }
    },
    // 发送短信接口
    sendsms() {
      console.log('初始绑定手机')
      if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.novice)) {
        if (this.forums.qcloud.qcloud_captcha) {
          console.log('腾讯云验证已经开启')
          this.tcaptcha()
        } else {
          console.log('腾讯云验证未开启')
          if (this.rebind) {
            this.sendVerifyCode2()
          } else {
            this.setphon()
          }
        }
      } else {
        this.$message.error('手机号错误')
      }
    },
    // 发送短信接口2
    sendsms2() {
      this.newphon = ''
      console.log('验证旧手机')
      if (this.forums.qcloud.qcloud_captcha) {
        console.log('腾讯云验证已经开启')
        this.tcaptcha()
      } else {
        console.log('腾讯云验证未开启')
        // 直接修改手机验证码发送
        this.sendVerifyCode()
      }
    },
    // 腾讯验证码
    tcaptcha() {
      // eslint-disable-next-line no-undef
      this.captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, res => {
        if (res.ret === 0) {
          this.ticket = res.ticket
          this.randstr = res.randstr
          // 验证通过后发布
          console.log('验证码发送')
          if (this.novice) {
            if (this.rebind) {
              this.sendVerifyCode2()
            } else {
              // 新手机验证码发送
              this.setphon()
            }
          } else {
            // 修改手机验证码发送
            this.sendVerifyCode()
          }
        }
      })
      // 显示验证码
      this.captcha.show()
    },
    // 新手机号发送验证码
    setphon() {
      const params = {
        _jv: {
          type: 'sms/send'
        },
        mobile: this.novice,
        type: 'bind',
        captcha_ticket: this.ticket,
        captcha_rand_str: this.randstr
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          if (res.interval) this.countDown(res.interval)
          this.ticket = ''
          this.randstr = ''
        }, e => this.handleError(e))
    },
    dingphon() {
      if (this.newphon) {
        this.bindphon()
      }
    },
    // 验证手机号
    bindphon() {
      const _this = this
      const params = {
        _jv: {
          type: 'sms/verify'
        },
        mobile: this.newphon,
        code: this.setnum,
        type: 'bind'
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          if (res) {
            this.isMobileModify = !this.isMobileModify
            this.$message.success(this.$t('modify.phontitle'))
            const param = {
              _jv: {
                type: 'forum'
              }
            }
            _this.$store.dispatch('jv/get', param).then(() => {
              // console.log(1, 'froums');
            })
            const promsget = {
              _jv: {
                type: 'users',
                id: this.userId
              }
              // include: 'groups',
            }
            _this.$store.dispatch('jv/get', promsget).then(() => { })
          }
        }, e => this.handleError(e))
    },
    // 修改手机号
    mobileModify() {
      this.isMobileModify = !this.isMobileModify
      this.$nextTick(() => {
        this.$refs.oldphone.focus()
      })
    },
    // 旧手机验证码发送
    sendVerifyCode() {
      this.canClick = true
      const params = {
        _jv: {
          type: 'sms/send'
        },
        type: 'verify',
        captcha_ticket: this.ticket,
        captcha_rand_str: this.randstr
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          console.log('旧手机验证码', res, this.content)
          if (res.interval) this.countDown(res.interval)
          this.rebind = true
          this.ticket = ''
          this.randstr = ''
        }, e => this.handleError(e))
    },
    // 新手机验证码发送
    sendVerifyCode2() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.novice,
        type: 'rebind',
        captcha_ticket: this.ticket,
        captcha_rand_str: this.randstr
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          console.log('绑定新手机验证码', res)
          if (res.interval) this.countDown2(res.interval)
          this.rebind = true
          this.ticket = ''
          this.randstr = ''
        }, e => this.handleError(e))
    },
    // 手机号确认修改
    mobileComfirm() {
      this.oldVerify()
      this.newVerify()
      console.log('hh')
      this.isMobileModify = !this.isMobileModify
    },
    oldVerify() {
      const params = {
        _jv: { type: 'sms/verify' },
        code: this.oldVerifyCode,
        type: 'verify'
      }
      this.$store.dispatch('jv/post', params)
        .then(res => {
          if (res) {
            this.$message.success('旧手机验证成功')
          }
        }, e => this.handleError(e))
    },
    // 验证新手机号
    newVerify() {
      const _this = this
      const params = {
        _jv: {
          type: 'sms/verify'
        },
        mobile: this.newphon,
        code: this.newVerifyCode,
        type: 'rebind'
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          if (res) {
            this.isMobileModify = !this.isMobileModify
            this.$message.success(this.$t('modify.phontitle'))
            // eslint-disable-next-line object-curly-spacing
            const param = { _jv: { type: 'forum' } }
            _this.$store.dispatch('jv/get', param).then(() => {
            })
            const promsget = {
              _jv: { type: 'users', id: this.userId }
              // include: 'groups',
            }
            _this.$store.dispatch('jv/get', promsget).then(() => { })
          }
        }, e => this.handleError(e))
    },
    // 修改密码
    passModify() {
      this.isPassModify = !this.isPassModify
      this.$nextTick(() => {
        this.$refs.oldpass.focus()
      })
    },
    // 密码为空校验
    passSub() {
      if (this.oldPassWord && this.newPassWord && this.renewPassword) {
        this.passwordComfirm()
      } else if (!this.oldPassWord) {
        this.$message.error(this.$t('modify.oldpassword'))
      } else if (!this.newPassWord) {
        this.$message.error(this.$t('modify.newpassword'))
      } else if (!this.renewPassword) {
        this.$message.error(this.$t('modify.confrimpasword'))
      }
    },
    passwordComfirm() {
      const params = {
        _jv: {
          type: 'users',
          id: this.userId
        },
        password: this.oldPassWord,
        newPassword: this.newPassWord,
        password_confirmation: this.renewPassword
      }
      const postphon = status.run(() => this.$store.dispatch('jv/patch', params))
      postphon
        .then(res => {
          if (res) {
            this.$message.success(this.$t('modify.titlepassword'))
            this.isPassModify = !this.isPassModify
          }
        }, e => this.handleError(e))
    },
    // 微信
    wechatModify() {
      this.isWechatModify = !this.isWechatModify
    },
    // 实名认证
    realModify() {
      this.isRealModify = !this.isRealModify
      this.$nextTick(() => {
        this.$refs.realname.focus()
      })
    },
    // 实名不为空验证
    realSub() {
      if (this.realName && this.idNumber) {
        this.authentication()
      } else if (!this.realName) {
        this.$message.error(this.$t('modify.emptyname'))
      } else if (!this.idNumber) {
        this.$message.error(this.$t('modify.idcardisempty'))
      }
    },
    authentication() {
      const _this = this
      const params = {
        _jv: {
          type: 'users/real'
        },
        realname: this.realName,
        identity: this.idNumber
      }
      const patchname = status.run(() => this.$store.dispatch('jv/patch', params))
      patchname
        .then(res => {
          this.isRealModify = !this.isRealModify
          if (res) {
            console.log('实名成功信息', res)
            const param = {
              _jv: { type: 'forum' }
            }
            _this.$store.dispatch('jv/get', param).then((res) => {
              console.log('实名后获取站点数据', res)
            })
            const promsget = {
              _jv: { type: 'users', id: this.userId }
            }
            _this.$store.dispatch('jv/get', promsget).then((res) => {
              console.log('实名后获取用户个人信息', res)
            })
            this.$message.success(
              this.$t('modify.nameauthensucc')
            )
          }
        }, e => {
          // eslint-disable-next-line object-curly-spacing
          const { response: { data: { errors } } } = e
          if (errors[0].statusCode === 422 && errors[0].detail) {
            this.$message.error(errors[0].detail[0])
          } else if (errors[0].detail) {
            this.$message.error(errors[0].detail)
          }
        })
    },
    // 用户名修改
    usernameModify() {
      this.isNameModify = !this.isNameModify
      this.$nextTick(() => {
        this.$refs.username.focus()
      })
    },
    // 用户名提交
    nameSub() {
      if (this.newName) {
        this.changename()
      } else {
        this.$message.error(this.$t('modify.emptyname'))
      }
    },
    changename() {
      const params = {
        _jv: {
          type: 'users',
          id: this.userId
        },
        username: this.newName
      }
      const patchname = status.run(() => this.$store.dispatch('jv/patch', params))
      patchname
        .then(res => {
          if (res) {
            console.log('修改用户名', res)
            this.isNameModify = !this.isNameModify
            this.$message.success(this.$t('modify.modifysucc'))
          }
          this.userinfo()
        }, e => this.handleError(e))
    },
    toTopic() {
      this.$router.push(`/profile?userId=${this.userId}&current=1`)
    },
    toFollowing() {
      this.$router.push(`/profile?userId=${this.userId}&current=2`)
    },
    toFollowers() {
      this.$router.push(`/profile?userId=${this.userId}&current=3`)
    },
    toLikes() {
      this.$router.push(`/profile?userId=${this.userId}&current=4`)
    }

  }
}
</script>
<style lang='scss' scoped>
::v-deep input::-ms-reveal {
  display: none;
}
.myprofile {
  padding-left: 30px;
  @media screen and (max-width: 1005px) {
    padding-left: 0 15px;
  }
}
.myprofile-c {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e4e4;
  padding-bottom: 20px;
  .sigbutton {
    display: block;
    margin-left: 15px;
    width: 300px;
    background: #1878f3;
    margin-bottom: 48px;
  }
  .disnone {
    display: none;
  }
  .myprofile-top {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    .auth-icon {
      width: 16px;
      height: 16px;
    }
    .sig {
      font-size: 16px;
      color: #6d6d6d;
    }
    .usr {
      display: flex;
      flex-direction: column;
      margin-left: 15px;
      font-size: 16px;
      .usrname {
        font-weight: bold;
      }
      .usrid {
        color: #8590a6;
      }
    }
    .iden {
      margin-left: 10px;
      .nreal {
        margin-left: 2px;
        color: #fa5151;
      }
      .real {
        margin-left: 2px;
      }
    }
    .setavatar {
      flex: 1;
      text-align: right;
      margin-right: 30px;
      color: #1878f3;
      cursor: pointer;
    }
  }
  .mtop {
    margin-top: 0px;
  }
  .myprofile-bottom {
    display: flex;
    margin-top: 14px;
    .marglef {
      margin-left: 77px !important;
    }
    .myprofile-title {
      display: flex;
      flex-direction: column;
      margin-left: 95px;
      color: #6d6d6d;
      text-align: center;
      margin-bottom: 21px;
      cursor: pointer;
      .num {
        font-size: 18px;
      }
    }
  }
  .myprofile-btom {
    margin-left: 17px;
    font-size: 16px;
    margin-right: 55px;
    padding-bottom: 20px;
    margin-top: 15px;
    width: 460px;
    overflow: hidden;
    overflow-wrap: break-word;
    @media screen and (max-width: 1005px) {
      width: 390px;
    }
    // font-family: Microsoft YaHei;
    color: #000000;
    .pmobile {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
  .myprofile-btom2 {
    margin-left: 17px;
    font-size: 16px;
    margin-right: 55px;
    padding-bottom: 20px;
    margin-top: 15px;
    width: 460px;
    // font-family: Microsoft YaHei;
    color: #8590a6;
  }
  .ebutton {
    display: block;
    width: 300px;
    background: #1878f3;
    margin-bottom: 48px;
    margin-top: 10px;
  }
  .textarea {
    border: none;
    font-size: 16px;
    margin-left: 15px;
    margin-top: 13px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
  .phone-input {
    width: 209px;
    margin-bottom: 10px;
    ::v-deep.el-input__inner {
      border-right: none;
    }
  }
  .count-b {
    width: 90px;
    height: 40px;
    // padding: 15.5px 10px;
    padding: 0;
    margin-left: -4px;
    color: #606162;
    // font-size: 10px;
  }
  .disabled {
    background-color: #ededed;
    border-color: #ddd;
    color: #606162;
    cursor: not-allowed; // 鼠标变化
  }
  .passbtom {
    width: 300px;
    margin-bottom: 10px;
  }
}
::v-deep .el-input__inner {
  border-radius: 0px;
}
::v-deep .el-button {
  border-radius: 0px;
}
::v-deep .el-input__inner:focus {
  border-color: #dcdfe6;
}
// ::v-deep .el-button:focus {
//   background: #fff;
//   // border: 1px solid #dcdfe6;
//   color: #ffffff;
// }
// ::v-deep .el-button:hover {
//   background: #fff;
//   // border: 1px solid #dcdfe6;
//   color: #ffffff;
// }
// ::v-deep .el-button:active {
//   background: #fff;
//   // border: 1px solid #dcdfe6;
//   color: #ffffff;
// }
</style>
