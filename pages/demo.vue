<template>
  <div>
  <el-button>默认按钮</el-button>
    <el-button type="primary" @click="getData">获取数据</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="info">信息按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>
    
    <div>{{info}}</div>
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
    }
  }
}
</script>