Vue.component('plugin.concerts', {
  template: `
    <div class="content-inner concerts-page library-page">
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
                @keyup.enter="searchArtistDebounce"
                v-model="searchInput"
                class="search-input"
              />
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
          <div class="col-auto" style="padding:0;">
            <div class="search-input-container" style="width:100%;margin: 16px 0;">
              <div class="icon icon-map-pin"></div> 
              <input
                type="search"
                @input="searchConcertDebounce"
                @keyup.enter="searchConcertDebounce"
                spellcheck="false"
                placeholder="Postal Code"
                v-model="postalCode" 
                class="search-input"
              />
            </div>
          </div>
          <div class="col-auto flex-center">
            <button 
              v-if="!loading" 
              @click="searchConcert" 
              class="reload-btn icon icon-rotate-ccw"
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
      <div class="concerts-body">
        <div class="concerts-list">
          <plugin.concerts.concert-entry
            v-if="concerts.length"
            v-for="(concert, index) in concerts"
            :key="index"
            :concert-data="concert"
            :active="activeConcert && activeConcert.id === concert.id"
            @set-active-concert="setActiveConcert(concert)"
          />
          
          <template v-if="!concerts.length && !loading">
            <p v-if="postalCode" class="cd-mediaitem-list-item">No concerts found near {{postalCode}} :(</p>
            <p v-else class="cd-mediaitem-list-item">No concerts found :(</p>
          </template>
          <template v-else-if="!concerts.length">
            <div class="cd-mediaitem-list-item">
              <div class="spinner"></div>
            </div>
          </template>

          <div class="page-button-row" v-if="totalPages > 1">
            <button class="page-button icon icon-chevron-left" :disabled="!showPrevPage" @click="onPageClick('prev')"></button>
            <button class="page-button icon icon-chevron-right" :disabled="!showNextPage" @click="onPageClick('next')"></button>
          </div>
        </div>

        <plugin.concerts.active-concert
          v-if="activeConcert"
          :concert-data="activeConcert" 
          :artist-data="activeArtist"
        />

        <plugin.concerts.controls
        />
      </div>
    </div>
  `,
  data: () => ({
    artist: null,
    concertsStore: [],
    searchInput: '',
    sortOrderOptions: ['ascending', 'descending'],
    sortOrder: 'ascending',
    loading: false,
    postalCode: null,
    activeConcert: null,
    activeArtist: null,
    page: 0,
    totalPages: 0
  }),
  created () {
    this.searchArtistDebounce = CiderConcertsPlugin.debounce(this.searchArtist);
    this.searchConcertDebounce = CiderConcertsPlugin.debounce(this.searchConcert);
    this.postalCode = CiderConcertsPlugin.getLocalStorage('postalCode')
    this.artist = CiderConcertsPlugin.getLocalStorage('artist')

    if (this.artist) this.searchInput = this.artist.attributes.name
  },
  async mounted () {
    const nowPlayingArtist = await CiderConcertsPlugin.getNowPlayingArtist()
    if (nowPlayingArtist) this.artist = nowPlayingArtist

    if (!this.artist) {
      this.searchConcert()
    }
  },
  methods: {
    async searchArtist () {
      if (this.searchInput === '') {
        return this.searchConcert()
      }

      const artists = await CiderConcertsPlugin.searchArtists(this.searchInput)
      if (!artists?.length) return this.artist = null
      
      this.artist = artists[0]
    },
    async searchConcert (resetPages = true) {
      this.loading = true

      const response = await CiderConcertsPlugin.getConcerts({
        artist: this.artist?.attributes?.name,
        postalCode: this.postalCode,
        sort: this.sortOrder,
        page: this.page
      })
      
      this.loading = false

      if (response.error) return console.error(response.message)

      this.concertsStore = response.events || []
      this.page = response.page || 0
      this.totalPages = response.totalPages || 0
      
      if (resetPages) this.page = 0
    },
    getLz (term) {
      return window.app.getLz(term)
    },
    async setActiveConcert (concert) {
      this.activeConcert = concert

      const attractions = concert._embedded.attractions
      const isFestival = concert.classifications.find(classification => classification?.subType?.name === 'Festival')

      if (
        !attractions?.length ||
        isFestival // Festivals usually have their name as the first artist, so just skip searching for artists in this
      ) return this.activeArtist = null
      
      const artists = await CiderConcertsPlugin.searchArtists(attractions[0].name)

      if (!artists?.length) this.activeArtist = null
      else this.activeArtist = artists[0]
    },
    onPageClick (direction) {
      if (direction === 'prev') this.page--
      else this.page++
    }
  },
  computed: {
    concerts () {
      let concerts = this.concertsStore
      if (!concerts?.length) return []

      return concerts
    },
    showNextPage () {
      return !this.loading && this.page < this.totalPages - 1
    },
    showPrevPage () {
      return !this.loading && this.page !== 0 
    }
  },
  watch: {
    artist () {
      if (!this.artist) CiderConcertsPlugin.removeLocalStorage('artist')
      else CiderConcertsPlugin.updateLocalStorage('artist', this.artist)

      this.searchConcert()
    },
    postalCode () {
      CiderConcertsPlugin.updateLocalStorage('postalCode', this.postalCode)
    },
    searchInput () {
      if (this.searchInput === '') {
        this.artist = null
        return CiderConcertsPlugin.removeLocalStorage('artist')
      } else {
        this.searchArtistDebounce()
      }
    },
    sortOrder () {
      this.searchConcert()
    },
    page () {
      this.searchConcert(false)
    }
  }
})

Vue.component('plugin.concerts.concert-entry', {
  template: `
    <div class="concert-entry">
      <div
        @click="setActiveConcert"
        class="cd-mediaitem-list-item list-flat" 
        :class="{'mediaitem-selected': active}"
      >
        <div class="artwork">
          <mediaitem-artwork
            :url="concertData.images[0].url"
            size="50"
            type="concert"
          />
        </div>
        <div class="info-rect">
          <div class="title text-overflow-elipsis">
            {{ venue.name }} | {{ venue.city.name }}
          </div>
          <div class="subtitle text-overflow-elipsis">
            {{ date }} - {{ concertData.name }}
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    concertData: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    date () {
      const datesObj = this.concertData.dates.start

      let dateStr = datesObj.localDate
      if (datesObj.localTime) dateStr += `T${datesObj.localTime}Z`

      const date = new Date(dateStr)

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    },
    venue () {
      return this.concertData._embedded.venues[0]
    }
  },
  methods: {
    setActiveConcert () {
      this.$emit('set-active-concert', this.concertData)
    }
  }
})

Vue.component('plugin.concerts.active-concert', {
  template: `
    <div class="concert-info">
      <div class="concert-header">
        <artwork-material 
          v-if="largestImage"
          :url="largestImage.url"
          size="190"
          images="1"
        />
        <div class="row">
          <div class="col-sm">
            <div class="artist-image">
              <mediaitem-artwork
                v-if="largestImage && !artistData"
                :url="largestImage.url"
                size="190"
                type="artists"
                shadow="large"
              />

              <mediaitem-square
                v-else-if="artistData"
                :item="artistData"
              />
            </div>
          </div>
          <div class="concert-title col flex-start">
            <h1 class="title">{{ concertData.name }}</h1>
            <h3 v-if="start" class="subtitle">
              <span>{{ start }}</span>
              <span v-if="end">- {{ end }}</span>
            </h3>
          </div>
        </div>
      </div>
      <div class="row buy-tickets">
        <div class="col">
          <h2 class="header">Buy Tickets</h2>
          <button class="btn btn-primary" @click="onBuyTicketsClick">Ticketmaster</button>
        </div>
      </div>
      <div class="well">
        <p v-if="concertData.pleaseNote">{{ concertData.pleaseNote }}</p>

        <div class="lineup">
          <h2>Lineup</h2>
          <div
            v-for="artist in concertData._embedded.attractions"
            :key="artist.id"
            class="cd-mediaitem-list-item list-flat lineup-artist"
          >
            <div class="artwork">
              <mediaitem-artwork
                :url="artist.images[0].url"
                size="50"
                type="artists"
              />
            </div>
            <div class="info-rect">
              <div class="title text-overflow-elipsis">
                {{ artist.name }}
              </div>
            </div>
          </div>
        </div>

        <div class="price-ranges" v-if="concertData?.priceRanges?.length">
          <h2>Prices</h2>
          <p 
            v-for="(priceRange, index) in concertData.priceRanges" 
            :key="index"
          >
            {{ capitalize(priceRange.type) }}: {{ formatPriceRange(priceRange) }}
          </p>
        </div>
      </div>
      <div v-if="concertData.seatmap" class="seatmap-container">
        <img 
          :src="concertData.seatmap.staticUrl"
          class="seatmap"
        />
      </div>
    </div>
  `,
  props: {
    concertData: {
      type: Object,
      required: true
    },
    artistData: {
      type: Object
    }
  },
  methods: {
    onBuyTicketsClick () {
      window.open(this.concertData.url)
    },
    formatPriceRange (priceRange) {
      let output = this.formatCurrency(priceRange.min, priceRange.currency)
      if (priceRange.min !== priceRange.max) output += ` - ${this.formatCurrency(priceRange.max, priceRange.currency)}`

      return output
    },
    formatCurrency (price, code) {
      return price.toLocaleString('en-US', { style: 'currency', currency: code });
    },
    capitalize (input) {
      return input.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    },
    buildIntlDateTime ({ localDate, localTime, timezone }) {
      if (!localDate) return null

      let options = {
        month: 'long',
        day: 'numeric',
      }

      let dateStr = localDate
      if (localTime) {
        dateStr += `T${localTime}Z`
        options = { 
          hour: 'numeric', 
          minute: 'numeric',
          ...options
        }

        if (timezone) {
          options = {
            timeZone: timezone,
            timeZoneName: 'short',
            ...options
          }
        }
      }

      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('en-US', options).format(date)
    }
  },
  computed: {
    start () {
      const datesObj = this.concertData.dates.start
      const timezone = this.concertData.dates.timezone

      if (!datesObj) return null

      return this.buildIntlDateTime({ 
        localDate: datesObj.localDate,
        localTime: datesObj.localTime,
        timezone
      })
    },
    end () {
      const datesObj = this.concertData.dates.end
      const timezone = this.concertData.dates.timezone

      if (!datesObj) return null
      
      return this.buildIntlDateTime({ 
        localDate: datesObj.localDate,
        localTime: datesObj.localTime,
        timezone
      })
    },
    largestImage () {
      if (!this.concertData?.images) return null

      return this.concertData.images.reduce((largest, image) => {
        if (image.width > largest.width) return image
        return largest
      }, this.concertData.images[0])
    }
  }
})

Vue.component('plugin.concerts.controls', {
  template: `
    <div class="concert-control-container">
      <button 
        @click="onDonationClick" 
        class="control-button icon-dollar-sign"
        title="Donate"
      />
      <button 
        @click="onGithubClick" 
        class="control-button icon-github"
        title="Open Github"
      />
    </div>
  `,
  methods: {
    onDonationClick () {
      window.open('https://ko-fi.com/chaseingebritson')
    },
    onGithubClick () {
      window.open('https://github.com/ChaseIngebritson/Cider-Concert-Plugin')
    }
  }
});