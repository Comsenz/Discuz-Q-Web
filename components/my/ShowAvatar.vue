<template>
  <div v-loading="loading" class="showAvatar">
    <el-dialog
      title="头像"
      :visible.sync="dialogVisible"
      width="620px"
      :before-close="handleClose"
    >
      <div class="container">
        <div
          v-show="!cropImageFormVisible"
          style=" top:40%;display: inline-block;position: relative;z-index: 999;"
        >
          <el-upload
            ref="photoFile"
            :action="`${host}/users/${userId}/avatar`"
            :headers="header"
            accept="image/*"
            :data="{ type: 1,order:1}"
            name="avatar"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="selectChange"
            :http-request="httpRequest"
          >
            <el-button>{{ $t('profile.showavatar') }}</el-button>
          </el-upload>
          <p class="uptext">
            {{ $t('profile.supportupload') }}
            <span>{{ $t('profile.jpgorpng') }} </span> {{ $t('profile.filemost') }} <span>500kb</span></p>
        </div>
        <!-- 裁剪框 -->
        <div
          v-show="cropImageFormVisible"
          class="imgCrop-content"
        >
          <div class="cropper-content">
            <VueCropper
              ref="cropper"
              :img="option.img"
              :output-size="option.size"
              :output-type="option.outputType"
              :info="true"
              :full="option.full"
              :fixed="fixed"
              :fixed-number="fixedNumber"
              :can-move="option.canMove"
              :can-move-box="option.canMoveBox"
              :fixed-box="option.fixedBox"
              :original="option.original"
              :auto-crop="option.autoCrop"
              :auto-crop-width="option.autoCropWidth"
              :auto-crop-height="option.autoCropHeight"
              :center-box="option.centerBox"
              :high="option.high"
              mode="cover"
              :max-img-size="option.max"
              @real-time="realTime"
            />
          </div>

        </div>
      </div>
      <!-- 方形预览图 -->
      <div
        class="show-preview"
        :style="{
          'width': previews.w + 'px',
          'height': previews.h + 'px',
          'overflow': 'hidden', 'display':'inline-block','position':'absolute','margin-left':'17px','margin-top':'7px'}"
      >
        <div
          :style="previews.div"
          class="preview"
        >
          <img
            :src="previews.url"
            :style="previews.img"
          >
        </div>
      </div>
      <!-- 圆形预览图 -->
      <div
        class="show-preview"
        :style="{
          'width': 100 + 'px',
          'height': 100 + 'px',
          'overflow': 'hidden',
          'display':'inline-block','position':'absolute','margin-left':'17px','border-radius':'50%','top':'51%'}"
      >
        <div
          :style="previewCycle"
          class="preview"
        >
          <img
            :src="previews.url"
            :style="previews.img"
          >
        </div>
      </div>

      <div class="preview2">
        <div class="square">
          <span class="squarep">{{ $t('profile.px1') }}</span>
        </div>
        <div class="circle">
          <span class="squarep">{{ $t('profile.px2') }}</span>
        </div>
        <div class="pre-button">
          <el-button
            type="primary"
            size="small"
            class="btnw"
            @click="down"
          >{{ $t('profile.avataruse') }}</el-button>
          <el-button
            size="small"
            class="btnw"
            @click="handleClose2"
          >{{ $t('profile.avatarcancel') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/api/request';
import handleError from '@/mixin/handleError';

export default {
  name: 'ShowAvatar',
  mixins: [handleError],
  props: {
    userId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      host: '',
      header: '',
      dialogVisible: true,
      cropImageFormVisible: false,
      previews: {},
      previewCycle: {},
      option: {
        img: '',
        size: 1, // 裁剪生成图片的质量
        full: false, // 是否输出原图比例的截图 默认false
        outputType: 'png', // 裁剪生成图片的格式 默认jpg
        canMove: true, // 上传图片是否可以移动
        fixedBox: true, // 固定截图框大小 不允许改变
        original: true, // 上传图片按照原始比例渲染
        canMoveBox: true, // 截图框能否拖动
        autoCrop: true, // 是否默认生成截图框
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 150,
        autoCropHeight: 150,
        centerBox: false, // 截图框是否被限制在图片里面
        high: true, // 是否按照设备的dpr 输出等比例图片
        max: 99999,
      },
      show: true,
      fixed: true,
      fixedNumber: [1, 1],
      downImg: '', // 裁剪后的照片
      loading: false,

    };
  },
  mounted() {
    this.header = {
      authorization: `Bearer ${process.client ? localStorage.getItem('access_token') : ''}`,
    };
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(() => {
          done();
          this.$emit('change', this.dialogVisible);
        })
        .catch(() => { });
    },
    handleClose2() {
      this.dialogVisible = false;
      this.$emit('change', this.dialogVisible);
    },

    // 本地上传头像
    uploadPhoto() {
      this.$refs.photoFile.click();
    },
    // 选择文件
    selectChange(file) {
      const { raw } = file;
      this.fileChange(raw);
    },
    // 修改头像
    fileChange(file) {
      const files = file;
      if (/.(png|jpg|jpeg|JPG|JPEG)$/.test(files.name)) {
        const reader = new FileReader();
        reader.readAsDataURL(files);
        const self = this;
        // eslint-disable-next-line space-before-function-paren
        reader.onload = function() {
          // 图片base64化
          const newUrl = this.result; // 图片路径
          self.$nextTick(() => {
            self.pageImage = newUrl;
            // 将图像置于裁剪框中
            self.option.img = newUrl;
            self.cropImageFormVisible = true;
          });
        };
      } else {
        this.$message({
          message: '请选择符合格式要求的图片',
          type: 'warning',
        });
        this.$refs.photoFile.value = '';
      }
    },
    // 实时预览函数
    realTime(data) {
      this.previews = data;
      this.previewCycle = {
        width: `${this.previews.w}px`,
        height: `${this.previews.h}px`,
        overflow: 'hidden',
        margin: '0',
        zoom: 0.66666666666,
      };
    },
    down() {
      // 获取blob格式的裁剪后的图片
      this.$refs.cropper.getCropBlob((data) => {
        this.downImg = data;
        this.$refs.photoFile.submit();
        this.loading = true;
      });
    },
    // submit 之后会触发此方法
    httpRequest(request) {
      const { action, data, filename } = request;
      // 新建formDate对象
      const formData = new FormData();
      // eslint-disable-next-line no-restricted-syntax
      for (const key in data) {
        formData.append(key, data[key]);
      }
      // 文件单独push,第三个参数指定上传的文件名
      formData.append(filename, this.downImg, data.fileName);
      // loading.start(); // 上传中的loading
      service({
        // headers: {
        //   Accept: 'application/vnd.api+json',
        //   contentType: 'multipart/form-data', // 需要指定上传的方式
        //   authorization: this.authorization
        // },
        url: action,
        method: 'post',
        data: formData,
        timeout: 200000000, // 防止文件过大超时
      }).then((res) => {
        if (res) {
          this.loading = false;
          this.$message.success('图片上传成功');
          this.dialogVisible = false;
          this.$emit('change', this.dialogVisible);
          // this.$router.go(0)
        }
      }, (e) => {
        this.loading = false;
        this.handleError(e);
      });
    },
  },
};
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.showAvatar {
  .container {
    width: 400px;
    height: 400px;
    background: #f0f0f0;
    display: inline-block;
    text-align: center;
    vertical-align: bottom;
    .uptext {
      width: 150px;
      margin-top: 10px;
      span {
        font-weight: bold;
      }
    }
  }
  .imgCrop-content {
    /* margin: 0 20px; */
    display: flex;
    top: 75px;
    /* left: 0; */
    justify-content: flex-start;
    -webkit-justify-content: flex-start;
    position: absolute;
    .cropper-content {
      width: 400px;
      height: 400px;
      background: red;
      margin: 0px auto;
    }
  }

  .preview2 {
    display: inline-flex;
    flex-direction: column;
    margin-left: 17px;
    text-align: center;
    // align-items: center;
  }
  .square {
    width: 150px;
    height: 150px;
    /* line-height: 150px; */
    color: #d9d9d9;
    border: 1px dashed #d9d9d9;
    /* display: inline-block; */
    display: flex;
    justify-content: center;
    align-items: center;
    .squarep {
      width: 53px;
      display: inline-block;
    }
  }
  .circle {
    width: 100px;
    height: 100px;
    // line-height: 100px;
    border-radius: 50%;
    color: #d9d9d9;
    border: 1px dashed #d9d9d9;
    // display: inline-block;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    .squarep {
      width: 53px;
    }
  }
  .pre-button {
    display: inline-block;
    margin-top: 91px;
    .btnw {
      width: 70px;
    }
  }
  ::v-deep .el-dialog__body {
    padding: 20px 15px;
  }
}
::v-deep .el-dialog__title {
  line-height: 24px;
  font-size: 16px;
  color: #6d6d6d;
  font-weight: bold;
}
::v-deep .el-dialog__headerbtn {
  font-size: 22px;
}
</style>
