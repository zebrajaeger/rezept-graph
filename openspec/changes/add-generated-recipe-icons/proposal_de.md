## Warum

Wiedererkennbare Bilder für häufige Zutaten und Verarbeitungsschritte erleichtern das schnelle Erfassen eines Rezeptgraphen. Eine lokal wiederverwendbare Sammlung KI-generierter Motive ermöglicht einen einheitlichen Stil, ohne für jedes Bild eine andere externe Quelle zu verwenden. Nutzungsbedingungen und Herkunft müssen trotzdem dokumentiert werden.

Die kanonische OpenSpec-Datei ist [proposal.md](proposal.md); diese Datei ist die deutsche Übersetzung.

## Änderungen

- Eigene Bildkomponente: Zutaten und Verarbeitungsschritte werden stabilen Motivkennungen zugeordnet. Ergebnis ist ein verwendbares lokales Bild oder eine ausdrückliche Nichtverfügbarkeit.
- Drei Config-Modi: ausgeschaltet, nur lokale Bilder und automatische Generierung fehlender Bilder. Bestehende Konfigurationen bleiben gültig und lösen keine Bildgenerierung aus.
- Codex-Kommandozeilenagent als erster Generator und versionierter Stilprompt: farbige, schematische Sachillustrationen, kräftige Konturen, wenige Details und Erkennbarkeit bei kleiner Darstellung. Nichtinteraktive Erzeugung echter Bilddateien vor Integration nachweisen.
- Git-taugliche Motivpakete aus Bild und Metadaten in einem konfigurierbaren Verzeichnis. Herkunft und hinterlegte Nutzungsbedingungen werden ohne Zugangsdaten dokumentiert.
- Nicht nur Metadaten prüfen, sondern die Bilddatei selbst. Fehlende oder unbrauchbare Bilder je nach Modus nachgenerieren oder den Knoten ohne Bild ausgeben; offenen Bedarf festhalten.
- Bilder ergänzen Zutaten- und Prozessknoten, ohne Text, Rezeptdaten, Verbindungen oder vorhandene Ausführungshinweise zu ersetzen. SVG und PNG bleiben eigenständig verwendbar.
- Bildbeschaffungsfehler sind nicht fatal; Fehler des eigentlichen Graph-Renderers bleiben dagegen fatal.
- Nicht enthalten: externe Bildsuche, eigener Server, Verwaltungsoberfläche, verpflichtende manuelle Freigabe, automatische visuelle Bewertung, vollständige Zutatenabdeckung und Bilder für Zwischenzustände. Eine lokale Bild-KI in Docker oder ähnlicher Laufzeit bleibt einem eigenen späteren Change vorbehalten; hier wird dafür kein Backend oder Container gebaut.

## Fähigkeiten

### Neu

- `recipe-icon-library`: Motivzuordnung, konfigurierbare Generierung, dauerhafte Wiederverwendung, Herkunftsnachweise, Reparatur fehlender Dateien und Bedarfsbericht.

### Geändert

- `recipe-graph-visualization`: optionale Illustrationen für Zutaten und Prozesse, weiterhin vollständige Beschriftungen, portable Bildausgaben und deterministische Wiederverwendung bei festen Bildbeständen.

## Auswirkungen

- Integration in Konfiguration, Beispiele, Ablaufzusammenstellung, Darstellungsanreicherung, Mermaid-Ausgabe, Rendering und Ausgabeschreiben.
- Abgegrenztes Bildmodul mit austauschbarer Generator-Schnittstelle und zunächst einem Codex-CLI-Prozessadapter; keine Änderung am Rezeptanalyseschema oder Rezept-JSON vorgesehen.
- Separat installiertes und authentifiziertes Codex mit nachgewiesener Bildgenerierung erforderlich. Generierung kann externe Dienste und Kosten verursachen. Anmeldung bleibt bei Codex, nicht in Bildmetadaten. KI-Bilder sind nicht automatisch rechtlich unbedenklich; die Nutzungsbedingungen sind ausdrücklich zu dokumentieren.
- Tests vor Implementierung, GitNexus-Auswirkungsanalyse vor Änderungen bestehender Symbole, lokale Testbilder und echter Offline-Renderingtest. Betriebsdokumentation auf Deutsch und Englisch.
- Gemeinsame Integrationsstellen mit `add-single-person-cooking-timeline` abstimmen, ohne dessen Umfang oder vorhandene Änderungen zu überschreiben.
