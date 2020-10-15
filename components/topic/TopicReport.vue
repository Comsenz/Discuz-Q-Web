<template>
  <message
    :title="$t('report.reportTitle')"
    @close="$emit('close')"
  >
    <div class="reportcontainer">
      <div class="reportselect">
        <el-radio-group
          v-model="radio"
          @change="select"
        >
          <el-radio label="advertisingRubbish">{{ this.$t('report.advertisingRubbish') }}</el-radio>
          <el-radio label="illegalContent">{{ this.$t('report.illegalContent') }}</el-radio>
          <el-radio label="maliciousIrrigation">{{ this.$t('report.maliciousIrrigation') }}</el-radio>
          <el-radio label="repeatPost">{{ this.$t('report.repeatPost') }}</el-radio>
          <el-radio
            label="other"
            class="otherr"
          >{{ this.$t('report.otherreason') }}</el-radio>
        </el-radio-group>
      </div>
      <div class="other">
        <el-input
          v-if="isOther"
          v-model="otherReasonValue"
          type="textarea"
          :rows="5"
          :disabled="!isOther"
          :placeholder="$t('report.enterOtherReason')"
        />
      </div>
    </div>
    <div class="confirmbtn">
      <div class="allbtn">
        <el-button
          class="comfirm"
          type="small"
          @click="reportConfirmClick(type)"
        >{{ this.$t('report.confirm') }}</el-button>
        <el-button
          class="cancel"
          type="small"
          @click="reportCancelClick"
        >{{ this.$t('report.cancel') }}</el-button>
      </div>
    </div>
  </message>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  mixins: [handleError],
  props: {
    threadId: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 0
    },
    commentId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      radio: '',
      inputInfo: '',
      otherReasonValue: '',
      currentReport: '',
      isOther: false,
      reportData: [
        {
          // 举报理由
          value: 'advertisingRubbish',
          name: '广告垃圾'
        },
        {
          value: 'illegalContent',
          name: '违规内容'
        },
        {
          value: 'maliciousIrrigation',
          name: '恶意灌水'
        },
        {
          value: 'repeatPost',
          name: '重复发帖'
        },
        {
          value: 'other',
          name: '其他'
        }
      ]

    }
  },
  computed: {
    currentLoginId() {
      const userId = this.$store.getters['session/get']('userId')
      return parseInt(userId, 10)
    }
  },
  mounted() {
    this.otherReasonValue = ''
  },
  methods: {
    select(val) {
      this.currentReport = val
      this.isOther = this.currentReport === 'other'
    },
    // 确认举报
    reportConfirmClick(type) {
      if (!this.currentReport) {
        this.$message.error(
          this.$t('report.pleaseClickReasons')
        )
        return
      }
      let reason = ''
      if (this.currentReport === 'other') {
        if (!this.otherReasonValue) {
          this.$message.error(
            this.$t('report.enterOtherReason')
          )
          return
        }
        reason = this.otherReasonValue
      } else {
        this.reportData.forEach(item => {
          if (item.value === this.currentReport) {
            reason = item.name
          }
        })
      }
      const params = {
        _jv: {
          type: 'reports'
        },
        user_id: this.currentLoginId,
        thread_id: parseInt(this.threadId),
        type,
        reason: `${reason}`
      }
      if (type === 2) {
        params.post_id = parseInt(this.commentId)
      }
      this.$store.dispatch('jv/post', params).then(res => {
        if (res._jv) {
          this.$emit('close')
          this.$message.success(
            this.$t('report.reportSucceed')
          )
        }
      }, e => this.handleError(e))
    },
    // 取消举报
    reportCancelClick() {
      this.otherReasonValue = ''
      this.currentReport = ''
      this.$emit('close')
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";

.reportcontainer {
  margin: 40px 40px 0 40px;
  .reportselect {
    // margin: 40px 40px 0 40px;
    border-bottom: 1px solid #f5f5f5;
    position: relative;
    .otherr {
      position: absolute;
      left: 0;
      top: 59px;
    }
  }
  .other {
    margin-top: 20px;
    padding-bottom: 45px;
    ::v-deep .el-textarea {
      margin-top: 20px;
    }
    ::v-deep .el-textarea__inner {
      color: black;
      background: #f4f5f6;
      margin-top: 20px;
      font-family: "Microsoft Ya Hei";
    }
  }
}
.confirmbtn {
  background: #f5f6f7;
  display: flex;
  justify-content: flex-end;
  .allbtn {
    margin: 10px 19px;
  }
  .comfirm {
    width: 70px;
    height: 35px;
    background: #1878f3;
    color: #ffffff;
    border-radius: 2px;
    border: none;
    &:hover{
      background:$color-blue-deep;
    }
  }
  .cancel {
    width: 70px;
    height: 35px;
    border-radius: 2px;
    margin-left: 5px;
  }
}

::v-deep .el-radio__label {
  font-size: 16px;
}
::v-deep .el-radio-group {
  padding-bottom: 19px;
}
</style>
