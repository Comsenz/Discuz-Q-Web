<template>
  <div class="global">
    <div v-if="personNum > 0" class="per-num">{{ $t('topic.allVotePer', { personNum }) }}</div>
    <div v-if="personRes.length > 0" class="det-per-list">
      <div v-for="(person, index) in personRes" :key="index" class="det-person">
        <Avatar
          :key="index"
          class="container-avatar"
          size="30"
          round
          :user="person"
        />
      </div>
    </div>
    <div v-if="userList.length > limitCount" class="fold-box" @click="foldClick()">
      <svg-icon
        style="font-size: 20px; margin-top: 10px; fill: #8590A6"
        :style="{ transform: transform }"
        type="drop-down"
      />
    </div>
  </div>
</template>

<script>
import isLogin from '@/mixin/isLogin';
export default {
  name: 'TopicRewardList',
  mixins: [isLogin],
  props: {
    userList: {
      type: Array,
      default: () => []
    },
    // list总数
    personNum: {
      default: '0',
      type: [Number, String]
    },
    // 初始化显示数量
    limitCount: {
      default: '24',
      type: [Number, String]
    }
  },
  data() {
    return {
      personRes: [],
      foldStatus: false,
      transform: '',
      icon: 'pay'
    };
  },
  watch: {
    // 监听得到的数据
    userList: {
      handler(newVal) {
        console.log(newVal, '数据');
        newVal.map(item => {
          const person = item;
          person.showAvatar = true;
          return person;
        });
        // this.personRes = newVal;
        this.personRes = this.limitArray(newVal, this.limitCount);
      },
      deep: true,
      immediate: true
    }
    // personRes: {
    //   handler(newVal) {
    //     console.log(newVal, '数据监听');
    //     // newVal.map(item => {
    //     //   const person = item;
    //     //   person.showAvatar = true;
    //     //   return person;
    //     // });
    //     // this.personRes = newVal;
    //     // this.personRes = this.limitArray(newVal, this.limitCount);
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  methods: {
    // 数组取前几条数据
    limitArray(obj, limit) {
      const arr = [];
      Object.values(obj).forEach((item, index) => {
        if (index >= limit) {
          return;
        }
        arr.push(item);
      });
      this.personRes = arr;
      return arr;
    },
    // 展开 折叠
    foldClick() {
      this.foldStatus = !this.foldStatus;
      console.log(this.personNum, this.limitCount);
      // this.$emit('btnClick', param);
      if (this.foldStatus) {
        this.transform = 'rotate(180deg)';
        this.personRes = this.limitArray(this.userList, this.personNum);
        // console.log(this.personRes, '展开');
      } else {
        this.transform = '';
        this.personRes = this.limitArray(this.userList, this.limitCount);
        // console.log(this.personRes, '折叠');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.global {
  > .group {
    display: flex;
    flex-direction: column;
    align-items: center;

    > .title {
      margin-top: 20px;
      color: $font-color-grey;
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
          margin-bottom: 5px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    > .rotate {
      transform: rotate(180deg);
      transition: 0.5s;
    }

    > button {
      display: flex;
      align-items: center;
      margin-top: 30px;
      border-radius: 2px;
      height: 35px;
      padding: 0 35px;
      text-align: center;
      background: #fa5151;

      > span {
        color: #ffffff;
      }
    }
  }
}
.per-num {
  padding-top: 28px;
  padding-bottom: 10px;
  font-size: 14px;
  color: #8590A6;
  text-align: center;
}
.det-per-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.fold-box {
  display: flex;
  justify-content: center;
}
</style>
