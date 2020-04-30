const axios = require('axios');
const cheerio = require('cheerio');
const urlPrefix = "https://lista.mercadolivre.com.br";

queryItems(query, pages).then((resultsArray) => {
   return resultsArray.reduce((acum, val) => acum.concat(val), [])
})

async function queryItems(query, pages) {
    let urls = prepareURLS(query, pages)
    return Promise.all(urls.map(getQueryPage))
}


function prepareURLS(query, pages) {
    let urlsArray = []
    for (let i = 0; i < pages; i++) {
        if (i == 0)
            urlsArray.push(`${urlPrefix}/${query}`)
        else if (i == 1)
            urlsArray.push(`${urlPrefix}/${query}_Desde_49`)
        else
            urlsArray.push(`${urlPrefix}/${query}_Desde_${(48 * i) + 1}`)
    }
    return urlsArray
}

async function getQueryPage(url) {
    return new Promise((resolve, reject) => {
        fetchData(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            const results = $('ol#searchResults li.results-item');
            console.log(results.length)
            let resultsArray = []
            let storePromises = []
            results.each(async function () {
                let link = $(this).find('a').attr('href')
                storePromises.push(getStore(link))
                resultsArray.push({
                    name: $(this).find('.main-title').text(),
                    link: link,
                    price: $(this).find('.price__fraction').text() + ($(this).find('.price__decimals').text() ? "." + $(this).find('.price__decimals').text() : "")
                })
            });
            Promise.all(storePromises)
                .then(function (stores) {
                    for (let i in stores) {
                        resultsArray[i].store = stores[i]
                    }
                    resolve(resultsArray)
                })
        })
    })
}


async function getStore(link) {
    return new Promise((resolve, reject) => {
        fetchData(link).then((productPage) => {
            let productHtml = productPage.data;
            let $ = cheerio.load(productHtml);
            resolve($('a#seller-view-more-link').attr('href').split(".br/")[1])
        })
    })
}



async function fetchData(url) {
    //console.log(`Crawling data from ${url}`)
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if (response.status !== 200) {
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}

module.exports = {
    queryItems
}