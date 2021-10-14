const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

const urls = [
    'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs',
    'https://www.mibosport.com/en/muchmore-fleta-zx-bearing-set-fr?bbResetZone=1&bbSetCurrency=EUR'
]

const classes = '.add-to-cart-form .state'

const desiredText = 'in stock'

const scrape = function (url, classes, desiredText) {

    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $(classes, html).each(function () {
                const tit = $(this).text()
                if (tit.includes(desiredText))
                    console.log('available', url)
                else
                    console.log('not available', url)
            })
        }).catch(err => console.log(err))
}

urls.forEach(url => scrape(url, classes, desiredText))


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))