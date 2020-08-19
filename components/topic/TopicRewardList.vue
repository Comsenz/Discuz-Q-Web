<template>
  <div class="global">
    <div v-for="(userList, usersIndex) in userLists" :key="usersIndex" class="group">
      <div v-if="userList.length > 0" class="title">{{ userList.length + $t('topic.personUnit') +
        $t(`topic.${command[usersIndex].title}`) }}
      </div>
      <div v-if="userList.length > 0" class="person-list">
        <div class="first-show">
          <template v-for="(user, index) in userList.slice(0, command[usersIndex].value)">
            <Avatar :key="index" class="container-avatar" size="30" round :user="user" />
          </template>
        </div>
      </div>
      <div
        v-if="userList.length > 24"
        :class="{'rotate': command[usersIndex].value > userList.length}"
        @click="showMore(command[usersIndex] ,userList.length)"
      >
        <svg-icon style="font-size: 20px; margin-top: 10px; fill: #8590A6" type="drop-down" />
      </div>
      <button v-if="command[usersIndex].showButton && command[usersIndex].buttonText" @click="$emit('payOrReward', command[usersIndex].title)">
        <svg-icon style="font-size: 18px; fill: white" type="heart" />
        <span>{{ $t(`topic.${command[usersIndex].buttonText}`) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopicRewardList',
  props: {
    userLists: {
      type: Array,
      default: () => []
    },
    paidInformation: {
      type: Object,
      default: () => {
      }
    },
    threadType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      payButtonText: ['', 'paymentViewRemainingContent', 'paymentViewVideo', 'paymentViewPicture'],
      command: [
        {
          value: 24,
          title: 'pay',
          buttonText: 'pay'
        },
        {
          value: 24,
          title: 'reward',
          buttonText: 'reward'
        },
        {
          value: 24,
          title: 'like'
        }]
    }
  },
  watch: {
    paidInformation: {
      handler(val) {
        this.command[0].showButton = parseFloat(val.price) > 0 && !val.paid
        this.command[1].showButton = parseFloat(val.price) === 0
      },
      deep: true
    },
    threadType(val) {
      this.command[0].buttonText = this.payButtonText[val]
    }
  },
  methods: {
    showMore(obj, length) {
      obj.value < length ? obj.value += 24 : obj.value = 24
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  .global {
    > .group {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;

      > .title {
        color: $fontColor;
        font-size: 14px;
      }

      > .person-list {
        margin: 10px auto 0;
        min-height: 33px;
        width: 400px;

        > .first-show {
          width: 100%;
          height: 100%;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;

          > .container-avatar {
            margin-right: 3px;

            &:last-child {
              margin-right: 0;
            }
          }
        }
      }

      > .rotate {
        transform: rotate(180deg);
        transition: .5s;
      }

      > button {
        margin-top: 30px;
        border-radius: 2px;
        height: 35px;
        padding: 0 35px;
        text-align: center;
        background: #FA5151;

        > span {
          color: #ffffff;
          line-height: 40px;

        }
      }
    }
  }

</style>
