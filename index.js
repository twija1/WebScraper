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

const scrape = async function (url) {
    const siteData = siteRecognition(url)
    let result = ''

    if (siteData !== undefined) {
        const { classes } = siteData
        result = await axios(url)
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)
                const result = $(classes, html).first().text()
                // console.log(result, url)
                return result
            }).catch(err => err)
    } else {
        result = 'Site is not included'
    }
    console.log(result, url)
    return result
}

Urls.forEach(scrape)

async function main(url) {
    const uri = "mongodb+srv://process.env.DB_USER:<process.env.DB_PASS>@cluster0.2e1j4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    try {
        await client.connect()
        console.log("Connected correctly to server");

        const db = client.db('scrapperDB')
        const collection = db.collection('scraperData')

        await createDocument(collection, url)
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    }
}

async function createDocument(collection, url) {

    let scraperDocument = {
        "url": 'https://www.mibosport.com/en/hudy-alu-nut-m4-black-10pcs',
        "output": output,
        "timeStamp": timeStamp
    }

    await collection.insertOne(scraperDocument)
}

async function findDocument(collection, url) {
    const document = await collection.find({url}).toArray()
    console.log(document)
}

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))