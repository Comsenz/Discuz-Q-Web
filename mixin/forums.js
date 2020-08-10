// import { SITE_PAY } from '@/common/const';

 const Forums = {
  computed: {
    forums() {
      return this.$store.getters['jv/get']('forums/1');
    },
  },
};
export default{
  Forums
}
