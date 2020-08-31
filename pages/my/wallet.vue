<template>
  <div class="mywallet">
    <!-- 钱包信息 -->
    <div class="mywallet-top">
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.availableamount') }}</span>
        <span class="amount">{{ `¥ ${dataInfo.available_amount || 0.0}` }}<span class="availmount">{{ $t('modify.withdratitle') }}</span></span>
      </div>
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.freezeamount') }}</span>
        <span
          v-if="dataInfo.freeze_amount > 0"
          class="amount"
          style="color:#FA5151;"
        >{{ `¥ ${dataInfo.freeze_amount || 0.0}` }}</span>
        <span
          v-else
          class="amount"
        >{{ `¥ ${dataInfo.freeze_amount || 0.0}` }}</span>

      </div>
      <div
        class="mywallet-topitem"
        style="margin-right:30px;text-align:right"
      >
        <span class="margbtm">{{ $t('pay.payPassword') }}</span>
        <span
          v-if="hasPassword"
          style="cursor: pointer;"
          @click="changePassword"
        >
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="shield"
          />已设置 / 修改 </span>
        <span
          v-else
          style="cursor: pointer;"
          @click="setPassword"
        >
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="warning"
          />{{ $t('profile.setpaypassword') }}
        </span>
      </div>
      <div v-if="hasPassword">
        <wallet-password
          v-if="showPasswordInput"
          :error="passError"
          @close="showPasswordInput = false"
          @password="validatePass"
        />
        <set-newpassword
          v-if="showNewverify"
          :error="codeError"
          @close="showNewverify = false"
          @password="checkpass"
        />
        <repeat-newpassword
          v-if="showNewverify2"
          :error="codeError"
          @close="showNewverify2 = false"
          @password="checkpass2"
        />
      </div>
      <div v-else>
        <set-password
          v-if="setPasswordInput"
          @close="setPasswordInput = false"
          @password="setPass"
        />
        <repeat-password
          v-if="repPasswordInput"
          :error="codeError"
          @close="repPasswordInput = false"
          @password="setPass2"
        />
      </div>
    </div>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <!-- 提现记录 -->
      <el-tab-pane :label="$t('profile.withdrawalslist')">
        <div class="selector">

          <el-date-picker
            v-model="date"
            type="month"
            placeholder="选择月"
            suffix-icon="el-icon-arrow"
            format="yyyy 年 MM 月 "
            value-format="yyyy-MM"
            @change="bindDateChange"
          />
          <el-select
            v-model="value"
            placeholder="请选择"
            @change="confirm"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="margleft">
            {{ $t('profile.total') }}{{ total }}{{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥{{ sumMoney }}
          </span>
        </div>
        <!-- 提现记录表格 -->
        <el-table
          ref="multipleTable"
          :data="dataList.slice((pageNum-1)*pageSize,pageNum*pageSize)"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="40"
          />
          <el-table-column
            prop="id"
            label="ID"
            width="55"
          />
          <el-table-column
            prop="cash_status"
            label="记录描述"
            width="332"
            :formatter="statusFormat"
          />
          <el-table-column
            label="时间"
            width="177"
            prop="created_at"
            :ormatter="dateFormat"
          />
          <el-table-column
            prop="cash_status"
            label="状态"
            width="97"
            :formatter="statusFormat"
          />
          <el-table-column
            prop="money"
            label="金额"
            width="113"
            sortable
          />
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dataList.length"
          style="margin-top:15px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-tab-pane>
      <!-- 冻结金额 -->
      <el-tab-pane :label="$t('profile.freezeamount')">
        <div class="selector">
          <el-date-picker
            v-model="date3"
            type="month"
            placeholder="选择月"
            suffix-icon="el-icon-arrow"
            format="yyyy 年 MM 月 "
            value-format="yyyy-MM"
            @change="bindDateChange3"
          />
          <el-select
            v-model="value"
            placeholder="请选择"
            @change="confirm3"
          >
            <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="margleft">
            {{ $t('profile.total') }}{{ total3 }}{{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥{{ userInfo.walletFreeze }}
          </span>
        </div>
        <!-- 冻结金额。表格 -->
        <el-table
          ref="multipleTable"
          :data="freezelist.slice((pageNum3-1)*pageSize3,pageNum3*pageSize3)"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="40"
          />
          <el-table-column
            prop="id"
            label="ID"
            width="55"
          />
          <el-table-column
            prop="change_desc"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="275"
            prop="created_at"
            :formatter="dateFormat"
          />
          <!-- <el-table-column
            prop="cash_status"
            label="状态"
            width="97"
            :formatter="statusFormat"
          /> -->
          <el-table-column
            label="金额"
            width="113"
            sortable
            :sort-method="sortAmount"
          >
            <template slot-scope="scope">
              <span v-html="amountFormat(scope.row.change_freeze_amount)" />
            </template></el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum3"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize3"
          layout="total, sizes, prev, pager, next, jumper"
          :total="freezelist.length"
          style="margin-top:15px;"
          @size-change="handleSizeChange3"
          @current-change="handleCurrentChange3"
        />
      </el-tab-pane>
      <!-- 钱包明细 -->
      <el-tab-pane :label="$t('profile.walletlist')">
        <div class="selector">
          <el-date-picker
            v-model="date2"
            type="month"
            placeholder="选择月"
            suffix-icon="el-icon-arrow"
            format="yyyy 年 MM 月 "
            value-format="yyyy-MM"
            @change="bindDateChange2"
          />
          <el-select
            v-model="value"
            placeholder="请选择"
            @change="confirm2"
          >
            <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="margleft">
            {{ $t('profile.total') }}{{ total2 }}{{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥{{ sumMoney2 }}
          </span>
        </div>
        <!-- 钱包记录表格 -->
        <el-table
          ref="multipleTable"
          :data="dataList2.slice((pageNum2-1)*pageSize2,pageNum2*pageSize2)"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="40"
          />
          <el-table-column
            prop="id"
            label="ID"
            width="55"
          />
          <el-table-column
            prop="change_desc"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="177"
            prop="created_at"
            :formatter="dateFormat"
          />
          <el-table-column
            label="状态"
            width="97"
            :formatter="statusFormat2"
          />
          <el-table-column
            label="金额"
            width="113"
            sortable
            :sort-method="sortAmount"
          >
            <template slot-scope="scope">
              <span v-html="amountFormat(scope.row.change_available_amount)" />
            </template></el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum2"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize2"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dataList2.length"
          style="margin-top:15px;"
          @size-change="handleSizeChange2"
          @current-change="handleCurrentChange2"
        />
      </el-tab-pane>
      <!-- 订单明细 -->
      <el-tab-pane :label="$t('profile.orderlist')">
        <div class="selector">
          <el-date-picker
            v-model="date4"
            type="month"
            placeholder="选择月"
            suffix-icon="el-icon-arrow"
            format="yyyy 年 MM 月 "
            value-format="yyyy-MM"
            @change="bindDateChange4"
          />
          <el-select
            v-model="value"
            placeholder="请选择"
            @change="confirm4"
          >
            <el-option
              v-for="item in options4"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="margleft">
            {{ $t('profile.total') }}{{ total4 }}{{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥{{ sumMoney4 }}
          </span>
        </div>
        <!-- 订单明细表格 -->
        <el-table
          ref="multipleTable"
          :data="dataList4.slice((pageNum4-1)*pageSize4,pageNum4*pageSize4)"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="40"
          />
          <el-table-column
            prop="_jv.id"
            label="ID"
            width="55"
          />
          <el-table-column
            prop="titleType"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="177"
            prop="created_at"
            :formatter="dateFormat"
          />
          <el-table-column
            label="状态"
            width="97"
            :formatter="statusFormat4"
          />
          <el-table-column
            label="金额"
            width="113"
            sortable
            :sort-method="sortAmount"
          >
            <template slot-scope="scope">
              <span v-html="amountFormat(scope.row)" />
            </template></el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum4"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize4"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dataList4.length"
          style="margin-top:15px;"
          @size-change="handleSizeChange4"
          @current-change="handleCurrentChange4"
        />
      </el-tab-pane>
    </el-tabs>

  </div>

</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'

export default {
  mixins: [
    handleError
  ],
  data() {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    const currentDate = `${year}-${month}`
    return {
      inputpas: '', // 第一次新密码
      usertokenid: '', // 原密码验证成功id
      showNewverify: false, // 新密码验证码框
      showNewverify2: false, // 新密码验证码框
      setPasswordInput: false, // 设置密码框
      repPasswordInput: false, // 设置重复密码框
      showPasswordInput: false, // 修改密码框
      passError: false, // 修改原密码
      codeError: false, // 再次输入密码错误判断
      value: '', // 提现记录被选择到的类型id
      pageSize: 20, // 提现记录每页展示的数目
      pageNum: 1, // 提现当前页数
      pageSize2: 20, // 钱包明细每页展示的数目
      pageNum2: 1, // 钱包明细当前页数
      pageSize3: 20, // 冻结每页展示的数目
      pageNum3: 1, // 冻结当前页数
      pageSize4: 20, // 订单每页展示的数目
      pageNum4: 1, // 订单当前页数
      loadingType: '', // 读取状态
      dataInfo: {}, // 钱包信息
      freeze_amount: '',
      date: currentDate, // 提现记录日期
      date2: currentDate, // 钱包明细日期
      date3: currentDate, // 冻结金额日期
      date4: currentDate, // 订单日期
      filterSelected: '', // 提现记录状态过滤内容的id
      filterSelected2: '', // 钱包明细状态过滤内容的id
      filterSelected3: '', // 冻结状态过滤内容的id
      filterSelected4: '', // 订单状态过滤内容的id
      dataList: [], // 提现记录数据
      dataList2: [], // 钱包明细数据
      dataList4: [], // 订单数据
      freezelist: [], // 冻结金额
      total: 0, // 提现记录总记录数
      total2: 0, // 钱包qi记录总记录数
      total3: 0, // 冻结金额记录总记录数
      total4: 0, // 订单记录总记录数
      sumMoney2: 0, // 钱包涉及到的总金额
      sumMoney: 0, // 提现涉及到的总金额
      sumMoney4: 0, // 订单涉及到的总金额
      hasPassword: false,
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      // 提现过滤选择器的文字内容
      options: [{
        value: '',
        label: this.$t('profile.all')
      }, {
        value: '1',
        label: this.$t('profile.tobereviewed')

      }, {
        value: '2',
        label: this.$t('profile.approved')

      }, {
        value: '3',
        label: this.$t('profile.auditfailed')

      }, {
        value: '4',
        label: this.$t('profile.paymenttobemade')

      }, {
        value: '5',
        label: this.$t('profile.paymentsucceed')

      }, {
        value: '6',
        label: this.$t('profile.paymentfailed')

      }],
      // 钱包明细状态选择文本
      options2: [{
        value: '',
        label: this.$t('profile.all')
      }, {
        value: '10',
        label: this.$t('profile.withdrawalfreeze')

      }, {
        value: '11',
        label: this.$t('profile.withdrawalsucceed')

      }, {
        value: '12',
        label: this.$t('profile.withdrawalunfreeze')

      }, {
        value: '30',
        label: this.$t('profile.registeredincome')

      }, {
        value: '31',
        label: this.$t('profile.rewardincome')

      }, {
        value: '32',
        label: this.$t('profile.laborincome')

      }, {
        value: '50',
        label: this.$t('profile.laborexpenditure')

      }, {
        value: '41',
        label: this.$t('profile.givearewardforthetheme')

      }, {
        value: '60',
        label: this.$t('profile.paidtoseeyourtheme')

      }, {
        value: '61',
        label: this.$t('profile.paidtoview')

      }],
      options4: [{
        value: '',
        label: this.$t('profile.all')
      }, {
        value: '0',
        label: this.$t('profile.tobepaid')
      }, {
        value: '1',
        label: this.$t('profile.paid')
      }, {
        value: '2',
        label: this.$t('profile.cancelorder')
      }, {
        value: '3',
        label: this.$t('profile.payfail')
      }, {
        value: '4',
        label: this.$t('profile.orderexpired')
      }],
      multipleSelection: []
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters['jv/get'](`/users/${this.userId}`)
    }
  },
  mounted() {
    this.getInfo()
    this.getList()
    this.getList2()
    this.getFreezelist()
    this.getList4()
  },
  methods: {
    // 设置密码框展示
    setPassword() {
      this.setPasswordInput = true
    },
    // 修改密码框展示
    changePassword() {
      this.showPasswordInput = true
    },
    // 原密码判断
    validatePass(password = '') {
      const params = {
        _jv: {
          type: 'users/pay-password/reset'
        },
        pay_password: password
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          console.log('原支付密码验证', res)
          if (res._jv.json.data.id) {
            this.passError = false
            this.showPasswordInput = false
            this.$message.success(
              this.$t('modify.authensucceeded')
            )
            this.showNewverify = true
            this.usertokenid = res._jv.json.data.id
          }
        })
        .catch(err => {
          this.$message.error(this.$t('modify.authenfailed'))
          this.passError = true

          console.log('error', err)
          // if (err.statusCode === 422) {
          //   this.sun = true
          //   const [
          //     {
          //       detail: [sun]
          //     }
          //   ] = err.data.errors
          //   this.test = sun
          // } else if (err.statusCode === 500) {
          //   this.sun = true
          //   this.test = this.i18n.t('modify.passwordinputerro')
          // }
          // this.empty()
        })
      console.log('password', password)
    },
    // 新密码
    checkpass(num) {
      if (num.length >= 6) {
        console.log('hhhhhhh')

        this.inputpas = num
        console.log('新密码', this.inputpas)
        this.showNewverify = false
        this.showNewverify2 = true
      }
    },
    // 重复输入新密码
    checkpass2(sum) {
      if (sum.length >= 6) {
        console.log('重复新密码', sum)
        this.validateVerify(sum)
      }
    },

    // 获取初始化密码
    setPass(password) {
      if (password.length >= 6) {
        this.inputpas = password
        console.log('hhhh')
        this.setPasswordInput = false
        this.repPasswordInput = true
      }
    },
    // 重复初始化密码
    setPass2(password) {
      if (password.length >= 6) {
        console.log('重复密码', password)
        this.validateVerify(password)
      }
    },
    // 初始密码判断
    validateVerify(password = '') {
      console.log('password', password)
      const params = {
        _jv: {
          type: 'users',
          id: this.userId
        },
        pay_password_token: this.usertokenid, // 初始化密码不需要
        payPassword: this.inputpas,
        pay_password_confirmation: password
      }
      const postphon = status.run(() => this.$store.dispatch('jv/patch', params))
      postphon
        .then(res => {
          this.inputpas = ''
          console.log('初始密码设置成功', res)
          if (res) {
            this.repPasswordInput = false
            this.showNewverify2 = false
            this.$message.success(this.$t('modify.paymentsucceed'))
            this.$router.go(0)
          }
        })
        .catch(err => {
          console.log(err)
          this.codeError = true
          this.handleError(err)
        })
    },
    // 获取钱包信息
    getInfo() {
      status
        .run(() => this.$store.dispatch('jv/get', `wallet/user/${this.userId}`))
        .then(res => {
          this.dataInfo = res
          this.hasPassword = res.user.canWalletPay
          console.log('钱包信息', this.dataInfo)
        })
    },
    // 金额排序
    sortAmount(str1, str2) {
      console.log(str1, str2)
      return str1.change_available_amount * 1 - str2.change_available_amount * 1
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time)
    },
    // 提现状态格式化
    statusFormat(row) {
      switch (row.change_type) {
        case 1: return `<font style="color:#25A9F6">${this.$t('profile.tobereviewed')}</font>`
        case 2: return `<font style="color:#09BB07">${this.$t('profile.approved')}</font>`
        case 3: return `<font style="color:#FA5151">${this.$t('profile.auditfailed')}</font>`
        case 4: return this.$t('profile.paymenttobemade')
        case 5: return this.$t('profile.paymentsucceed')
        case 6: return this.$t('profile.paymentfailed')
        default: return '未知状态'
      }
    },
    // 钱包状态格式化
    statusFormat2(row) {
      switch (row.change_type) {
        case 10: return this.$t('profile.withdrawalfreeze')
        case 11: return this.$t('profile.withdrawalsucceed')
        case 12: return this.$t('profile.withdrawalunfreeze')
        case 30: return this.$t('profile.registeredincome')
        case 31: return this.$t('profile.rewardincome')
        case 32: return this.$t('profile.laborincome')
        case 50: return this.$t('profile.laborexpenditure')
        case 41: return this.$t('profile.givearewardforthetheme')
        case 60: return this.$t('profile.paidtoseeyourtheme')
        case 61: return this.$t('profile.paidtoview')

        default: return '未知状态'
      }
    },
    // 订单明细状态格式化
    statusFormat4(row) {
      switch (row.status) {
        case 0: return this.$t('profile.tobepaid')
        case 1: return this.$t('profile.paid')
        case 2: return this.$t('profile.cancelorder')
        case 3: return this.$t('profile.payfail')
        case 4: return this.$t('profile.orderexpired')

        default: return '未知状态'
      }
    },
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at)
    },
    // 金额格式化
    amountFormat(row) {
      // 订单
      if (row.amount > 0) {
        return `<font color="09BB07">-￥${row.amount}</font>`
      }
      if (row > 0) {
        return `<font color="09BB07">+￥${row}</font>`
      } else {
        return `<font style="color:#FA5151">-￥${row.substr(1)}</font>`
      }
    },
    // 提现日期选中
    bindDateChange(e) {
      this.date = e
      console.log('提现日期选中', this.date)
      if (this.date !== null) {
        this.getList('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 钱包明细日期选中
    bindDateChange2(e) {
      this.date2 = e
      console.log('钱包明细日期选中', this.date2)
      if (this.date2 !== null) {
        this.getList2('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 冻结金额日期选中
    bindDateChange3(e) {
      this.date3 = e
      console.log('冻结金额日期选中', this.date3)
      if (this.date3 !== null) {
        this.getFreezelist('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 订单日期选中
    bindDateChange4(e) {
      this.date4 = e
      console.log('订单日期选中', this.date4)
      if (this.date4 !== null) {
        this.getList4('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 提现确认筛选类型
    confirm(e) {
      console.log('提现确认筛选类型', e)
      this.filterSelected = e
      // console.log(this.filterSelected)
      this.getList('filter')
    },
    // 钱包明细状态筛选类型
    confirm2(e) {
      console.log('钱包明细状态筛选类型', e)
      this.filterSelected2 = e
      // console.log(this.filterSelected)
      this.getList2('filter')
    },
    // 冻结金额状态筛选类型
    confirm3(e) {
      console.log('冻结金额状态筛选类型', e)
      this.filterSelected3 = e
      // console.log(this.filterSelected)
      this.getFreezelist('filter')
    },
    // 订单状态筛选类型
    confirm4(e) {
      console.log('订单状态筛选类型', e)
      this.filterSelected4 = e
      // console.log(this.filterSelected)
      this.getList4('filter')
    },
    // 获取提现数据
    getList(type) {
      this.loadingType = 'loading'
      const dateArr = this.date.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // cash_status(1-6) '待审核', '审核通过', '审核不通过', '待打款', '已打款', '打款失败'
      const params = {
        'filter[user]': this.userId,
        'page[number]': this.pageNum2,
        'page[limit]': this.pageSize2,
        'filter[start_time]': `${this.date}-01-00-00-00`,
        'filter[end_time]': `${this.date}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum = 1
        this.dataList = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected !== '') {
        params['filter[cash_status]'] = this.filterSelected
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/cash', { params }]))
        .then(res => {
          console.log(res)
          if (res._jv) {
            delete res._jv
          }
          // 处理钱
          this.sumMoney = this.handlemoney(res)
          this.loadingType = res.length === this.pageSize ? 'more' : 'nomore'
          this.dataList = [...this.dataList, ...res]
          this.total = this.dataList.length
          console.log('提现数据', this.dataList)
        })
    },
    // 获取钱包明细数据
    getList2(type) {
      this.loadingType = 'loading'
      const dateArr = this.date2.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // change_type 10提现冻结，11提现成功，12提现解冻，30注册收入，31打赏收入，32人工收入，50人工支出
      const params = {
        include: ['user', 'order.user', 'order.thread', 'order.thread.firstPost'],
        'filter[user]': this.userId,
        'page[number]': this.pageNum2,
        'page[limit]': this.pageSize2,
        'filter[start_time]': `${this.date2}-01-00-00-00`,
        'filter[end_time]': `${this.date2}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum2 = 1
        this.dataList2 = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected2) {
        params['filter[change_type]'] = this.filterSelected2
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/log', { params }]))
        .then(res => {
          console.log(res)
          if (res._jv) {
            delete res._jv
          }
          // 处理文字
          const result = this.handleHandle(res)
          // 处理钱
          this.sumMoney2 = this.handlemoney(result)
          console.log('钱包总金额', this.sumMoney2)
          this.loadingType = result.length === this.pageSize ? 'more' : 'nomore'
          this.dataList2 = [...this.dataList2, ...result]
          this.total2 = this.dataList2.length
          console.log('钱包明细', this.dataList2)
        })
    },
    // 获取冻结金额列表数据
    getFreezelist() {
      this.loadingType = 'loading'
      const params = {
        'filter[user]': this.userId,
        'filter[change_type]': [10, 11, 12], // 10提现冻结 11提现成功 12 提现解冻
        'page[number]': this.pageNum3,
        'page[limit]': this.pageSize3
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then(res => {
        console.log('冻结金额列表数据', res)
        this.total3 = res._jv.json.meta.total
        delete res._jv
        this.loadingType = res.length === this.pageSize4 ? 'more' : 'nomore'
        this.freezelist = [...this.freezelist, ...res]
      })
    },
    // 获取订单数据
    getList4(type) {
      this.loadingType = 'loading'
      const dateArr = this.date.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // status 0 待付款，1 已付款 ，2取消订单，3支付失败，4 订单已过期
      const params = {
        include: ['user', 'thread', 'thread.firstPost'],
        'filter[user]': this.userId,
        'page[number]': this.pageNum4,
        'page[limit]': this.pageSize4,
        'filter[start_time]': `${this.date4}-01-00-00-00`,
        'filter[end_time]': `${this.date4}-${days}-00-00-00`
      }
      if (type && type === 'filter') {
        params.pageNum4 = 1
        this.dataList4 = []
      }
      if (this.filterSelected4 || this.filterSelected4 === 0) {
        params['filter[status]'] = this.filterSelected4
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['orders', { params }]))
        .then(res => {
          if (res._jv) {
            delete res._jv
          }
          // 处理文字
          const result = this.handleHandle4(res)
          // 处理钱
          this.sumMoney4 = this.handlemoney4(result)
          this.loadingType = result.length === this.pageSize4 ? 'more' : 'nomore'
          this.dataList4 = [...this.dataList4, ...result]
          this.total4 = this.dataList4.length
          console.log('订单数据', this.dataList4)
        })
    },
    // 处理钱包总金额
    handlemoney(result) {
      const res = JSON.parse(JSON.stringify(result))
      let sum = 0
      res.forEach((item, index) => {
        res[index] = parseFloat(item.change_available_amount.replace(/\+|\-|\*|\?/g, ''))
        sum = sum + res[index]
      })
      return sum.toFixed(2)
    },
    // 处理订单
    handlemoney4(result) {
      const res = JSON.parse(JSON.stringify(result))
      let sum = 0
      res.forEach((item, index) => {
        res[index] = parseFloat(item.amount.replace(/\+|\-|\*|\?/g, ''))
        sum = sum + res[index]
      })
      return sum.toFixed(2)
    },
    // 钱包处理文字
    handleHandle(res) {
      const results = JSON.parse(JSON.stringify(res))
      results.forEach((item, index) => {
        let desc = this.handleTitle(item)
        // 截取42个字
        if (desc.length > 42) {
          desc = `${desc.substr(0, 42)}...`
        }
        results[index]['change_desc'] = desc
      })
      return results
    },
    // 订单处理文字
    handleHandle4(res) {
      const results = JSON.parse(JSON.stringify(res))
      results.forEach((item, index) => {
        let desc = this.handleTitle4(item)
        // 截取42个字
        if (desc.length > 42) {
          desc = `${desc.substr(0, 42)}...`
        }
        results[index].titleType = desc
      })
      return results
    },
    // 处理钱包主题相关的数据
    handleTitle(item) {
      switch (item.change_type) {
        case 31: {
          // 打赏收入
          const user = item.order.user
            ? item.order.user.username
            : this.$t('profile.theuserwasdeleted')
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${user} ${this.$t('profile.givearewardforyourtheme')} ${thread}`
        }
        case 41: {
          // 打赏支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.givearewardforthetheme')} ${thread}`
        }
        case 60: {
          // 付费主题收入
          const user = item.order.user
            ? item.order.user.username
            : this.i18n.t('profile.theuserwasdeleted')
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.givearewardforthetheme')
          return `${user} ${this.$t('profile.paidtoseeyourtheme')} ${thread}`
        }
        case 61: {
          // 付费主题支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.paidtoview')} ${thread}`
        }
        default:
          return item.change_desc
      }
    },
    // 处理订单相关数据
    handleTitle4(item) {
      switch (item.type) {
        case 1: {
          // 注册
          return this.$t('profile.register')
        }
        case 2: {
          // 打赏支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.thread
            ? item.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.givearewardforthetheme')} ${thread}`
        }
        case 3: {
          // 付费主题支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.thread
            ? item.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.paidtoview')} ${thread}`
        }
        case 4: {
          // 付费用户组
          return this.$t('profile.paygroup')
        }
        default:
          return item.type
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 提现分页
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
    },
    // 提现分页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.pageNum = val
    },
    // 钱包分页
    handleSizeChange2(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize2 = val
    },
    // 钱包分页
    handleCurrentChange2(val) {
      console.log(`当前页: ${val}`)
      this.pageNum2 = val
    },
    // 冻结金额分页
    handleSizeChange3(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize3 = val
    },
    // 冻结金额分页
    handleCurrentChange3(val) {
      console.log(`当前页: ${val}`)
      this.pageNum3 = val
    },
    // 订单金额分页
    handleSizeChange4(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize4 = val
    },
    // 订单金额分页
    handleCurrentChange4(val) {
      console.log(`当前页: ${val}`)
      this.pageNum4 = val
    }
  }

}
</script>
<style lang='scss' scoped>
.mywallet {
  .mywallet-top {
    display: flex;
    flex-direction: row;
    .mywallet-topitem {
      display: flex;
      flex-direction: column;
      flex: 1;
      color: #6d6d6d;
      .amount {
        font-size: 20px;
      }
      .availmount {
        font-size: 14px;
        color: #1878f3;
        line-height: 23px;
        vertical-align: top;
        margin-left: 10px;
      }
      .margbtm {
        margin-bottom: 10px;
      }
    }
  }
  .register-select {
    margin-top: 63px;
    border: none;
    background: transparent;
    box-shadow: none;
  }
  .margleft {
    margin-left: 30px;
  }
}

::v-deep.el-tabs {
  .el-tabs__header {
    background: transparent;
  }
  .el-tabs__header .el-tabs__item {
    border: none;
    color: #b5b5b5;
    padding: 0 52px 0 0px;
    font-size: 16px;
  }
  .el-tabs__content {
    padding: 10px 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 18px;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
  }
  .el-input__inner {
    border-radius: 0px;
  }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
}
::v-deep .el-table {
  margin-top: 15px;
}
::v-deep.el-table .cell {
  padding-left: 10px;
}
::v-deep .el-table thead {
  color: #303133;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #f4f5f6 !important;
}
::v-deep .el-pagination .btn-prev {
  margin-left: 110px;
}
::v-deep .el-pagination__jump {
  position: absolute;
  right: 10px;
}
</style>
