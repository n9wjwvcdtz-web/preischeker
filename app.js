document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTE
    // =====================================================

    const analyzeButton = document.getElementById("analyzeButton");
    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");
    const newAnalysisButton = document.getElementById("newAnalysisButton");

    const themeButton = document.getElementById("themeButton");
    const countrySelect = document.getElementById("countrySelect");
    const currencySelect = document.getElementById("currency");

    const imageFile = document.getElementById("imageFile");
    const imagePreview = document.getElementById("imagePreview");

    const voiceButton = document.getElementById("voiceButton");
    const voiceStatus = document.getElementById("voiceStatus");
    const description = document.getElementById("description");

    const addButton = document.getElementById("addButton");
    const addMenu = document.getElementById("addMenu");

    const imageAddButton = document.getElementById("imageAddButton");
    const fileAddButton = document.getElementById("fileAddButton");
    const cameraAddButton = document.getElementById("cameraAddButton");

    // =====================================================
    // EINGABEFELDER
    // =====================================================

    const brand = document.getElementById("brand");
    const model = document.getElementById("model");
    const year = document.getElementById("year");
    const price = document.getElementById("price");
    const budget = document.getElementById("budget");
    const mileage = document.getElementById("mileage");

    // =====================================================
    // ERGEBNIS
    // =====================================================

    const resultProduct = document.getElementById("resultProduct");
    const resultRating = document.getElementById("resultRating");
    const estimatedPrice = document.getElementById("estimatedPrice");
    const priceRange = document.getElementById("priceRange");
    const recommendedPrice = document.getElementById("recommendedPrice");
    const marketplaceList = document.getElementById("marketplaceList");
    const analysisText = document.getElementById("analysisText");

    // =====================================================
    // DARK MODE
    // =====================================================

    if (themeButton) {

        const savedTheme =
            localStorage.getItem("preischecker-theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark");
            themeButton.textContent = "☀️";
        }

        themeButton.addEventListener("click", () => {

            document.body.classList.toggle("dark");

            const isDark =
                document.body.classList.contains("dark");

            themeButton.textContent =
                isDark ? "☀️" : "🌙";

            localStorage.setItem(
                "preischecker-theme",
                isDark ? "dark" : "light"
            );

        });
    }

    // =====================================================
    // LAND → WÄHRUNG
    // =====================================================

    if (countrySelect && currencySelect) {

        countrySelect.addEventListener("change", () => {

            const country =
                PRICECHECKER_CONFIG.countries[
                    countrySelect.value
                ];

            if (country) {
                currencySelect.value =
                    country.currency;
            }

        });
    }

    // =====================================================
    // PLUS-MENÜ
    // =====================================================

    if (addButton && addMenu) {

        addButton.addEventListener("click", (event) => {

            event.stopPropagation();

            addMenu.classList.toggle("hidden");

        });
    }

    document.addEventListener("click", (event) => {

        if (
            addMenu &&
            addButton &&
            !addMenu.contains(event.target) &&
            !addButton.contains(event.target)
        ) {
            addMenu.classList.add("hidden");
        }

    });

    // =====================================================
    // BILD HOCHLADEN
    // =====================================================

    if (imageAddButton && imageFile) {

        imageAddButton.addEventListener("click", () => {

            imageFile.removeAttribute("capture");
            imageFile.accept = "image/*";
            imageFile.click();

            if (addMenu) {
                addMenu.classList.add("hidden");
            }

        });

    }

    // =====================================================
    // DATEI
    // =====================================================

    if (fileAddButton && imageFile) {

        fileAddButton.addEventListener("click", () => {

            imageFile.removeAttribute("capture");

            imageFile.accept =
                "image/*,.txt,.pdf,.doc,.docx";

            imageFile.click();

            if (addMenu) {
                addMenu.classList.add("hidden");
            }

        });

    }

    // =====================================================
    // KAMERA
    // =====================================================

    if (cameraAddButton && imageFile) {

        cameraAddButton.addEventListener("click", () => {

            imageFile.accept = "image/*";

            imageFile.setAttribute(
                "capture",
                "environment"
            );

            imageFile.click();

            if (addMenu) {
                addMenu.classList.add("hidden");
            }

        });

    }

    // =====================================================
    // BILDVORSCHAU
    // =====================================================

    if (imageFile && imagePreview) {

        imageFile.addEventListener("change", () => {

            const file = imageFile.files[0];

            if (!file) {

                imagePreview.innerHTML = "";
                imagePreview.classList.add("hidden");

                return;
            }

            if (!file.type.startsWith("image/")) {

                imagePreview.innerHTML = "";
                imagePreview.classList.add("hidden");

                alert("Bitte wähle ein Bild aus.");

                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {

                imagePreview.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="Produktbild"
                    >
                `;

                imagePreview.classList.remove("hidden");

            };

            reader.readAsDataURL(file);

        });

    }

    // =====================================================
    // SPRACHEINGABE
    // =====================================================

    let recognition = null;
    let isListening = false;

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (
        SpeechRecognition &&
        voiceButton &&
        voiceStatus &&
        description
    ) {

        recognition = new SpeechRecognition();

        recognition.lang = "de-DE";
        recognition.continuous = true;
        recognition.interimResults = true;

        voiceButton.addEventListener("click", () => {

            if (isListening) {
                recognition.stop();
                return;
            }

            try {
                recognition.start();
            } catch (error) {
                console.log(
                    "Mikrofon konnte nicht gestartet werden:",
                    error
                );
            }

        });

        recognition.onstart = () => {

            isListening = true;

            voiceButton.textContent = "⏹️";

            voiceButton.classList.add("listening");

            voiceStatus.textContent =
                "🎤 Aufnahme läuft – sprich jetzt...";

        };

        recognition.onresult = (event) => {

            let finalText = "";
            let interimText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {

                    finalText +=
                        transcript + " ";

                } else {

                    interimText += transcript;

                }

            }

            if (finalText.trim()) {

                const oldText =
                    description.value.trim();

                if (oldText) {

                    description.value =
                        oldText +
                        " " +
                        finalText.trim();

                } else {

                    description.value =
                        finalText.trim();

                }

            }

            if (interimText) {

                voiceStatus.textContent =
                    "🎤 " + interimText;

            }

        };

        recognition.onend = () => {

            isListening = false;

            voiceButton.textContent = "🎤";

            voiceButton.classList.remove("listening");

            voiceStatus.textContent =
                "✅ Sprache wurde übernommen.";

        };

        recognition.onerror = (event) => {

            isListening = false;

            voiceButton.textContent = "🎤";

            voiceButton.classList.remove("listening");

            if (event.error === "not-allowed") {

                voiceStatus.textContent =
                    "❌ Mikrofon wurde nicht erlaubt.";

            } else if (event.error === "no-speech") {

                voiceStatus.textContent =
                    "⚠️ Keine Sprache erkannt.";

            } else {

                voiceStatus.textContent =
                    "❌ Spracherkennung fehlgeschlagen.";

            }

        };

    } else {

        if (voiceButton) {
            voiceButton.disabled = true;
            voiceButton.style.opacity = "0.5";
        }

    }

    // =====================================================
    // KATEGORIE
    // =====================================================

    function detectCategory(product) {

        const text = product.toLowerCase();

        if (
            text.includes("iphone") ||
            text.includes("samsung") ||
            text.includes("ipad") ||
            text.includes("macbook") ||
            text.includes("laptop") ||
            text.includes("handy") ||
            text.includes("smartphone") ||
            text.includes("computer") ||
            text.includes("pc")
        ) {
            return "electronics";
        }

        if (
            text.includes("playstation") ||
            text.includes("ps5") ||
            text.includes("ps4") ||
            text.includes("xbox") ||
            text.includes("nintendo") ||
            text.includes("switch") ||
            text.includes("gaming")
        ) {
            return "gaming";
        }

        if (
            text.includes("bmw") ||
            text.includes("mercedes") ||
            text.includes("audi") ||
            text.includes("volkswagen") ||
            text.includes("vw") ||
            text.includes("porsche") ||
            text.includes("opel") ||
            text.includes("ford") ||
            text.includes("auto") ||
            text.includes("wagen")
        ) {
            return "cars";
        }

        if (
            text.includes("ikea") ||
            text.includes("sofa") ||
            text.includes("couch") ||
            text.includes("schrank") ||
            text.includes("tisch") ||
            text.includes("stuhl") ||
            text.includes("bett") ||
            text.includes("möbel")
        ) {
            return "furniture";
        }

        if (
            text.includes("bohrmaschine") ||
            text.includes("akkuschrauber") ||
            text.includes("werkzeug") ||
            text.includes("schrauber") ||
            text.includes("säge")
        ) {
            return "tools";
        }

        if (
            text.includes("jacke") ||
            text.includes("hose") ||
            text.includes("schuhe") ||
            text.includes("shirt") ||
            text.includes("pullover") ||
            text.includes("kleidung")
        ) {
            return "clothing";
        }

        if (
            text.includes("kamera") ||
            text.includes("canon") ||
            text.includes("nikon") ||
            text.includes("sony alpha")
        ) {
            return "photo";
        }

        return "general";
    }

    // =====================================================
    // NORMALE PREISQUELLEN
    // =====================================================

    function getMarketplaces(country, search) {

        const encoded =
            encodeURIComponent(search);

        const marketplaces = {

            DE: [
                ["Amazon.de", `https://www.amazon.de/s?k=${encoded}`],
                ["eBay", `https://www.ebay.de/sch/i.html?_nkw=${encoded}`],
                ["Kleinanzeigen", `https://www.kleinanzeigen.de/s-${encoded}/k0`],
                ["Google Shopping", `https://www.google.com/search?tbm=shop&q=${encoded}`]
            ],

            US: [
                ["Amazon", `https://www.amazon.com/s?k=${encoded}`],
                ["eBay", `https://www.ebay.com/sch/i.html?_nkw=${encoded}`],
                ["Walmart", `https://www.walmart.com/search?q=${encoded}`],
                ["Google Shopping", `https://www.google.com/search?tbm=shop&q=${encoded}`]
            ],

            GB: [
                ["Amazon UK", `https://www.amazon.co.uk/s?k=${encoded}`],
                ["eBay UK", `https://www.ebay.co.uk/sch/i.html?_nkw=${encoded}`],
                ["Google Shopping", `https://www.google.com/search?tbm=shop&q=${encoded}`]
            ],

            RU: [
                ["Avito", `https://www.avito.ru/rossiya?q=${encoded}`],
                ["Wildberries", `https://www.wildberries.ru/catalog/0/search.aspx?search=${encoded}`],
                ["Ozon", `https://www.ozon.ru/search/?text=${encoded}`]
            ],

            FR: [
                ["Amazon France", `https://www.amazon.fr/s?k=${encoded}`],
                ["eBay France", `https://www.ebay.fr/sch/i.html?_nkw=${encoded}`],
                ["Leboncoin", `https://www.leboncoin.fr/recherche?text=${encoded}`]
            ],

            IT: [
                ["Amazon Italia", `https://www.amazon.it/s?k=${encoded}`],
                ["eBay Italia", `https://www.ebay.it/sch/i.html?_nkw=${encoded}`]
            ],

            ES: [
                ["Amazon España", `https://www.amazon.es/s?k=${encoded}`],
                ["eBay España", `https://www.ebay.es/sch/i.html?_nkw=${encoded}`]
            ],

            PL: [
                ["Allegro", `https://allegro.pl/listing?string=${encoded}`],
                ["Amazon Polska", `https://www.amazon.pl/s?k=${encoded}`],
                ["eBay Polska", `https://www.ebay.pl/sch/i.html?_nkw=${encoded}`]
            ],

            CH: [
                ["Digitec", `https://www.digitec.ch/de/search?q=${encoded}`],
                ["Galaxus", `https://www.galaxus.ch/de/search?q=${encoded}`],
                ["eBay Schweiz", `https://www.ebay.ch/sch/i.html?_nkw=${encoded}`]
            ],

            UA: [
                ["Rozetka", `https://rozetka.com.ua/ua/search/?text=${encoded}`],
                ["Prom.ua", `https://prom.ua/ua/search?search_term=${encoded}`],
                ["OLX Ukraine", `https://www.olx.ua/uk/list/q-${encoded}/`]
            ]

        };

        return marketplaces[country] || marketplaces.DE;
    }

    // =====================================================
    // KI-WERT AUSLESEN
    // =====================================================

    function extractAIValue(text, labels) {

        for (const label of labels) {

            const regex =
                new RegExp(
                    `${label}\\s*:?\\s*(.+)`,
                    "i"
                );

            const match = text.match(regex);

            if (match) {

                return match[1]
                    .split("\n")[0]
                    .trim();

            }

        }

        return "";
    }

    // =====================================================
    // LIVE-KLEINANZEIGEN
    // =====================================================

    async function getLiveOffers(product, maxPrice) {

        if (!maxPrice) {
            return [];
        }

        const url =
            `${PRICECHECKER_CONFIG.API_URL}/api/live-search` +
            `?product=${encodeURIComponent(product)}` +
            `&maxPrice=${encodeURIComponent(maxPrice)}`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Live-Suche Fehler: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                data.error ||
                "Live-Suche fehlgeschlagen."
            );
        }

        return data.offers || [];
    }

    // =====================================================
    // LIVE-ANGEBOTE ANZEIGEN
    // =====================================================

    function showLiveOffers(offers) {

        if (!marketplaceList) {
            return;
        }

        if (!offers.length) {

            const empty =
                document.createElement("p");

            empty.textContent =
                "😕 Keine passenden Live-Angebote unter deinem Budget gefunden.";

            marketplaceList.appendChild(empty);

            return;
        }

        const title =
            document.createElement("h3");

        title.textContent =
            "🔥 LIVE-ANGEBOTE";

        marketplaceList.appendChild(title);

        offers.forEach((offer, index) => {

            const card =
                document.createElement("a");

            card.href = offer.url;
            card.target = "_blank";
            card.rel = "noopener noreferrer";

            card.className =
                "live-offer";

            const medal =
                index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`;

            card.innerHTML = `
                <strong>
                    ${medal} ${offer.price} ${offer.currency}
                </strong>
                <span>
                    ${offer.title}
                </span>
                <small>
                    ${offer.marketplace}
                </small>
            `;

            marketplaceList.appendChild(card);

        });
    }

    // =====================================================
    // ANALYSE
    // =====================================================

    if (analyzeButton) {

        analyzeButton.addEventListener("click", async () => {

            const brandValue =
                brand?.value.trim() || "";

            const modelValue =
                model?.value.trim() || "";

            const yearValue =
                year?.value.trim() || "";

            const priceValue =
                price?.value.trim() || "";

            const budgetValue =
                budget?.value.trim() || "";

            const mileageValue =
                mileage?.value.trim() || "";

            const descriptionValue =
                description?.value.trim() || "";

            const countryValue =
                countrySelect?.value || "DE";

            const currencyValue =
                currencySelect?.value || "EUR";

            const product =
                `${brandValue} ${modelValue}`.trim() ||
                descriptionValue ||
                "Unbekanntes Produkt";

            if (
                !brandValue &&
                !modelValue &&
                !descriptionValue &&
                !imageFile?.files?.length
            ) {

                alert(
                    "Bitte gib zuerst ein Produkt ein oder lade ein Bild hoch."
                );

                return;
            }

            if (loadingSection) {
                loadingSection.classList.remove("hidden");
            }

            if (resultSection) {
                resultSection.classList.add("hidden");
            }

            analyzeButton.disabled = true;

            analyzeButton.innerHTML =
                "🤖 KI analysiert...";

            try {

                // -----------------------------------------
                // BILD
                // -----------------------------------------

                let imageBase64 = null;

                if (
                    imageFile?.files?.[0] &&
                    imageFile.files[0]
                        .type.startsWith("image/")
                ) {

                    imageBase64 =
                        await fileToBase64(
                            imageFile.files[0]
                        );
                }

                // -----------------------------------------
                // KI
                // -----------------------------------------

                const data = {

                    product,
                    brand: brandValue,
                    model: modelValue,
                    year: yearValue,
                    price: priceValue,
                    budget: budgetValue,
                    mileage: mileageValue,
                    country: countryValue,
                    currency: currencyValue,
                    description: descriptionValue,
                    image: imageBase64

                };

                const response =
                    await fetch(
                        `${PRICECHECKER_CONFIG.API_URL}/api/analyze`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        `Serverfehler: ${response.status}`
                    );
                }

                const result =
                    await response.json();

                if (!result.success) {

                    throw new Error(
                        result.error ||
                        "Analyse fehlgeschlagen."
                    );
                }

                const aiText =
                    result.analysis ||
                    "Keine KI-Antwort erhalten.";

                const aiPrice =
                    extractAIValue(
                        aiText,
                        [
                            "PREIS",
                            "GESCHÄTZTER MARKTWERT",
                            "MARKTWERT"
                        ]
                    );

                const aiRange =
                    extractAIValue(
                        aiText,
                        [
                            "PREISSPANNE",
                            "MARKTSPANNE"
                        ]
                    );

                const aiRecommended =
                    extractAIValue(
                        aiText,
                        [
                            "EMPFOHLENER PREIS",
                            "EMPFOHLENER VERKAUFSPREIS"
                        ]
                    );

                const aiProduct =
                    extractAIValue(
                        aiText,
                        ["PRODUKT"]
                    );

                // -----------------------------------------
                // KI ERGEBNIS
                // -----------------------------------------

                if (resultProduct) {
                    resultProduct.textContent =
                        aiProduct || product;
                }

                if (estimatedPrice) {
                    estimatedPrice.textContent =
                        aiPrice || "KI-Analyse";
                }

                if (priceRange) {
                    priceRange.textContent =
                        aiRange ||
                        "Preis wird von der KI geschätzt";
                }

                if (recommendedPrice) {
                    recommendedPrice.textContent =
                        aiRecommended ||
                        "KI-Analyse";
                }

                if (analysisText) {
                    analysisText.textContent =
                        aiText;
                }

                if (resultRating) {
                    resultRating.textContent =
                        "★★★★★";
                }

                // -----------------------------------------
                // PREISQUELLEN LEEREN
                // -----------------------------------------

                if (marketplaceList) {
                    marketplaceList.innerHTML = "";
                }

                // -----------------------------------------
                // LIVE-ANGEBOTE
                // -----------------------------------------

                let liveOffers = [];

                if (budgetValue) {

                    liveOffers =
                        await getLiveOffers(
                            product,
                            budgetValue
                        );

                    showLiveOffers(liveOffers);
                }

                // -----------------------------------------
                // NORMALE LINKS
                // -----------------------------------------

                const marketplaces =
                    getMarketplaces(
                        countryValue,
                        product
                    );

                if (marketplaceList) {

                    const normalTitle =
                        document.createElement("h3");

                    normalTitle.textContent =
                        "🌐 Weitere Preisquellen";

                    marketplaceList.appendChild(
                        normalTitle
                    );

                    marketplaces.forEach(
                        ([name, url]) => {

                            const link =
                                document.createElement("a");

                            link.href = url;
                            link.target = "_blank";
                            link.rel =
                                "noopener noreferrer";

                            link.textContent =
                                `🔎 ${name}`;

                            marketplaceList
                                .appendChild(link);

                        }
                    );
                }

                // -----------------------------------------
                // ERGEBNIS
                // -----------------------------------------

                if (loadingSection) {
                    loadingSection.classList.add("hidden");
                }

                if (resultSection) {
                    resultSection.classList.remove("hidden");
                }

            } catch (error) {

                console.error(
                    "PreisChecker Fehler:",
                    error
                );

                alert(
                    "Fehler:\n\n" +
                    error.message
                );

                if (loadingSection) {
                    loadingSection.classList.add("hidden");
                }

            } finally {

                analyzeButton.disabled = false;

                analyzeButton.innerHTML =
                    "<span>🔍</span> Preis analysieren";
            }

        });

    }

    // =====================================================
    // DATEI → BASE64
    // =====================================================

    function fileToBase64(file) {

        return new Promise((resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                const result =
                    reader.result;

                resolve(
                    result.split(",")[1]
                );

            };

            reader.onerror = reject;

            reader.readAsDataURL(file);

        });

    }

    // =====================================================
    // NEUE ANALYSE
    // =====================================================

    if (newAnalysisButton) {

        newAnalysisButton.addEventListener("click", () => {

            if (resultSection) {
                resultSection.classList.add("hidden");
            }

            if (description) {
                description.value = "";
            }

            if (imageFile) {
                imageFile.value = "";
            }

            if (brand) {
                brand.value = "";
            }

            if (model) {
                model.value = "";
            }

            if (year) {
                year.value = "";
            }

            if (price) {
                price.value = "";
            }

            if (budget) {
                budget.value = "";
            }

            if (mileage) {
                mileage.value = "";
            }

            if (imagePreview) {

                imagePreview.innerHTML = "";

                imagePreview.classList.add(
                    "hidden"
                );
            }

            if (voiceStatus) {
                voiceStatus.textContent = "";
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    // =====================================================
    // START
    // =====================================================

    console.log(
        "✅ PreisChecker App geladen."
    );

    console.log(
        "🤖 KI: Ollama / Gemma 3"
    );

    console.log(
        "🔥 Live-Preise: Kleinanzeigen Agent"
    );

    console.log(
        "🎤 Spracheingabe:",
        SpeechRecognition
            ? "aktiv"
            : "nicht unterstützt"
    );

});