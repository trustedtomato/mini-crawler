import PQueue, { DefaultAddOptions, Options as PQueueOptions } from 'p-queue'
import PriorityQueue from 'p-queue/dist/priority-queue'
import got, { Options as GotOptions, CancelableRequest } from 'got'
import urlLib from 'url'

interface CrawlerOptions {
  pQueueOptions: PQueueOptions<PriorityQueue, DefaultAddOptions>,
  gotDefaultOptions: GotOptions
}

type Promisable<T> = T | PromiseLike<T>
type ResolvedCallbackResult = [ResolvedCallbackResult] | string | PartialCrawlOptions | null | void
type CallbackResult = Promisable<ResolvedCallbackResult>
interface CallbackArgument {
  error?: Error
  body?: unknown
  options: CrawlOptions
}
interface Callback {
  (arg: CallbackArgument): CallbackResult
}

interface CrawlOptions {
  url: string
  callback: Callback
  gotOptions?: GotOptions
}

interface PartialCrawlOptions {
  url: string;
  callback?: Callback
  gotOptions?: GotOptions
}

class Crawler {
  queue: PQueue
  gotDefaultOptions: GotOptions
  visited: string[]
  ongoingRequests: CancelableRequest[]

  constructor({ pQueueOptions, gotDefaultOptions }: CrawlerOptions) {
    this.queue = new PQueue(pQueueOptions)
    this.gotDefaultOptions = gotDefaultOptions
    this.visited = []
    this.ongoingRequests = []
  }

  async crawlNext(next: ResolvedCallbackResult, previousOptions: CrawlOptions): Promise<void> {
    if (next === undefined || next === null) {
      return;
    }
    if (typeof next === 'string') {
      // next is: an URL string
      await this.crawl({
        ...previousOptions,
        url: urlLib.resolve(previousOptions.url, next)
      });
    } else if (Array.isArray(next)) {
      // next is: an array of nexts
      await Promise.all(
        next.map((nextMember) => this.crawlNext(nextMember, previousOptions))
      );
    } else if (typeof next === 'object') {
      // next is: a PartialCrawlOptions object
      await this.crawl({
        ...previousOptions,
        ...next,
        url: urlLib.resolve(previousOptions.url, next.url)
      });
    }
  }

  async crawl(options: CrawlOptions): Promise<void> {
    if (!options) {
      throw new Error('No options object present!');
    }
    if (typeof options.callback !== 'function') {
      throw new Error('The options object should have a callback property (function)!');
    }
    if (typeof options.url !== 'string') {
      throw new Error('The options object should have an url property (string)!');
    }

    const { gotOptions, callback } = options
    const url = urlLib.resolve(options.url, '')

    if (this.visited.includes(url)) {
      return;
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
            ...this.gotDefaultOptions,
            ...gotOptions,
            isStream: false,
            resolveBodyOnly: true
          }
        ) as CancelableRequest
        this.ongoingRequests.push(request)
        body = await request;
      } catch (err) {
        error = err;
      }

      if (request && this.ongoingRequests.includes(request)) {
        this.ongoingRequests.splice(this.ongoingRequests.indexOf(request), 1);
      }

      if (request?.isCanceled) {
        return;
      }

      const next = await callback({ error, body, options })
      this.crawlNext(next, options);
    });
  }

  reset(): void {
    this.queue.clear()
    this.ongoingRequests.forEach((ongoingRequest) => {
      ongoingRequest.cancel();
    });
  }
}

export default Crawler
export { Crawler }