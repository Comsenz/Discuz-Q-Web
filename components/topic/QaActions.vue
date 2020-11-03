<template>
  <div class="qa">
    <div v-if="showAnswer" class="block answer">
      <div class="header">
        <avatar-component :size="40" round :author="question.beUser || {}">
          {{ timerDiff(question.answered_at) + $t('topic.before') }}.. 回答
        </avatar-component>
        <div v-show="question.onlooker_number" class="counter">
          <span>{{ question.onlooker_number + '人阅读' }}</span>
          <span v-show="question.onlooker_number > 0">, {{ question.onlooker_number + '人已支付' }}</span>
        </div>
      </div>
      <div class="answer-text content-html" v-html="$xss(question.content_html)" />
      <div v-if="question.images && question.images.length > 0" v-viewer="{url: 'data-source'}" class="images">
        <el-image v-for="(image, index) in question.images" :key="index" class="image" :data-source="image.url" :src="image.thumbUrl" :alt="image.filename" fit="cover">
          <div slot="placeholder" class="image-slot"><i class="el-icon-loading" /></div>
        </el-image>
      </div>
    </div>
    <div v-if="showAnswerButton" class="block">
      <button @click="showAnswerEditor = true">
        <svg-icon type="question" style="font-size: 15px" />
        <span>{{ $t('topic.answerQuestion') }}</span>
      </button>
      <div v-show="parseFloat(question.price) > 0" class="tip">
        <span>{{ $t('topic.answerCanGet') }}</span>
        <span class="amount"> ￥{{ (parseFloat(question.price) * siteUserScale).toFixed(2) }} </span>
        <span>{{ $t('topic.answerTip') }}</span>
        <span class="amount">￥ {{ (parseFloat(question.onlooker_unit_price) * siteUserScale / 2).toFixed(2) }} </span>
        <span>{{ $t('post.yuan') }}</span>
      </div>
    </div>
    <div v-if="showOnLookerButton" class="block">
      <button @click="$emit('payForAnswer')">
        <svg-icon type="yuan" style="font-size: 15px" />
        <span>{{ $t('topic.payAmountCanWatch', { amount: question.onlooker_unit_price }) }}</span>
      </button>
    </div>
    <message-box v-if="showAnswerEditor" :title="$t('topic.answerQuestion')" @close="closeEditor">
      <div class="editor-box">
        <editor
          editor-style="comment"
          class="edit-answer-editor"
          selector="edit-answer-editor"
          :edit-resource-show="editResourceShow"
          :on-publish="onAnswerPublish"
          :type-information="answerType"
          :post.sync="answer"
          @publish="answerPublish"
        />
      </div>
    </message-box>
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff'
import publishResource from '@/mixin/publishResource'
import postLegalityCheck from '@/mixin/postLegalityCheck'
import handleError from '@/mixin/handleError'
import isLogin from '@/mixin/isLogin'

export default {
  name: 'QaActions',
  mixins: [timerDiff, publishResource, postLegalityCheck, handleError, isLogin],
  props: {
    question: {
      type: Object,
      default: () => {}
    },
    questionUserId: {
      type: [String, Number],
      default: ''
    },
    currentUserId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      answerType: { type: 15, textLimit: 450, showPayment: false, showTitle: false, showImage: true, showVideo: false,
        showAttached: false, showEmoji: true, showTopic: false, showCaller: true, placeholder: '写下我的评论 ...' },
      editResourceShow: { showUploadImg: false, showUploadVideo: false, showUploadAttached: false },
      answer: { text: '', imageList: [], attachedList: [] },
      onAnswerPublish: false,
      showAnswerEditor: false
    }
  },
  computed: {
    isQuestionUser() {
      return parseInt(this.questionUserId) === parseInt(this.currentUserId)
    },
    isBeAskedUser() {
      return parseInt(this.question.be_user_id) === parseInt(this.currentUserId)
    },
    showAnswer() {
      if (this.question.is_answer === 0) return false
      else return !(!this.isBeAskedUser && !this.isQuestionUser && this.question.onlookerState === '0' && this.question.onlooker_price > 0)
    },
    showAnswerButton() {
      return this.isBeAskedUser && this.question.is_answer === 0
    },
    showOnLookerButton() {
      return !this.isBeAskedUser && !this.isQuestionUser && this.question.onlooker_unit_price > 0 && !this.question.onlookerState && this.question.is_answer === 1
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    siteMasterScale() {
      return this.forums && this.forums.set_site ? this.forums.set_site.site_master_scale / 10 : ''
    },
    siteUserScale() {
      return this.siteMasterScale ? 1 - this.siteMasterScale : ''
    }
  },
  methods: {
    closeEditor() {
      this.answer.text = ''
      this.answer.imageList = []
      this.showAnswerEditor = false
    },
    answerPublish() {
      if (!this.isLogin()) return
      if (this.onAnswerPublish) return
      if (!this.answer.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.answer.text.length > this.answerType.textLimit) return this.$message.warning(this.$t('post.messageLengthCannotOver'))
      this.onAnswerPublish = true
      const id = this.question._jv.id
      const answerParams = {
        _jv: {
          type: `answer`,
          links: { self: `questions/${id}/answer` },
          relationships: {}
        },
        content: this.answer.text,
        type: 5
      }
      this.publishPostResource(answerParams, this.answer)
      return this.$store.dispatch(`jv/post`, [answerParams, { url: `/questions/${id}/answer` }]).then(response => {
        this.postLegalityCheck(response, this.$t('topic.answerPublishSuccess'))
        this.$emit('answerPublished')
        this.closeEditor()
      }, e => this.handleError(e)).finally(() => { this.onAnswerPublish = false })
    }
  }
}
</script>

<style lang="scss" scoped>
.qa {
  .editor-box {
    padding: 20px
  }
  > .block {
    margin-top: 20px;
    display: block;
    text-align: center;
    &.answer {
      border-radius: 5px;
      padding: 15px;
      background: #F7F7F7;
      text-align: left;
      > .header {
        display: flex;
        justify-content: space-between;
        > .counter {
          color: #8590A6;
        }
      }
      > .answer-text {
        text-align: left;
        margin-top: 15px;
        font-size: 16px;
      }
      > .images {
        margin-top: 15px;
        text-align: left;
        width: 330px;
        > .image {
          cursor: pointer;
          width: 100px;
          height: 100px;
          margin-right: 10px;
          margin-bottom: 10px;
        }
      }
    }
    > .tip {
      margin-top: 10px;
      color: #8590A6;
      > .amount {
        color: black;
      }
    }
    > button {
      display: block;
      margin: 0 auto;
      height: 35px;
      padding: 0 20px;
      background: #FA5151;
      color: white;
      line-height: 35px;
      border: none;
      border-radius: 2px;
      > span {
        margin-left: 8px;
      }
    }
  }
}

</style>
