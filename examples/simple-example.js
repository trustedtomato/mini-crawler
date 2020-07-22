const { Crawler } = require('..')
const crawler = new Crawler({
  concurrency: 10,
  interval: 1000,
  intervalCap: 500
})

crawler.crawl({
  url: 'https://www.google.com/search?q=Tame+Impala',
  gotOptions: {
    headers: {
      'Accept-Language': 'en-US'
    }
  },
  callback: ({ err, body, options: { url }}) => {
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

    return urls
  }
})