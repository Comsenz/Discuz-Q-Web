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
      <div class="title">{{ $t('post.questionHim') }}:</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorQa',
  data() {
    return {
      paymentRadio: 'free',
      isAnonymous: false,
      canLooker: false
    }
  }
}
</script>

<style lang="scss" scoped>
.qa {
  > .block {
    margin-top: 20px;
    > .title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #6D6D6D;
    }
  }
}

</style>
