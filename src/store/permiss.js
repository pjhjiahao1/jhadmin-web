
import Main from '@/components/main'
const permiss = {
    
}
export const filterAsyncRouter = (routers) => { // 遍历后台传来的路由字符串，转换为组件对象
  return routers.filter(router => {
    if (router.component) {
      if (router.component === 'Main') { // Layout组件特殊处理
        router.component = Main
      } else {
        const component = router.component
        router.component = loadView(component)
      }
    }
    routers.alwaysShow = true
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children)
    }
    return true
  })
}

export const loadView = (view) => {
  return (resolve) => require(['@/view/' + view], resolve)
}

export default permiss
