export default {
  // pc端地址和移动端地址映射
  map: {
    '/topic/:id?': '/pages/topic/index?id=',
    '/profile': '/pages/profile/index?userId=',
    '/topic/post/:type?': '/pages/topic/post?type=',
    '/search/user': '/pages/site/search-user?value=',
    '/location': '/pages/topic/position',
    '/site/partner-invite': '/pages/site/partner-invite?code=',
    '/topic/comment': '/pages/topic/comment',
    '/search': '/pages/site/search',
    '/user/login': '/pages/user/login',
    '/user/register': '/pages/user/register',
    '/modify/findpwd': '/pages/modify/findpwd?pas=reset_pwd',
    '/my/profile': '/pages/my/profile',
    '/my/wallet': '/pages/my/wallet',
    '/my/favorite': '/pages/my/favorite',
    '/my/myshield': '/pages/my/shield',
    '/my/circleinfo': '/pages/site/index',
    '/my/sitemanagement': '/pages/manage/index',
    '/my/invite': '/pages/invite/index',
    '/site/info': '/pages/site/info'
  }
}
