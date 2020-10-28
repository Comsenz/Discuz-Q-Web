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
    </div>
    <qa-caller v-if="showQACaller" @close="showQACaller = false" />
  </div>
</template>

<script>
export default {
  name: 'EditorQa',
  props: {
    question: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      paymentRadio: 'free',
      isAnonymous: false,
      canLooker: false,
      showQACaller: false
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
  }
}

</style>
