const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const csv = require("csv-parser");

// effectue une régression linéaire pour prédire les tendances des prix

const calculateLinearRegression = (prices) => {
    const n = prices.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = prices.reduce((acc, price) => acc + price, 0);
    const sumXY = prices
        .map((price, index) => index * price)
        .reduce((acc, value) => acc + value, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - Math.pow(sumX, 2));
    const intercept = (sumY - slope * sumX) / n;

    return prices.map((_, x) => slope * x + intercept);
};

const runRegression = async () => {
    console.log("Exécution du bot Regression...");

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

            // Calculer la régression linéaire
            const regression = calculateLinearRegression(prices);

            const csvWriter = createCsvWriter({
                path: "regression_results.csv",
                header: [
                    { id: "date", title: "Cryptocurrency" },
                    { id: "price", title: "Price (USD)" },
                    { id: "regression", title: "Predicted Price (Regression)" },
                ],
            });

            const records = dates.map((date, index) => ({
                date: date,
                price: prices[index],
                regression: regression[index],
            }));

            csvWriter
                .writeRecords(records)
                .then(() =>
                    console.log(
                        "Résultats de la régression exportés dans regression_results.csv.",
                    ),
                );
        });
};

module.exports = runRegression;
