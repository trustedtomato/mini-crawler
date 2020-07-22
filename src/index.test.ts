import Crawler from './index'

const callback = () => null

test('when crawling a non-visited URL, the URL should be added to visited URLs', () => {
  const crawler = new Crawler()
  crawler.visited.push('https://example.com/')
  crawler.crawl({
    url: 'https://example.com/non-visited-path',
    callback
  })
  expect(crawler.queue.size + crawler.queue.pending).toBe(1)
  expect(crawler.visited.length).toBe(2)
})

test('crawling a visited URL should return early', () => {
  const crawler = new Crawler()
  crawler.visited.push('https://example.com/')
  crawler.crawl({
    url: 'https://example.com',
    callback
  })
  expect(crawler.queue.size + crawler.queue.pending).toBe(0)
})

test('resetting the crawler should stop it', () => {
  const crawler = new Crawler({
    concurrency: 2
  })
  crawler.crawl({
    url: 'https://example.com',
    callback
  })
  crawler.crawl({
    url: 'https://example.org',
    callback
  })
  crawler.crawl({
    url: 'https://example.com/2',
    callback
  })
  crawler.reset()
  expect(crawler.queue.size).toBe(0)
  process.nextTick(() => {
    expect(crawler.queue.pending).toBe(0)
  })
})

test('callback\'s result should be used for further calls', done => {
  const crawler = new Crawler()
  crawler.crawl({
    url: 'https://wiki.archlinux.org/',
    callback: ({ body }) => {
      const newCallback = () => {
        expect(crawler.queue.size + crawler.queue.pending).toBe(3)
        crawler.reset()
        done()
      }
      return [...(body as string)
        .matchAll(/href="(.*?)"/g)]
        .slice(0, 3)
        .map(match => ({
          url: match[1],
          callback: newCallback
        }))
    }
  })
})

test('throws errors', () => {
  expect(() => {
    // @ts-ignore: In the following line we are testing errors.
    new Crawler({}).crawl()
  }).toThrow(/No options object present/i)

  expect(() => {
    // @ts-ignore: In the following line we are testing errors.
    new Crawler().crawl({})
  }).toThrow(/callback property/i)

  expect(() => {
    // @ts-ignore: In the following line we are testing errors.
    new Crawler().crawl({
      callback
    })
  }).toThrow(/url property/i)
})
