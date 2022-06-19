Vue.component('plugin.concerts', {
  template: `
    <div class="content-inner library-page">
      <div class="library-header concerts-control-container">
        <div class="row">
          <div class="col" style="padding:0;">
            <div class="search-input-container" style="width:100%;margin: 16px 0;">
              <div class="search-input--icon"></div>
              <input
                type="search"
                style="width:100%;"
                spellcheck="false"
                :placeholder="getLz('term.search') + '...'"
                @input="searchDebounce"
                @keyup.enter="search"
                v-model="searchInput" 
                class="search-input"
              >
            </div>
          </div>
          <div class="col-auto flex-center">             
            <div class="row">
              <div class="col">
                <select class="md-select" v-model="sortOrder">
                  <optgroup label="Date"">
                    <option
                      v-for="order in sortOrderOptions" 
                      :key="order"
                      :value="order"
                    >
                      {{getLz('term.sortOrder.' + order)}}
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
          <div class="col-auto flex-center">
            <button 
              v-if="!loading" 
              @click="getConcerts" 
              class="reload-btn control-button icon-rotate-ccw"
              title="Reload"
            ></button>
            <button 
              v-else 
              class="reload-btn control-button"
              style="opacity: 0.8;pointer-events: none"
              title="Loading..."
            >
              <div class="spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data: () => ({
    artist: null,
    concertsStore: [],
    searchInput: '',
    sortOrderOptions: ['ascending', 'descending'],
    sortOrder: 'ascending',
    loading: false
  }),
  created () {
    this.searchDebounce = CiderConcertsPlugin.debounce(this.search);
  },
  async mounted () {
    const nowPlayingArtist = await CiderConcertsPlugin.getNowPlayingArtist()

    console.log(nowPlayingArtist)

    if (nowPlayingArtist) {
      const artist = await this.getArtist(nowPlayingArtist.id)
      this.getConcerts(artist.attributes.name)
    }
  },
  methods: {
    async search () {
      const artists = await CiderConcertsPlugin.searchArtists(this.searchInput)
      if (!artists?.length) return
      
      this.artist = artists[0]
    },
    async getConcerts (artistName) {
      this.loading = true

      const response = await CiderConcertsPlugin.getConcerts(artistName)
      if (response.concerts) this.concertsStore = response.concerts

      this.loading = false
    },
    getLz (term) {
      return window.app.getLz(term)
    }
  },
  computed: {
    concerts () {
      const concerts = this.concertsStore

      if (!concerts?.length) return []
      
      if (this.sortOrder === 'descending') concerts = concerts.reverse()

      return concerts
    }
  },
  watch: {
    artist () {
      if (!this.artist) return

      this.getConcerts(this.artist.attributes.name)
    }
  }
})
