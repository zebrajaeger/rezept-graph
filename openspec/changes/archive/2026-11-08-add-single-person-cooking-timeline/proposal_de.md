## Warum

Der bestehende Rezeptgraph erklärt Zutaten und Abhängigkeiten, aber weder Zeitbedarf noch eine sinnvolle Arbeitsreihenfolge für eine Person. Eine zusätzliche visuelle Kochansicht soll ohne wiederholtes Lesen des Rezepttexts zeigen, was wann zu tun ist und welche Vorgänge nebenher laufen.

## Geplante Ergänzung

- Bestehenden Graphen und seine fünf Ausgaben behalten.
- Einen ungefähren Ablauf für genau eine Person ergänzen: aktive Arbeiten nacheinander, passive Phasen möglichst parallel.
- Gesamtzeit, aktive Arbeitszeit, relative Startzeiten und Wiedereinstiegspunkte sichtbar machen.
- Fehlende Dauern schätzen; Schätzungen und Angaben aus dem Rezept eindeutig unterscheiden. Der Ablauf ist ausdrücklich ein Planungsvorschlag.
- Kurze, konkrete Handlungsanweisungen mit relevanten Mengen, Temperaturen und Zielzuständen anzeigen.
- Vorheizen rechtzeitig einplanen; tatsächliche Ofenbereitschaft bleibt Voraussetzung.
- Zusätzliche Dateien für Planung, Mermaid, SVG und PNG erzeugen.

## Abgrenzung

Keine Mehrpersonenplanung, Geräteverwaltung, Live-Timer oder mathematisch optimale Planung. Die Ansicht soll eine einfache Kochhilfe bleiben.

## Technischer Umfang

Neue Capability `single-person-cooking-timeline`. Ein eigener Planungsschritt ergänzt validierte Zeit- und Aufmerksamkeitsinformationen, ohne das bestehende Rezeptformat zu ersetzen. Bestehende Analyse-Caches bleiben verwendbar. Details stehen in [design_de.md](design_de.md), die verbindlichen Anforderungen in [specs/single-person-cooking-timeline/spec.md](specs/single-person-cooking-timeline/spec.md).
