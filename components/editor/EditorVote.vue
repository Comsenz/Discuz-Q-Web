<template>
  <div class="vote">
    <div class="vote-option block">
      <div class="title">
        <span>{{ $t("post.voteOption") }}</span>
        <span class="select-option" @click="addOption">
          {{ $t("post.addOption") }}
        </span>
      </div>
      <div v-for="(item, index) in voteList" :key="index" class="option">
        <el-input
          v-model="item.title"
          class="option-select"
          :placeholder="$t('post.optionSelect')"
          @input="voteInput"
        />
        <svg-icon type="delete" class="icon" @click="remove(index)" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'EditorVote',
  props: {
    voteBeforeList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      voteList: [
        {
          title: ''
        },
        {
          title: ''
        },
        {
          title: ''
        }
      ],
      voteData: [] // 投票项数据
    };
  },
  watch: {
    // 监听得到的数据
    voteData: {
      handler() {
        this.$emit('change', this.voteData);
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    if (this.voteBeforeList.length > 0) {
      this.voteList = [];
      this.voteBeforeList.forEach(item => {
        this.voteList.push({
          title: item.content,
          id: item.id
        });
      });
      this.voteData = this.voteBeforeList;
    }  
  },
  methods: {
    // 增加投票选项
    addOption() {
      this.voteList.push({
        title: ''
      });
    },
    // 删除投票选项
    remove(index) {
      this.voteList.splice(index, 1);
      if (this.voteData.length > 0) {
        this.voteData.forEach((item, vIndex) => {
          const voteIndex = item.id - 1;
          if (voteIndex === index) {
            this.voteData.splice(vIndex, 1);
          }
        });
      }
    },
    voteInput() {
      this.voteData = [];
      this.voteList.forEach(item => {
        if (item.title) {
          if (item.id) {
            this.voteData.push({
              id: item.id,
              content: item.title
            });
          } else {
            this.voteData.push({
              content: item.title
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.vote {
  > .block {
    margin-top: 20px;
  }
  .title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #6d6d6d;
  }
  .select-option {
      font-weight: normal;
      color: #1878F3;
      margin-left: 10px;
      cursor: pointer;
    }
  .option {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    > .option-select {
        flex: 1;
    }
    > .icon {
      margin-left: 5px;
      font-size: 17px;
      color: #6D6D6D;
    }
  }
}

</style>
