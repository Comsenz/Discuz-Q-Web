<template>
  <!-- 补充信息 -->
  <div class="supple">
    <h2 class="supple-title">{{ $t('user.supplementary') }}</h2>
    <div v-for="(item, index) in dataList" :key="index" class="supple-content">
      <div class="supple-content__item">
        <div class="supple-content__item__title">
          {{ `${index + 1}.${item.name}` }}
          <span v-if="item.fields_ext.necessary" class="supple-content__item__title-necessary">*</span>
        </div>
        <div class="supple-content__item__detail">
          <!-- 单行文本 -->
          <el-input v-if="item.type==0" v-model="item.fields_ext.detail" clearable :placeholder="$t('user.inputcontent')" />
          <!-- 多行文本 -->
          <el-input v-else-if="item.type==1" v-model="item.fields_ext.detail" clearable type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :placeholder="$t('user.inputcontent')" />
          <!-- 单选 -->
          <el-radio-group v-else-if="item.type==2" v-model="item.fields_ext.detail">
            <el-radio v-for="radioItem in item.fields_ext.options" :key="radioItem" :label="radioItem">{{ radioItem }}</el-radio>
          </el-radio-group>
          <!-- 多选 -->
          <el-checkbox-group v-else-if="item.type==3" v-model="item.fields_ext.detail">
            <el-checkbox v-for="checkItem in item.fields_ext.options" :key="checkItem" :label="checkItem" />
          </el-checkbox-group>
          <!-- 图片上传-->
          <div v-else-if="item.type==4" class="supple-content__item__detail-image">
            <image-upload
              :on-upload.sync="onUploadImage"
              :type="1"
              :file-list="[]"
              action="/attachments"
              :accept="imageTypeLimit"
              :size-limit="attachedSizeLimit"
              @success="imageList => onPostContentChange('imageList', imageList, index)"
              @remove="(imageList, fileIndex) => removeItem(fileIndex, index)"
            />
          </div>
          <!-- 附件上传-->
          <div v-else-if="item.type==5" class="supple-content__item__detail-file">
            <attachment-upload :file-list="[]" :on-upload.sync="onUploadAttached" action="/attachments" :accept="attachedTypeLimit" :type="0" :size-limit="attachedSizeLimit" :add-tips="$t('post.postAttachment')" @success="files => onPostContentChange('attachedList', files, index)" @remove="(imageList, fileIndex) => removeItem(fileIndex, index)" />
          </div>
        </div>
      </div>
    </div>
    <el-button type="primary" class="r-button" @click="registerConfirm">
      {{ $t("profile.registerconfirm") }}
    </el-button>
  </div>
</template>

<script>
import head from '@/mixin/head'
import handleError from '@/mixin/handleError'

export default {
  name: 'SuppleMentary',
  mixins: [head, handleError],
  data() {
    return {
      loading: false,
      onUploadImage: false,
      onUploadAttached: false,
      dataList: []
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    url() {
      return '/api'
    },
    imageTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_img_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    },
    attachedTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_file_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    },
    attachedSizeLimit() {
      if (this.forums.set_attach) {
        return this.forums.set_attach.support_max_size * 1024 * 1024
      }
      return 10485760
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    registerConfirm() {
      const dataList = this.dataList
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].fields_ext.necessary) {
          if (!dataList[i].fields_ext.detail || dataList[i].fields_ext.detail.length < 1) {
            this.$message.error(`${dataList[i].name}不能为空`)
            return
          }
        }
      }
      this.submit()
    },
    // 上传和删除附件
    onPostContentChange(key, value, index) {
      this.dataList[index].fields_ext.detail.push(value[0])
    },
    removeItem(fileIndex, index) {
      this.dataList[index].fields_ext.detail.splice(fileIndex, 1)
    },
    submit() {
      console.log(this.dataList)
      this.$message.success(this.$t('user.registerSuccess'))
      this.logind()
    },
    getData() {
      const data = [
        {
          type: 0,
          name: '单行文本框',
          fields_ext: {
            necessary: true
          }
        },
        {
          type: 1,
          name: '多行文本框',
          fields_ext: {
            necessary: true
          }
        },
        {
          type: 2,
          name: '单选',
          fields_ext: {
            necessary: true,
            options: ['单选1', '单选2']
          }
        },
        {
          type: 3,
          name: '多选',
          fields_ext: {
            necessary: true,
            options: ['多选1', '多选2', '多选3', '多选4']
          }
        },
        {
          type: 4,
          name: '图片',
          fields_ext: {
            necessary: true
          }
        },
        {
          type: 5,
          name: '附件',
          fields_ext: {
            necessary: false
          }
        }
      ]
      data.forEach(v => {
        if (v.type > 2) {
          v.fields_ext.detail = []
        } else {
          v.fields_ext.detail = ''
        }
      })
      this.dataList = data
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.supple {
  display: flex;
  flex-direction: column;
  width: 420px;
}
.supple-title {
  color: $color-000;
  font-weight: bold;
  font-size: 26px;
  margin-top: 62px;
  padding-bottom: 19px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e4e7ed;
}
.supple-content__item {
  position: relative;
  margin-bottom: 20px;
  &__title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  &__title-necessary {
    color: $color-red;
    margin-left: 5px;
    font-weight: bold
  }
  .el-input {
    width: 300px;
  }
}
::v-deep .supple-content__item__detail-image {
  .container-upload > .preview-item,
  .container-upload > .upload {
    width: 70px;
    height: 70px;
    border-radius: 2px;
  }
  .container-upload > .upload {
    border: 1px solid $border-color;
  }
  .container-upload > .upload > .upload-icon {
     color: $border-color;
     font-size: 36px;
  }
  .container-upload > .preview-item > img {
     border-radius: 2px;
  }
}

::v-deep .container-upload > .preview-item > .cover {
  text-align: center;
}
::v-deep .supple-content__item__detail-file {
  .container-upload > .preview-item > .container-item {
    background: transparent;
    border: none;
  }
  .container-upload > .upload .attachment-list {
    display: none;
  }
  .container-upload > .upload {
    position: absolute;
    top: 0;
    right: 0;
  }
  .container-upload > .preview-item {
    border-bottom: 1px solid #EDEDED;
  }
  .container-upload > .preview-item > .remove > .remove-icon {
    font-size: 14px;
  }
}
.el-button.el-button--primary {
  width: 300px;
   margin-top: 10px;
   margin-bottom: 50px;
}
</style>
