export default function({ isHMR, app, store, route, params, error, redirect }) {
  console.log(isHMR)
  if (isHMR) return
  if (route.fullPath === '/pages/site/index') {
    return redirect('/my/circleinfo')
  }
}
