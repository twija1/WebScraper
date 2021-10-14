const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

const MibosportsUrls = [
    'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs',
    'https://www.mibosport.com/en/muchmore-fleta-zx-bearing-set-fr?bbResetZone=1&bbSetCurrency=EUR'
]
const MiboClasses = '.add-to-cart-form .state'

const FCKITUrls = [
    'https://fckit.pl/pl/p/SWEEP-RACING-Formula-X2/2395',
    'https://fckit.pl/pl/p/1UP-RACING-3x6x0.25mm-Precision-Aluminum-Shims-Black-12pcs-/3029'
]
const fckitClasses = '.availability .second';


const scrape = function (url, classes) {

    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const result = $(classes, html).first().text()
            console.log(result, url)
        }).catch(err => console.log(err))
}

MibosportsUrls.forEach(url => scrape(url, MiboClasses))
FCKITUrls.forEach(url => scrape(url, fckitClasses))


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))