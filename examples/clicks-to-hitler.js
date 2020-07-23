const { Crawler } = require('..')
const { URL } = require('url')
const { default: got } = require('got/dist/source')

// URLs
const getWikiPageApiUrl = (wikiPage, prop = 'text') => `https://en.wikipedia.org/w/api.php?action=parse&page=${wikiPage}&prop=${prop}&formatversion=2&format=json`
const getWikiPageUrl = (wikiPage) => `https://en.wikipedia.org/wiki/${wikiPage}`

// define constants
const startingWikiPage = process.argv[2] || 'Elmo'
const targetName = 'Hitler'
const targetWikiPage = 'Adolf_Hitler'
const targetWikiPageUrl = getWikiPageUrl(targetWikiPage)

// utility functions
const clickHistoryToText = (clickHistory) => {
  if (clickHistory.length === 0) {
    return 'You are on the Adolf Hitler page duh.'
  }
  if (clickHistory.length === 1) {
    return `Just click ${clickHistory[0]}!`
  }
  return `Click ${clickHistory.slice(0, -1).join(', ')} then ${clickHistory[clickHistory.length - 1]}!`
}
const getWikiPageTitle = (wikiPage) => got(getWikiPageApiUrl(wikiPage, ''), {
  resolveBodyOnly: true,
  responseType: 'json'
}).then(({ parse: { title } }) => title)

// setup crawler
const crawler = new Crawler({
  concurrency: 2,
  interval: 1000,
  intervalCap: 2
})

getWikiPageTitle(targetWikiPage).then((targetWikiPageTitle) => {
  // start crawling
  crawler.crawl({
    url: getWikiPageApiUrl(startingWikiPage),
    data: {
      // store the titles of the articles
      titleHistory: [],
      // store the link which the algorithm "clicked on"
      clickHistory: []
    },
    callback: (_, {
      body,
      options: {
        url,
        data: {
          titleHistory,
          clickHistory
        }
      }
    }) => {
      const page = JSON.parse(body)
      if (!page.parse) {
        console.error(`No parse property at ${url}`)
        return null
      }

      const wikiPage = new URL(url).searchParams.get('page')
      const wikiPageUrl = getWikiPageUrl(wikiPage)
      const { title } = page.parse
      const text = page.parse.text
      // Remove text after References (inclusive) since that is not really a part of the article.
        .replace(/<span [^<>]*?id="?References"?[^<>]*?>\s*References\s*<\/span>[\s\S]*/, '')

      const newTitleHistory = titleHistory.concat([title])
      console.log(`\x1b[32m${newTitleHistory.join(' → ')}\x1b[0m ${wikiPageUrl}`)

      const wikiPageRegex = /href="\/wiki\/(.*?)(?:#.*?)?".*?>(.*?)</g
      const wikiPageMatches = [...text.matchAll(wikiPageRegex)]
      const wikiPages = wikiPageMatches
        .map(([, id, referrer]) => ({
          id,
          referrer
        }))
        // Remove wikiPages which are not regular articles.
        .filter((wikiPage) => !wikiPage.id.startsWith('Help:') &&
          !wikiPage.id.startsWith('File:') &&
          !wikiPage.id.startsWith('Wikipedia:'))

      const targetPage = wikiPages.find(({ id }) => id === targetWikiPage)
      if (targetPage) {
        console.log(`\x1b[32m${newTitleHistory.concat([targetWikiPageTitle]).join(' → ')}\x1b[0m ${targetWikiPageUrl}`)
        console.log(`We have successfully found our way to ${targetName}!`)
        console.log(clickHistoryToText(clickHistory.concat([targetPage.referrer])))
        crawler.reset()
        return null
      }

      return wikiPages.map((wikiPage) => ({
        url: getWikiPageApiUrl(wikiPage.id),
        data: {
          titleHistory: newTitleHistory,
          clickHistory: clickHistory.concat([wikiPage.referrer])
        }
      }))
    }
  })
})
