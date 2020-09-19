<template>
  <div class="title">
    <avatar-component :author="author">
      {{ $t('topic.publishAt') }} {{ timerDiff(thread.createdAt) + $t('topic.before') }} ..
      <!--  TODO thread.updateAt 没更新，只能先用 firstPost.updateAt   -->
      （{{ $t('topic.editAt') }} {{ timerDiff(thread.firstPost ? thread.firstPost.updatedAt : '') + $t('topic.before') }}）
    </avatar-component>
    <div class="container-management">
      <el-dropdown
        v-if="managementList.length > 0"
        class="dropdown"
        placement="bottom"
        trigger="click"
        @command="handleCommand"
        @visible-change="visibile => isManagementDrop = visibile"
      >
        <div :class="{'management': true, 'on-drop': isManagementDrop}">
          <svg-icon type="setting" class="icon-setting" style="font-size: 16px" />
          <span> {{ $t('topic.management') }} </span>
        </div>
        <el-dropdown-menu slot="dropdown" style="padding: 0 10px">
          <el-dropdown-item
            v-for="(item, index) in managementList"
            :key="index"
            :command="{command: item.command ,item}"
            style="border-bottom: 1px solid #EDEDED; width: 98px; text-align: center"
          >
            {{ item.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="report" @click="reportClick">
        <svg-icon type="report" class="icon-setting" style="font-size: 16px" />
        {{ $t('report.reportTitle') }}
      </div>
      <topic-report v-if="isReport" :thread-id="thread._jv.id" :type="1" @close="isReport = false" />
      <div v-if="thread.isEssence" class="essence">
        <svg-icon style="font-size: 51px;" type="essence" />
      </div>
    </div>
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff'

export default {
  name: 'TopicHeader',
  mixins: [timerDiff],
  props: {
    author: {
      type: Object,
      default: () => { }
    },
    thread: {
      type: Object,
      default: () => { }
    },
    managementList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isManagementDrop: false,
      isReport: false
    }
  },
  methods: {
    handleCommand({ command, item }) {
      if (command === 'toEdit') return this.$router.push('/topic/post/' + this.thread.type + '?threadId=' + this.thread._jv.id)
      if (command === 'isDeleted') return this.deleteConfirm(item)
      this.$emit('managementSelected', item)
    },
    deleteConfirm(item) {
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => this.$emit('managementSelected', item))
    },
    reportClick() {
      this.isReport = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.el-dropdown-menu__item:hover {
  background: #ffffff;
  color: $color-blue-base;
}
.title {
  height: 50px;
  display: flex;
  justify-content: space-between;

  > .container-management {
    display: flex;
    .report {
      margin-top: 5px;
      font-size: 16px;
      line-height: 16px;
      cursor: pointer;
      color: #d0d4dc;
      margin-left: 20px;
      height: 16px;
      .warning {
        height: 16px;
      }
    }
    > .dropdown {
      height: 20px;

      > .management {
        margin-top: 5px;
        font-size: 16px;
        line-height: 16px;
        cursor: pointer;
        color: $font-color-grey;

        &:focus {
          border: none;
          outline: none;
        }

        &.on-drop {
          color: $color-blue-base;
          > .icon-setting {
            fill: $color-blue-base;
          }
        }
      }
    }
    > .essence {
      transform: translate(10px, -20px);
    }
  }
}
</style>
