const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const csv = require("csv-parser");

// simule une analyse de sentiment basée sur des scores aléatoires. À terme, cela pourrait être remplacé par une vraie API de sentiment

const runSentiment = async () => {
    console.log("Exécution du bot Sentiment...");

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

            // Simuler des scores de sentiment aléatoires
            const sentiments = prices.map(() =>
                (Math.random() * 2 - 1).toFixed(2),
            );

            const csvWriter = createCsvWriter({
                path: "sentiment_results.csv",
                header: [
                    { id: "date", title: "Cryptocurrency" },
                    { id: "price", title: "Price (USD)" },
                    { id: "sentiment", title: "Sentiment Score" },
                ],
            });

            const records = dates.map((date, index) => ({
                date: date,
                price: prices[index],
                sentiment: sentiments[index],
            }));

            csvWriter
                .writeRecords(records)
                .then(() =>
                    console.log(
                        "Résultats de l'analyse de sentiment exportés dans sentiment_results.csv.",
                    ),
                );
        });
};

module.exports = runSentiment;
