## Kontext

Die aktuelle Motivgrammatik liefert Grundmotive. Die Rezeptanalyse kennt bereits Name, Menge, Einheit, Vorbereitung und Originaltext; Zutaten- und Knoten-IDs dürfen aber nicht gleichgesetzt werden. Die bestehende Bildbibliothek und ihre offenen Sicherheitsabnahmen bleiben eigenständig.

## Ziele / Nicht-Ziele

**Ziele:** Zutaten zuerst erkennen, Alternativen erhalten, Mengenvarianten begrenzen und die Lesbarkeit in echter Graphgröße erproben.

**Nicht-Ziele:** freie LLM-Bildprompts, allgemeine Lebensmittelontologie, automatische visuelle Freigabe, geänderte Rezeptfakten oder vorsorglich erzeugte Bildkataloge.

## Entscheidungen

### Ergänzung: bestehende Knotenformen erhalten

Icons ergänzen native Knoten innen links, Text steht rechts. Die Serialisierung reserviert Beschriftungsplatz und schreibt begrenzte Bilddaten-Kommentare; der Anwendungsrenderer vervollständigt die native SVG und rasterisiert sie ohne foreignObject. Fremde Mermaid-Viewer interpretieren diese Kommentare nicht und zeigen Platzhalter; SVG/PNG bleiben portabel. Reine Textgraphen bleiben unverändert. Impact-Abfragen für renderNode/renderMermaid/renderGraphImages lieferten UNKNOWN wegen fehlender Indexsymbole, keine Entwarnung; Offline-Regression deckt Writer, Budgetierung und echte SVG/PNG ab. 156 Tests inklusive Typprüfung/Build erfolgreich. Gespeicherter Apfelkuchen lokal neu gerendert und visuell geprüft; keine Provideraufrufe.

### Ergänzung nach Nutzerfeedback: kulinarischer Zustand

Der Nutzer bestätigt das ungeeignete gekochte halbe Ei. Zustand und Darstellungsform getrennt halten: roh/ganz mit Schale, gekocht, gebraten. Zustand gehört in validierte Beschreibung, kanonische Bildidentität, Gruppenauswahl und Derivatcache. Künftige rohe Schlüssel: `egg-raw` und `egg-raw-count-N`, daneben eigene gekochte/gebratene Identitäten. Alte `egg`-Pakete nicht still migrieren. Dafür sind weitere Tests und Implementierung nötig; allgemeine Zustandserkennung ist noch nicht umgesetzt. Keine weiteren Bildsitzungen freigegeben. Die unmittelbare lokale Rezeptvorschau nutzt ausschließlich gesichtete passende Bilder, die bestehende Dreiergruppe nur für genau drei rohe ganze Eier. Das gekochte Grundmotiv bleibt ausgeschlossen. Die Vorschau arbeitet mit explizit geprüften Beschreibungen, nicht mit einer bereits vollständig live ausgeführten semantischen Pipeline.

1. **Bedeutung von Darstellung trennen:** Validierte interne Beschreibung mit Einzelzutat oder Alternative, kanonischen Identitäten, optionaler genauer Menge/Einheit und unterstützten Zusätzen. Keine Änderung der Rezeptdaten. Strukturierte Zutatenfelder nur bei nachgewiesener Knotenzuordnung nutzen, sonst den begrenzten Original-Knotentext interpretieren. Bei Konflikten keine Zuordnung.
2. **Regeln zuerst, optionales kleines LLM als Ergänzung:** Bestehende Erkennung wiederverwenden. Ungelöste Formulierungen können nach expliziter Aktivierung über die vorhandene OpenAI-kompatible Schnittstelle interpretiert werden. Separates Modell, Zeit-/Größenlimits, strikte Validierung, versionierter Cache, Deduplizierung und höchstens ein Anwendungsversuch pro unterschiedlicher Eingabe/Lauf. Modellkonfidenz allein reicht nicht. Zunächst kuratierte Identitäten einschließlich Margarine; Unbekanntes bleibt Text.
3. **Keine versteckten Netzaufrufe:** off umgeht die Funktion. local-only nutzt Regeln und validierte vorhandene Interpretationscaches, aber keinen semantischen Provider. Cacheidentität berücksichtigt Eingabe/Kontext, Schema, Prompt und Modellkonfiguration ohne Geheimnisse. Ohne semantische Aktivierung bleibt die bisherige Auflösung erhalten.
4. **Darstellungsregeln gehören der Anwendung:** Ei-Grundidentität bleibt mengenunabhängig. Ein Ei verwendet das Grundmotiv, zwei bis fünf Eier können separate endliche Gruppenvarianten verwenden. Nur fehlende angefragte Varianten erzeugen. Darüber immer Grundmotiv plus genaue Renderer-Zahl, niemals ein Mengenbild generieren. Fehlende/fehlgeschlagene Gruppenbilder fallen auf Grundmotiv plus Zahl oder Text zurück. Ohne genaue positive ganzzahlige Stückzahl keine Anzahl erfinden oder runden. Andere Zutaten bleiben zunächst Grundmotive.
5. **Alternativen lokal zusammensetzen:** Butter und Margarine einzeln auflösen, Identitäten für stabile Wiederverwendung sortieren und mit Renderer-Text „oder“ kombinieren. Keine KI-Schrift und kein separat generiertes Alternativbild. Fehlt ein Teil oder ist die Darstellung unlesbar, vollständigen Text behalten statt eine Auswahl zu unterschlagen. Mischungen bleiben zunächst ununterstützt.
6. **Bibliotheksgrenzen erhalten:** Grund-/Gruppenbilder durchlaufen bestehende Paket-, Herkunfts- und Integritätsprüfung. Derivatcache berücksichtigt Komponentenprüfsummen, Menge/Relation, Layoutversion und Laufzeit. Overlays sind keine KI-Originale. Größen-/Byte-/Mermaid-Limits, Beschriftungen, Rezept-JSON und Timeline bleiben erhalten.
7. **Begrenzter visueller Versuch:** Kontaktbogen und Graphauszug mit Butter, Margarine, deren Alternative, drei und sechs Eiern. Zuerst offline mit lokalen/injizierten Bildern prüfen. Vor einem Live-Versuch fehlende Motive und maximale neue Generatorsitzungen einzeln freigeben lassen; keine automatischen Wiederholungen. Sechs Eier verwenden das Grundmotiv, die Alternative wird nur zusammengesetzt. Gemeinsam in echter Graphgröße und vergrößert prüfen: Zutatenerkennung, „oder“-Bedeutung, richtige Anzahl und lesbares Badge. PNG-Prüfung allein zählt keine Eier.

## Risiken / Abwägungen

- LLM-Verwechslung → kuratierte Identitäten, strikte Struktur, Negativtests, vorsichtiger Fallback und unveränderte Rezeptfakten.
- Falsche Zutaten-Knoten-Zuordnung → Zuordnung belegen oder Original-Knotentext verwenden.
- Ähnliche Butter-/Margarinemotive und winziges „oder“ → echte Anzeigegröße prüfen und mit Nutzerfeedback überarbeiten.
- Falsche Anzahl im Gruppenbild → menschliche Prüfung; bei Ablehnung Grundmotiv plus Zahl.
- Mehr Netz-/Kostenverbrauch → explizite Aktivierung, Cache, endliche Varianten und separate Live-Freigabe. Eine Codex-Sitzung garantiert nicht genau eine kostenpflichtige interne Bildanfrage.
- Cache-/Rendererregression → alle Darstellungsparameter im Cache, portable Offline-SVG/PNG-Tests und bestehende Limits.

## Einführung und Rückweg

Optionale Konfiguration ergänzt alte Defaults. Testgetrieben umsetzen, Regressionen und Offline-Vorschauen prüfen, Live-Sitzungen separat freigeben lassen. Grundbilder bleiben gültig; Abschalten genügt als Rückweg ohne Löschen. Betriebsdokumentation und next_step.md aktualisieren. Vor Symboländerungen GitNexus-Impact, vor Commit detect_changes; unvollständigen Index nicht als Sicherheitsnachweis behandeln.

## Offene Fragen

- Geeignetes kleines Modell anhand fester Testfälle und gegebenenfalls separat freigegebener Live-Auswertung auswählen.
- Lesbarkeit der Alternative und Gruppenbilder entscheidet der visuelle Versuch.
- Konfiguration: `icons.presentation: true` und `icons.interpretation: { enabled: true, baseUrl, model, apiKeyEnv, timeoutMs, maxOutputBytes, cacheDirectory }`; beides standardmäßig aus. Im Schema fehlt eine explizite Zutaten-Knoten-Verknüpfung. Daher ausschließlich Knotentext verwenden und keine strukturierte Zutatenmenge übernehmen. Der Workflow erstellt den Provider; Icons erhalten nur die injizierte Completion-Fähigkeit. Das erhält die Modulgrenzen. Der gemeinsame Client unterstützt optional ein gestreamtes Antwort-Byte-Limit; alte Aufrufer bleiben unverändert.

## Umsetzungsnachweise

- Zustandsergänzung testgetrieben abgeschlossen: `state` wird anhand einer begrenzten Originaltext-Grammatik validiert. Eigene rohe/gekochte/gebratene Schlüssel, Gruppen und Fallbacks, eindeutige Darstellungsprompts und neue semantische/Derivat-Cacheversion. Fehlende/ununterstützte Zustände bleiben Text; Altpakete werden nie automatisch migriert. Zustandsspezifische Auswahl gilt auch bei Interpretation ohne Mengendarstellung. Abschließend 159 Tests erfolgreich, inklusive unverändertem Altverhalten. Keine zusätzlichen Live-Bildanfragen. Nutzer akzeptiert Innen-links-Layout vorläufig und verlangt Abschluss der Zustandsarbeit vor Archivierung.

- Semantik-/Konfigurations- und Darstellungstests schlugen vor Anlage der Module zunächst in der Typprüfung fehl. Aktuell bestehen 155 Offline-Tests einschließlich Typprüfung/Build und unveränderter Apfelkuchenabnahme.
- GitNexus neu indexiert: normalizeIcons LOW, direkte Aufrufer validateConfig/normalizeConfig; LlmConfig MEDIUM mit sieben direkten Verwendungen; createOpenAiCompatibleClient LOW. analyzeUrls nur teilweise mit LOW abgedeckt. Einige Iconsymbole fehlen weiterhin: UNKNOWN statt Entwarnung. Dateiprüfung belegt den Weg über analyzeUrls zur Ausgabe; vollständige Regression bleibt erforderlich.
- Kontaktbogen und echter SVG-/PNG-Graph nutzen ausdrücklich gekennzeichnete lokale Zeichnungen, keine KI-Ergebnisse. Nutzerabnahme und etwaige Live-Bildsitzungen bleiben offen.
