import { RouterInfo } from '../types'
import View from './view'

export default class Router {
    routeTable: RouterInfo[]
    defaultRoute: RouterInfo | null

    constructor() {
        window.addEventListener('hashchange', this.route.bind(this))

        this.routeTable = []
        this.defaultRoute = null
    }
    setDefaultPage(page: View): void {
        this.defaultRoute = { path: '', page }
    }
    addRouterPath(path: string, page: View): void {
        this.routeTable.push({ path, page })
    }
    route() {
        const routePath = location.hash

        if (routePath === '' && this.defaultRoute) {
            this.defaultRoute.page.render()
        }
        for (const RouterInfo of this.routeTable) {
            if (routePath.indexOf(RouterInfo.path) >= 0) {
                RouterInfo.page.render()
                break
            }
        }
    }
}
