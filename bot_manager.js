// Importer les bots
const fetchCryptoData = require("./fetch_data");
const runSMA_RSI = require("./bots/bot_sma_rsi"); // Bot SMA/RSI
const runVolatility = require("./bots/bot_volatility"); // Bot Volatility
const runRegression = require("./bots/bot_regression"); // Bot Regression
const runSentiment = require("./bots/bot_sentiment"); // Bot Sentiment

class BotManager {
    constructor() {
        // Enregistrer tous les bots dans un dictionnaire
        this.bots = {
            Fetch_Crypto_Data: fetchCryptoData,
            SMA_RSI: runSMA_RSI,
            Volatility: runVolatility,
            Regression: runRegression,
            Sentiment: runSentiment,
        };
    }

    displayBots() {
        console.log("Options disponibles :");
        for (let botName in this.bots) {
            console.log(` - ${botName}`);
        }
    }

    async runBot(botName, days) {
        const bot = this.bots[botName];
        if (bot) {
            try {
                console.log(`Exécution du bot ${botName}...`);
                await bot(days); // Exécuter le bot avec la durée de temps
            } catch (error) {
                console.error(
                    `Erreur lors de l'exécution du bot ${botName}:`,
                    error,
                );
            }
        } else {
            console.log(`Bot ${botName} non disponible.`);
        }
    }

    async start() {
        while (true) {
            this.displayBots();
            const botName = await this.prompt(
                'Entrez le nom du bot à exécuter (ou "exit" pour quitter) : ',
            );

            if (botName.toLowerCase() === "exit") {
                console.log("Sortie du programme.");
                break;
            } else {
                const days = await this.prompt(
                    "Entrez la durée de temps en jours (ex: 7 pour 1 semaine, 30 pour 1 mois) : ",
                );
                await this.runBot(botName, parseInt(days));
            }
        }
    }

    prompt(query) {
        const readline = require("readline");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((resolve) =>
            rl.question(query, (ans) => {
                rl.close();
                resolve(ans);
            }),
        );
    }
}

const manager = new BotManager();
manager.start();
