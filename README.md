# mini-crawler
A really small crawler.

## Usage
```javascript
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

    return urls
  }
})
```

Output:
```
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
Fetched https://www.google.com/search?q=Tame+Impala&ie=UTF-8&source=lnms&tbm=shop&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8Q_AUIDCgF!
Found 49 new URLs!
Fetched https://www.google.com/search?q=Tame+Impala&ie=UTF-8&source=lnt&tbs=qdr:h&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8QpwUIEQ!
Found 32 new URLs!
Fetched https://maps.google.com/maps?q=Tame+Impala&um=1&ie=UTF-8&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8Q_AUICygE!
Found 4 new URLs!
Fetched https://www.google.com/search?q=Tame+Impala&ie=UTF-8&source=lnms&tbm=vid&sa=X&ved=0ahUKEwiM39zjjuHqAhUUdCsKHf7xAX8Q_AUICCgB!
Found 56 new URLs!
Fetched https://www.google.com/search?q=Tame+Impala&ie=UTF-8&gbv=1&sei=QlMYX4y2NZTorQH-44f4Bw!
Found 140 new URLs!
…
```

## API
For the auto-generated typedoc, see [the project's GitHub Page](https://trustedtomato.github.io/mini-crawler/).

## Example
See the examples folder.
There lies a crawler which tries to find Hitler's Wikipedia article
by navigating from article to article, using the links in them.
You know, the classic [clicks to Hitler](https://en.wikipedia.org/wiki/Wikipedia:Wiki_Game) game.

To try out the example,
clone this respository,
cd into it,
run `npm install && npm run build` then `node examples/clicks-to-hitler.js Barack_Obama`.
(At the time of writing, you can get there with two clicks.)