# Rezept Graph

Rezept-URLs einlesen, HTML lokal cachen und mit einem LLM strukturierte Rezeptdaten,
Zutatenlisten und Mermaid-Graphen erzeugen – über eine CLI.

Read recipe URLs, cache HTML locally, and use an LLM to generate structured recipe
data, ingredient lists, and Mermaid graphs through a CLI.

## Dokumentation / Documentation

| Thema / Topic | Deutsch | English |
| --- | --- | --- |
| Einrichtung und Tests / Setup and tests | [Einrichtung](docs/setup_de.md) | [Setup](docs/setup_en.md) |
| CLI und Beispiele / CLI and examples | [Bedienung](docs/cli_de.md) | [Usage](docs/cli_en.md) |
| Konfiguration und Anbieter / Configuration and providers | [Konfiguration](docs/configuration_de.md) | [Configuration](docs/configuration_en.md) |
| Backend und Datenfluss / Backend and data flow | [Architektur](docs/backend-architecture_de.md) | [Architecture](docs/backend-architecture_en.md) |
| SVG-/PNG-Rendering / SVG/PNG rendering | [Bildausgabe](docs/graph-rendering_de.md) | [Image outputs](docs/graph-rendering_en.md) |
| Kochablauf für eine Person / Single-person cooking guide | [Kochansicht](docs/cooking-timeline_de.md) | [Cooking view](docs/cooking-timeline_en.md) |

**Voraussetzung / Requirement:** Node.js **24+**.

Konfigurationsvorlage / Configuration template: [`config.example.json`](config.example.json).

Nur OpenAI-kompatible LLM-APIs / OpenAI-compatible LLM APIs only:
[Migration (DE)](docs/configuration_de.md#migration-bisheriger-provider) ·
[Migration (EN)](docs/configuration_en.md#migration-from-legacy-providers).
