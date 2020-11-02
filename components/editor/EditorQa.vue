<template>
  <div class="qa">
    <div class="qa-payment block">
      <div class="title">{{ $t('post.questionMode') }}:</div>
      <el-radio :value="question.paymentType" label="free" @input="value => $emit('paymentTypeChange', value)">{{ $t('post.freeWatch') }}</el-radio>
      <el-radio :value="question.paymentType" label="paid" @input="value => $emit('paymentTypeChange', value)">{{ $t('post.paidWatch') }}</el-radio>
    </div>
    <div class="qa-anonymous block">
      <div class="title">{{ $t('post.anonymous') }}:</div>
      <el-switch :value="question.isAnonymous" active-color="#1878F3" @input="value => $emit('isAnonymousChange', value)" />
    </div>
    <div class="qa-onlooker block">
      <div class="title">{{ $t('post.onLooker') }}:</div>
      <el-switch :value="question.isOnlooker" active-color="#1878F3" @input="value => $emit('isOnlookerChange', value)" />
      <span v-show="siteOnlookerPrice && siteMasterScale && siteUserScale" class="tip">
        <span>{{ '他人围观需付费 ' + siteOnlookerPrice + ' 元' }}</span>
        <span>{{ `（你得 ${(siteOnlookerPrice * siteUserScale / 2).toFixed(2)} 元，回答者得 ${(siteOnlookerPrice * siteUserScale / 2).toFixed(2)} 元，平台得 ${(siteOnlookerPrice * siteMasterScale).toFixed(2)} 元）` }}</span>
      </span>
    </div>
    <div class="qa-answerer block">
      <div class="title">
        <span>{{ $t('post.questionHim') }}:</span>
        <span class="select-answerer" @click="showQACaller = true">
          {{ Object.keys(beAskedUser).length > 0 ? $t('post.changeBeAskedUser') : $t('post.addBeAskedUser') }}
        </span>
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
      beAskedUser: {},
      showQACaller: false
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    siteOnlookerPrice() {
      return this.forums && this.forums.set_site ? this.forums.set_site.site_onlooker_price : ''
    },
    siteMasterScale() {
      return this.forums && this.forums.set_site ? this.forums.set_site.site_master_scale / 10 : ''
    },
    siteUserScale() {
      return this.siteMasterScale ? 1 - this.siteMasterScale : ''
    }
  },
  // TODO beAskedUser 回显
  mounted() {
    console.log(this.forums, 'forums')
  },
  methods: {
    selectedQaCaller(user) {
      this.beAskedUser = user
      this.showQACaller = false
      this.$emit('beUserChange', user)
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
      min-width: 230px;
      height: 70px;
      padding: 0 11px;
      display: inline-flex;
      align-items: center;
      background: #F4F5F6;
      border: 1px solid #EDEDED;
      border-radius: 2px;
    }
    > .tip {
      font-size: 14px;
      margin-left: 15px;
      color: #6D6D6D;
      span:last-child {
        color: #CCCCCC;
      }
    }
  }
}

</style>
