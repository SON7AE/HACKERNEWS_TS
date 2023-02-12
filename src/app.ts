// const AJAX: XMLHttpRequest = new XMLHttpRequest()
// const container: HTMLElement | null = document.getElementById('root')
import Router from './core/router'
import { NewsFeedView, NewsDetailView } from './page'
import Store from './store'

const store = new Store()
const router: Router = new Router()
const newsFeedView = new NewsFeedView('root', store)
const newsDetailView = new NewsDetailView('root', store)

router.setDefaultPage(newsFeedView)

router.addRouterPath('/page/', newsFeedView, /page\/(\d+)/)
router.addRouterPath('/show/', newsDetailView, /show\/(\d+)/)

router.go()
