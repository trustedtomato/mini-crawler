"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const p_queue_1 = __importDefault(require("p-queue"));
const got_1 = __importDefault(require("got"));
const url_1 = __importDefault(require("url"));
class Crawler {
    constructor({ pQueueOptions, gotDefaultOptions } = {}) {
        this.queue = new p_queue_1.default(pQueueOptions);
        this.gotDefaultOptions = gotDefaultOptions;
        this.visited = [];
        this.ongoingRequests = [];
    }
    async crawlNext(next, previousOptions) {
        if (next === undefined || next === null) {
            return;
        }
        if (typeof next === 'string') {
            // next is: an URL string
            await this.crawl({
                ...previousOptions,
                url: url_1.default.resolve(previousOptions.url, next)
            });
        }
        else if (Array.isArray(next)) {
            // next is: an array of nexts
            await Promise.all(next.map((nextMember) => this.crawlNext(nextMember, previousOptions)));
        }
        else if (typeof next === 'object') {
            // next is: a PartialCrawlOptions object
            await this.crawl({
                ...previousOptions,
                ...next,
                url: url_1.default.resolve(previousOptions.url, next.url)
            });
        }
    }
    async crawl(options) {
        if (!options) {
            throw new Error('No options object present!');
        }
        if (typeof options.callback !== 'function') {
            throw new Error('The options object should have a callback property (function)!');
        }
        if (typeof options.url !== 'string') {
            throw new Error('The options object should have an url property (string)!');
        }
        const { gotOptions, callback } = options;
        const url = url_1.default.resolve(options.url, '');
        if (this.visited.includes(url)) {
            return;
        }
        this.visited.push(url);
        this.queue.add(async () => {
            let request;
            let body;
            let error;
            try {
                request = got_1.default(url, {
                    ...this.gotDefaultOptions,
                    ...gotOptions,
                    isStream: false,
                    resolveBodyOnly: true
                });
                this.ongoingRequests.push(request);
                body = await request;
            }
            catch (err) {
                error = err;
            }
            if (request && this.ongoingRequests.includes(request)) {
                this.ongoingRequests.splice(this.ongoingRequests.indexOf(request), 1);
            }
            if (request?.isCanceled) {
                return;
            }
            const next = await callback({ error, body, options });
            this.crawlNext(next, options);
        });
    }
    reset() {
        this.queue.clear();
        this.ongoingRequests.forEach((ongoingRequest) => {
            ongoingRequest.cancel();
        });
    }
}
exports.Crawler = Crawler;
exports.default = Crawler;
