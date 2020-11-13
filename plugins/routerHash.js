export default [
  { // 详情页
    h5: '/topic/index',
    pc: '/thread',
    dynamic: 'id'
  },
  { // 发布页
    h5: '/topic/post',
    pc: '/thread/post'
  },
  { // 评论详情页
    h5: '/pages/topic/comment',
    pc: '/thread/comment'
  },
  { // 搜索结果页
    h5: '/pages/site/search',
    pc: '/site/search'
  },
  { // 搜索用户列表页
    h5: '/pages/site/search-user',
    pc: '/site/search-user'
  },
  { // 位置信息页
    h5: '/pages/topic/position',
    pc: '/topic/position'
  },
  { // 话题详情页
    h5: '/pages/topic/content',
    pc: '/topic',
    dynamic: 'id'
  },
  { // 话题列表页
    h5: '/pages/topic/list',
    pc: '/topic/list'
  },
  { // 站点信息页
    h5: '/pages/site/index',
    pc: '/site'
  },
  { // 站点管理页
    h5: '/pages/manage/index',
    pc: '/manage'
  },
  { // 推广邀请页
    h5: '/pages/invite/index',
    pc: '/invite'
  },
  { // 我的收藏
    h5: '/pages/my/favorite',
    pc: '/my/favorite'
  },
  { // 消息页
    h5: '/',
    pc: '/my/notice'
  },
  { // 分类页
    h5: '/',
    pc: '/category',
    dynamic: 'id'
  }
]
