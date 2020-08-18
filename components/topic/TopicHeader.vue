<template>
  <div class="title">
    <Avatar :user="author" />
    <div class="title-info">
      <div class="author-name">{{ author.username }}</div>
      <div class="timer">发布于 {{ formatDate(article.createdAt) }}（编辑于 {{ formatDate(article.updatedAt) }}）</div>
    </div>
    <el-dropdown
      v-show="managementList.some(item => item.canOpera)"
      class="dropdown"
      placement="bottom"
      trigger="click"
      @command="handleCommand"
      @visible-change="visibile => isManagementDrop = visibile"
    >
      <div :class="{'management': true, 'on-drop': isManagementDrop}">
        <Icon name="icon-management" />
        {{ $t('topic.management') }}
      </div>
      <el-dropdown-menu slot="dropdown" style="padding: 0 10px">
        <el-dropdown-item
          v-for="(item, index) in managementList"
          :key="index"
          :command="{command: item.command ,item}"
          style="border-bottom: 1px solid #EDEDED; width: 98px; text-align: center"
        >{{ item.text }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div v-if="managementList[1].isStatus || false" class="essence">
      <svg-icon style="font-size: 50px;" type="essence" />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'TopicHeader',
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    article: {
      type: Object,
      default: () => {}
    },
    managementList: {
      type: Array,
      default: () => []
    },
    threadId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isManagementDrop: false
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    handleCommand({ command, item }) {
      // TODO 去发帖
      if (command === 'toEdit') return alert('去发帖页面')
      if (command === 'isDeleted') return this.deleteConfirm(item)
      this.$emit('managementSelected', item)
    },
    deleteConfirm(item) {
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => this.$emit('managementSelected', item))
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  $activeColor: #1878F3;

  .el-dropdown-menu__item:hover {
    background: #ffffff;
    color: $activeColor;
  }
  .title {
    height: 50px;
    display: flex;

    > .title-info {
      margin-left: 6px;
      margin-top: 5px;
      flex: 1;

      .author-name {
        font-size: 16px;
        font-weight: bold;
      }

      .timer {
        margin-top: 5px;
        color: $fontColor;
        font-size: 12px;
      }
    }

    > .dropdown {
      height: 20px;

      > .management {
        cursor: pointer;
        color: $fontColor;

        &:focus {
          border: none;
          outline: none;
        }

        &.on-drop {
          color: $activeColor;
        }
      }
    }
    > .essence {
      transform: translateY(-20px);
    }

  }

</style>
