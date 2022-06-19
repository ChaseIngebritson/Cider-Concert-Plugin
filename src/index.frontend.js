
class CiderConcertsFrontend {
  PLUGIN_NAME = 'Concerts'
  BACKEND_URL = 'https://0yd893f7ia.execute-api.us-east-1.amazonaws.com/Prod'

  constructor() {
    CiderFrontAPI.StyleSheets.Add('./plugins/gh_498562102/concerts.less')

    this.menuEntryId = window.uuidv4()

    const menuEntry = new CiderFrontAPI.Objects.MenuEntry()
    menuEntry.Id = this.menuEntryId
    menuEntry.name = "Concerts"
    menuEntry.onClick = ()=>{
      app.appRoute("plugin/concerts")
    }
    CiderFrontAPI.AddMenuEntry(menuEntry)
  }

  async getConcerts ({ artist, zipCode }) {
    if (!artist) return []

    const params = new URLSearchParams({
      artist: artist, 
    })

    if (zipCode && zipCode !== '' && zipCode.match(/^\d{5}(?:[-\s]\d{4})?$/)) {
      params.append('zipCode', zipCode)
    }

    return fetch(`${this.BACKEND_URL}/concerts?${params}`)
      .then(response => response.json())
  }

  async searchArtists (artistName) {
    const musickit = window.app.mk
    const storefront = musickit.storefrontId
    const response = await musickit.api.v3.music(`/v1/catalog/${storefront}/search?term=${artistName}`, {
      types: 'artists',
      "include[artists]": "artists",
      "fields[artists]": "url,name,artwork,hero"
    })

    return response?.data?.results?.artists?.data
  }

  async getNowPlayingArtist () {
    const musickit = window.app.mk
    const nowPlayingSong = musickit.nowPlayingItem

    if (!nowPlayingSong) return null
  
    const storefront = musickit.storefrontId
    const response = await musickit.api.v3.music(`/v1/catalog/${storefront}/songs/${nowPlayingSong.songId}`, {
      views: ['artists'],
      "fields[artists]": "url,name,artwork,hero"
    })
  
    return response?.data?.data[0]?.relationships?.artists?.data[0]
  }

  updateLocalStorage (key, data) {
    localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${key}`, JSON.stringify(data))

    this.debug(`Updated ${key} in localStorage`, data)
  }

  getLocalStorage (key) {
    const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${key}`)

    if (data) this.debug(`Loaded ${key} from localStorage`, JSON.parse(data))
    return JSON.parse(data)
  }

  debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  async debug(text) {
    console.log(`[Plugin][${this.PLUGIN_NAME}]`, text)
  }
}


window.CiderConcertsPlugin = new CiderConcertsFrontend()