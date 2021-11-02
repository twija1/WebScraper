const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()

const app = express()

const Urls = [
    'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs',
    'https://www.mibosport.com/en/muchmore-fleta-zx-bearing-set-fr?bbResetZone=1&bbSetCurrency=EUR',
    'https://allegro.pl/oferta/kawa-ziarnista-costa-coffee-signature-blend-1kg-9857242214'
]

const sitesData = {
    'mibosport': {
        classes: {
            'availability': '.add-to-cart-form .state',
            'price': '.product-prices .price-total'
        }
    }
}

const siteRecognition = function (url) {
    for (site in sitesData)
        if (url.includes(site))
            return sitesData[site]
    return undefined
}

const scrape = async function (url) {
    const siteData = siteRecognition(url)
    let result = ''

    if (siteData !== undefined) {
        const { classes } = siteData
        result = await axios(url)
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)
                const result = Object.keys(classes).reduce((acc, key, index) => {
                    const output = $(classes[key], html).first().text().trim()
                    return { ...acc, [key]: output }
                }, {})
                return result
            }).catch(err => err)
    } else {
        result = { availability: 'Site is not included' }
    }
    console.log(result)
    return result
}
Urls.map(scrape)

const timestampToDate = (timestamp) => {
    const date = new Date(timestamp)
    const result = 'Date: ' + date.getDate() +
        '/' + ( date.getMonth() + 1 ) +
        '/' + ( date.getFullYear() ) +
        ' ' + ( date.getHours() ) +
        ':' + ( date.getMinutes() ) +
        ':' + ( date.getSeconds() )
    return result
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2e1j4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
let collection

try {
    client.connect()
    console.log("Connected correctly to server");

    const db = client.db('scrapperDB')
    collection = db.collection('scraperData')
} catch (e) {
    console.error(e)
} finally {
    client.close()
}

function findDocument(url) {
    return collection.find({ url }).sort({ timestamp: -1 }).limit(1).toArray().then(r => r[0])
}


function createDocument(scraperDocument) {

    return collection.insertOne(scraperDocument)
}

app.get('/scrape', async (req, res) => {
    const result = await Promise.all(
        Urls.map(async (url) => {
            console.log(url)
            const timeNow = Date.now()
            console.log(timestampToDate(timeNow))

            return findDocument(url).then(async ({ timestamp, output }) => {
                const timeDif = timeNow - timestamp

                if (timeDif < 15 * 60 * 1000)
                    return { url, output, timestamp }
                else {
                    const output = await scrape(url)
                    const scraperDocument = Object.entries(output).reduce((acc, [key, value]) =>
                        ( { ...acc, [key]: value } ), { url, timestamp: timeNow })
                    await createDocument(scraperDocument)
                    return scraperDocument
                }
            })
        }))
    res.json(result)
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))