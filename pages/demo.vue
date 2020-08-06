<template>
  <div>
  <el-button>默认按钮</el-button>
    <el-button type="primary" @click="getData">获取数据</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="info">信息按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger" @click="storeCommit">store commit</el-button>
    <p>svg</p>
    <div>
      <svg-icon style="font-size: 100px;" type="alipay" />
    </div>
    <div>{{info}}</div>

    <p>store commit</p>
    <el-button type="primary" @click="storeCommit">store commit</el-button>
    <div>{{$store.state.demo.counter}}</div>
  </div>
</template>

<script>
import demoApi from '@/api/v1/demo'
export default {
  // 异步数据用法
  async asyncData({ params }) {
    const { data } = await demoApi.getForumInfo()
    return { info: data.data }
  },
  data() {
    return {
      info: ''
    }
  },
  methods: {
    getData() {
      console.log(demoApi)
      demoApi.getForumInfo().then(res => {
        console.log('res =>', res.data.data)
        this.info = JSON.stringify(res.data.data || {})
      })
    },
    storeCommit() {
      this.$store.commit('demo/increment')
    }
  }
}
</script>