import PQueue, { DefaultAddOptions, Options as PQueueOptions } from 'p-queue'
import PriorityQueue from 'p-queue/dist/priority-queue'
import got, { Options as GotOptions, CancelableRequest } from 'got'
import urlLib from 'url'
import { resultToCrawlOptionsArray } from './result-to-crawloptions-array'

/**
 * The options for the PQueue constructor.
 * @see {@link https://www.npmjs.com/package/p-queue}
 */
type CrawlerOptions = PQueueOptions<PriorityQueue, DefaultAddOptions>

type Promisable<T> = T | PromiseLike<T>
export type ResolvedCallbackResult = ResolvedCallbackResult[] | string | PartialCrawlOptions | null | void
type CallbackResult = Promisable<ResolvedCallbackResult>
interface CallbackArgument {
  error?: Error
  body?: unknown
  options: CrawlOptions
}
interface Callback {
  (arg: CallbackArgument): CallbackResult
}

interface PartialCrawlOptions {
  /**
   * The URL to start crawling at.
   */
  url: string
  /**
   * The callback interprets the result of got.
   * The returned value of the callback will be used to trigger
   * further crawls. The current CrawlOptions object will be
   * merged with the returned value. See the [examples](https://github.com/trustedtomato/mini-crawler/tree/master/examples)
   * or the [function which converts callback results to an array of crawlOptions](https://github.com/trustedtomato/mini-crawler/blob/master/src/result-to-crawloptions-array.ts)
   * to understand the merging mechanism.
   */
  callback?: Callback
  /**
   * Options for got().
   * @see {@link https://www.npmjs.com/package/got#options}
   */
  gotOptions?: GotOptions
  /**
   * Any arbitary data to send to callback.
   */
  data?: unknown
}

export type CrawlOptions = PartialCrawlOptions & Required<Pick<PartialCrawlOptions, "callback">>

class Crawler {
  /**
   * The PQueue where the crawl requests are waiting.
   * @see {@link https://www.npmjs.com/package/p-queue}
  */
  queue: PQueue
  /**
   * The array of visited URL.
   * If you have already visited an URL,
   * crawl will immediately return;
   * else the URL will be added to the array.
   * Normally you don't need to modify this array.
   */
  visited: string[]
  /**
   * Array of ongoing requests.
   * These are cancelled when calling the reset method.
   * Normally you don't need to modify this array.
   */
  ongoingRequests: CancelableRequest[]

  constructor(pQueueOptions?: CrawlerOptions) {
    this.queue = new PQueue(pQueueOptions)
    this.visited = []
    this.ongoingRequests = []
  }

  crawl(options: CrawlOptions): void {
    if (options === null || typeof options !== 'object') {
      throw new Error('No options object present!')
    }
    if (typeof options.callback !== 'function') {
      throw new Error('The options object should have a callback property (function)!')
    }
    if (typeof options.url !== 'string') {
      throw new Error('The options object should have an url property (string)!')
    }

    const { gotOptions, callback } = options
    const url = urlLib.resolve(options.url, '')

    if (this.visited.includes(url)) {
      return
    }
    this.visited.push(url)

    this.queue.add(async () => {
      let request: CancelableRequest | undefined
      let body: unknown
      let error: Error | undefined
      try {
        request = got(
          url,
          {
            ...gotOptions,
            isStream: false,
            resolveBodyOnly: true
          }
        ) as CancelableRequest
        this.ongoingRequests.push(request)
        body = await request
      } catch (err) {
        error = err
      }

      if (request && this.ongoingRequests.includes(request)) {
        this.ongoingRequests.splice(this.ongoingRequests.indexOf(request), 1)
      }

      if (request?.isCanceled) {
        return
      }

      const result = await callback({ error, body, options })
      
      const crawlOptionsArray = resultToCrawlOptionsArray(result, options)
      crawlOptionsArray.forEach(crawlOptions => {
        this.crawl(crawlOptions)
      })
    })
  }

  reset(): void {
    this.queue.clear()
    this.ongoingRequests.forEach((ongoingRequest) => {
      ongoingRequest.cancel()
    })
  }
}

export default Crawler
export { Crawler }