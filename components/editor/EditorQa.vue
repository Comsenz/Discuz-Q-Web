<template>
  <div class="qa">
    <div class="qa-payment block">
      <div class="title">{{ $t('post.isPay') }}:</div>
      <el-radio v-model="paymentRadio" label="free">{{ $t('post.freeWatch') }}</el-radio>
      <el-radio v-model="paymentRadio" label="paid">{{ $t('post.paidWatch') }}</el-radio>
    </div>
    <div class="qa-anonymous block">
      <div class="title">{{ $t('post.anonymous') }}:</div>
      <el-switch v-model="isAnonymous" active-color="#1878F3" />
    </div>
    <div class="qa-onlooker block">
      <div class="title">{{ $t('post.onLooker') }}:</div>
      <el-switch v-model="canLooker" active-color="#1878F3" />
    </div>
    <div class="qa-answerer block">
      <div class="title">
        <span>{{ $t('post.questionHim') }}:</span>
        <span class="select-answerer" @click="showQACaller = true">+选择回答者</span>
      </div>
      <div v-show="Object.keys(beAskedUser).length > 0" class="be-asked-user">
        <avatar-component :author="beAskedUser" :size="50" round>
          {{ $t('topic.activeAt') }} {{ timerDiff(beAskedUser.updatedAt) }}{{ $t('topic.before') }}
        </avatar-component>
      </div>
    </div>
    <qa-caller v-if="showQACaller" @close="showQACaller = false" @selectedQaCaller="selectedQaCaller" />
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff'

export default {
  name: 'EditorQa',
  mixins: [timerDiff],
  props: {
    question: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      paymentRadio: 'free',
      beAskedUser: {},
      isAnonymous: false,
      canLooker: false,
      showQACaller: false
    }
  },
  methods: {
    selectedQaCaller(user) {
      this.beAskedUser = user
      this.showQACaller = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';

.qa {
  > .block {
    margin-top: 20px;
    > .title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #6D6D6D;
      > .select-answerer {
        font-weight: normal;
        color: $color-blue-base;
        margin-left: 10px;
        cursor: pointer;
      }
    }
    > .be-asked-user {
      width: 230px;
      min-width: 230px;
      height: 70px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #F4F5F6;
      border: 1px solid #EDEDED;
      border-radius: 2px;
    }
  }
}

</style>
