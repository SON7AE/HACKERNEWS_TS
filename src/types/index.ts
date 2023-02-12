import View from '../core/view'

export interface Store {
    currentPage: number
    feeds: NewsFeed[] // NewsFeed 유형의 데이터가 들어가는 배열
}

// 중복 데이터 통합
export interface News {
    readonly id: number
    readonly time_ago: string
    readonly title: string
    readonly url: string
    readonly user: string
    readonly content: string
}

export interface NewsFeed extends News {
    readonly comments_count: number
    readonly points: number
    read?: boolean // 있을 때도 있고, 없을 때도 있다.
}

export interface NewsDetail extends News {
    readonly comments: NewsComment[]
}

export interface NewsComment extends News {
    readonly comments: NewsComment[]
    readonly level: number
}

export interface RouterInfo {
    path: string
    page: View
}
