<template>
  <div class="result">
    <div class="result-top">
      <div class="left">
        <div class="title">{{ $t("post.atMost") }}</div>
        <el-input v-model="vote.atMost" placeholder="0项" />
        <!-- <el-select v-model="vote.atMost" placeholder="0项">
          <el-option label="1项" value="1" />
          <el-option label="2项" value="2" />
        </el-select> -->
      </div>
      <div class="right">
        <div class="title">{{ $t("post.countingDays") }}</div>
        <el-input v-model="vote.count" placeholder="0" />
      </div>
    </div>
    <div class="result-bottom">
      <div class="left">
        <div class="title">{{ $t("post.voteResult") }}</div>
        <el-switch
          :value="vote.voteResult"
          active-color="#1878F3"
          @input="value => $emit('isVoteResult', value)"
        />
      </div>
      <div class="right">
        <div class="title">{{ $t("post.participants") }}</div>
        <el-switch
          :value="vote.participants"
          active-color="#1878F3"
          @input="value => $emit('isParticipants', value)"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EditorVoteResult',
  props: {
    vote: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // atMost: '', // 投票可选项
      // count: 0, // 计票天数
      // voteResult: false, // 是否展示投票结果
      // participants: false // 是否公开投票参与人
    };
  }
};
</script>
<style lang="scss" scoped>
.result {
  margin-top: 21px;
  > .result-top {
    display: flex;
    align-items: center;
    color: #6D6D6D;
    font-size: 14px;
    >.left {
      margin-right: 52px;
      >.title {
        margin-bottom: 10px;
      }
    }
    >.right {
      >.title {
        margin-bottom: 10px;
      }
    }
  }
  > .result-bottom {
      display: flex;
      align-items: center;
      color: #6D6D6D;
      font-size: 14px;
      margin-top: 20px;
    >.left {
      margin-right: 160px;
      >.title {
        margin-bottom: 10px;
      }
    }
    >.right {
      >.title {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
