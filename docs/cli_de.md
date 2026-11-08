# CLI und Beispiele

[Übersicht](../README.md) · [English](cli_en.md)

Voraussetzung: abgeschlossene [Einrichtung](setup_de.md) und eine passende
[Konfiguration](configuration_de.md).

## Rezepte analysieren

Aus dem Projekt-Hauptverzeichnis, nach dem Build:

```bash
node backend/src/cli.js analyze --urls backend/examples/recipe-urls.txt
```

Alternativ aus dem Backend, mit automatischem Build:

```bash
cd backend
npm start -- analyze --urls examples/recipe-urls.txt
```

`backend/go.cmd` funktioniert unabhängig vom Aufrufverzeichnis.

Ohne `--config` lädt die CLI immer `config.json` im Projekt-Hauptverzeichnis.
Explizite relative Konfigurationspfade beziehen sich auf das Arbeitsverzeichnis.
Zum Verwenden der Vorlage aus dem Backend: `--config ../config.example.json`.
Die Vorlage verwendet Cache- und Ausgabeordner unter `backend/`; Beispiel-URLs
liegen in `backend/examples/`.

## Wichtige Optionen

| Option | Bedeutung |
| --- | --- |
| `--config <path>` | JSON-Konfiguration für LLM, Cache und Ausgabe. |
| `--urls <path>` | Textdatei mit Rezept-URLs; Leerzeilen und `#`-Kommentare werden ignoriert. |
| `--cache-mode <cache-first\|refresh\|offline>` | HTML aus dem Cache lesen oder neu abrufen. |
| `--output-dir <path>` | Zielordner für `.recipe.json`, `.ingredients.txt`, `.mmd`, `.svg` und `.png`; relativ zum Arbeitsverzeichnis. |
| `--intermediate-states <show\|hide>` | Mermaid-Ausgabe mit oder ohne Zwischenzustände. |

Hilfe nach dem Build, aus dem Hauptverzeichnis:

```bash
node backend/src/cli.js --help
```

## Erzeugte Graphbilder

Jede erfolgreiche Analyse rendert SVG und PNG aus derselben Mermaid-Quelle mit
gleichem Theme, weißem Hintergrund und gleichen Layout-Einstellungen. Alle fünf
Dateien haben denselben Rezeptstamm. Erfolg wird erst nach Erzeugung beider Bilder
gemeldet. `--intermediate-states` wirkt auch auf beide Bilder. Bei Rendering-
Fehlern endet die CLI mit Fehlerstatus und verarbeitet keine weiteren URLs.
Aktuelle Textartefakte bleiben erhalten; beide Bildziele und temporäre Rendering-
Dateien werden nur für das betroffene Rezept entfernt. Pro Renderer-Aufruf gilt
ein Zeitlimit von 60 Sekunden; siehe [Einrichtung](setup_de.md).

## Chefkoch-Beispiel-URLs

Chefkoch-Zufallsrezepte werden nicht automatisch abgefragt. Zum Befüllen der
Beispiel-URL-Datei gibt es ein explizites Kommando:

```bash
cd backend
npm start -- seed-chefkoch --urls examples/recipe-urls.txt --limit 5
```

Aufgenommen werden nur Rezepte von
`https://www.chefkoch.de/rs/s0/zufall/Rezepte.html` mit einer Bewertung **größer als
4** und **mehr als 10 Bewertungen**. Bereits vorhandene URLs werden nicht doppelt
eingetragen.
