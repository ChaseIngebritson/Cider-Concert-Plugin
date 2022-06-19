
class CiderConcertsFrontend {
  name = 'Concerts'
  backendUrl = 'https://0yd893f7ia.execute-api.us-east-1.amazonaws.com/Prod'

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

  async getConcerts (artistName) {
    const params = new URLSearchParams({
      artist: artistName
    })

    return fetch(`${this.backendUrl}/concerts?${params}`)
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

  debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  async debug(text) {
    console.log(`[Plugin][${this.name}]`, text)
  }
}


window.CiderConcertsPlugin = new CiderConcertsFrontend()