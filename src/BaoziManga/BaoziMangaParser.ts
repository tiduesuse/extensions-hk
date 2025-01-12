import {
  Chapter, 
  ChapterDetails, 
  HomeSection, 
  LanguageCode, 
  Manga, 
  MangaStatus, 
  MangaTile, 
  SearchRequest, 
  Tag,
  TagSection } from "paperback-extensions-common";

const MG_DOMAIN = 'https://www.baozimh.com'
const MG_DOMAIN1 = 'https://www.webmota.com'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const titles = [$('.comics-detail__title').text()]
  const author = $('.comics-detail__author').text()
  const image: string = $('amp-img', '.pure-u-1-1').attr('src') ?? ""
  const genres = $('span.tag', '.tag-list').map(
    function(this: Text) {
      return $(this).text().trim()
    }
  ).get().filter((x) => x != '')
  let status = MangaStatus.UNKNOWN
  if ((genres[0] == "连载中") || (genres[0] == "连载中")) {
    status = MangaStatus.ONGOING
  } else if ((genres[0] == '已完结') || (genres[0] == '已完结')) {
    status = MangaStatus.COMPLETED
  }     
  const desc = $('.comics-detail__desc').text()

  const arrayTags: Tag[] = []
  if (genres.length > 0) {
    for (const tag of genres) {
      const label = tag
      const id = tagDict[tag][0]
      arrayTags.push({ id: id, label: label })
    }
  }
  const tagSections: TagSection[] = [createTagSection({
    id: '0',
    label: 'genres',
    tags: arrayTags.length > 0 ? arrayTags.map(x => createTag(x)) : []
  })]

  return createManga({
      id: mangaId,
      titles,
      image,
      rating: Number(''),
      status,
      artist: '',
      author,
      tags: tagSections,
      views: Number(''),
      desc,
      hentai: false
  })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const allChapters = $('.comics-chapters')
  const chapters: Chapter[] = []
  const date = $('em', ':contains(日 更新)').text().trim()
  const re = /[年月日() 更新]/
  const datepts = date.split(re).filter((x) => x.trim() != '').join('/')
  const time: Date = new Date(datepts)

  for (let chapter of $(allChapters).toArray()) {
    const id = MG_DOMAIN1 + '/' + $('a',chapter).attr('href')
    const name = $(chapter).text()
    const chapNum = Number(id.split('=').pop()) ?? 0
    // const time: Date = new Date(baseTime.getTime() - (7 * 24 * 3600000))
    chapters.push(createChapter({
      id,
      mangaId,
      name,
      langCode: LanguageCode.CHINEESE,
      chapNum,
      time
    }))
    // baseTime.setDate(baseTime.getDate() - 7)
  }
  return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {

  const pages = $('.comic-contain__item').map(
    function(this: Text) {
      return $(this).attr('src')
    }
  ).get()
  return createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages,
      longStrip: false
  })
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const env = $('.comics-card')
  const manga: MangaTile[] = []
  for (const item of $(env).toArray()) {
    manga.push(parseMangaItem($, item))
  }
  return manga
}

// parse each mange item
export const parseMangaItem = ($: CheerioStatic, item: CheerioElement): MangaTile => {
  let id: string = $('.comics-card__poster', item).attr('href') ?? ""
  id = id.split('/').pop() ?? ""
  const image: string = $('amp-img', item).attr('src') ?? ""
  const title = $('.comics-card__title', item).text()
  // console.log(id)
  // console.log(image)
  // console.log(title)
  return createMangaTile({
    id: id,
    image: image,
    title: createIconText({ text: title })
  })
}

// parse a section of manga items
const parseSection = ($: CheerioStatic, sec: CheerioElement): MangaTile[] => {
  const res: MangaTile[] = []
  for (const item of $('.comics-card', sec).toArray()) {
    const manga = parseMangaItem($, item)
    res.push(manga)
  }
  return res
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section)

  const env = $('.pure-g')
  for (let i=0; i<sections.length; i++) {
    const sec = $(env)[i]
    sections[i].items = parseSection($, sec)
  }

  for (const section of sections) sectionCallback(section)
}

export const tagDict: { [key: string]: string[] } = {
  國漫: ['cn', 'region'],
  日本: ['jp', 'region'],
  韓國: ['kr', 'region'],
  歐美: ['en', 'region'],
  連載中: ['serial', 'state'],
  已完結: ['pub', 'state'],
  戀愛: ['lianai', 'type'],
  純愛: ['chunai', 'type'],
  古風: ['gufeng', 'type'],
  異能: ['yineng', 'type'],
  懸疑: ['xuanyi', 'type'],
  劇情: ['juqing', 'type'],
  科幻: ['kehuan', 'type'],
  奇幻: ['qihuan', 'type'],
  玄幻: ['xuanhuan', 'type'],
  穿越: ['chuanyue', 'type'],
  冒險: ['maoxian', 'type'],
  推理: ['tuili', 'type'],
  武俠: ['wuxia', 'type'],
  格鬥: ['gedou', 'type'],
  戰爭: ['zhanzheng', 'type'],
  熱血: ['rexue', 'type'],
  搞笑: ['gaoxiao', 'type'],
  大女主: ['danuzhu', 'type'],
  都市: ['dushi', 'type'],
  總裁: ['zongcai', 'type'],
  後宮: ['hougong', 'type'],
  日常: ['richang', 'type'],
  韓漫: ['hanman', 'type'],
  少年: ['shaonian', 'type'],
  其它: ['qita', 'type'],
  ABCD: ['ABCD', 'filter'],
  EFGH: ['EFGH', 'filter'],
  IJKL: ['IJKL', 'filter'],
  MNOP: ['MNOP', 'filter'],
  QRST: ['QRST', 'filter'],
  UVW: ['UVW', 'filter'],
  XYZ: ['XYZ', 'filter'],
  '0-9': ['0-9', 'filter']
}

const typeDict : { [key: string]: string[] } = {
    type:   ['0', '類型'],
    region: ['1', '地區'],
    state:  ['2', '狀態'],
    filter: ['3', '字母']
  }


export const parseTags = ($: CheerioStatic): TagSection[] => {
  // const dict: { [key: string]: string[] } = {
  //   region: ['0', '地區'],
  //   state:  ['1', '狀態'],
  //   type:   ['2', '類型'],
  //   filter: ['3', '字母']
  // }
  // create empty diction for tags
  const tmpTags: { [key: string]: Tag[] } = {}
  for (let key in typeDict) {
    tmpTags[key] = []
    // tagSections.push(createTagSection({id: dict[key][0], label: dict[key][1], tags: []}))
  }
  for (let key in tagDict) {
    let cond_key = tagDict[key][1]
    tmpTags[cond_key].push({ id: tagDict[key][0], label:key })
  }
  // create tag sections
  const tagSections: TagSection[] = [] 
  for (let key in typeDict) {
    tagSections.push(createTagSection({
      id: typeDict[key][0],
      label: typeDict[key][1],
      tags: tmpTags[key].map(x => createTag(x))
    }))
  }
  return tagSections
}

export const parseMultiTags = (arrTag: Tag[]): string => {
  // group by dict
  const lastTags: { [key: string]: string } = {}
  // always take the last tag
  for (let tag of arrTag) {
    let key = tagDict[tag.label][1]
    lastTags[key] = tag.id
  }
  // make the search string
  let search = ''
  for (let key in lastTags) {
    search += key + '=' + lastTags[key] + '&'
  }
  return search
} 

// export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
//   const env = $('.index-recommend-items:contains(' + homepageSectionId + ')')
//   const manga: MangaTile[] = []
//   for (const item of $('.comics-card', env).toArray()) {
//     manga.push(parseMangaItem($, item))
//   }
//   return manga
// }

