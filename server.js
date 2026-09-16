const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PreisChecker API läuft!"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "PreisChecker Verbindung funktioniert!"
    });
});

app.post("/api/analyze", async (req, res) => {
    try {
        const data = req.body;

        const product =
            data.product ||
            `${data.brand || ""} ${data.model || ""}`.trim() ||
            "Unbekanntes Produkt";

        const prompt = `
Du bist die professionelle Preis-KI von PreisChecker.

Analysiere das Produkt so genau wie möglich.

Produkt: ${product}
Marke: ${data.brand || "unbekannt"}
Modell: ${data.model || "unbekannt"}
Baujahr: ${data.year || "unbekannt"}
Kilometerstand: ${data.mileage || "unbekannt"}
Verkäuferpreis: ${data.price || "nicht angegeben"}
Land: ${data.country || "DE"}
Währung: ${data.currency || "EUR"}
Beschreibung: ${data.description || "keine Beschreibung"}

Falls ein Bild vorhanden ist, analysiere auch das Bild.
Erkenne darauf möglichst:
- Produktart
- Marke
- Modell
- Zustand
- sichtbare Schäden
- besondere Merkmale
- Zubehör

Schätze danach einen realistischen Marktpreis.

Antworte auf Deutsch.

Verwende genau diese Struktur:

PRODUKT:
PREIS:
PREISSPANNE:
EMPFOHLENER PREIS:
ZUSTAND:
BEGRÜNDUNG:

Sei realistisch und erfinde keine sicheren Fakten, wenn sie auf dem Bild nicht erkennbar sind.
`;

        const requestBody = {
            model: "gemma3",
            prompt: prompt,
            stream: false
        };

        // Bild an Gemma 3 senden
        if (data.image) {
            requestBody.images = [data.image];
        }

        const ollamaResponse = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!ollamaResponse.ok) {
            throw new Error("Ollama konnte nicht erreicht werden.");
        }

        const ollamaData = await ollamaResponse.json();

        res.json({
            success: true,
            product: product,
            estimatedPrice: "KI-Analyse",
            priceRange: "KI-Analyse",
            recommendedPrice: "KI-Analyse",
            analysis: ollamaData.response,
            marketplaces: []
        });

    } catch (error) {
        console.error("KI-Fehler:", error);

        res.status(500).json({
            success: false,
            error: "Die Preis-KI konnte momentan nicht erreicht werden."
        });
    }
});

app.listen(PORT, () => {app.get("/api/live-search", async (req, res) => {
    try {
        const product = req.query.product || "";
        const maxPrice = Number(req.query.maxPrice);

        if (!product) {
            return res.status(400).json({
                success: false,
                error: "Produkt fehlt."
            });
        }

        const url = new URL(
            "https://api.kleinanzeigen-agent.de/api/v2/kleinanzeigen/search"
        );

        url.searchParams.set("q", product);
        url.searchParams.set("size", "50");

        if (!isNaN(maxPrice)) {
            url.searchParams.set("max_price", maxPrice);
        }

        const response = await fetch(url, {
            headers: {
                klaz_key: process.env.KLEINANZEIGEN_API_KEY
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        const ads = (data.data?.ads || [])
            .filter(ad => {
                const price = Number(ad.price?.amount);
                return !isNaN(price) &&
                    (isNaN(maxPrice) || price <= maxPrice);
            })
            .sort((a, b) => {
                return Number(a.price.amount) - Number(b.price.amount);
            });

        res.json({
            success: true,
            product: product,
            budget: maxPrice,
            count: ads.length,
            offers: ads.map(ad => ({
                title: ad.title,
                price: ad.price?.amount,
                currency: ad.price?.currency_code,
                url: ad.ad_url,
                marketplace: "Kleinanzeigen"
            }))
        });

    } catch (error) {
        console.error("Live-Suche Fehler:", error);

        res.status(500).json({
            success: false,
            error: "Live-Preise konnten nicht geladen werden."
        });
    }
});
    console.log(`PreisChecker API läuft auf http://localhost:${PORT}`);
});