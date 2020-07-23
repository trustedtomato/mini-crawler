const { Crawler } = require('..')
const crawler = new Crawler({
  // All of p-queue options are accepted,
  // see https://www.npmjs.com/package/p-queue#options.
  concurrency: 10,
  interval: 1000,
  intervalCap: 500
})

crawler.crawl({
  // The crawling will begin at this URL.
  url: 'https://www.google.com/search?q=Tame+Impala',
  // All of got's options are accepted,
  // except isStream and resolveBodyOnly.
  // See https://www.npmjs.com/package/got#options.
  gotOptions: {
    headers: {
      'Accept-Language': 'en-US'
    }
  },
  callback: (err, { body, options: { url } }) => {
    if (err) {
      console.error(`Error occured at ${url}!`)
      return
    }

    console.log(`Fetched ${url}!`)

    const urls = [...body.matchAll(/href="(.*?)"/g)]
      .map(match => match[1]
        .replace(/&amp;/g, '&')
      )
    console.log(`Found ${urls.length} new URLs!`)

    // The returned value will be used for further crawls.
    // It will be transformed into a CrawlOptions array.
    // then crawl() will be called for all of the array's items.
    // To understand the transforming mechanism,
    // see https://github.com/trustedtomato/mini-crawler/blob/master/src/result-to-crawloptions-array.ts
    return urls
  }
})
