const AJAX = new XMLHttpRequest()
const CONTAINER = document.getElementById('root')
const CONTENT = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
// 실제 사용자가 타이틀을 클릭했을 때, CONTENTS_URL을 가지고 AJAX 호출을 하여 데이터를 가져오자.
// 이벤트 시스템은 브라우저가 제공한다.
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'
const store = {
    currentPage: 1,
    feeds: [],
}

function getData(url) {
    AJAX.open('GET', url, false) // false : 동기적으로 처리하겠다는 옵션
    AJAX.send()

    return JSON.parse(AJAX.response)
}
function makeFeeds(feeds) {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false
    }

    return feeds
}
function newsFeed() {
    // 메인 페이지
    let newsFeed = store.feeds
    const NEWSLIST = []

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

    if (newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeeds(getData(NEWS_URL))
    }

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        NEWSLIST.push(`
            <div class="p-6 ${
                newsFeed[i].read ? 'bg-red-200' : 'bg-white'
            } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
                <div class="flex">
                    <div class="flex-auto">
                        <a href="#/show/${newsFeed[i].id}">
                            ${newsFeed[i].title}
                        </a>
                    </div>
                    <div class="text-center text-sm">
                        <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
                            (${newsFeed[i].comments_count})
                        </div>
                    </div>
                </div>
                <div class="flex mt-3">
                    <div class="grid grid-cols-3 text-sm text-gray-500">
                        <div>
                            <i class="fas fa-user mr-1"></i>${newsFeed[i].user}
                        </div>
                        <div>
                            <i class="fas fa-heart mr-1"></i>${newsFeed[i].points}
                        </div>    
                        <div>
                            <i class="fas fa-clock mr-1"></i>${newsFeed[i].time_ago}
                        </div>        
                    </div>
                </div>
            </div>
        `)
    }

    template = template.replace('{{__news_feed__}}', NEWSLIST.join(''))
    template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1)
    template = template.replace('{{__next_page__}}', store.currentPage + 1)

    CONTAINER.innerHTML = template
}
function newsDetail() {
    const id = location.hash.substring(7) // 내가 쓰고 싶은 위치 값을 지정해주면 된다. 그 이후의 나머지 문자열들만 반환한다.
    const NEWSCONTENT = getData(CONTENT_URL.replace('@id', id))

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
                            <a href="#/page/${store.currentPage}" class="text-gray-500">
                                <i class="fa fa-times"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="h-full border rounded-xl bg-white m-6 p-4">
                <h2>
                    ${NEWSCONTENT.title}
                </h2>
                <div class="text-gray-400 h-20">
                    ${NEWSCONTENT.content}
                </div>
                {{__comments__}}
            </div>
        </div>
    `

    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true
            break
        }
    }

    function makeComment(comments, called = 0) {
        const commentString = []

        for (let i = 0; i < comments.length; i++) {
            commentString.push(`
                <div style="padding-left: ${called * 40}px" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comments[i].user}</strong> ${comments[i].time_ago}
                    </div>
                    <p class="text-gray-700">
                        ${comments[i].content}
                    </p>
                </div>
            `)
            // 재귀 호출
            if (comments[i].comments.length > 0) {
                commentString.push(makeComment(comments[i].comments, called + 1))
            }
        }

        return commentString.join('')
    }

    CONTAINER.innerHTML = template.replace('{{__comments__}}', makeComment(NEWSCONTENT.comments))
}
function router() {
    const routePath = location.hash

    // location.hash가 #만 있을 경우에는 빈 값을 반환한다.
    // 따라서 true를 반환한다.
    if (routePath === '') {
        newsFeed()
    } else if (routePath.indexOf('#/page/') >= 0) {
        store.currentPage = Number(routePath.substring(7))
        newsFeed()
    } else {
        newsDetail()
    }
}

window.addEventListener('hashchange', router)

router()
