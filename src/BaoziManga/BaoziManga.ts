import { 
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  HomeSectionType,
  SearchRequest,
  TagSection,
  PagedResults,
  SourceInfo,
  TagType,
  RequestManager,
  ContentRating,
  MangaTile
} 
from "paperback-extensions-common"

import { 
  parseMangaDetails, 
  parseChapters, 
  parseChapterDetails, 
  parseSearch, 
  parseHomeSections, 
  parseTags, 
  parseMultiTags,
  parseMangaItem
} from "./BaoziMangaParser"

// const MG_DOMAIN = 'https://www.webmota.com'
const MG_DOMAIN = 'https://www.baozimh.com'
const MG_NAME = 'BaoziManga'
const method = 'GET'
const mid_addr = 'comic'
const headers = {
  'Host': 'www.baozimh.com'
}
const headers1 = {
  'Host': 'www.webmota.com'
}

export const BaoziMangaInfo: SourceInfo = {
	version: '1.0.3',
	name: MG_NAME,
	icon: 'icon.jpg',
	author: 'Tomas Way',
	authorWebsite: 'https://github.com/Tiduesuse',
	description: 'Extension that pulls manga from ' + MG_NAME + ' (Chinese)',
  contentRating: ContentRating.MATURE,
  websiteBaseURL: MG_DOMAIN,
	sourceTags: [
    {
      text: "Chinese",
      type: TagType.GREY
    },
		{
			text: "Notifications",
			type: TagType.GREEN
		}
	]
}

export class BaoziManga extends Source {
  requestManager: RequestManager = createRequestManager({
    requestsPerSecond: 3 
  });

  // manga shared url
  getMangaShareUrl(mangaId: string): string {
    return `${MG_DOMAIN}/${mid_addr}/${mangaId}`
  }

  // manga details
	async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${MG_DOMAIN}/${mid_addr}/${mangaId}`,
      method,
      headers
    })

		const response = await this.requestManager.schedule(request, 1);
		const $ = this.cheerio.load(response.data);
		return parseMangaDetails($, mangaId);
	}

	async getChapters(mangaId: string): Promise<Chapter[]> {
		const request = createRequestObject({
			url: `${MG_DOMAIN}/${mid_addr}/${mangaId}`,
			method,
      headers
		})

		const response = await this.requestManager.schedule(request, 1)
		const $ = this.cheerio.load(response.data)
		return parseChapters($, mangaId)
	}

	async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${chapterId}`,
      method,
      headers: headers1
    })
    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);
    return parseChapterDetails($, mangaId, chapterId);
	}

  async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
    // if (!metadata.manga) {
    const page: number = metadata?.page ?? 1
    const ori = query.title?.trim() ?? ""
    const search = ori.replace(/ /g, '+').replace(/[’'´]/g, '%27') ?? ""
    let addr = ''
    if (search.length > 0) {
      addr = `${MG_DOMAIN}/search?q=${search}`
    } else if (query.includedTags && query.includedTags?.length != 0) {
      const tagStr = parseMultiTags(query.includedTags)
      addr = `${MG_DOMAIN}/classify?${tagStr}`
    } else {
      addr = `${MG_DOMAIN}/classify?`
    }
    let addr1 = `${addr}&page=${page}`
    addr1 = encodeURI(addr1)
    const request = createRequestObject({
        url: addr1,
        method,
        headers
    })
    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)
      // metadata = {
      //   manga: parseSearch($),
      //   offset: 0
      // }
    // }
    return createPagedResults({
      results: parseSearch($),
      metadata: { page: page + 1 } 
      // metadata: {
      //   manga: metadata.manga,
      //   offset: metadata.offset + 100
      // }
    })
  }

	async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
		const section1 = createHomeSection({ id: '熱門漫畫', title: '熱門漫畫', type: HomeSectionType.featured, view_more: true})
		const section2 = createHomeSection({ id: '推薦漫畫', title: '推薦漫畫', view_more: true})
		const section3 = createHomeSection({ id: '韓漫漫畫', title: '韓漫漫畫', view_more: true})
		const section4 = createHomeSection({ id: '大女主漫畫', title: '大女主漫畫', view_more: true})
		const section5 = createHomeSection({ id: '少年漫畫', title: '少年漫畫', view_more: true})
		const section6 = createHomeSection({ id: '戀愛漫畫', title: '戀愛漫畫', view_more: true})
		const section7 = createHomeSection({ id: '玄幻漫畫', title: '玄幻漫畫', view_more: true})
		const section8 = createHomeSection({ id: '最新上架', title: '最新上架', view_more: true})
		const section9 = createHomeSection({ id: '最近更新', title: '最近更新', view_more: true})
		const sections = [
      section1, 
      section2, 
      section3, 
      section4,
      section5, 
      section6, 
      section7, 
      section8,
      section9
    ]
		const request = createRequestObject({url: `${MG_DOMAIN}`, method})
		const response = await this.requestManager.schedule(request, 1)
		const $ = this.cheerio.load(response.data)
		parseHomeSections($, sections, sectionCallback)
	}

  async getSearchTags(): Promise<TagSection[]> {
    const request = createRequestObject({
      url: `${MG_DOMAIN}/classify`,
      method,
      headers
    })

    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)
    
    return parseTags($)
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
    const page: number = metadata?.page ?? 1
    const request0 = createRequestObject({
      url: `${MG_DOMAIN}`,
      method,
      headers
    })
    const response0 = await this.requestManager.schedule(request0, 1)
    const $0 = this.cheerio.load(response0.data)
    const env = $0('.index-recommend-items:contains(' + homepageSectionId + ')')
    const addr = $0('.more', env).attr('href') ?? ''
    let manga: MangaTile[] = []
    if (addr.length > 0) {
      const request = createRequestObject({
        url: MG_DOMAIN + $0('.more', env).attr('href') + '?&page=' + page,
        method,
        headers
      })
      const response = await this.requestManager.schedule(request, 1)
      const $ = this.cheerio.load(response.data)
      manga = parseSearch($)
    } else {
      for (const item of $0('.comics-card', env).toArray()) {
        manga.push(parseMangaItem($0, item))
      }
    }

    return createPagedResults({
      results: manga,
      metadata: { page: page + 1 }
    })
  }
}
