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
      <div class="answer-text" v-html="$xss(question.content_html)" />
    </div>
    <div v-if="showAnswerButton" class="block">
      <button>
        <svg-icon type="question" style="font-size: 15px" />
        <span>回答问题</span>
      </button>
    </div>
    <div v-if="showOnLookerButton" class="block">
      <button>
        <svg-icon type="yuan" style="font-size: 15px" />
        <span>答案支付 2 元可见</span>
      </button>
    </div>
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff'
export default {
  name: 'QaActions',
  mixins: [timerDiff],
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
  computed: {
    isQuestionUser() {
      return parseInt(this.questionUserId) === parseInt(this.currentUserId)
    },
    isBeAskedUser() {
      return parseInt(this.be_user_id) === parseInt(this.currentUserId)
    },
    showAnswer() {
      if (this.question.is_answer === 0) return false
      else return !(!this.isBeAskedUser && !this.isQuestionUser && this.question.onlookerState === '0' && this.question.onlooker_price > 0)
    },
    showAnswerButton() {
      return this.isBeAskedUser && this.question.is_answer === 1
    },
    showOnLookerButton() {
      return !this.isBeAskedUser && !this.isQuestionUser && this.question.onlooker_price > 0 && this.question.onlookerState === '0'
    }
  }
}
</script>

<style lang="scss" scoped>
.qa {
  > .block {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    &.answer {
      display: block;
      border-radius: 5px;
      padding: 15px 15px 30px;
      background: #F7F7F7;
      > .header {
        display: flex;
        justify-content: space-between;
        > .counter {
          color: #8590A6;
        }
      }
      > .answer-text {
        margin-top: 15px;
        font-size: 16px;
      }
    }
    > button {
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
