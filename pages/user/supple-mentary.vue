<template v-if="forums" v-loading="loading">
  <!-- 补充信息 -->
  <div class="supple">
    <h2 class="supple-title">{{ $t("user.supplementary") }}</h2>
    <div v-for="(item, index) in dataList" :key="index" class="supple-content">
      <div class="supple-content__item">
        <div class="supple-content__item__title">
          {{ `${index + 1}.${item.name}` }}
          <span
            v-if="item.required"
            class="supple-content__item__title-necessary"
          >*</span>
        </div>
        <div class="supple-content__item__detail">
          <!-- 单行文本 -->
          <el-input
            v-if="item.type === 0"
            v-model="item.detail"
            clearable
            :placeholder="$t('user.inputcontent')"
          />
          <!-- 多行文本 -->
          <el-input
            v-else-if="item.type === 1"
            v-model="item.detail"
            clearable
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('user.inputcontent')"
          />
          <!-- 单选 -->
          <el-radio-group v-else-if="item.type === 2" v-model="item.detail">
            <el-radio
              v-for="radioItem in item.options"
              :key="radioItem.value"
              :label="radioItem"
            >{{ radioItem.value }}
            </el-radio>
          </el-radio-group>
          <!-- 多选 -->
          <el-checkbox-group v-else-if="item.type === 3" v-model="item.detail">
            <el-checkbox
              v-for="checkItem in item.options"
              :key="checkItem.value"
              :label="checkItem.value"
            />
          </el-checkbox-group>
          <!-- 图片上传-->
          <div
            v-else-if="item.type === 4"
            class="supple-content__item__detail-image"
          >
            <image-upload
              :on-upload.sync="onUploadImage"
              :type="1"
              :file-list="[]"
              action="/attachments"
              :accept="imageTypeLimit"
              :size-limit="attachedSizeLimit"
              @success="
                imageList => onPostContentChange('imageList', imageList, index)
              "
              @remove="(imageList, fileIndex) => removeItem(fileIndex, index)"
            />
          </div>
          <!-- 附件上传-->
          <div
            v-else-if="item.type === 5"
            class="supple-content__item__detail-file"
          >
            <attachment-upload
              :file-list="[]"
              :on-upload.sync="onUploadAttached"
              action="/attachments"
              :accept="attachedTypeLimit"
              :type="0"
              :size-limit="attachedSizeLimit"
              :add-tips="$t('post.postAttachment')"
              @success="
                files => onPostContentChange('attachedList', files, index)
              "
              @remove="(imageList, fileIndex) => removeItem(fileIndex, index)"
            />
          </div>
        </div>
      </div>
    </div>
    <el-button type="primary" class="r-button" @click="registerConfirm">
      {{ $t("modify.submit") }}
    </el-button>
  </div>
</template>

<script>
import head from '@/mixin/head';
import handleError from '@/mixin/handleError';
import loginAbout from '@/mixin/loginAbout';

export default {
  name: 'SuppleMentary',
  mixins: [head, handleError, loginAbout],
  data() {
    return {
      title: this.$t('user.supplementary'),
      loading: false,
      onUploadImage: false,
      id: '',
      onUploadAttached: false,
      dataList: []
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    },
    url() {
      return '/api';
    },
    imageTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_img_ext;
        return limitText
          .split(',')
          .map(item => `.${item}`)
          .join(',');
      }
      return '';
    },
    attachedTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_file_ext;
        return limitText
          .split(',')
          .map(item => `.${item}`)
          .join(',');
      }
      return '';
    },
    attachedSizeLimit() {
      if (this.forums.set_attach) {
        return this.forums.set_attach.support_max_size * 1024 * 1024;
      }
      return 10485760;
    }
  },
  mounted() {
    const { id } = this.$route.query;
    if (id) {
      this.id = id;
    }
    this.getData();
  },
  methods: {
    registerConfirm() {
      const dataList = this.dataList;
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].required) {
          if (!dataList[i].detail || dataList[i].detail.length < 1) {
            this.$message.error(`${dataList[i].name}不能为空`);
            return;
          }
        }
      }
      this.submit();
    },
    // 上传和删除附件
    onPostContentChange(key, value, index) {
      this.dataList[index].detail.push(value[0]);
    },
    removeItem(fileIndex, index) {
      this.dataList[index].detail.splice(fileIndex, 1);
    },
    submit() {
      const dataList = this.dataList;
      const params = {
        data: []
      };
      dataList.forEach(item => {
        const detailType = typeof item.detail;
        let fields_ext = '';
        if (item.type === 2) {
          // 单选
          item.options.forEach(v => {
            if (v.value === item.detail.value) {
              v.checked = true;
            }
          });
          fields_ext = JSON.stringify({ options: item.options });
        } else if (item.type === 3) {
          // 多选
          item.options.forEach(v => {
            if (item.detail.indexOf(v.value) !== -1) {
              v.checked = true;
            }
          });
          fields_ext = JSON.stringify({ options: item.options });
        } else {
          // 其他
          fields_ext = detailType === 'string' ? item.detail : JSON.stringify(item.detail);
        }
        // 处理拓展字段
        params.data.push({
          type: 'user_sign_in',
          attributes: {
            sort: item.sort,
            name: item.name,
            id: item.id,
            user_id: this.id,
            type: item.type,
            fields_desc: item.fields_desc,
            type_desc: item.type_desc,
            required: item.required,
            fields_ext: fields_ext,
            remark: item.remark,
            status: item.status
          }
        });
      });
      this.$store
        .dispatch('jv/post', [
          { _jv: { type: 'user/signinfields' }},
          { data: params }])
        .then(data => {
          const userId = this.$store.getters['session/get']('userId');
          const params = {
            include: 'groups'
          };
          this.$store
            .dispatch('jv/get', [`users/${userId}`, { params }])
            .then(val => {
              this.$router.push('/');
            })
            .catch(e => {
              const {
                response: {
                  data: { errors }
                }
              } = e;
              if (Array.isArray(errors) && errors.length > 0) {
                const errorCode = errors[0].code;
                if (errorCode === 'register_validate') {
                  this.$router.push('/user/warning');
                  return;
                }
              }
            });
        });
    },
    getData() {
      const params = {
        user_id: this.id
      };
      this.$store.dispatch('jv/get', ['user/signinfields', { params }]).then(
        res => {
          res.forEach((v, i) => {
            // 单选多选选项
            if (v.fields_ext && (v.type === 2 || v.type === 3)) {
              v.options = JSON.parse(v.fields_ext).options;
            }
            // 用于存放填的值
            v.detail = v.type > 2 ? [] : '';
          });
          this.dataList = res;
        },
        e => this.handleError(e)
      );
    }
  }
};
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
    font-weight: bold;
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
    border-bottom: 1px solid #ededed;
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
