import { NewsFeed, NewsDetail } from '../types'
import { NEWS_URL, CONTENT_URL } from '../config'

// function applyApiMixins(targetClass: any, baseClass: any[]): void {
//     baseClass.forEach((baseClass) => {
//         Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
//             const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name)

//             if (descriptor) {
//                 Object.defineProperty(targetClass.prototype, name, descriptor)
//             }
//         })
//     })
// }

export class Api {
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
export class NewsFeedApi extends Api {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>(NEWS_URL)
    }
}
export class NewsDetailApi extends Api {
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id))
    }
}

// applyApiMixins(NewsFeedApi, [Api])
// applyApiMixins(NewsDetailApi, [Api])
