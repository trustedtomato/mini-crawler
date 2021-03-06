import { ResolvedCallbackResult, CrawlOptions } from './index'

const resultToCrawlOptionsArray = (result: ResolvedCallbackResult, previousOptions: CrawlOptions): CrawlOptions[] => {
  if (result === undefined || result === null) {
    return []
  }
  if (typeof result === 'string') {
    // next is: an URL string
    return resultToCrawlOptionsArray({ url: result }, previousOptions)
  } else if (Array.isArray(result)) {
    // next is: an array of nexts
    return result.flatMap((resultMember) => resultToCrawlOptionsArray(resultMember, previousOptions))
  } else if (typeof result === 'object') {
    // next is: a PartialCrawlOptions object
    return [{
      ...previousOptions,
      ...result,
      url: new URL(result.url, previousOptions.url).href
    }]
  }
  return []
}

export default resultToCrawlOptionsArray
export { resultToCrawlOptionsArray }
