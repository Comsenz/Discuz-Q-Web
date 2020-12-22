import Vue from 'vue';
import svgIcon from '../components/SvgIcon';

function importAll(r) {
  r.keys().forEach(r);
}

importAll(require.context('../assets/svg-icons/', false, /\.svg$/));

Vue.component(svgIcon.name, svgIcon);
