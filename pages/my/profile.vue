<template>
  <div class="myprofile">
    <div
      class="myprofile-c"
      style="padding-bottom:0px"
    >
      <div class="myprofile-top">
        <Avatar
          :user="userInfo"
          :size="51"
          class="avatar"
        />

        <div class="usr">
          <span class="usrname">{{ userInfo.username }}
            <img
              src=""
              alt=""
            ></span>

          <span class="usrid">{{ userInfo && userInfo.groupsName ? userInfo.groupsName : '默认用户' }}</span>
        </div>
        <span
          v-if="userInfo && userInfo.isReal"
          class="iden"
        >已实名认证
        </span>
        <span
          v-else
          class="iden"
        >
          <svg-icon
            style="width:16px; height:16px"
            type="warning"
          /> <span style="margin-left:2px; color:#FA5151;">未实名认证</span>
        </span>
        <span class="setavatar">设置头像</span>
      </div>
      <div class="myprofile-bottom">
        <div class="myprofile-title marglef">
          <span>{{ $t('profile.topic') }}</span>
          <span class="num">{{ userInfo.threadCount }}</span>
        </div>
        <div class="myprofile-title">
          <span>{{ $t('profile.following') }}</span>
          <span class="num">{{ userInfo.fansCount }}</span>
        </div>
        <div class="myprofile-title">
          <span>{{ $t('profile.followers') }}</span>
          <span class="num">{{ userInfo.followCount }}</span>
        </div>
        <div class="myprofile-title">
          <span>{{ $t('profile.likes') }}</span>
          <span class="num">{{ userInfo.likedCount }}</span>
        </div>
      </div>
    </div>
    <!-- 签名 -->
    <div class="myprofile-c">
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
        {{ userInfo.signature }}
      </div>
      <div v-show="isSignModify">
        <textarea
          ref="sign"
          v-model="inputVal"
          type="text"
          :placeholder="$t('search.search')"
          class="myprofile-btom"
          style="border:none;font-size:16px;margin-left:15px;margin-top:13px;"
          @input="fun"
        />
        {{ $t('modify.canalsoinput') }}
        {{ num - wordnumber }}{{ $t('modify.wordnumber') }}
        <el-button
          type="primary"
          style="
                display: block;
                margin-left: 15px;
                width: 300px;
                background: #1878f3;
                margin-bottom:48px;"
          @click="sigComfirm"
        >确定修改</el-button>
      </div>
    </div>
    <!-- 手机号 -->
    <div class="myprofile-c">
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.mobile') }}</span>
        <span
          class="setavatar"
          @click="mobileModify"
        >{{ (!isMobileModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div v-show="!isMobileModify" class="myprofile-btom" style="font-size:20px;font-weight:bold">
        {{ userInfo.mobile }}
      </div>
      <div v-show="isMobileModify" class="myprofile-btom">
        <div style="font-size:20px;font-weight:bold">
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
            :class="{disabled: !canClick}"
            size="middle"
            @click="sendVerifyCode"
          >{{ content }}</el-button>

          <el-input
            v-model="newPhoneNumber"
            :placeholder="$t('modify.setphontitle')"
            style="width:300px"
          />

          <el-input
            v-model="newVerifyCode"
            placeholder="请输入新手机验证码"
            class="phone-input"
          />

          <el-button
            class="count-b"
            :class="{disabled: !canClick}"
            size="middle"
            @click="sendVerifyCode2"
          >{{ content }}</el-button>
        </div>

        <el-button
          type="primary"
          style="
                display: block;
                width: 300px;
                background: #1878f3;
                margin-bottom:48px;"
          @click="mobileComfirm"
        >确定修改</el-button>
      </div>
    </div>
    <!-- 密码 -->
    <div class="myprofile-c">
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.password') }}</span>
        <span
          class="setavatar"
          @click="passModify"
        >{{ (!isPassModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div v-show="!isPassModify" class="myprofile-btom" style="color:#8590A6">
        {{ userInfo && userInfo.hasPassword ?'已设置':'未设置密码' }}
      </div>
      <div v-show="isPassModify" class="myprofile-btom">

        <div>
          <el-input
            ref="oldpass"
            v-model="oldPassWord"
            :placeholder="$t('modify.enterold')"
            class="passbtom"
          />
          <el-input
            v-model="newPassWord"
            :placeholder="$t('modify.enterNew')"
            class="passbtom"
          />
          <el-input
            v-model="renewPassword"
            :placeholder="$t('modify.enterNewRepeat')"
            class="passbtom"
          />

        </div>

        <el-button
          type="primary"
          style="
                display: block;
                width: 300px;
                background: #1878f3;
                margin-top:10px;
                margin-bottom:48px"
          @click="passSub"
        >确定修改</el-button>
      </div>
    </div>

    <!-- 微信 -->
    <div class="myprofile-c">
      <div class="myprofile-top">
        <span class="sig">{{ $t('profile.wechat') }}</span>
        <span
          class="setavatar"
          @click="wechatModify"
        >{{ (!isWechatModify ? $t('profile.modify') : '取消修改') }}</span>
      </div>
      <div v-show="!isWechatModify" class="myprofile-btom" style="color:#8590A6">
        {{ userInfo && userInfo.wechat ?userInfo.wechat.nickname :'未绑定微信' }}
      </div>
    </div>

    <!-- 实名验证 -->
    <!-- qcloud_faceid是否开启实名认证 -->
    <div v-if="!userInfo.realname && forums.qcloud && forums.qcloud.qcloud_faceid" class="myprofile-c" style="border-bottom:0px;">
      <div class="myprofile-top">
        <span class="sig">{{ $t('modify.realnametitle') }}</span>
        <span
          class="setavatar"
          @click="realModify"
        >{{ (!isRealModify ? $t('profile.tocertification') : '暂不认证') }}</span>
      </div>
      <div v-show="!isRealModify" class="myprofile-btom" style="color:#8590A6">
        {{ userInfo && userInfo.realname ?'已设置':'未实名认证' }}
      </div>
      <div v-show="isRealModify" class="myprofile-btom">

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
          style="
                display: block;
                width: 300px;
                background: #1878f3;
                margin-top:10px;
                margin-bottom:48px"
          @click="realSub"
        >确定提交</el-button>
      </div>
    </div>
    <div v-if="userInfo.realname && forums.qcloud && forums.qcloud.qcloud_faceid" class="myprofile-c">
      <div class="myprofile-top">
        <span class="sig">{{ $t('modify.realnametitle') }}</span>
      </div>
      <div class="myprofile-btom" style="color:#8590A6">
        {{ userInfo && userInfo.realname ?userInfo.realname:'未实名认证2' }}
      </div>
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import forums from '@/mixin/forums'
export default {
  mixins: [forums],
  data() {
    return {
      userId: '',
      userInfo: '',
      num: 140,
      wordnumber: '',
      signcontent: '',
      content: this.$t('modify.sendVerifyCode'),
      canClick: true,
      newVerifyCode: '', // 新手机验证码
      oldVerifyCode: '', // 旧手机验证码
      newPhoneNumber: '', // 新绑定的手机
      oldPassWord: '',
      newPassWord: '',
      renewPassword: '', // 重复新密码
      realName: '',
      idNumber: '',
      isSignModify: false,
      isMobileModify: false,
      isPassModify: false,
      isWechatModify: false,
      isRealModify: false
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
    }
    // usersId() {
    //   console.log(this.userId)

    //   return this.$store.getters['session/get']('userId')
    // }
    // userInfo() {
    //   const userInfo = this.$store.getters['jv/get'](`users/${this.userId}`)
    //   console.log(userInfo)
    //   userInfo.groupsName = userInfo.groups ? userInfo.groups[0].name : ''
    //   this.setNum(userInfo)
    //   return userInfo
    // }
  },
  mounted() {
    this.userinfo()
  },
  methods: {
    countDown(interval) {
      if (!this.canClick) return
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
    // 使用计算属性获取不到userinfo,直接请求接口就可以了但没有group的数据
    userinfo() {
      this.userId = this.$store.getters['session/get']('userId')
      // this.userId = localStorage.getItem('uid')
      console.log('userid', this.userId)
      // const params = {
      //   // _jv: { type: `/users/${this.userId}` }
      //   _jv: {
      //     type: 'users',
      //     id: this.userId
      //   },
      //   include: 'groups'
      // }
      // this.$store.dispatch('jv/get', params).then(res => {
      // })
      const params = {
        include: 'groups,wechat'
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}`, { params }]).then(res => {
        console.log('useriinfo', res)
        this.userInfo = res
        this.signcontent = this.userInfo.signature
        this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
        this.wordnumber = this.signcontent.length
      })
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
      this.inputVal = this.userInfo.signature
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
        }
      })
    },
    // 修改手机号
    mobileModify() {
      this.isMobileModify = !this.isMobileModify
      this.$nextTick(() => {
        this.$refs.oldphone.focus()
      })
    },
    // 旧手机验证码发送
    async sendVerifyCode() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.userInfo.originalMobile,
        type: 'verify'
      }
      console.log('oldphone', params)
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => {
          const {
            response: {
              data: {
                errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].detail[0])
        })
    },
    // 新手机验证码发送
    async sendVerifyCode2() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.newPhoneNumber,
        type: 'rebind'
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => {
          const {
            response: {
              data: {
                errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].code)
        })
    },
    // 手机号确认修改
    mobileComfirm() {
      this.oldVerify()
      this.newVerify()
      // newVerifyCode: '',
      // oldVerifyCode: '',
      // newPhoneNumber: '',
      console.log('hh')
      this.isMobileModify = !this.isMobileModify
    },
    async oldVerify() {
      const params = {
        _jv: { type: 'sms/verify' },
        mobile: this.userInfo.originalMobile,
        code: this.oldVerifyCode,
        type: 'verify'
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          alert('旧手机解绑验证成功')
        }, e => {
          const {
            response: { status }
          } = e
          if (status === 500) return this.$message.error('验证码不正确')
        })
    },
    async newVerify() {
      const params = {
        _jv: { type: 'sms/verify' },
        mobile: this.newPhoneNumber,
        code: this.newVerifyCode,
        type: 'rebind'
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          alert('新手机绑定成功')
        }, e => {
          const {
            response: { status }
          } = e
          if (status === 500) return this.$message.error('验证码不正确')
        })
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
            console.log('passsuccess', res)
            this.$message.success(this.$t('modify.titlepassword'))
            this.isPassModify = !this.isPassModify
          }
        })
        // 错误能输出却拿不到，需要在request.js添加响应时的错误处理
        .catch(error => {
          console.log(error.request)
          console.log(error.message)
          console.log(error.config)
          this.disab = true
          this.styledisbla = 'default'
          if (error.statusCode === 422) {
            if (this.valuetone === this.valuenew) {
              this.judge2 = true
              this.judge3 = false
              const [
                {
                  detail: [sun]
                }
              ] = error.data.errors
              this.text1 = sun
            } else {
              this.judge3 = true
              this.judge2 = false
              this.disab = true
            }
          } else if (error.request.status === 500) {
            this.judge2 = false
            this.judge3 = false
            this.judge = true
            const err = { 'errors': [{ 'status': 500, 'code': 'user_update_error', 'detail': ['\u539f\u5bc6\u7801\u4e0d\u5339\u914d'] }] }
            console.log(err.errors[0].detail)
            // if (error.request.response) {
            //   console.log(error.request.response.errors[0].detail[0])
            // }

            if (err.errors[0].detail[0]) return this.$message.error(err.errors[0].detail[0])
          }
        })
    },
    // 微信
    wechatModify() {
      console.log('hhhh')
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
        identity: this.realName,
        realname: this.idNumber
      }
      const patchname = status.run(() => this.$store.dispatch('jv/patch', params))
      patchname
        .then(res => {
          if (res) {
            console.log('实名成功信息', res)
            const param = {
              _jv: {
                type: 'forum'
              }
            }
            _this.$store.dispatch('jv/get', param).then((res) => {
              // console.log(1, 'froums');
              console.log('实名后获取站点数据', res)
            })
            const promsget = {
              _jv: {
                type: 'users',
                id: this.userid
              }
              // include: 'groups',
            }
            _this.$store.dispatch('jv/get', promsget).then((res) => {
              console.log('实名后获取用户个人信息', res)
            })
            this.$message({
              title: this.$t('modify.nameauthensucc'),
              type: 'success',
              duration: 2000
            })
          }
        })
        .catch(err => {
          console.log(err)
          if (err.statusCode === 422) {
            this.judge = true
            const [
              {
                detail: [sun]
              }
            ] = err.data.errors
            this.title1 = sun
            // uni.showToast({
            //   icon: 'none',
            //   title: this.title1,
            //   duration: 2000
            // })
          } else if (err.statusCode === 500) {
            this.judge = true
            if (err.data.errors[0].detail === this.i18n.t('modify.idtitl')) {
              this.title1 = err.data.errors[0].detail
              // uni.showToast({
              //   icon: 'none',
              //   title: this.title1,
              //   duration: 2000
              // })
            } else {
              this.title2 = err.data.errors[0].detail
              // uni.showToast({
              //   icon: 'none',
              //   title: this.title2,
              //   duration: 2000
              // })
            }
          }
        })
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类

.myprofile-c {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e4e4;
  padding-bottom: 20px;
  .disnone {
    display: none;
  }
  .myprofile-top {
    display: flex;
    flex-direction: row;
    .sig {
      font-size: 16px;
      color: #6d6d6d;
    }
    .avatar1 {
      border-radius: 50% !important;
    }
    img {
      width: 50px;
      height: 50px;
      background: red;
      border-radius: 50%;
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
    }
    .setavatar {
      flex: 1;
      text-align: right;
      margin-right: 30px;
      color: #1878f3;
      cursor: pointer;
    }
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
      .num {
        font-size: 18px;
      }
    }
  }
  .myprofile-btom {
    margin-left: 17px;
    font-size: 16px;
    margin-right: 55px;
    // background: red;
    padding-bottom: 15px;
    margin-top: 15px;
    width: 460px;
    font-family: Microsoft YaHei;
    color: #000000;
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
  ::v-deep .el-button:focus {
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
  }
  ::v-deep .el-button:hover {
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
  }
  ::v-deep .el-button:active {
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
  }
  .phone-input {
    width: 209px;
    margin-bottom: 20px;
    margin-top: 20px;
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
    // font-size: 10px;
  }
  .disabled {
    background-color: #ddd;
    border-color: #ddd;
    color: #57a3f3;
    cursor: not-allowed; // 鼠标变化
  }
  .passbtom {
    width: 300px;
    margin-bottom: 10px;
  }
}
</style>
