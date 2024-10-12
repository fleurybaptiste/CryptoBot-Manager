const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require("moment");

const fetchCryptoData = async (days) => {
    try {
        const endDate = moment().format("YYYY-MM-DD");
        const startDate = moment().subtract(days, "days").format("YYYY-MM-DD");

        // Récupérer les données historiques via l'API CoinGecko
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/markets`,
            {
                params: {
                    vs_currency: "usd",
                    ids: "bitcoin,ethereum,litecoin",
                    order: "market_cap_desc",
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: "24h,7d,30d",
                },
            },
        );

        const data = response.data;

        // Créer un fichier CSV avec les résultats
        const csvWriter = createCsvWriter({
            path: "crypto_data.csv",
            header: [
                { id: "id", title: "Cryptocurrency" },
                { id: "price", title: "Price (USD)" },
                { id: "market_cap", title: "Market Cap (USD)" },
                { id: "volume_24h", title: "24h Volume (USD)" },
                { id: "change_24h", title: "24h Change (%)" },
            ],
        });

        // Transformer les données en format compatible pour CSV
        const records = data.map((coin) => ({
            id: coin.id,
            price: coin.current_price,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            change_24h: coin.price_change_percentage_24h,
        }));

        // Écrire les données dans un fichier CSV
        await csvWriter.writeRecords(records);
        console.log("Données récupérées et exportées dans crypto_data.csv");
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
    }
};

// Exporter la fonction pour l'utiliser dans bot_manager.js
module.exports = fetchCryptoData;
