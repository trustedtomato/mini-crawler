# mini-crawler
A really small crawler based on [p-queue](https://www.npmjs.com/package/p-queue)
and [got](https://www.npmjs.com/package/got).

## Installation
```
npm install mini-crawler
```

## Usage
```javascript
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
    // It will be transformed into a CrawlOptions array,
    // then crawl() will be called for all of the array's items.
    // To understand the transforming mechanism,
    // see https://github.com/trustedtomato/mini-crawler/blob/master/src/result-to-crawloptions-array.ts
    return urls
  }
})
```

Output:
```text
Fetched https://www.google.com/search?q=Tame+Impala!
Found 145 new URLs!
Fetched https://www.google.com/?sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8QOwgC!
Found 19 new URLs!
Fetched https://www.google.com/?output=search&ie=UTF-8&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8QPAgE!
Found 19 new URLs!
Fetched https://www.google.com/advanced_search!
Found 22 new URLs!
Fetched https://www.google.com/search?q=Tame+Impala&ie=UTF-8&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8Q_AUICSgC!
Found 59 new URLs!
…
```

## API
For the auto-generated typedoc, see the [project's GitHub Page](https://trustedtomato.github.io/mini-crawler/).

## Examples
See the [examples](https://github.com/trustedtomato/mini-crawler/tree/master/examples) folder.
There lies a crawler which tries to find Hitler's Wikipedia article
by navigating from article to article, using the links in them.
You know, the classic [clicks to Hitler](https://en.wikipedia.org/wiki/Wikipedia:Wiki_Game) game.

To try out the example,
clone this respository,
cd into it,
run `npm install && npm run build` then `node examples/clicks-to-hitler.js Barack_Obama`.
(At the time of writing, you can get there with two clicks.)