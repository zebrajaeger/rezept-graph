# Konfiguration und Anbieter

[Übersicht](../README.md) · [English](configuration_en.md)

## Lokale Konfiguration

Verwende [`config.example.json`](../config.example.json) als Vorlage für
`config.json` im Projekt-Hauptverzeichnis; siehe [Einrichtung](setup_de.md).
`config.json` bleibt lokal und wird von Git ignoriert.

Eine bestehende `backend/config.json` muss manuell ins Hauptverzeichnis verschoben
werden. Vorhandene Root-Dateien nicht überschreiben. Relative Cache- und
Ausgabepfade beziehen sich auf den Konfigurationsordner und müssen beim Umzug
angepasst werden, beispielsweise `outputs` → `backend/outputs`.

## Pfadauflösung

| Pfad | Bezugspunkt |
| --- | --- |
| Standard-`config.json` | Immer das Projekt-Hauptverzeichnis. |
| Explizites `--config <path>` | Arbeitsverzeichnis, sofern nicht absolut. |
| Cache- und Ausgabepfade in der Konfiguration | Ordner der Konfigurationsdatei. |
| `--output-dir <path>` | Arbeitsverzeichnis, sofern nicht absolut. |

## LLM-Einstellungen

| Feld | Bedeutung |
| --- | --- |
| `llm.baseUrl` | Basis-URL des Anbieters. |
| `llm.baseUrlEnv` | Optionaler Name der Umgebungsvariable für die Basis-URL. |
| `llm.provider` | `openai` für OpenAI-kompatible `/v1/chat/completions`, `ollama` für native `/api/chat`. |
| `llm.model` | Modellname. |
| `llm.apiKeyEnv` | Name der Umgebungsvariable mit dem API-Schlüssel. |
| `llm.timeoutMs` | Zeitlimit in Millisekunden. |

Lokale Anbieter wie LM Studio oder kompatible Gateways können verwendet werden,
solange sie `/v1/chat/completions` anbieten.

Für direkten Zugriff auf Ollama Cloud verwende `provider: "ollama"` und die
Basis-URL `https://ollama.com`. Die native Cloud-API liegt unter
`https://ollama.com/api/chat` und verwendet `Authorization: Bearer ...`.

## Umgebungsvariablen

Die CLI lädt `.env` automatisch aus dem aktuellen Arbeitsverzeichnis, dessen
Parent-Verzeichnis und dem Konfigurationsordner. Vorhandene Shell-Variablen haben
Vorrang.

Wenn die Konfiguration `"apiKeyEnv": "API_KEY"` und `"baseUrlEnv": "BASE_URL"`
verwendet, kann `.env` so aussehen:

```dotenv
API_KEY=...
BASE_URL=...
```

Die mitgelieferte Vorlage verwendet stattdessen die Namen `OPENAI_API_KEY` und
`OPENAI_BASE_URL`; die Variablennamen müssen zur Konfiguration passen.
