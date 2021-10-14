const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()


const url = 'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs'
// const url = 'https://www.mibosport.com/en/muchmore-fleta-zx-bearing-set-fr?bbResetZone=1&bbSetCurrency=EUR'

axios(url)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $('.add-to-cart-form .state', html).each(function (){
            const tit = $(this).text()
            console.log(tit)
        })
    }).catch(err => console.log(err))

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))