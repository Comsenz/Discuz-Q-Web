<template>
  <div>
    <div>
      <div v-for="(item, index) in attr" :key="index">
        <p :class="{ red: item.isSelect }">{{ item.text }}</p>
        <el-button @click="selectFn(index)">点我</el-button>
      </div>
    </div>
    <el-button>默认按钮</el-button>
    <el-button type="primary" @click="getData">获取数据</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="info">信息按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger" @click="storeCommit">store commit</el-button>
    <div id="vditor" />
    <p>svg</p>
    <div>
      <svg-icon style="font-size: 100px;" type="alipay" />
    </div>

    <p>store commit</p>
    <el-button type="primary" @click="storeCommit">store commit</el-button>
    <div style="margin-top: 100px">
      <Upload accept="image/*" :file-list="imageList" action="/attachments" />
    </div>
  </div>
</template>

<script>
// 只在前端渲染
const Vditor = process.client ? require('vditor') : ''
export default {
  data() {
    return {
      info: '',
      imageList: []
    }
  },
  mounted() {
    console.log('Vditor => ', Vditor)
    if (Vditor) {
      this.contentEditor = new Vditor('vditor', {
        icon: 'material',
        mode: 'wysiwyg',
        toolbarConfig: {
          pin: true
        },
        cache: {
          enable: false
        },
        after: () => {
          this.contentEditor.setValue('hello, Vditor + Vue!')
        }
      })
    }
    const params = {
      _jv: {
        type: 'users?page[limit]=4'
      },
      include: 'groups'
    }
    this.$store.dispatch('jv/get', params).then(data => {
      console.log('user data => ', data)
    })
  },
  destroyed() {
    this.contentEditor && this.contentEditor.destroy()
  },
  methods: {
    selectFn(index) {
      // console.log('当前点击索引', index)
      // const _attr = [...this.attr]
      // _attr[index].text = '!_attr[index].isSelect'
      // _attr[index].isSelect = !_attr[index].isSelect
      // this.attr = _attr
    },
    getData() {
      const params = {
        _jv: {
          type: 'forum'
        }
      }
      this.$store.dispatch('jv/get', params).then(data => {
        console.log('forum data => ', data)
        this.info = data
      })
    },
    storeCommit() {
      this.$store.commit('demo/increment')
    }
  }
}
</script>

<style scoped>
  .red {
    color: red
  }
</style>
