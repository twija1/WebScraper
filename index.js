const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

const Urls = [
    'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs',
    'https://www.mibosport.com/en/muchmore-fleta-zx-bearing-set-fr?bbResetZone=1&bbSetCurrency=EUR',
    'https://fckit.pl/pl/p/SWEEP-RACING-Formula-X2/2395',
    'https://fckit.pl/pl/p/1UP-RACING-3x6x0.25mm-Precision-Aluminum-Shims-Black-12pcs-/3029',
    'https://allegro.pl/oferta/kawa-ziarnista-costa-coffee-signature-blend-1kg-9857242214'
]

const sitesData = {
    'mibosport': {
        classes: '.add-to-cart-form .state'
    },
    'fckit': {
        classes: '.availability .second'
    }
}

const siteRecognition = function (url) {
    for (site in sitesData)
        if (url.includes(site))
            return sitesData[site]
    return undefined
}

const scrape = function (url) {
    const siteData = siteRecognition(url)

    if (siteData !== undefined) {
        const { classes } = siteData
        axios(url)
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)
                const result = $(classes, html).first().text()
                console.log(result, url)
            }).catch(err => console.log(err))
    } else console.log('Site is not included', url)
}

Urls.forEach(scrape)


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))