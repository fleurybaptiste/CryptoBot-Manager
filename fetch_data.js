const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require("moment");

const fetchCryptoData = async (days, historicalDate) => {
    try {
        // Récupérer les données de marché actuelles via l'API CoinGecko
        const marketResponse = await axios.get(
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

        const marketData = marketResponse.data;
        console.log("Données de marché récupérées depuis l'API :", marketData);

        // Récupérer les données historiques pour une date précise pour Bitcoin
        const historicalResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/bitcoin/history`,
            {
                params: {
                    date: historicalDate, // Format dd-mm-yyyy
                    localization: false,
                },
            },
        );

        const historicalData = historicalResponse.data;
        console.log(
            "Données historiques récupérées depuis l'API :",
            historicalData,
        );

        // Créer un fichier CSV avec les résultats actuels
        const csvWriterCurrent = createCsvWriter({
            path: "crypto_current_data.csv",
            header: [
                { id: "id", title: "Cryptocurrency" },
                { id: "price", title: "Price (USD)" },
                { id: "market_cap", title: "Market Cap (USD)" },
                { id: "volume_24h", title: "24h Volume (USD)" },
                { id: "change_24h", title: "24h Change (%)" },
                { id: "date", title: "Date" },
            ],
        });

        // Créer un fichier CSV avec les résultats historiques
        const csvWriterHistorical = createCsvWriter({
            path: "crypto_historical_data.csv",
            header: [
                { id: "id", title: "Cryptocurrency" },
                { id: "date", title: "Date" },
                { id: "historical_price", title: "Historical Price (USD)" },
            ],
        });

        // Transformer les données actuelles en format compatible pour CSV
        const currentRecords = marketData.map((coin) => ({
            id: coin.id,
            price: coin.current_price,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            change_24h: coin.price_change_percentage_24h,
            date: moment().format("YYYY-MM-DD"),
        }));

        // Transformer les données historiques pour Bitcoin
        const historicalRecords = [
            {
                id: "bitcoin",
                date: historicalDate,
                historical_price: historicalData.market_data.current_price.usd,
            },
        ];

        // Écrire les données actuelles dans un fichier CSV
        await csvWriterCurrent.writeRecords(currentRecords);
        console.log("Données actuelles exportées dans crypto_current_data.csv");

        // Écrire les données historiques dans un fichier CSV
        await csvWriterHistorical.writeRecords(historicalRecords);
        console.log(
            "Données historiques exportées dans crypto_historical_data.csv",
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
    }
};

// Exemple d'utilisation
const days = 30; // Période pour les données de marché actuelles
const historicalDate = "01-10-2023"; // Date pour les données historiques (format dd-mm-yyyy)

fetchCryptoData(days, historicalDate);
