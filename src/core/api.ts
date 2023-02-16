import { NewsFeed, NewsDetail } from '../types'
import { NEWS_URL, CONTENT_URL } from '../config'

export class Api {
    ajax: XMLHttpRequest
    url: string

    constructor(url: string) {
        this.ajax = new XMLHttpRequest()
        this.url = url
    }

    getRequest<T>(cb: (data: T) => void): void {
        this.ajax.open('GET', this.url)
        this.ajax.addEventListener('load', () => {
            cb(JSON.parse(this.ajax.response) as T)
        })
        this.ajax.send()
    }
}
export class NewsFeedApi extends Api {
    constructor(url: string) {
        super(url)
    }
    getData(cb: (data: NewsFeed[]) => void): void {
        return this.getRequest<NewsFeed[]>(cb)
    }
}
export class NewsDetailApi extends Api {
    getData(cb: (data: NewsDetail) => void): void {
        return this.getRequest<NewsDetail>(cb)
    }
}
