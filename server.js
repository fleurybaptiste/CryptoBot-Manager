const express = require("express");
const app = express();
const port = 3000;

// Importer la fonction qui récupère les données
const fetchCryptoData = require("d:/CryptoBot/CryptoBot-Manager/fetch_data.js");

// Créer une route pour afficher les données dans le navigateur
app.get("/fetch-data", async (req, res) => {
    try {
        const days = 30; // Exemple d'argument pour ton script
        const historicalDate = "01-10-2023"; // Exemple de date pour les données historiques

        // Appeler la fonction et récupérer les données
        await fetchCryptoData(days, historicalDate);

        res.send(
            "Les données ont été récupérées. Consulte la console pour les logs.",
        );
    } catch (error) {
        res.status(500).send("Erreur lors de la récupération des données.");
    }
});

// Démarrer le serveur sur localhost:3000
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
