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
| `llm.baseUrl` | OpenAI-kompatibler API-Stammpfad, einschließlich `/v1`, falls vom Server benötigt. |
| `llm.baseUrlEnv` | Optionaler Name der Umgebungsvariable für die Basis-URL. |
| `llm.model` | Modellname. |
| `llm.apiKeyEnv` | Name der Umgebungsvariable mit dem API-Schlüssel. |
| `llm.timeoutMs` | Zeitlimit in Millisekunden. |

Unterstützt werden ausschließlich OpenAI-kompatible Chat-Completions-APIs,
unabhängig vom Anbieter. Der Client entfernt abschließende Schrägstriche und hängt
`/chat/completions` an den API-Stammpfad an; `/v1` wird nicht automatisch ergänzt.
Aus `http://localhost:1234/v1` wird beispielsweise
`http://localhost:1234/v1/chat/completions`. Eigene Gateway-Stammpfade sind möglich.

Der Server muss `model`, `messages` und den JSON-Modus
(`response_format: { "type": "json_object" }`) akzeptieren und Text unter
`choices[0].message.content` zurückgeben. Die konfigurierte Umgebungsvariable
liefert den optionalen Bearer-Token. Timeouts und Antwortcache bleiben erhalten;
native Protokoll-Fallbacks, Responses API und Streaming werden nicht unterstützt.

## Migration bisheriger Provider

- Entferne `llm.provider` vollständig, auch bisherige Werte wie `server`, `ollama`
  oder `openai`. In Code und typisierter Konfiguration gibt es keine Auswahl mehr.
  Veraltete Felder in externem JSON werden ignoriert und nicht in die normalisierte
  Konfiguration übernommen.
- Prüfe den OpenAI-kompatiblen API-Stammpfad und die JSON-Modus-Unterstützung.
  Übernimm einen nativen API-Stammpfad nicht ungeprüft.
- Für lokales Ollama verwende `http://localhost:11434/v1`. Anfragen gehen damit an
  `/v1/chat/completions`, nie an das native `/api/chat`. Der native Zugriff auf
  Ollama Cloud entfällt; der Dienst muss die oben beschriebene kompatible API anbieten.
- Hinterlege Zugangsdaten in der durch `apiKeyEnv` benannten Umgebungsvariable,
  nicht direkt als `apiKey`. Private Konfigurationen werden nicht automatisch geändert.
- Antwortcache-Schlüssel enthalten nur noch API-Stammpfad, Modell und Nachrichten.
  Alte Einträge mit Provider-Komponente (auch OpenAI-Einträge) werden nicht mehr
  getroffen: Die nächste Anfrage benötigt einen neuen LLM-Aufruf. Alte Dateien
  werden weder migriert noch gelöscht; weitere identische Anfragen nutzen den neuen Eintrag.

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
