# Rezept-Icons

## Zustände von Eiern

Bei aktivierter neuer Interpretation/Darstellung tragen Eier einen validierten Zustand `raw`, `boiled` oder `fried`. Einfache Eierangaben gelten als rohe ganze Eier mit intakter Schale; explizit gekochte oder gebratene Eier bleiben getrennt. Unterstützte Beispiele: `3 Eier, Größe M`, `2 rohe Eier`, `2 gekochte Eier`, `hart gekochtes Ei`, `Spiegelei`, `2 gebratene Eier`, `boiled egg`, `fried egg`. Widersprüchliche Zustände, aufgeschlagene Eier, Rührei, pochierte Eier, Eiweiß und Eigelb bleiben vorerst Text statt falscher Ganz-Ei-Zuordnung.

Neue Bildschlüssel: `ingredients/egg-raw`, `ingredients/egg-boiled`, `ingredients/egg-fried`; Gruppen entsprechend `egg-raw-count-3` usw. Grund- und Gruppenprompts nennen Zustand und Form ausdrücklich. Badges und Gruppenfallback verwenden ausschließlich denselben Zustand. Derivat- und Interpretationscache sind dafür versioniert. Die alten zustandsunspezifischen Pakete `egg` und `egg-count-3` bleiben erhalten, werden aber nicht automatisch als neue Zustandsbilder übernommen. Fehlende neue Bilder bleiben in local-only Text; es wurden keine zusätzlichen Zustandsbilder generiert. Ohne aktivierte neue Funktionen bleibt der alte Resolver aus Kompatibilitätsgründen unverändert.

## Originale, Derivate und Bedarf

Icons ergänzen vorhandene Knoten statt deren Form zu ersetzen: bei Zutaten bleibt die grüne pillenförmige Umrandung erhalten, das Bild steht innen links und der vollständige Text rechts. Der Anwendungsrenderer reserviert Platz im Mermaid-Layout und setzt native SVG-Bilder/Text ein; PNG wird aus derselben vervollständigten SVG erzeugt. Die `.mmd` enthält dafür `inline-icon`-Kommentare und Platzhalter und muss mit dem Anwendungsrenderer verarbeitet werden; ein fremder Mermaid-Viewer zeigt nur die Platzhalter. Reine Textgraphen behalten die bisherige Ausgabe.

Original-PNGs **gemeinsam mit Metadaten** unter `assets/recipe-icons/` versionieren. Kleine Anzeigebilder sind entbehrlich: `icons.displayCacheDirectory` ist standardmäßig `backend/.cache/recipe-icons`, relativ zur Config. Cache und Originalbibliothek dürfen sich nicht überlappen. Schlüssel enthalten Original-SHA-256, Regelversion, Puppeteer-Version sowie Plattform/Architektur (mitgelieferten Browser verwenden; bei eigener Browserüberschreibung Cache löschen). Unveränderte Eingaben verwenden geprüfte PNGs über Knoten und Läufe hinweg wieder. Geänderte Originale/Regeln erhalten neue Schlüssel; gelöschte/defekte Einträge werden offline ohne KI neu erzeugt. Schreibfehler erlauben weiter die Anzeige aus dem Arbeitsspeicher. Alte Schlüssel werden nicht automatisch bereinigt; diesen Cache darfst du löschen.

Demand wird je Lauf aus Rezeptanfragen und brauchbaren Originalpaketen neu berechnet, nicht allein aus Bildern oder Derivaten. `backend/outputs/icon-demand.json` und der Standardcache sind bereits Git-ignoriert. Eigene Cache-/Berichtspfade ebenfalls ausschließen und außerhalb der Originalbibliothek halten. Kein automatischer Commit oder Import früherer Live-Testbilder.

[English](recipe_icons_en.md) · [Übersicht](../README.md)

## Schnellstart und Modi

Ohne `icons` bleibt alles ausgeschaltet. Beispiel, Pfade relativ zur Config-Datei:

```json
{
  "icons": {
    "mode": "local-only",
    "libraryDirectory": "assets/recipe-icons",
    "displayCacheDirectory": "backend/.cache/recipe-icons",
    "reportPath": "backend/outputs/icon-demand.json"
  }
}
```

`off`: keine Katalogzugriffe/Generierung. `local-only`: geprüfte lokale Pakete, kein Codex-Start. `generate-missing`: ausdrücklich externe Dienste und Kontingentverbrauch erlauben; zusätzlich:

```json
"generator": {
  "backend": "codex-cli",
  "executable": "C:/pfad/zum/nativen/codex.exe",
  "termsReference": "https://openai.com/policies/terms-of-use/",
  "timeoutMs": 120000,
  "maxOutputBytes": 262144
}
```

Optional: `profile`, `agentModel`, unabhängig von Rezeptanalyse. Profilname nur Buchstaben/Ziffern/`_`/`-`. Unter Windows natives `codex.exe` verwenden, keine `.cmd`-/`.bat`-/`.ps1`-Starter. Zunächst ausschließlich geprüfte Codex-Version **0.167.0**; andere Versionen liefern Text-Fallback. Codex selbst installieren und anmelden (`codex login`); keine Zugangsdatenkopien, kein automatisches Login, keine globale Config-Änderung. Keine direkte Bild-API nötig.

## Sicherheit, Kosten und Offline

Der Adapter erzwingt zusätzlich `--sandbox read-only`: Agentenbefehle benötigen keine Schreibrechte, da unsere Anwendung das Cachebild kopiert. Diese strengere Grenze ersetzt die Sandboxauswahl eines Profils; Staging-Schreibzugriffe erfolgen durch unsere Anwendung, nicht Agentenbefehle.

- Maximal eine begrenzte Codex-**Sitzung** je Motiv/Lauf, sequenziell, gleiche gleichzeitige Anfragen zusammengefasst. Keine Wiederholung durch unsere Anwendung. Codex kann intern mehrere kostenpflichtige Anfragen stellen; keine Geld- oder Einzelanfragegarantie.
- Windows: explizites MXC-Berechtigungsprofil für Agentenbefehle mit Schreibrechten nur in Staging. Interne Codex-Bildablage im normalen Cache wird ausdrücklich vertraut und läuft außerhalb dieser Befehls-Sandbox. Keine Behauptung vollständiger technischer Isolation des Clients. Fehlende Sandbox/Anmeldung/Bildfähigkeit führt zu Text-Fallback.
- Benutzerconfig/Exec-Regeln werden ignoriert, Sitzung temporär, Sicherheitswerte explizit gesetzt. Nur vertrauenswürdige Profile verwenden. Promptverbote für Shell/MCP/direkte APIs sind Hinweise, keine universelle Werkzeugsicherheitsgrenze. Für strengere Isolation eine gesonderte vertrauenswürdige Codex-Umgebung verwenden.
- Strukturierte JSON-Sitzungskennung, frischer exklusiv reservierter Sitzungsordner und kooperative Cache-Sperre. Genau ein reguläres PNG, maximal 32 Einträge; keine Suche nach neuesten Dateien. Links/Junctions/Hardlinks und erkannter Dateiaustausch werden abgelehnt. Kein Schutz gegen feindliche lokale Parallelprozesse. **Einzel-Schreiber-Betrieb**, auch gegenüber anderen Codex-Sitzungen; verwaiste `.rezept-graph-writer.lock` manuell untersuchen statt automatisch entfernen.
- Zeitlimit 1–600000 ms, Prozessausgabe 1–1048576 Byte; Sitzungsparser zusätzlich 256 KiB gesamt/16 KiB je Zeile. Prozessbaumbeendigung bei Abbruch/Zeitüberschreitung. Keine rohen Provider-stderr-Ausgaben in Berichten.
- PNG: maximal 4 MiB/4096 Pixel je Achse; unterstützte nichtverschachtelte 8-/16-Bit-Grau/RGB/Grau-Alpha/RGBA. CRC, begrenzte Dekompression und Filterbytes prüfen; indizierte/interlaced Bilder werden nicht ungeprüft akzeptiert.
- Offline-Chromium erzeugt proportionales Anzeigederivat bis 96 Pixel/8 KiB, nötigenfalls 64/48 Pixel. Original unverändert. Gesamter Mermaid-Text maximal 48000 UTF-16-Zeichen, weitere Icons deterministisch weglassen, Text erhalten. Fehlerkarten trotz Exit 0 bleiben fatal. Browserupdates können die Bildkodierung ändern; Determinismus bei festem Runtime/Input getestet.

HTML-Cachemodus `offline` ist kein globaler Netzschalter. Vollständig offline erfordert Icons aus/lokal und erfüllte Cache-Voraussetzungen für Analyse/Planung.

## Pakete, Git und Reparatur

Standard: `assets/recipe-icons/ingredients/egg/image.png` plus `metadata.json`; Prozesse `processes/oven`, `pot`, `pan`. Relative Pfade, SHA-256, Abmessungen, Prompt/Stil, Backend/CLI, angefragter Agent, Zeitpunkt und Nutzungsbedingungenreferenz dokumentieren. Tatsächliches Bildmodell bleibt ohne überprüfbare Meldung `null`; nie mit Agentenmodell gleichsetzen. Herkunft ist keine Rechtegarantie oder menschliche Freigabe.

PNG und Metadaten gemeinsam committen, wenn das Aussehen erhalten bleiben soll. Metadatenklone ohne Bild sind Cache-Lücken: lokal melden, im Generierungsmodus reparieren. Gültige Bilder nach Promptänderungen weiterverwenden. Löschen erlaubt Neugenerierung, nicht identische Wiederherstellung. Manuelle Änderungen mit falscher Prüfsumme bleiben erhalten; Ersatz unter `revisions/r000001/` usw. Direkter gültiger Ordner hat Vorrang, dann lexikografische gültige Revisionen. Manuelle Bilder benötigen technisch konsistente Metadaten/Prüfsumme; keine Freigabeoberfläche. Codex-Cacheoriginale bleiben liegen.

Temporäre Veröffentlichung auf demselben Dateisystem, Bild zuerst und Metadaten zuletzt. Unterbrochene Pakete gelten als fehlend; nur eigene Staging-Dateien bereinigen, fremde Dateien erhalten. Keine mehreren Katalogschreiber.

## Motive und Fehler

### Optionale semantische Erkennung und Mengenvarianten

Beide Neuerungen sind standardmäßig deaktiviert. Unter `icons` optional ergänzen (Beispielwerte anpassen):

```json
"presentation": true,
"interpretation": {
  "enabled": true,
  "baseUrl": "http://localhost:1234/v1",
  "model": "your-small-model",
  "apiKeyEnv": "ICON_LLM_API_KEY",
  "timeoutMs": 10000,
  "maxOutputBytes": 4096,
  "cacheDirectory": "backend/.cache/ingredient-interpretation"
}
```

`presentation` aktiviert Mengen-/Alternativdarstellung. `interpretation` aktiviert unabhängig davon die Ergänzung ungelöster Formulierungen durch ein separat konfiguriertes OpenAI-kompatibles Modell; kein automatischer Rückgriff auf das Analysemodell. Ohne Interpretation gelten die bisherigen Regeln. Ohne presentation kann eine erkannte Einzelzutat ihr Grundmotiv erhalten; Alternativen bleiben Text.

- Regeln zuerst; nur ungelöste Formulierungen gehen an das Modell. Kuratierte Identitäten: Ei, Apfel, Butter, Margarine, Zucker, Mehl, Salz. Unbekanntes, Mischungen, Verneinungen und ungültige Antworten bleiben Text. Keine allgemeine Zutatenontologie und keine Garantie korrekter Modellinterpretation.
- Zutaten-/Knoten-IDs sind nicht verknüpft. Ausschließlich Knotentext verwenden, keine Menge aus geratenen Zuordnungen übernehmen. Rezeptdaten und Beschriftungen bleiben unverändert.
- off: keine Interpretation. local-only: Regeln und bei Aktivierung vorhandene validierte Interpretationen, **keine semantischen Netzaufrufe**. Nur generate-missing kann bei expliziter Interpretation neue Modellanfragen stellen.
- Eine Anfrage je unterschiedlicher Eingabe/Lauf, auch Fehler werden im Lauf nicht wiederholt. Zeitlimit 1–60000 ms, Inhaltslimit 1–65536 Byte; HTTP-Antwortlimit zusätzlich 4096 Byte für Protokollhülle. Cacheversion umfasst Prompt/Schema, Originaleingabe, Endpoint, Modell und Namen der Schlüsselvariable, niemals deren Geheimnis. Cache extern zur Bildbibliothek; Standardcache Git-ignoriert und löschbar.
- Ein Ei nutzt das Grundmotiv; zwei bis fünf Eier erlauben ausschließlich angefragte Gruppenbilder `egg-count-2` bis `egg-count-5`. Darüber Grundmotiv plus lokal gesetzte genaue Zahl. Fehlt eine Gruppenvariante, Grundmotiv plus Zahl; fehlt auch dieses, Text. Keine unangefragten Varianten. Gewichte, Brüche und fehlende Stückzahlen bleiben im Text, ohne erfundene Zählung.
- Butter/Margarine-Alternative wird bei validierter Interpretation lokal mit „oder“ zusammengesetzt; kein neues KI-Alternativbild. Fehlt eine Komponente, vollständiger Text statt einer irreführenden Einzelauswahl. Badges/Kompositionen sind löschbare Derivate mit versions-, mengen- und komponentenabhängigen Cacheidentitäten.

Fehler bleiben nichtfatal; bestehende Generatorgrenzen und Darstellungsbudgets gelten weiter. Neues Verhalten ist in der lokalen Config **nicht automatisch aktiviert**. Modellqualität und visuelle Nutzbarkeit sind noch offen: [Offline-Versuch und separate Live-Freigabe](ingredient_icon_trial_de.md).

### Unterstützte reale Beschriftungen

Die Motivauflösung berücksichtigt jetzt führende positive Mengen (Ganzzahlen, Dezimalzahlen mit Punkt/Komma, Brüche wie `1/2`, `½` und `1 1/2`) und optional die Einheiten `g`, `kg`, `mg`, `ml`, `l`, `TL`, `EL`, `tsp`, `tbsp`, `Stück`, `Stueck`, `piece`/`pieces`. Groß-/Kleinschreibung, Unicode und Leerraum werden normalisiert, Eingaben über 1024 Zeichen abgelehnt. Einheiten müssen durch Leerraum getrennt sein.

Gezielt unterstützte Zusätze: Eier mit `, Größe S/M/L/XL`, `Zucker für den Teig`, `Butter zum Bestreichen`, `weiche Butter`. Beispiele: `3 Eier, Größe M`, `250 g Mehl`, `1,5 kg Äpfel`, `60 g Butter zum Bestreichen`. Andere Zusätze werden nicht pauschal abgeschnitten. `Margarine oder Butter`, `Zucker oder Zimtzucker`, `Butter und Mehl`, `Ei-Ersatz`, `Apfelsaft` und unbekannte Einheiten bleiben Text.

Prozesse erkennen eigenständige Aktionswörter auch innerhalb vollständiger Texte: `backen`, `weiterbacken`, `vorheizen`, `bake`, `baking`, `preheat`; `kochen`, `sieden`, `boil`, `boiling`; `braten`, `anbraten`, `fry`, `frying`. Das nichtleere `action`-Feld hat Vorrang; sonst gilt die Beschriftung. Reine Geräte-/Temperaturangaben, erkannte Verneinungen, Bedingungen/Optionalität und konkurrierende Aktionen führen zu keiner Zuordnung. Das ist eine begrenzte Regelgrammatik, kein allgemeines Sprachverständnis.

Die bereinigte Apfelkuchen-Fixture ergibt acht Icons für fünf Zutaten und drei Ofenschritte (sechs unterschiedliche Motive). Offline mit Testbildern geprüft; dies ist kein neuer Live-Generierungsnachweis und ersetzt nicht die Sicherheitsabnahme des ursprünglichen Icon-Changes.

Konservatives Startvokabular: Ei, Apfel, Butter, Zucker, Mehl, Salz; klare Back-/Koch-/Brataktionen. Ei-Ersatz ist nicht Ei, Apfelsaft nicht Apfel; IDs und Temperatur allein bestimmen kein Bild. Zwischenzustände ohne Icons. Unbekanntes bleibt Text. Stil: farbige schematische Sachillustration, klare Kontur/Silhouette, wenige Details, keine Schrift/Marken/Gesichter/Fotorealismus, bei etwa 48 Pixeln lesbar.

Bedarfsbericht außerhalb des Katalogs: fehlender Schlüssel, Grund, Anzahl und Rezeptreferenzen. Unbekannte Begriffstexte nicht in Diagnosen kopieren; Fehlergründe fest vorgegeben. Erfolgreiche Reparaturen fehlen im Bedarf. Berichts-/Speicher-/Generierungsfehler nichtfatal; Rezept-JSON/Zutatenliste unverändert. Graph-Rendererfehler bleiben fatal mit Bildpaarbereinigung; Timeline separat.

Freigegebener Ein-Ei-Probelauf erfolgreich, Neun-Motive-Kontaktbogen optional und nicht durchgeführt. Erkennbarkeit selbst prüfen; technische Prüfung ist keine ästhetische oder rechtliche Freigabe. Providerbedingungen prüfen. Lokale Docker-KI bleibt eigener späterer Change.
