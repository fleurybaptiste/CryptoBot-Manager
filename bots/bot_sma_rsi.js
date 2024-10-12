const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const csv = require("csv-parser");

// calcule la moyenne mobile simple d’une cryptomonnaie

const calculateSMA = (prices, period) => {
    let sma = [];
    for (let i = 0; i < prices.length; i++) {
        if (i >= period - 1) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += prices[i - j];
            }
            sma.push(sum / period);
        } else {
            sma.push(null); // Pas assez de données pour SMA
        }
    }
    return sma;
};

const runSMA_RSI = async () => {
    console.log("Exécution du bot SMA/RSI...");

    // Lire les prix à partir du fichier CSV généré précédemment
    let prices = [];
    let dates = [];

    fs.createReadStream("crypto_data.csv")
        .pipe(csv())
        .on("data", (row) => {
            prices.push(parseFloat(row["Price (USD)"]));
            dates.push(row.Cryptocurrency);
        })
        .on("end", () => {
            console.log("Fichier CSV lu avec succès.");

            // Calculer la SMA (Simple Moving Average) sur 10 jours
            const sma = calculateSMA(prices, 10);

            // Créer un nouveau fichier CSV avec la SMA
            const csvWriter = createCsvWriter({
                path: "sma_rsi_results.csv",
                header: [
                    { id: "date", title: "Cryptocurrency" },
                    { id: "price", title: "Price (USD)" },
                    { id: "sma", title: "SMA (10)" },
                ],
            });

            const records = dates.map((date, index) => ({
                date: date,
                price: prices[index],
                sma: sma[index],
            }));

            csvWriter
                .writeRecords(records)
                .then(() =>
                    console.log(
                        "Résultats SMA/RSI exportés dans sma_rsi_results.csv.",
                    ),
                );
        });
};

module.exports = runSMA_RSI;
