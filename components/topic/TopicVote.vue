<template>
  <div v-if="voteRes" class="vote">
    <div class="vote-top">
      <h1 class="tit">
        {{
          voteRes.optional && voteRes.optional === 1
            ? $t("topic.radioVote")
            : $t("topic.checkboxVote", { num: optional })
        }}
      </h1>
      <div v-if="lookvoteStatus" class="look-player" @click="lookPlayer">{{ $t("topic.lookVotePlayers") }}</div>
    </div>
    <div>
      <div v-if="voteRes.optional && voteRes.optional === 1">
        <el-radio-group
          v-for="(vote, index) in voteData"
          :key="index"
          v-model="radioVal"
          class="vote-item"
        >
          <el-radio
            v-if="!isVoted && !stopStatus"
            :label="vote._jv.id"
            class="vote-radio"
            @change="radioChange"
          >{{ vote.content }}</el-radio>
          <div v-if="isVoted || stopStatus" class="vote-content">{{ `${index + 1}.${vote.content}` }}</div>
          <div v-if="voteRes.is_show_result" class="progress-box">
            <el-progress
              :show-text="false"
              :percentage="Number(vote.percent)"
              color="#1E78F3" 
            />
            <div class="percent">{{ `${vote.percent}%(${vote.count})` }}</div>
          </div>
        </el-radio-group>
      </div>
      <div v-if="voteRes.optional && voteRes.optional > 1">
        <el-checkbox-group
          v-for="(vote, index) in voteData"
          :key="index"
          v-model="checkboxVal"
          class="vote-item"
        >
          <el-checkbox
            v-if="!isVoted && !stopStatus"
            :label="vote._jv.id"
            class="vote-radio"
            @change="checkboxChange(vote._jv.id)"
          >{{ vote.content }}</el-checkbox>
          <div v-if="isVoted || stopStatus" class="vote-content">{{ `${index + 1}.${vote.content}` }}</div>
          <div v-if="voteRes.is_show_result" class="progress-box">
            <el-progress
              :show-text="false"
              :percentage="Number(vote.percent)"
              color="#1E78F3" 
            />
            <div class="percent">{{ `${vote.percent}%(${vote.count})` }}</div>
          </div>
          
        </el-checkbox-group>
      </div>
      <div class="vote-btn-box">
        <div v-if="isVoted" class="already-vote">{{ $t("topic.voted") }}</div>
        <el-button
          v-else
          size="medium"
          :type="stopStatus ? 'info' : 'primary'"
          class="vote-btn"
          :disabled="stopStatus ? true : false"
          @click="voteClick"
        >{{ $t("topic.vote") }}</el-button>
      </div>
      
      <div v-if="!stopStatus" class="count-down">{{ $t("topic.countDown") }}
        <span>{{ day }}</span>{{ $t("topic.day") }}
        <span>{{ hourString }}</span>{{ $t("topic.hour") }}
        <span>{{ minuteString }}</span>{{ $t("topic.minute") }}
      </div>
      <div v-if="stopStatus" class="count-over">{{ $t("topic.itsOver") }}</div>
      <topic-vote-user-list
        v-if="voteRes.is_show_participant"
        :user-list="voteRes.logsUsers"
        :person-num="voteRes.user_count"
      />
    </div>
    <vote-player
      v-if="showCaller"
      :vote-options="voteRes.options"
      @close="showCaller = false"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs';
export default {
  name: 'TopicVote',
  props: {
    // 接收vote
    voteRes: {
      type: Object,
      default: () => {}
    },
    isVoted: {
      type: Boolean,
      default: false
    },
    lookvoteStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      radioVal: 0,
      checkboxVal: [],
      voteData: [], // 投票选项数据
      voteIdData: null, // 已选投票ID
      day: 0,
      hour: '',
      minute: '',
      second: '',
      promiseTimer: '',
      remainTime: this.voteRes.end_day * 86400,
      stopStatus: false,
      optional: 0, // 投票可选项
      showCaller: false // 投票参与人弹框
    };
  },
  computed: {
    dayString() {
      return this.formatNum(this.day);
    },
    hourString() {
      return this.formatNum(this.hour);
    },
    minuteString() {
      return this.formatNum(this.minute);
    },
    secondString() {
      return this.formatNum(this.second);
    }
  },
  mounted() {
    
    // 验证秒杀开始时间是否过期
    // console.log(dayjs().format(), '当前时间',
    //   dayjs().isBefore(dayjs(this.voteRes.created_at)),
    //   dayjs().isSame(dayjs(this.voteRes.end_at)));
    if (!dayjs().isBefore(dayjs(this.voteRes.created_at)) && !dayjs().isSame(dayjs(this.voteRes.end_at))) {
      // console.log('符合判断');
      // 计算当前时间 - 结束时间
      // let time = Math.abs(new Date().getTime() - parseInt(this.vote.end_at));
      let time = dayjs(this.voteRes.end_at).diff(dayjs());
      
      // 转成秒
      time /= 1000;
      // 天
      let d = parseInt(time / 86400);
      // 时
      let h = parseInt((time % 86400) / 3600);
      // 分
      let m = parseInt((time % 3600) / 60);
      // 秒
      let s = parseInt(time % 60);
      // console.log(d, h, m, s, '时间差');
      const t = setInterval(() => {
        s--;
        if (s < 0) {
          m--;
          s = 59;
        }
        if (m < 0) {
          h--;
          m = 59;
        }
        if (h < 0) {
          d--;
          h = 23;
        }
        if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
          this.stopStatus = true;
          // d = h = m = s = 0;
          clearInterval(t); // 清除定时器
        }
        this.day = d;
        this.hour = h;
        this.minute = m;
        this.second = s;
        // this.hour = h < 10 ? `0${h}` : h;
        // this.minute = m < 10 ? `0${m}}` : m;
        // this.second = s < 10 ? `0${s}}` : s;
        // console.log(d, h, m, s, 111111);
      }, 1000);
    } else {
      // console.log('秒杀过期');
    }
  },
  created() {
    if (!dayjs().isBefore(dayjs(this.voteRes.end_at))) {
      this.stopStatus = true;
    }
    let total = 0;
    this.voteRes.options.forEach(item => {
      total += item.count;
    });
    this.voteId = Number(this.voteRes._jv.id);
    this.voteData = this.voteRes.options;
    this.optional = this.voteRes.optional;
    this.voteRes.options.forEach((item, index) => {
      if (total === 0 || Number.isNaN(total)) {
        this.voteData[index].percent = 0;
      } else {
        this.voteData[index].percent = this.format(item.count / total);
      }
    });
  },
  methods: {
    // 将小数转化为百分数
    format(point) {
      const num = Number(point * 100);
      let len = 0;
      if (num.toString().indexOf('.') !== -1) {
        len = num.toString().replace(/^\d+\./, '').length;
      }
      if (len && len >= 2) {
        return num.toFixed(2);
      }
      return num;
    },
    // radioChange(vote) {
    //   console.log(vote, '---');
    // },
    radioChange(curId) {
      // console.log(curId, '单选');
      this.radioVal = curId;
      this.voteIdData = curId;
      // console.log(this.voteIdData, '单选选中的');
    },
    checkboxChange(curId) {
      // console.log(this.checkboxVal, '多选');
      this.voteIdData = this.checkboxVal.join(',');
      // console.log(this.voteIdData, '多选选中的');
    },
    formatNum(num) {
      return num < 10 ? `0${num}` : ` ${num}`;
    },
    // 参与投票
    voteClick() {
      // console.log(this.checkboxVal.length, this.optional, this.voteIdData, '点击投票');
      let voteIds = '';

      if (this.checkboxVal.length > 0) {
        // 多选
        if (this.checkboxVal.length > this.optional) {
          this.$message.warning(this.$t('topic.maximumOptions', { num: this.optional }));
          return;
        }
        voteIds = this.checkboxVal.join(',');
      } else if (this.voteIdData) {
        // console.log('单选');
        voteIds = this.voteIdData;
      } else {
        // console.log('没选');
        this.$message.warning(this.$t('topic.pleaseSelectVoteOptions'));
        return;
      }
      this.$store.dispatch('jv/get', `votes/cast/${this.voteId}/${voteIds}`).then(res => {
        // console.log(res, '成功了');
        this.$emit('voteSuccess', res);
        let total = 0;
        res.options.forEach(item => {
          total += item.count;
        });
        this.voteData = res.options;
        this.optional = res.optional;
        res.options.forEach((item, index) => {
          if (total === 0 || Number.isNaN(total)) {
            this.voteData[index].percent = 0;
          } else {
            this.voteData[index].percent = this.format(item.count / total);
          }
        });
        
      }).catch(err => {
        console.log(err, '报错了');
      });
    },
    lookPlayer() {
      this.showCaller = true;
    }
  }
  
};
</script>
<style lang="scss">
@import "@/assets/css/variable/mixin.scss";
@import "@/assets/css/variable/color.scss";
.vote {
  padding: 15px 16px;
  margin-top: 30px;
  background: $background-color-grey;
  border-radius: 5px;
  .vote-top {
    display: flex;
    justify-content: flex-start;
    .tit {
      padding-bottom: 20px;
      font-size: 16px;
      font-weight: normal;
    }
    .look-player {
      color: $color-blue-base;
      cursor: pointer;
    }
  }
  .count-down {
    padding-top: 10px;
    font-size: 14px;
    color: #6d6d6d;
    text-align: center;
    span {
      color: #303133;
      font-weight: 700;
    }
  }
  .vote-btn-box {
    display: flex;
    justify-content: center;
  }
  .count-over {
    padding-top: 10px;
    font-size: 14px;
    color: #8590A6;
    text-align: center;
  }
  .vote-item {
    display: block;
    padding-bottom: 22px;
    .vote-radio {
      display: flex;
      padding-bottom: 11px;
      font-size: 14px;
      line-height: 19px;
      text-align: left;
    }
  }
  .vote-content {
    font-size: 14px;
    line-height: 25px;
    color: #303133;
  }
  .already-vote {
    padding-top: 10px;
    font-size: 14px;
    color: #8590A6;
  }
}
.el-radio__input.is-checked+.el-radio__label {
  white-space: normal;
  word-break: break-all;
}
* {
  white-space: normal;
  word-break: break-all;
}
.vote-item {
  .el-progress {
    display: flex;
    flex: 1;
    align-items: center;
  }
  .el-progress-bar {
    // padding-right: 58px;
    // margin-right: -61px
  }
}
.progress-box {
  display: flex;
  justify-content: space-between;
  .percent {
    padding-left: 14px;
    font-size: 14px;
    color: $color-blue-base;
  }
}
</style>
