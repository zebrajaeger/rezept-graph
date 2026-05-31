## Rezept Graph

CLI-first Anwendung, die Rezept-URLs einliest, HTML-Seiten lokal cached, Rezeptinhalt extrahiert und daraus mit einer OpenAI-kompatiblen LLM strukturierte Rezeptdaten, Zutatenlisten und Mermaid-Graphen erzeugt.

### Backend CLI

```bash
cd backend
npm start -- analyze --config config.example.json --urls examples/recipe-urls.txt
```

Wichtige Optionen:

- `--config <path>`: JSON-Konfiguration fuer LLM, Cache und Ausgabe.
- `--urls <path>`: Textdatei mit Rezept-URLs. Leerzeilen und `#`-Kommentare werden ignoriert.
- `--cache-mode <cache-first|refresh|offline>`: steuert, ob HTML aus dem Cache gelesen oder neu abgerufen wird.
- `--output-dir <path>`: Zielordner fuer `.recipe.json`, `.ingredients.txt` und `.mmd`.
- `--intermediate-states <show|hide>`: Mermaid-Ausgabe mit oder ohne Zwischenzustaende.

### Chefkoch-Beispiel-URLs

Chefkoch-Zufallsrezepte werden nicht automatisch abgefragt. Zum Befuellen der Beispiel-URL-Datei gibt es ein explizites Kommando:

```bash
cd backend
npm start -- seed-chefkoch --urls examples/recipe-urls.txt --limit 5
```

Aufgenommen werden nur Rezepte von `https://www.chefkoch.de/rs/s0/zufall/Rezepte.html` mit Bewertung groesser als `4` und mehr als `10` Bewertungen. Bereits vorhandene URLs werden nicht doppelt eingetragen.

### Config

Siehe `backend/config.example.json`. Die LLM-Konfiguration ist OpenAI-kompatibel:

- `llm.baseUrl`
- `llm.model`
- `llm.apiKeyEnv`
- `llm.timeoutMs`

Lokale Anbieter wie LM Studio oder kompatible Gateways koennen verwendet werden, solange sie `/v1/chat/completions` anbieten.

### Tests

```bash
cd backend
npm test
```
