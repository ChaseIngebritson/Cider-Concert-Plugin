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
                @keyup.enter="searchDebounce"
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
                @keyup.enter="searchDebounce"
                spellcheck="false"
                placeholder="Zip Code"
                v-model="zipCode" 
                class="search-input"
              />
            </div>
          </div>
          <div class="col-auto flex-center">
            <button 
              v-if="!loading" 
              @click="getConcerts" 
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
      <div class="concert-list">
        <div class="concert-list-item" v-for="concert in concerts">
          <div class="row">
            <div class="col-auto">
              <plugin.concerts.concert-entry 
                :concert-data="concert" 
              />
            </div>
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
    loading: false,
    zipCode: null
  }),
  created () {
    this.searchDebounce = CiderConcertsPlugin.debounce(this.search);
    this.zipCode = CiderConcertsPlugin.getLocalStorage('zipCode')
  },
  async mounted () {
    const nowPlayingArtist = await CiderConcertsPlugin.getNowPlayingArtist()
    if (nowPlayingArtist) this.artist = nowPlayingArtist
  },
  methods: {
    async search () {
      const artists = await CiderConcertsPlugin.searchArtists(this.searchInput)
      if (!artists?.length) return
      
      this.artist = artists[0]
    },
    async getConcerts () {
      this.loading = true

      const response = await CiderConcertsPlugin.getConcerts({
        artist: this.artist?.attributes?.name,
        zipCode: this.zipCode,
      })
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

      this.getConcerts()
    },
    zipCode () {
      CiderConcertsPlugin.updateLocalStorage('zipCode', this.zipCode)
    }
  }
})

Vue.component('plugin.concerts.concert-entry', {
  template: `
    <div class="concert-entry">
      
    </div>
  `,
  props: {
    concertData: {
      type: Object,
      required: true
    }
  }
})

/*
{
  "name":"Aries",
  "type":"event",
  "id":"G5e8Z96B3yKhX",
  "test":false,
  "url":"https://www.ticketmaster.co.nz/aries-auckland-new-zealand-07-08-2022/event/24005C7E92E536FE",
  "locale":"en-us",
  "images":[
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_16_9.jpg","width":1024,"height":576,"fallback":false},
    {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_3_2.jpg","width":1024,"height":683,"fallback":false},
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_EVENT_DETAIL_PAGE_16_9.jpg","width":205,"height":115,"fallback":false},
    {"ratio":"4_3","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_CUSTOM.jpg","width":305,"height":225,"fallback":false},
    {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_ARTIST_PAGE_3_2.jpg","width":305,"height":203,"fallback":false},
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_LANDSCAPE_16_9.jpg","width":1136,"height":639,"fallback":false},
    {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_PORTRAIT_3_2.jpg","width":640,"height":427,"fallback":false},
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_LARGE_16_9.jpg","width":2048,"height":1152,"fallback":false},
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_PORTRAIT_16_9.jpg","width":640,"height":360,"fallback":false},
    {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RECOMENDATION_16_9.jpg","width":100,"height":56,"fallback":false}
  ],
  "sales":{
    "public":{
      "startDateTime":"2022-04-07T01:00:00Z",
      "startTBD":false,"startTBA":false,
      "endDateTime":"2022-07-08T08:00:00Z"
    },
    "presales":[
      {"startDateTime":"2022-04-06T00:00:00Z","endDateTime":"2022-04-07T00:00:00Z","name":"Live Nation Presale"},
      {"startDateTime":"2022-04-06T00:00:00Z","endDateTime":"2022-04-07T00:00:00Z","name":"My Ticketmaster Presale"}
    ]
  },
  "dates":{
    "start":{
      "localDate":"2022-07-08",
      "localTime":"20:00:00",
      "dateTime":"2022-07-08T08:00:00Z",
      "dateTBD":false,"dateTBA":false,
      "timeTBA":false,"noSpecificTime":false
    },
    "timezone":"Pacific/Auckland",
    "status":{"code":"onsale"},
    "spanMultipleDays":false
  },
  "classifications":[
    {
      "primary":true,
      "segment":{"id":"KZFzniwnSyZfZ7v7nJ","name":"Music"},
      "genre":{"id":"KnvZfZ7vAeA","name":"Rock"},
      "subGenre":{"id":"KZazBEonSMnZfZ7v6F1","name":"Pop"},
      "type":{"id":"KZAyXgnZfZ7v7nI","name":"Undefined"},
      "subType":{"id":"KZFzBErXgnZfZ7v7lJ","name":"Undefined"},
      "family":false
    }
  ],
  "promoter":{
    "id":"4175","name":"LIVE NATION AUSTRALIA",
    "description":"LIVE NATION AUSTRALIA / NTL / AUS"
  },
  "promoters":[
    {"id":"4175","name":"LIVE NATION AUSTRALIA","description":"LIVE NATION AUSTRALIA / NTL / AUS"}
  ],
  "info":"All Tickets are Mobile Ticket Only. Mobile Tickets are like Print-at-Home tickets but instead of having to print off the tickets yourself, you can just show the barcode on your mobile phone. It is the easiest way to access tickets to your events. For more information visit Ticketmaster.co.nz/mobileticket",
  "pleaseNote":"Fees & Charges: A Handling Fee of $8.00 per transaction applies over the phone and $5.00 online. A payment processing fee of no more than 2.3% applies to purchases by credit card, debit card or gift card. The payment processing fee includes (but is not limited to) credit and debit card fees and expenses, administration and associated infrastructure costs. The payment processing fee will be added to the price displayed. This payment processing fee does not apply when you purchase tickets by cash at outlets or box-offices (subject to availability). In addition a delivery fee may apply depending on the mode of delivery selected. Event Restrictions: This is an All Ages Show. If you have selected tickets in the R18 Licensed Area you must have valid ID.",
  "priceRanges":[
    {"type":"standard including fees","currency":"NZD","min":71.51,"max":71.51},
    {"type":"standard","currency":"NZD","min":64.4,"max":64.4},
    {"type":"standard","currency":"NZD","min":69.9,"max":69.9}
  ],
  "seatmap":{"staticUrl":"https://s1.ticketm.net/tmimages/venue/maps/nzl/60902s.png"},
  "accessibility":{},
  "ticketLimit":{"info":"There is a ticket limit of 10 per customer"},
  "ageRestrictions":{"legalAgeEnforced":false},
  "code":"NZL:EZPS708G",
  "_links":{
    "self":{"href":"/discovery/v2/events/G5e8Z96B3yKhX?locale=en-us"},
    "attractions":[{"href":"/discovery/v2/attractions/K8vZ9179zm7?locale=en-us"}],
    "venues":[{"href":"/discovery/v2/venues/KovZpZAaFktA?locale=en-us"}]
  },
  "_embedded":{
    "venues":[
      {
        "name":"The Powerstation",
        "type":"venue",
        "id":"KovZpZAaFktA",
        "test":false,
        "url":"https://www.ticketmaster.co.nz/the-powerstation-tickets-auckland/venue/295167",
        "locale":"en-us",
        "images":[{"ratio":"16_9","url":"https://s1.ticketm.net/dbimages/9286v.jpg","width":205,"height":115,"fallback":false}],
        "postalCode":"1023",
        "timezone":"Pacific/Auckland",
        "city":{"name":"Auckland"},
        "state":{"name":"New Zealand","stateCode":"NZ"},
        "country":{"name":"New Zealand","countryCode":"NZ"},
        "address":{"line1":"33 Mount Eden Road","line2":"Grafton"},
        "location":{"longitude":"174.761322","latitude":"-36.8661613"},
        "markets":[
          {"name":"All of New Zealand","id":"350"},
          {"name":"North Island","id":"351"}
        ],
        "dmas":[{"id":750},{"id":751}],
        "social":{"twitter":{"handle":"@Powerstation_NZ"}},
        "boxOfficeInfo":{
          "willCallDetail":"Please note ticket collection is not available for this venue on event night. Tickets can be collected in advance from any Ticketmaster Outlet."},
          "generalInfo":{
            "generalRule":"AGE RESTRICTIONS Unless stated otherwise, all Powerstation shows are R18. Those who are underage will not be able to attend shows, even if a legal parent or guardian is present. This is a licensed venue and valid ID will be required. Valid forms of ID are: any current passport, a current New Zealand driver's licence or a HANZ 18+ card. These are the only forms of photo ID / verification of age that are acceptable as per the Liquor Licensing Law. Under the liquor licensing law, it is an offence for the License Holder/Licensee to admit or have onsite persons they deem to be intoxicated. We request all attendees' cooperation regarding the appropriate consumption of alcohol prior and during the event.",
            "childRule":"R18 SHOW Those who are underage will not be able to attend shows, even if a legal parent or guardian is present. ALL AGES SHOW are both All Ages & Licensed R18, the venue will have two very separate & well-monitored areas. The upstairs area of the venue will be unlicensed All Ages and totally alcohol-free. Downstairs will be fully licensed R18. No alcohol can be taken into the unlicensed area. Patrons who are under 18 will be restricted to the unlicensed area upstairs. Patrons over 18 can enter the unlicensed / alcohol-free area. Suitably qualified venue personnel will be in place to administer the people entering & exiting these licensed & unlicensed areas. Ticket holders under 15 must be accompanied by a parent or legal guardian. PLEASE NOTE: If you're being picked up post-show, please ensure your pick up person is on site at the completion of the event. There will be security monitoring the outside of the venue post-show for around 20 min only. It is important that all pickups take place prior to the completion of the security monitoring."
          },
          "upcomingEvents":{"_total":37,"ticketmaster":37,"_filtered":0},
          "ada":{
            "adaPhones":"Please call 09 970 9711 or visit www.ticketmaster.co.nz/help",
            "adaCustomCopy":"Please call the Ticketmaster Contact Centre if you require wheelchair or accessible seating bookings, or are otherwise unable to complete a ticket purchase online.",
            "adaHours":"Monday – Friday 9:00am – 9:00pm; Saturday – Sunday 9:00am – 5:00pm (excludes Public Holidays)."
          },
          "_links":{
            "self":{"href":"/discovery/v2/venues/KovZpZAaFktA?locale=en-us"}
          }
        }
      ],
      "attractions":[
        {
          "name":"Aries",
          "type":"attraction",
          "id":"K8vZ9179zm7",
          "test":false,
          "url":"https://www.ticketmaster.co.nz/aries-tickets/artist/2601500",
          "locale":"en-us",
          "externalLinks":{
            "itunes":[{"url":"https://music.apple.com/us/album/1588761902?ign-itscg=30440&ign-itsct=catchall_p2"}],
            "spotify":[{"url":"https://open.spotify.com/album/1eLp5qe0nJkOb3rzqnbme0"}],
            "facebook":[{"url":"https://www.facebook.com/aries"}],
            "instagram":[{"url":"https://www.instagram.com/aries/"}],
            "homepage":[{"url":"https://www.ariesofwunderworld.com/"}]
          },
          "images":[
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_16_9.jpg","width":1024,"height":576,"fallback":false},
            {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_3_2.jpg","width":1024,"height":683,"fallback":false},
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_EVENT_DETAIL_PAGE_16_9.jpg","width":205,"height":115,"fallback":false},
            {"ratio":"4_3","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_CUSTOM.jpg","width":305,"height":225,"fallback":false},
            {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_ARTIST_PAGE_3_2.jpg","width":305,"height":203,"fallback":false},
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_LANDSCAPE_16_9.jpg","width":1136,"height":639,"fallback":false},
            {"ratio":"3_2","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_PORTRAIT_3_2.jpg","width":640,"height":427,"fallback":false},
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_TABLET_LANDSCAPE_LARGE_16_9.jpg","width":2048,"height":1152,"fallback":false},
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RETINA_PORTRAIT_16_9.jpg","width":640,"height":360,"fallback":false},
            {"ratio":"16_9","url":"https://s1.ticketm.net/dam/a/74e/6a87d2b0-94fe-46ce-a9e0-079fd703674e_1654361_RECOMENDATION_16_9.jpg","width":100,"height":56,"fallback":false}
          ],
          "classifications":[
            {
              "primary":true,
              "segment":{"id":"KZFzniwnSyZfZ7v7nJ","name":"Music"},
              "genre":{"id":"KnvZfZ7vAeA","name":"Rock"},
              "subGenre":{"id":"KZazBEonSMnZfZ7v6F1","name":"Pop"},
              "type":{"id":"KZAyXgnZfZ7v7la","name":"Individual"},
              "subType":{"id":"KZFzBErXgnZfZ7vAde","name":"Singer/Vocalist"},
              "family":false
            }
          ],
          "upcomingEvents":{"_total":8,"mfx-dk":1,"mfx-nl":1,"ticketmaster":4,"mfx-cz":1,"_filtered":0,"mfx-se":1},
          "_links":{
            "self":{"href":"/discovery/v2/attractions/K8vZ9179zm7?locale=en-us"}
          }
        }
      ]
    }
  }
*/