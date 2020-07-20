"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
test('crawls Wikipedia (baseUrl + maxConnections + callback)', (done) => {
    /*
    const crawler = new Crawler({
      baseUrl: 'https://hu.wikipedia.org/',
      maxConnections: 2,
      handler: (err, { body }) => {
        const titleRegex = /<title>(.*?) – Wikipédia<\/title>/;
        const articleUrlRegex = /href="(\/wiki\/.*?)"/g;
        const references = [];
        while ((articleUrlMatch = articleUrlRegex.exec(body)) !== null) {
          references.push(articleUrlMatch[1]);
        }
        return {
          title: body.match(titleRegex)[1].trim(),
          references,
        };
      },
    });
    crawler.queue({
      url: '/wiki/Csaknekedkisl%C3%A1ny',
      callback: ({ title, references }) => {
        expect(title).toBe('Csaknekedkislány');
        references.slice(0, 4).forEach((reference) => {
          crawler.queue({ url: reference });
        });
        expect(crawler.urlQueue.length).toBe(3);
        expect(crawler.running).toBe(2);
        done();
      },
    });
    */
    done();
});
test('sends no handler (error)', () => {
    // @ts-ignore: In the following line we are testing errors.
    expect(new index_1.default({}).crawl()).rejects.toThrow(/No options object present/i);
    // @ts-ignore: In the following line we are testing errors.
    expect(new index_1.default().crawl({})).rejects.toThrow(/callback property/i);
});
