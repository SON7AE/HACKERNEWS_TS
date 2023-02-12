// interface Store {
//     currentPage: number
//     feeds: NewsFeed[] // NewsFeed 유형의 데이터가 들어가는 배열
// }

// // 중복 데이터 통합
// interface News {
//     readonly id: number
//     readonly time_ago: string
//     readonly title: string
//     readonly url: string
//     readonly user: string
//     readonly content: string
// }

// interface NewsFeed extends News {
//     readonly comments_count: number
//     readonly points: number
//     read?: boolean // 있을 때도 있고, 없을 때도 있다.
// }

// interface NewsDetail extends News {
//     readonly comments: NewsComment[]
// }

// interface NewsComment extends News {
//     readonly comments: NewsComment[]
//     readonly level: number
// }

// // ----------------------------------------------------------------------------------------------------

// const AJAX: XMLHttpRequest = new XMLHttpRequest()
// const CONTAINER: HTMLElement | null = document.getElementById('root')

// const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
// const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

// const store: Store = {
//     currentPage: 1,
//     feeds: [],
// }

// function getData<T>(url: string): T {
//     AJAX.open('GET', url, false) // false : 동기적으로 처리하겠다는 옵션
//     AJAX.send()

//     return JSON.parse(AJAX.response)
// }
// function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
//     for (let i = 0; i < feeds.length; i++) {
//         feeds[i].read = false
//     }
//     return feeds
// }
// function updateView(html: string): void {
//     if (CONTAINER !== null) {
//         CONTAINER.innerHTML = html
//     } else {
//         console.error('최상위 컨테이너가 없어 UI를 진행하지 못했습니다.')
//     }
// }
// function newsFeed(): void {
//     // 메인 페이지
//     let newsFeed: NewsFeed[] = store.feeds
//     const NEWSLIST = []

//     let template = `
//         <div class="bg-gray-600 min-h-screen">
//             <div class="bg-white text-xl">
//                 <div class="mx-auto px-4">
//                     <div class="flex justify-between items-center py-6">
//                         <div class="flex justify-start">
//                             <h1 class="font-extrabold">HACKER NEWS</h1>
//                         </div>
//                         <div class="items-center justify-end">
//                             <a href="#/page/{{__prev_page__}}" class="text-gray-500">
//                                 Previous
//                             </a>
//                             <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
//                                 Next
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div class="p-4 text-2xl text-gray-700">
//                 {{__news_feed__}}
//             </div>
//         </div>
//     `
//     // getData의 리턴 값이 2개이므로 제네릭을 사용하자.
//     if (newsFeed.length === 0) {
//         newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL))
//     }

//     for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
//         NEWSLIST.push(`
//             <div class="p-6 ${
//                 newsFeed[i].read ? 'bg-red-200' : 'bg-white'
//             } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
//                 <div class="flex">
//                     <div class="flex-auto">
//                         <a href="#/show/${newsFeed[i].id}">
//                             ${newsFeed[i].title}
//                         </a>
//                     </div>
//                     <div class="text-center text-sm">
//                         <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
//                             (${newsFeed[i].comments_count})
//                         </div>
//                     </div>
//                 </div>
//                 <div class="flex mt-3">
//                     <div class="grid grid-cols-3 text-sm text-gray-500">
//                         <div>
//                             <i class="fas fa-user mr-1"></i>${newsFeed[i].user}
//                         </div>
//                         <div>
//                             <i class="fas fa-heart mr-1"></i>${newsFeed[i].points}
//                         </div>
//                         <div>
//                             <i class="fas fa-clock mr-1"></i>${newsFeed[i].time_ago}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `)
//     }

//     template = template.replace('{{__news_feed__}}', NEWSLIST.join(''))
//     template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
//     template = template.replace('{{__next_page__}}', String(store.currentPage + 1))

//     updateView(template)
// }
// function newsDetail(): void {
//     const id = location.hash.substring(7) // 내가 쓰고 싶은 위치 값을 지정해주면 된다. 그 이후의 나머지 문자열들만 반환한다.
//     const NEWSCONTENT = getData<NewsDetail>(CONTENT_URL.replace('@id', id))

//     let template = `
//         <div class="bg-gray-600 min-h-screen pb-8">
//             <div class="bg-white text-xl">
//                 <div class="mx-auto px-4">
//                     <div class="flex justify-between items-center py-6">
//                         <div class="flex justify-start">
//                             <h1 class="font-extrabold">
//                                 HACKER NEWS
//                             </h1>
//                         </div>
//                         <div class="items-center justify-end">
//                             <a href="#/page/${store.currentPage}" class="text-gray-500">
//                                 <i class="fa fa-times"></i>
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div class="h-full border rounded-xl bg-white m-6 p-4">
//                 <h2>
//                     ${NEWSCONTENT.title}
//                 </h2>
//                 <div class="text-gray-400 h-20">
//                     ${NEWSCONTENT.content}
//                 </div>
//                 {{__comments__}}
//             </div>
//         </div>
//     `

//     for (let i = 0; i < store.feeds.length; i++) {
//         if (store.feeds[i].id === Number(id)) {
//             store.feeds[i].read = true
//             break
//         }
//     }

//     updateView(template.replace('{{__comments__}}', makeComment(NEWSCONTENT.comments)))
// }
// function makeComment(comments: NewsComment[]): string {
//     const commentString = []

//     for (let i = 0; i < comments.length; i++) {
//         const comment: NewsComment = comments[i]

//         commentString.push(`
//             <div style="padding-left: ${comment.level * 40}px" class="mt-4">
//                 <div class="text-gray-400">
//                     <i class="fa fa-sort-up mr-2"></i>
//                     <strong>${comment.user}</strong> ${comment.time_ago}
//                 </div>
//                 <p class="text-gray-700">
//                     ${comment.content}
//                 </p>
//             </div>
//         `)
//         // 재귀 호출
//         if (comment.comments.length > 0) {
//             commentString.push(makeComment(comment.comments))
//         }
//     }

//     return commentString.join('')
// }
// function router(): void {
//     const routePath = location.hash

//     // location.hash가 #만 있을 경우에는 빈 값을 반환한다.
//     // 따라서 true를 반환한다.
//     if (routePath === '') {
//         newsFeed()
//     } else if (routePath.indexOf('#/page/') >= 0) {
//         store.currentPage = Number(routePath.substring(7))
//         newsFeed()
//     } else {
//         newsDetail()
//     }
// }

// window.addEventListener('hashchange', router)

// router()
