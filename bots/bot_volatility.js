const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");

// Fonction pour calculer la volatilité (écart type)
const calculateVolatility = (prices) => {
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
    const variance =
        prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) /
        prices.length;
    return Math.sqrt(variance);
};

const runVolatility = async (days) => {
    console.log("Exécution du bot Volatility...");

    let pricesByCrypto = {}; // Stocker les prix pour chaque cryptomonnaie
    let cryptos = [];

    fs.createReadStream("crypto_data.csv")
        .pipe(csv())
        .on("data", (row) => {
            const crypto = row.Cryptocurrency;
            const price = parseFloat(row["Price (USD)"]);
            const volume_24h = parseFloat(row["24h Volume (USD)"]);
            const market_cap = parseFloat(row["Market Cap (USD)"]);

            if (!pricesByCrypto[crypto]) {
                pricesByCrypto[crypto] = {
                    prices: [],
                    volumes: [],
                    market_caps: [],
                };
                cryptos.push(crypto);
            }

            if (!isNaN(price)) {
                pricesByCrypto[crypto].prices.push(price);
            }
            if (!isNaN(volume_24h)) {
                pricesByCrypto[crypto].volumes.push(volume_24h);
            }
            if (!isNaN(market_cap)) {
                pricesByCrypto[crypto].market_caps.push(market_cap);
            }
        })
        .on("end", () => {
            console.log("Fichier CSV lu avec succès.");

            let records = [];
            const endDate = moment().format("YYYY-MM-DD");
            const startDate = moment()
                .subtract(days, "days")
                .format("YYYY-MM-DD");

            cryptos.forEach((crypto) => {
                const prices = pricesByCrypto[crypto].prices;
                const volumes = pricesByCrypto[crypto].volumes;
                const market_caps = pricesByCrypto[crypto].market_caps;

                const volatility = calculateVolatility(prices);
                const averagePrice =
                    prices.reduce((acc, price) => acc + price, 0) /
                    prices.length;
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const averageVolume =
                    volumes.length > 0
                        ? volumes.reduce((acc, volume) => acc + volume, 0) /
                          volumes.length
                        : 0;
                const averageMarketCap =
                    market_caps.length > 0
                        ? market_caps.reduce(
                              (acc, market_cap) => acc + market_cap,
                              0,
                          ) / market_caps.length
                        : 0;

                records.push({
                    cryptocurrency: crypto,
                    start_date: startDate,
                    end_date: endDate,
                    average_price: averagePrice,
                    min_price: minPrice,
                    max_price: maxPrice,
                    average_volume: averageVolume,
                    average_market_cap: averageMarketCap,
                    volatility: volatility,
                    data_source: "CoinGecko",
                });
            });

            const csvWriter = createCsvWriter({
                path: "volatility_results.csv",
                header: [
                    { id: "cryptocurrency", title: "Cryptocurrency" },
                    { id: "start_date", title: "Start Date" },
                    { id: "end_date", title: "End Date" },
                    { id: "average_price", title: "Average Price (USD)" },
                    { id: "min_price", title: "Min Price (USD)" },
                    { id: "max_price", title: "Max Price (USD)" },
                    { id: "average_volume", title: "Average 24h Volume (USD)" },
                    {
                        id: "average_market_cap",
                        title: "Average Market Cap (USD)",
                    },
                    { id: "volatility", title: "Volatility" },
                    { id: "data_source", title: "Data Source" },
                ],
            });

            csvWriter
                .writeRecords(records)
                .then(() =>
                    console.log(
                        "Résultats de la volatilité exportés dans volatility_results.csv.",
                    ),
                );
        });
};

module.exports = runVolatility;
