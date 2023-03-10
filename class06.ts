interface Store {
    currentPage: number
    feeds: NewsFeed[] // NewsFeed 유형의 데이터가 들어가는 배열
}

// 중복 데이터 통합
interface News {
    readonly id: number
    readonly time_ago: string
    readonly title: string
    readonly url: string
    readonly user: string
    readonly content: string
}

interface NewsFeed extends News {
    readonly comments_count: number
    readonly points: number
    read?: boolean // 있을 때도 있고, 없을 때도 있다.
}

interface NewsDetail extends News {
    readonly comments: NewsComment[]
}

interface NewsComment extends News {
    readonly comments: NewsComment[]
    readonly level: number
}

interface RouterInfo {
    path: string
    page: View
}

// ----------------------------------------------------------------------------------------------------

const AJAX: XMLHttpRequest = new XMLHttpRequest()
const container: HTMLElement | null = document.getElementById('root')

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

const store: Store = {
    currentPage: 1,
    feeds: [],
}

// ----------------------------------------------------------------------------------------------------

function applyApiMixins(targetClass: any, baseClass: any[]): void {
    baseClass.forEach((baseClass) => {
        Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
            const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name)

            if (descriptor) {
                Object.defineProperty(targetClass.prototype, name, descriptor)
            }
        })
    })
}
class Api {
    ajax: XMLHttpRequest
    url: string

    constructor(url: string) {
        this.ajax = new XMLHttpRequest()
        this.url = url
    }

    getRequest<T>(url: string): T {
        this.ajax.open('GET', url, false)
        this.ajax.send()

        return JSON.parse(this.ajax.response)
    }
}
class NewsFeedApi {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>(NEWS_URL)
    }
}
class NewsDetailApi {
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id))
    }
}

applyApiMixins(NewsFeedApi, [Api])
applyApiMixins(NewsDetailApi, [Api])

// ----------------------------------------------------------------------------------------------------

abstract class View {
    private template: string
    // replace의 대상이 되는 template 용도의 속성
    private renderTemplate: string
    private container: HTMLElement
    private htmlList: string[]

    constructor(containerId: string, template: string) {
        const containerElement = document.getElementById(containerId)

        if (!containerElement) {
            throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
        }

        this.container = containerElement
        this.template = template
        this.renderTemplate = template
        this.htmlList = []
    }
    protected updateView(): void {
        this.container.innerHTML = this.renderTemplate
        this.renderTemplate = this.template
    }
    protected addHtml(htmlString: string): void {
        this.htmlList.push(htmlString)
    }
    protected getHtml(): string {
        const snapshot = this.htmlList.join('')
        this.clearHtmlList()

        return snapshot
    }
    protected setTemplateData(key: string, value: string): void {
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value)
    }
    private clearHtmlList() {
        this.htmlList = []
    }
    abstract render(): void
}
class NewsFeedView extends View {
    private api: NewsFeedApi
    private feeds: NewsFeed[]

    constructor(containerId: string) {
        // 메인 페이지
        let template = `
            <div class="bg-gray-600 min-h-screen">
                <div class="bg-white text-xl">
                    <div class="mx-auto px-4">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex justify-start">
                                <h1 class="font-extrabold">HACKER NEWS</h1>
                            </div>
                            <div class="items-center justify-end">
                                <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                                    Previous
                                </a>
                                <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                                    Next
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-4 text-2xl text-gray-700">
                    {{__news_feed__}}
                </div>
            </div>
        `

        super(containerId, template)

        this.api = new NewsFeedApi(NEWS_URL)
        this.feeds = store.feeds

        if (this.feeds.length === 0) {
            this.feeds = store.feeds = this.api.getData()
            this.makeFeeds()
        }
    }

    render(): void {
        store.currentPage = Number(location.hash.substring(7) || 1)
        for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
            const { id, title, comments_count, user, points, time_ago, read } = this.feeds[i]

            this.addHtml(`
            <div class="p-6 ${read ? 'bg-red-200' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
                <div class="flex">
                    <div class="flex-auto">
                        <a href="#/show/${id}">
                            ${title}
                        </a>
                    </div>
                    <div class="text-center text-sm">
                        <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
                            (${comments_count})
                        </div>
                    </div>
                </div>
                <div class="flex mt-3">
                    <div class="grid grid-cols-3 text-sm text-gray-500">
                        <div>
                            <i class="fas fa-user mr-1"></i>${user}
                        </div>
                        <div>
                            <i class="fas fa-heart mr-1"></i>${points}
                        </div>
                        <div>
                            <i class="fas fa-clock mr-1"></i>${time_ago}
                        </div>
                    </div>
                </div>
            </div>
        `)
        }

        this.setTemplateData('news_feed', this.getHtml())
        this.setTemplateData('prev_page', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
        this.setTemplateData('next_page', String(store.currentPage + 1))

        this.updateView()
    }
    private makeFeeds() {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false
        }
    }
}
class Router {
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
class NewsDetailView extends View {
    constructor(containerId: string) {
        let template = `
            <div class="bg-gray-600 min-h-screen pb-8">
                <div class="bg-white text-xl">
                    <div class="mx-auto px-4">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex justify-start">
                                <h1 class="font-extrabold">
                                    HACKER NEWS
                                </h1>
                            </div>
                            <div class="items-center justify-end">
                                <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                                    <i class="fa fa-times"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h-full border rounded-xl bg-white m-6 p-4">
                    <h2>
                        {{__title__}}
                    </h2>
                    <div class="text-gray-400 h-20">
                        {{__content__}}
                    </div>
                    {{__comments__}}
                </div>
            </div>
        `
        super(containerId, template)
    }
    render() {
        const id = location.hash.substring(7) // 내가 쓰고 싶은 위치 값을 지정해주면 된다. 그 이후의 나머지 문자열들만 반환한다.
        const api = new NewsDetailApi(CONTENT_URL.replace('@id', id))
        const newsDetail: NewsDetail = api.getData()

        for (let i = 0; i < store.feeds.length; i++) {
            if (store.feeds[i].id === Number(id)) {
                store.feeds[i].read = true
                break
            }
        }
        this.setTemplateData('comments', this.makeComment(newsDetail.comments))
        this.setTemplateData('currentPage', String(store.currentPage))
        this.setTemplateData('title', newsDetail.title)
        this.setTemplateData('content', newsDetail.content)

        this.updateView()
    }
    private makeComment(comments: NewsComment[]): string {
        for (let i = 0; i < comments.length; i++) {
            const comment: NewsComment = comments[i]

            this.addHtml(`
                <div style="padding-left: ${comment.level * 40}px" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comment.user}</strong> ${comment.time_ago}
                    </div>
                    <p class="text-gray-700">
                        ${comment.content}
                    </p>
                </div>
            `)
            // 재귀 호출
            if (comment.comments.length > 0) {
                this.addHtml(this.makeComment(comment.comments))
            }
        }

        return this.getHtml()
    }
}

const router: Router = new Router()
const newsFeedView = new NewsFeedView('root')
const newsDetailView = new NewsDetailView('root')

router.setDefaultPage(newsFeedView)

router.addRouterPath('/page/', newsFeedView)
router.addRouterPath('/show/', newsDetailView)

router.route()
