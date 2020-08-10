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
    <div>{{ info }}</div>

    <p>store commit</p>
    <el-button type="primary" @click="storeCommit">store commit</el-button>
    <div>{{ $store.state.demo.counter }}</div>
  </div>
</template>

<script>
export default {
  // 异步数据用法
  async asyncData({ params, store }) {
    const _params = {
      _jv: {
        type: 'forum'
      }
    }

    const data = await store.dispatch('jv/get', _params)
    // console.log('asyncData =>', data)
    return { info: data }
  },
  data() {
    return {
      info: ''
    }
  },
  mounted() {
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
  methods: {
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
