/**
 * 中文 - 只是列举出来了部分时间和提示相关的文案，这个可以根据具体需求进行更改和添加
 * 注意和英文或者其它语言对齐
 */
export default {
  discuzq: {
    // 测试，不用的时候可以删掉
    hello: '你好',
    // 常用
    ok: '确认',
    close: '关闭',
    // 日期相关
    date: {
      now: '此刻',
      today: '今天',
      sec: '秒',
      min: '分钟',
      day: '天',
      hour: '小时',
      mon: '月',
      year: '年',
      month1: '1 月',
      month2: '2 月',
      month3: '3 月',
      month4: '4 月',
      month5: '5 月',
      month6: '6 月',
      month7: '7 月',
      month8: '8 月',
      month9: '9 月',
      month10: '10 月',
      month11: '11 月',
      month12: '12 月',
      week: '周',
      weeks: {
        sun: '日',
        mon: '一',
        tue: '二',
        wed: '三',
        thu: '四',
        fri: '五',
        sat: '六'
      },
      months: {
        jan: '一月',
        feb: '二月',
        mar: '三月',
        apr: '四月',
        may: '五月',
        jun: '六月',
        jul: '七月',
        aug: '八月',
        sep: '九月',
        oct: '十月',
        nov: '十一月',
        dec: '十二月'
      },
      morning: '上午',
      afternoon: '下午'
    },
    // 列表加载提示相关
    list: {
      loading: '加载中',
      noMatch: '无匹配数据',
      noData: '暂无数据',
      noMoreData: '没有更多数据了',
      noshield: '您没有屏蔽任何人'
    },
    // 提示框
    msgBox: {
      title: '提示',
      confirm: '确定',
      cancel: '取消',
      error: '输入的数据不合法!',
      modifySuccess: '修改成功',
      operateSuccess: '操作成功',
      createSuccess: '创建成功',
      copySuccess: '链接已复制到剪贴板'
    },
    // 上传
    upload: {
      delete: '删除',
      preview: '查看图片',
      continue: '继续上传'
    },
    // 图片
    image: {
      error: '加载失败',
      imageUploading: '图片上传中...'
    },
    // 视频
    video: {
      error: '加载失败',
      videoUploading: '视频上传中...'
    },
    // 导航
    pageHeader: {
      title: '返回'
    },
    // @人员页面
    atMember: {
      atTitle: '选择@人员',
      selectedMember: '搜索成员',
      notSelected: '尚未选',
      selected: '@ 已选'
    },
    role: {
      noRole: '暂无角色'
    },
    symbol: {
      colon: '：'
    }
  },
  uploader: {
    uploadFailed: '上传失败',
    uploadedSuccessfully: '上传成功',
    videoUploadedSuccessfully: '视频上传成功',
    videoUploading: '视频上传中...'
  },
  core: {
    register_close: '站点禁止注册',
    regcode: '为加强站内人员管理，站点开启了人工验证注册用户，请耐心等待审核通过。',
    bind_error: '绑定错误',
    noAvatar: '无',
    thousand: '万',
    content: '内容',
    not_authenticated: '请登录',
    admin_login: '管理员登录',
    back_home: '返回 DISCUZ!Q 主页',
    back_history: '返回上一级页面',
    close: '点击关闭',
    user_deny: '对方设置了屏蔽，无法进行此操作',
    page_not_found: '页面没有找到',
    page_not_found_detail: '您要访问的页面可能已被删除，已更改名称或者暂时不可用',
    not_install: '该站点未安装',
    postTypesDoNotMatch: '帖子类型不匹配，请重新进入本页面',
    cancel: '取消',
    generatePoster: '生成海报',
    wxShare: '微信分享',
    copyLink: '复制链接',
    unknown_error: '未知错误',
    sms_interval: '短信间隔错误',
    update_permission_error: '更新权限错误',
    file_not_allow: '非法文件',
    uninitialized_pay_password: '未初始化支付密码',
    default: '系统错误，请联系管理员',
    access_denied: '拒绝访问',
    category_not_found: '请选择分类',
    censor_not_passed: '抱歉，您填写的内容包含不良信息',
    model_not_found: '您访问的内容不存在或已被删除',
    post_not_found: '您访问的内容不存在或已被删除',
    noViewPermission: '没有查看权限，请点击返回上一级',
    route_not_found: '路由未找到',
    no_bind_user: '未绑定用户',
    account_has_been_bound: '用户或微信已绑定',
    thread_count_fail: '主题数操作错误',
    thread_behavior_fail: '主题状态异常',
    thread_action_fail: '主题操作异常',
    reply_content_cannot_null: '内容不能为空',
    upload_error: '上传图片失败',
    scale_sum_not_10: '分成比例相加必须为 10',
    cannot_delete_category_with_threads: '无法删除存在主题的分类',
    permission_denied: '没有权限，请联系站点管理员',
    validation_error: '验证错误',
    user_update_error: '修改信息失败',
    upload_time_not_up: '上传头像频繁，一天仅允许上传一次头像',
    order_post_not_found: '订单主题不存在',
    order_type_not_found: '订单类型有误',
    order_create_failure: '订单创建失败',
    status_cash_freeze: '钱包已冻结提现',
    available_amount_error: '钱包可用金额不足',
    operate_type_error: '操作类型不存在',
    wallet_status_error: '钱包状态有误',
    file_type_not_allow: '文件类型不允许',
    file_size_not_allow: '文件大小不允许',
    sms_verify_error: '验证码错误',
    operate_forbidden: '非法操作',
    login_failed: '帐号或密码错误',
    login_failures_times_toplimit: '密码错误次数达到5次，请15分钟后再次尝试',
    site_closed: '站点已关闭！',
    ban_user: '您的帐号被禁用，无法访问本站点',
    thread_deleted: '当前主题已被删除',
    post_deleted: '当前评论已被删除',
    register_validate: '帐号审核中，请审核通过后尝试',
    registerValidate: '注册成功，请等待审核',
    waitValidate: '感谢您的注册，站点开启了人工验证注册用户，请等待审核',
    validate_reject: '您的注册申请未通过,无法登录',
    validate_ignore: '您的注册申请还未处理,请稍后尝试',
    mobile_is_already_bind: '手机已经绑定',
    setting_fill_register_reason: '注册时的注册原因必须必填',
    faceid_error: '身份信息验证不通过',
    invalid_emoji_path: '无效的表情目录',
    notification_is_missing_template_config: '微信推送信息不全',
    tencent_secret_key_error: '腾讯云Secretid或SecretKey不正确',
    tencent_vod_transcode_error: '腾讯云云点播转码模板未设置',
    tencent_vod_subappid_error: '腾讯云云点播子应用错误',
    tencent_qcloud_close_current: '腾讯云API配置没有开启',
    pay_password_failures_times_toplimit:
      '您输入的密码错误次数已超限，请点击忘记密码找回或次日后重试',
    qcloud_vod_cover_template_not_found: '截图模版不存在',
    contentdown: '显示更多...',
    contentrefresh: '正在加载...',
    noMoreData: '没有更多数据了',
    loading: '加载中...',
    sort: '排序',
    loadMore: '上拉加载更多',
    TheAmountCannotExceedOneMillion: '金额最高不能超过100万元',
    available: '暂无数据',
    userDeleted: '该用户已被删除',
    InvalidParameterValue: '腾讯云配置参数错误',
    wallet_error: '钱包错误',
    content_banned: '内容被拒绝',
    trade_error: '交易错误',
    order_type_error: '订单类型错误',
    order_amount_error: '订单金额有误',
    cash_interval_time: '提现处于限制间隔天数内',
    cash_sum_limit: '超出每日提现金额限制',
    post_not_comment: '不能回复，回复回帖的内容',
    post_not_fond: '未查询到该条回复',
    wechat_mobile_unbound: '微信未绑定手机号',
    unable_to_get_location: '无法获取地理位置',
    '二维码已失效，扫码超时': '二维码已失效，扫码超时'
  },
  // 发布页
  post: {
    download: '下载',
    free: '免费',
    callFriends: '@圈友',
    myFriends: '我的好友',
    chosen: '已选择',
    confirmChoice: '确定选择',
    searchFriends: '请输入昵称，来搜索圈友',
    topicInputTip: '请选择或直接输入#话题#',
    pleaseInputPostTitle: '请输入文章标题',
    note: '还能输入{num}个字',
    exceed: '已超出{num}个字',
    word: '{num}字',
    placeholder: '您想说的..',
    postText: '发文字',
    postPost: '发帖子',
    postVideo: '发视频',
    postImage: '发图片',
    post: '发 布',
    isPay: '付费模式',
    freeWatch: '免费查看',
    paidWatch: '付费查看',
    pleaseInput: '请输入',
    paymentAmount: '付费金额',
    freeWordCount: '免费的查看字数',
    location: '地理位置',
    pleaseSelectLocation: '请选择位置',
    selectToViewFreeWordCount: '选择查看免费字数',
    chooseCategory: '选择分类',
    selectToViewPaymentAmount: '选择查看付费金额',
    cancel: '取消',
    enterToViewPaymentAmount: '输入查看付费金额',
    enterTheWordCount: '输入查看字数',
    wordItem: '字',
    yuanItem: '￥',
    yuan: '元',
    customize: '自定义',
    messageLengthCannotOver: '内容字数超出限制',
    theTitleCanNotBeBlank: '标题不能为空',
    theContentCanNotBeBlank: '内容不能为空',
    theClassifyCanNotBeBlank: '请选择分类',
    imageCannotBeEmpty: '图片不能为空',
    videoCannotBeEmpty: '视频不能为空',
    pleaseWaitForTheVideoUploadToComplete: '请等待视频上传完成',
    pleaseWaitForTheImageUploadToComplete: '请等待图片上传完成',
    pleaseWaitForTheAttachedUploadToComplete: '请等待附件上传完成',
    imageUploadFail: '图片上传失败',
    attachmentUploadFail: '附件传失败',
    videoUploadFail: '视频上传失败',
    attachmentUpload: '附件上传',
    failedToObtainSignature: '获取签名失败',
    fromWeChatApplet: '来自微信小程序',
    pleaseEnterAPostTitle: '请输入帖子标题'
  },
  topic: {
    attachment: '附件',
    topicPageTitle: '内容详情页',
    commentPageTitle: '评论详情页',
    topictitle: '#话题#',
    topictitlelist: '话题列表',
    newTopic: '新话题',
    allTopics: '全部话题',
    contents: '内容数',
    topicList: '话题列表',
    personUnit: '人',
    delete: '删除',
    all: '全部',
    management: '管理',
    reply: '回复',
    replyAlready: '已有回复',
    replyTa: '回复',
    showOther: '展开其他',
    getLike: '点赞',
    like: '赞',
    liked: '已赞',
    share: '分享',
    writeComment: '写评论',
    writeComments: '写评论...',
    showMore: '查看更多',
    foldComment: '折叠评论',
    foldReply: '折叠回复',
    reward: '打赏',
    pay: '支付',
    read: '阅读',
    readAlready: '人读过',
    collection: '收藏',
    collectionAlready: '已收藏',
    confirmCancelCollection: '确认取消收藏？',
    cancelCollectionSuccess: '取消收藏成功',
    item: '条',
    author: '作者',
    content: '内容',
    comment: '评论',
    switchToPositiveSort: '切换为评论时间正序',
    switchToNegativeSort: '切换为评论时间倒序',
    noComment: '暂无评论',
    noMoreData: '没有更多数据了',
    whole: '全部',
    paymentViewPicture: '支付查看图片',
    paymentViewRemainingContent: '支付查看剩余内容',
    paymentViewVideo: '支付查看视频',
    publishExamineTip: '您发布的内容正在审核中哦',
    examineTip: '内容正在审核中，审核通过后才能正常显示！',
    underReview: '内容正在审核中，审核通过后才能生成海报',
    commentTip: '当前评论正在审核中，审核通过后才能正常显示！',
    transcodingTip: '视频正在转码中，转码成功后才能正常显示！',
    transcodingFailedTip: '视频转码失败，转码成功才能正常显示！',
    powerTip: '没有权限，请联系站点管理员',
    inReview: '审核中',
    note: '450',
    canWrite: '还能输入',
    word: '个字',
    publish: '发布',
    commentPublishSuccess: '评论发布成功',
    replyPublishSuccess: '回复发布成功',
    publishAt: '发布于',
    editAt: '编辑于',
    replyContentCannotBeEmpty: '回复内容不能为空',
    supportTheAuthorToCreate: '支持作者继续创作',
    enterTheRewardPaymeAmount: '输入打赏付费金额',
    edit: '编辑',
    essence: '精华',
    cancelEssence: '取消精华',
    sticky: '置顶',
    cancelSticky: '取消置顶',
    confirmDelete: '确定删除此内容吗？',
    deleteFail: '取消失败，请联系管理员操作',
    stickySuccess: '置顶成功',
    cancelStickySuccess: '已取消置顶',
    deleteSuccessAndJumpToBack: '删除成功，跳转到首页',
    imageNumLimit: '评论只允许上传3张图片',
    noReplyPermission: '没有回复权限',
    noThreadLikePermission: '没有主题点赞权限',
    noReplyLikePermission: '没有评论点赞权限',
    noCommentLikePermission: '没有回复点赞权限',
    deleteSuccessAndJumpToTopic: '删除成功，跳转到主题详情页',
    deleteFailed: '删除失败',
    deleteSuccess: '删除成功',
    iCantRewardMyself: '自己不能打赏自己哦',
    searchTopic: '搜索话题',
    hot: '热度',
    sortTimeSequence: '评论时间正序',
    sortTimeReverse: '评论时间倒序',
    itsAlreadyWantedSort: '已经是你想要的顺序了哦',
    aboutAuthor: '关于作者',
    activeAt: '活跃于',
    before: '前',
    sendMessage: '发私信',
    recommend: '相关推荐',
    toWatch: '去看看',
    viewDetail: '查看详情',
    allPost: '全部帖子（{total}）'
  },
  pay: {
    passwordError: '密码错误请重试',
    checkoutCounter: '收银台',
    payProduct: '购买物品',
    hideAvatar: '隐藏头像',
    hideMyAvatar: '隐藏我的头像',
    supportAuthor: '支持作者',
    getRemainingContent: '，获得剩余内容',
    keepWriting: '继续创作',
    getPicture: '，获得图片',
    getVideo: '，获得视频',
    getRight: '查看限权',
    passwordTip: '请输入支付密码',
    inputRewardAmount: '请输入您打赏的金额',
    needToResetPassword: '需要设置支付密码',
    payNow: '立即支付',
    passwordSetting: '请设置钱包支付密码',
    balance: '余额',
    sumOfMoney: '金额',
    inputComplete: '输入完成',
    surplus: '剩余',
    contentHide: '剩余内容已隐藏',
    pay: '支付',
    rmb: '元',
    showMyHead: '支付记录显示我的头像',
    wxPay: '微信支付',
    wxPayTipUse: '请使用',
    wxPayTipScan: '微信扫一扫',
    wxPayTipPay: '扫描二维码支付订单',
    walletPay: '钱包支付',
    walletBalance: '钱包余额',
    walletBalanceNo: '余额不足',
    walletRecharge: '去充值',
    wxPayClose: '微信支付功能已关闭',
    AmountCannotBeLessThan0: '自定义金额不能小于0',
    cancel: '取消',
    payTo: '将支付到',
    ofAccount: '的账户',
    surePay: '确认支付',
    scanPay: '扫码支付',
    paySuccess: '支付成功',
    payFail: '支付失败',
    payType: '支付方式',
    payPassword: '支付密码',
    wechatIdentificationQRcode: '微信识别二维码'
  },
  auth: {
    userinfo: '获取头像和昵称'
  },
  // 私信
  chat: {
    chatWithYou: '与你对话',
    noMore: '没有更多了',
    loadRecord: '查看更多消息',
    messageCannotBeBlack: '消息内容不能为空',
    messageLengthCannotOver: '消息内容不能超过 450 字'
  },
  // 首页
  home: {
    all: '所有',
    theme: '成员',
    thread: '主题',
    homecontent: '内容',
    share: '分享',
    confirmText: '筛选',
    sticky: '置顶',
    cancel: '取消',
    tabsCircle: '首页',
    tabsNews: '消息',
    tabsMy: '我',
    filterPlate: '版块',
    filterType: '类型',
    text: '文本',
    invitation: '帖子',
    video: '视频',
    picture: '图片',
    essence: '精华',
    followed: '已关注',
    follow: '+ 关注',
    generatePoster: '生成海报',
    wxShare: '微信分享',
    word: '文字',
    released: '发布了',
    noPostingPermission: '当前没有发帖权限',
    noPostingTopic: '当前没有查看主题权限',
    ioschoicetitle: '受iOS限制，暂时无法提供服务',
    ioschoicecontent: '请采用Android设备访问，给您带来不便尽请原谅！',
    siteName: '站点名称',
    needRealname: '发布内容需要实名认证，请在我的资料页进行实名认证',
    needPhone: '发布内容需要绑定手机号，请在我的资料页进行手机绑定',
    record: '网站备案信息:',
    recommentUser: '推荐用户',
    refresh: '换一批',
    noLimit: '不限',
    sortCreatedAt: '按发帖时间',
    sortUpdatedAt: '按评论时间',
    noPoster: '暂无封面',
    total: '共',
    seeAllImage: '张图片，进入查看全部..',
    hasNewContent: '有 {total}条新发布的内容',
    clickRefresh: '点击刷新',
    etc: '等',
    attachmentTotal: '个附件',
    location: '位置信息',
    threadCount: '附近共有 {total} 条内容',
    topicCount: '共有 {total} 条内容',
    topicViewCount: '热度'
  },
  // 站点管理页面
  manage: {
    payJoin: '有偿加入',
    payInfoTitle: '访问圈子内容需要您付费加入',
    inviteInfoTitle: '您已被邀请加入',
    inviteMembers: '邀请成员',
    siteMembers: '站点成员',
    siteManagement: '站点管理',
    manageMembers: '成员管理',
    searchMembers: '搜索成员',
    nouse: '未使用',
    used: '已使用',
    invalid: '已失效',
    overdue: '已过期',
    setInvalid: '设为无效',
    invitationUrl: '邀请链接',
    generateInvitationUrl: '生成邀请链接',
    notSelected: '尚未选',
    selected: '操作已选',
    total: '共有 {total} 条记录',
    member: '成员',
    contents: '内容',
    share: '分享',
    circleinfo: '站点信息',
    siteintroduction: '站点介绍',
    creationtime: '创建时间',
    circlemode: '站点模式',
    paymentmode: '付费模式',
    publicmode: '公开模式',
    circlemaster: '站长',
    myRole: '我的角色',
    joinedTime: '加入时间：',
    periodvalidity: '有效期至',
    myauthority: '我的权限',
    setting: '设置',
    noContent: '暂无内容',
    userCount: '成员总数',
    normal: '正常',
    disable: '禁用',
    cancelDisable: '解除禁用',
    allIdentity: '所有身份',
    identity: '身份',
    modifyRole: '配置身份',
    pleaseInputUserName: '请输入成员名称',
    userTotal: '共有{total} 人',
    find: '找到',
    searchResult: ' 搜索结果 {total}条',
    selectUser: '请先选择成员',
    set: '设为',
    userName: '成员名称',
    remainDay: '{day}天',
    remain0Day: '0天',
    urlType: '链接类型',
    batchOperate: '批量操作',
    operate: '操作',
    confirmDelete: '确认设为无效?',
    modifyFail: '修改失败，无权限设为管理员',
    circleAge: '圈龄',
    lastUpdateAt: '最后发言时间'
  },
  // 消息页面
  notice: {
    message: '私信',
    notice: '消息',
    relate: '@我的',
    relatedMe: '@了我',
    reply: '回复我的',
    repliedMe: '回复了我',
    like: '点赞我的',
    likedMe: '点赞了我',
    reward: '财务通知',
    rewardedMe: '打赏了我',
    pay: '支付我的',
    payMe: '支付了我',
    registerScale: '的注册分成',
    rewardScale: '的打赏分成',
    payScale: '的付费分成',
    payedMe: '支付了我',
    system: '系统通知',
    chat: '与你的私信',
    admin: '管理员',
    delete: '删除',
    send: '发送',
    emptycontent: '内容不能为空',
    contentMaxLength: '不能超过450个字',
    approved: '您的提现审核已通过，请注意查收。',
    unapproved: '您的提现审核已拒绝，拒绝原因：审核不通过。',
    checkMore: '查看剩余{surplus}条',
    toDetail: '前往'
  },
  invite: {
    invite: '推广邀请',
    invitedUser: '已邀朋友',
    income: '收益',
    incomeDetail: '收益明细',
    inviteSuccessCount: '成功邀请（人）',
    allIncome: '累计收益',
    inviteTotal: '共邀请',
    people: '人，',
    inviteUserName: '用户名',
    createdAt: '注册时间',
    incomeAt: '收益时间',
    viewDetail: '查看详细',
    userDetail: '受邀朋友收益',
    incomeTotal: '当前列表涉及金额',
    searchPlaceholder: '请输入要搜索的用户名'
  },
  // 海报分享页
  share: {
    generating: '拼命生成中...',
    buildfailed: '生成海报失败',
    successfully: '图片保存成功',
    savefailed: '图片保存失败',
    savealbum: '保存相册',
    longpressrecog: '长按识别小程序码查看详情',
    recomment: '   推荐',
    goddessvideo: '女神视频',
    comefrom: '来自',
    stay: '在',
    published: '中发表的',
    contents: '内容',
    siteintroduction: '站点介绍',
    member: '成员',
    confirm: '确定保存到相册吗',
    nothing: '无'
  },
  // 信息修改页
  modify: {
    user: '用户',
    nametitle: '修改用户名',
    mobiletitle: '修改手机号',
    newPwdTitle: '设置新密码',
    newPayPwdTitle: '设置新支付密码',
    setphontitle: '设置手机号',
    paypwdtitle: '设置支付密码',
    withdratitle: '提现',
    edipwdtitle: '修改密码',
    signaturetitle: '签名',
    realnametitle: '实名认证',
    findpawdtitle: '找回密码',
    authontitle: '验证身份',
    numbermodifitions: '用户名只可修改一次',
    submit: '提交',
    emptyname: '名字不能为空',
    modifysucc: '名字修改成功',
    phonbound: '已绑定手机',
    placeEnterCode: '请输入短信验证码',
    placeEnterRegisteredPhone: '请输入您注册用的手机号码',
    valifailed: '验证失败',
    lateron: '稍后重试',
    sendVerifyCode: '获取验证码',
    phonnumberempty: '未绑定手机号',
    retransmission: '秒后重发',
    validionerro: '验证码错误，您还可以重发',
    frequency: '次',
    newphonnumber: '输入新手机号码',
    newphon: '请输入绑定的手机号',
    newverifycode: '请输入手机验证码',
    phontitle: '手机号修改成功',
    nextsetp: '下一步',
    setpasswordtip: '为了您的资金安全，支付密码请采用6位数字设置',
    editpasswordtip: '为了您的资金安全，请输入原支付密码',
    editphonewordtip: '为了您的资金安全，请输入您手机收到的验证码',
    repeatpasstip: '请再次输入上一步设置的支付密码',
    editphonecode: '请输入您手机',
    enterpaymentpas: '请输入支付密码',
    enterpaymentagin: '请再次输入支付密码',
    resetrepeatpass: '请重新输入新密码',
    modification: '已有支付密码',
    reenter: '两次输入的密码不一致,请重新输入',
    paymentsucceed: '支付密码设置成功',
    payee: '收款人',
    withdrawable: '可提现余额',
    withdrawalamount: '提现金额',
    actualamout: '实际提现金额',
    enteramount: '请输入提现金额',
    phonnumber: '手机号',
    servicechaege: '手续费：',
    percentage: '元 (',
    percentagcon: '%)',
    withdrawal: '提现提交成功',
    enterold: '请输入原密码',
    enterNew: '请输入新密码',
    enterNewRepeat: '请输重复入新密码',
    oldpassword: '旧密码不能为空',
    newpassword: '新密码不能为空',
    confrimpasword: '确认密码不能为空',
    titlepassword: '密码修改成功',
    forgetoldpassword: '忘记旧密码?',
    masstext: '两次输入的密码不一致，请重新输入',
    realname: '请输入真实姓名',
    enteridnumber: '请输入您的身份证号码',
    idcardisempty: '身份证号码不能为空',
    nameauthensucc: '实名认证成功',
    mysignture: '我的签名',
    canalsoinput: '还能输入',
    wordnumber: '个字',
    signturecontent: '请输入签名内容',
    modificationsucc: '签名设置成功',
    passwordsetsucc: '密码设置成功',
    placeenternewpass: '请输新密码',
    authentication: '请输入支付密码，以验证身份',
    authensucceeded: '身份验证成功',
    authenfailed: '身份验证失败',
    passwordinputerro: '密码输入错误',
    forgetmanypassword: '忘记密码？',
    nohasphon: '请先绑定手机号码',
    idtitl: '非法身份证号（长度、校验位等不正确）',
    nametitl2: '非法姓名（长度、格式等不正确）',
    verifyoldphon: '验证旧手机',
    greaterthan: '提现金额不能大于可提现余额',
    NoteOpen: '短信服务未开启',
    logoinpaswd: '已有登录密码',
    forgetPassword: '忘记密码 ',
    retrievePassword: ' 找回密码',
    retrievePasswordByPhone: '通过手机号找回密码',
    resetPassword: '请重新设置您的登录密码',
    resetPasswordSuccess: '设置新密码成功',
    resetPasswordSuccessRepeat: '重新设置新密码成功',
    resetPasswordLoginTip: '请重新返回登录页面，并使用新设密码进行登录操作请点击下方登录。'
  },
  permission: {
    viewThreads: '查看主题列表',
    thread: {
      viewPosts: '查看主题',
      reply: '回复主题',
      hide: '删除主题',
      hidePosts: '删除回复',
      favorite: '帖子收藏',
      likePosts: '帖子点赞',
      batchEdit: '批量管理主题',
      editPosts: '编辑',
      essence: '加精',
      sticky: '置顶',
      deletePosts: '删除回复'
    },
    createThreadImage: '发布图片',
    createThread: '发布文本',
    createThreadLong: '发布帖子',
    createThreadVideo: '发布视频',
    createThreadPaid: '发布付费贴和被打赏',
    attachment: {
      create: ['上传附件', '上传图片'],
      view: ['查看附件', '查看图片'],
      delete: '删除附件'
    },
    createThreadWithCaptcha: '发帖需要验证码',
    editOwnThreadOrPost: '编辑发布的主题或回复',
    hideOwnThreadOrPost: '删除发布的主题或回复',
    publishNeedBindPhone: '发布内容需要绑定手机号',
    publishNeedRealName: '发布内容需要实名认证',
    viewUserList: '站点会员列表',
    cash: {
      create: '申请提现'
    },
    order: {
      create: '创建订单'
    },
    user: {
      view: '查看某个用户信息权限',
      agreement: '注册登录表示您同意',
      agreementRegister: '注册协议',
      agreementPrivacy: '隐私政策',
      edit: {
        status: '编辑用户状态'
      }
    },
    userFollow: {
      create: '关注用户'
    },
    group: {
      edit: '编辑用户组'
    },
    viewSiteInfo: '站点信息',
    createInvite: '管理-邀请加入',
    dialog: {
      create: '发布私信 '
    },
    showGroups: '显示用户组名',
    trade: {
      pay: {
        order: '订单支付'
      }
    },
    other: {
      canInviteUserScale: '可邀请其他用户'
    }
  },
  // 我的和个人主页
  profile: {
    uploadFile: '上传附件',
    filesizecannotexceed: '文件大小不能超过',
    pleaseselect: '请选择',
    fileformat: '格式的文件',
    downloadSuccess: '下载成功',
    downloadError: '下载失败',
    thetemporarypathis: '临时路径为',
    attachment: '附件',
    post: '发帖',
    notice: '消息',
    mine: '我的',
    myperson: '个人主页',
    backhomePage: '回首页',
    walletpasset: '已设置 / 修改',
    submitchange: '提交修改',
    myprofile: '我的资料',
    mywallet: '我的钱包',
    myfavorite: '我的收藏',
    myshield: '我的屏蔽',
    shield: '屏蔽',
    totalshield: '共屏蔽',
    deleteshield: '解除屏蔽',
    user_deny: '对方设置了屏蔽，无法进行此操作',
    person: '人',
    addshield: '添加屏蔽用户',
    searchresult: '搜索结果',
    circleinfo: '站点信息',
    search: '搜索',
    showavatar: '选择头像',
    supportupload: '支持上传',
    jpgorpng: 'jpg/png',
    filemost: '文件且不超过',
    px1: '150像素预览',
    px2: '100像素预览',
    avataruse: '使用',
    avatarcancel: '取消',
    privateMessage: '发私信',
    circlemanagement: '站点管理',
    topic: '主题',
    following: '关注',
    followed: '已关注',
    mutualfollow: '互相关注',
    followers: '粉丝',
    likes: '点赞',
    username: '用户名',
    avatar: '头像',
    mobile: '手机号码',
    bindingmobile: '绑定手机',
    password: '密码',
    modify: '修改',
    cancelModify: '取消修改',
    confirmModify: '确定修改',
    wechat: '微信',
    certification: '实名认证',
    tocertification: '去认证',
    signature: '签名',
    boundsucceed: '屏蔽成功',
    unboundsucceed: '解除屏蔽成功',
    availableamount: '可用余额',
    freezeamount: '冻结金额',
    withdrawalslist: '提现记录',
    walletlist: '钱包明细',
    orderlist: '订单明细',
    walletpassword: '钱包密码',
    setpassword: '设置密码',
    setpaypassword: '设置支付密码',
    editpaypassword: '修改支付密码',
    orignpassword: '请输入原支付密码',
    total: '共有',
    records: '记录',
    amountinvolved: '涉及金额',
    collection: '收藏',
    item: '条',
    status: '状态',
    time: '时间',
    paid: '已付款',
    tobepaid: '待付款',
    all: '所有',
    type: '类型',
    register: '注册',
    reward: '打赏',
    paytheme: '付费主题',
    paygroup: '付费用户组',
    codesend: '验证码将发送到',
    phonesms: '的手机短信',
    withoutbind: '您还未绑定手机请到',
    tobindphone: '进行手机的绑定',
    towithdrawal: '提现申请',
    withdrawalfreeze: '提现冻结',
    withdrawalsucceed: '提现成功',
    withdrawalunfreeze: '提现解冻',
    registeredincome: '注册收入',
    rewardincome: '打赏收入',
    laborincome: '人工收入',
    laborexpenditure: '人工支出',
    tobereviewed: '待审核',
    approved: '审核通过',
    auditfailed: '审核不通过',
    paymenttobemade: '待打款',
    paymentsucceed: '已打款',
    paymentfailed: '打款失败',
    theme: '深色模式',
    freezingreason: '冻结原因',
    theuserwasdeleted: '该用户被删除',
    thethemewasdeleted: '该主题被删除',
    givearewardforyourtheme: '打赏了你的主题',
    givearewardforthetheme: '打赏了主题',
    paidtoseeyourtheme: '付费查看了你的主题',
    paidtoview: '付费查看了',
    orderexpired: '订单过期',
    payfail: '支付失败',
    cancelorder: '取消订单',
    personalhomepage: '个人中心',
    successfullyuploadedtheavatar: '头像上传成功',
    uploadtimenotup: '上传头像频繁，一天仅允许上传一次头像',
    validationerror: '验证错误',
    filedownloadtips: '因iPhone系统限制，您的手机无法下载文件。请使用安卓手机或电脑访问下载',
    filedownloadtipswx: '因系统限制，无法下载文件。请使用安卓手机或电脑访问H5版进行下载'
  },
  site: {
    circleintroduction: '站点介绍',
    creationtime: '创建时间',
    periodvalidity: '有效期',
    day: '天',
    circlemaster: '站长',
    site: '站点',
    paynow: '立即付费',
    justonelaststepjoinnow: '只需最后一步，立即加入',
    circlemode: '站点模式',
    paymentmode: '付费模式',
    publicmode: '公开模式',
    validfromaccession: '有效期自加入起',
    myauthority: '我的权限',
    inviteyouas: '邀请您，作为',
    join: '加入',
    joinnow: '立刻加入',
    accepttheinvitationandbecome: '接受邀请，成为',
    permanent: '永久有效',
    continueResgister: '继续注册',
    codeinvalid:
      '该邀请码已经失效，请联系站长获取新的邀请码，若继续注册将以默认角色加入本站！是否继续注册？',
    codeused:
      '该邀请码已经使用，请联系站长获取新的邀请码，若继续注册将以默认角色加入本站！是否继续注册？',
    codeexpired:
      '该邀请码已经过期，请联系站长获取新的邀请码，若继续注册将以默认角色加入本站！是否继续注册？',
    codenotfound:
      '该邀请码不存在，请联系站长获取新的邀请码，若继续注册将以默认角色加入本站！是否继续注册？',
    codeforbid: '您当前已登录了帐号，无法使用邀请码进行注册，请退出后重试。',
    codeinvalid2: '该邀请码已经失效',
    codeused2: '该邀请码已经使用',
    codeexpired2: '该邀请码已经过期',
    codenotfound2: '该邀请码不存在',
    codeforbid2: '您当前已登录了帐号，无法使用邀请码进行注册，请退出后重试。',
    price: '费用',
    role: '角色：',
    to: '至',
    permission: '权限'
  },
  // 搜索
  search: {
    filter: '筛选',
    search: '搜索',
    searchusers: '用户搜索',
    searchthemes: '主题搜索',
    searchkeywords: '搜索关键字',
    cancel: '取消',
    users: '用户',
    searchmoreusers: '搜索更多用户',
    norelatedusersfound: '没有找到相关用户',
    noFollowers: '暂无关注用户，请搜索',
    themes: '主题',
    searchmorethemes: '搜索更多主题',
    norelatedthemesfound: '没有找到相关主题'
  },
  // 登录注册
  user: {
    status: '记住我的登录状态',
    userlogin: '登录Discuz!Q',
    userregister: '注册新用户',
    phonelogin: '手机号码登录',
    phonenumber: '手机号码',
    phoneregister: '手机号码注册',
    quicklogin: '快速登录',
    login: '登录',
    register: '注册',
    registerReason: '注册原因',
    submit: '提交',
    username: '请输入您的用户名',
    password: '请输入您的登录密码',
    reason: '请输入注册原因',
    phoneNumber: '请输入手机号码',
    pwd: '登录密码',
    verification: '验证码',
    verificationCode: '请输入短信验证码',
    verificationCode2: '请输入验证码',
    exist: '已有账号? 登录一下',
    noexist: '没有账号? 注册一下',
    forgetPassword: '忘记密码?',
    phoneNumberLogin: '手机号码登录',
    verificationCodeLogin: '验证码登录',
    passwordLogin: '密码登录',
    sendVerificationCode: '发送验证码',
    registerBindId: '注册，并绑定微信号',
    registerBind: '注册并绑定微信',
    loginBindId: '登录，并绑定微信号',
    loginBind: '登录并绑定微信',
    logout: '退出登录',
    noBind: '退出并解绑',
    registerSuccess: '注册成功',
    registerBindSuccess: '注册绑定成功',
    loginSuccess: '登录成功',
    loginBindSuccess: '登录绑定成功',
    pleaseLogin: '请登录'
  },
  // 举报
  report: {
    reportTitle: '举报',
    pleaseClickReasons: '请点击举报理由',
    otherReason: '其他理由...',
    confirm: '确认',
    cancel: '取消',
    enterOtherReason: '请输入其他理由',
    reportSucceed: '举报成功'
  }
}
