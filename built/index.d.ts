import PQueue, { DefaultAddOptions, Options as PQueueOptions } from 'p-queue';
import PriorityQueue from 'p-queue/dist/priority-queue';
import { Options as GotOptions, CancelableRequest } from 'got';
interface CrawlerOptions {
    pQueueOptions: PQueueOptions<PriorityQueue, DefaultAddOptions>;
    gotDefaultOptions: GotOptions;
}
declare type Promisable<T> = T | PromiseLike<T>;
declare type ResolvedCallbackResult = [ResolvedCallbackResult] | string | PartialCrawlOptions | null | void;
declare type CallbackResult = Promisable<ResolvedCallbackResult>;
interface CallbackArgument {
    error?: Error;
    body?: unknown;
    options: CrawlOptions;
}
interface Callback {
    (arg: CallbackArgument): CallbackResult;
}
interface CrawlOptions {
    url: string;
    callback: Callback;
    gotOptions?: GotOptions;
}
interface PartialCrawlOptions {
    url: string;
    callback?: Callback;
    gotOptions?: GotOptions;
}
declare class Crawler {
    queue: PQueue;
    gotDefaultOptions: GotOptions;
    visited: string[];
    ongoingRequests: CancelableRequest[];
    constructor({ pQueueOptions, gotDefaultOptions }: CrawlerOptions);
    crawlNext(next: ResolvedCallbackResult, previousOptions: CrawlOptions): Promise<void>;
    crawl(options: CrawlOptions): Promise<void>;
    reset(): void;
}
export default Crawler;
export { Crawler };
//# sourceMappingURL=index.d.ts.map