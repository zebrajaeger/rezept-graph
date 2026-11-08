## Ausgangslage und Ziel

Die vorhandenen Rezeptdaten enthalten optionale Zeitangaben als Text. Der Graph beschreibt Abhängigkeiten, aber keinen Zeitplan. Ergänzt wird eine einfache Kochansicht für eine Person. Bestehende Rezeptdaten, Caches und Graph-Ausgaben bleiben erhalten.

## Entwurfsentscheidungen

1. **Eigene Planungsdaten:** Ein zusätzlicher, gecachter LLM-Schritt ergänzt Dauerbereiche, Herkunft der Zeiten, Aufmerksamkeitsbedarf und Abhängigkeiten. Er erhält sowohl Rezepttext als auch vorhandene Analyse. Die vorhandene `RecipeAnalysis` bleibt unverändert. Planung und berechneter Ablauf landen in `.timeline.json`.
2. **Nachvollziehbare Planung:** Ein deterministischer Planer berechnet relative Zeiten. Aktive und dauerhaft zu beaufsichtigende Arbeiten teilen sich eine Aufmerksamkeitsspur; unbeaufsichtigte Phasen können parallel laufen. Notwendige Eingriffe und Kontrollen werden ausdrücklich berücksichtigt.
3. **Ehrliche Unsicherheit:** Rezeptangaben und Schätzungen sind getrennt markiert. Nicht sinnvoll schätzbare Zeiten bleiben unbekannt; dann wird keine vollständige Gesamtdauer behauptet. Garzeiten werden nicht zur Optimierung verkürzt. Zielzustände und Sicherheitshinweise bleiben erhalten.
4. **Vorheizen:** Einschalten ist ein kurzer Handgriff, Aufheizen eine passive Phase. Der Start wird möglichst passend vor dem ersten Ofeneinsatz eingeplant. Reicht die Zeit nicht, entsteht sichtbare Wartezeit. Tatsächliche Ofenbereitschaft bleibt Voraussetzung.
5. **Vertraute Darstellung:** Exakte Farben, Formen, Schrift und Linien des bisherigen Rezeptgraphen wiederverwenden. Chronologische Zeilen statt großer farbiger Bereiche; gleichzeitig beginnende Schritte stehen nebeneinander. „Du machst“ und „Läuft nebenher“ bleiben als kurze Hinweise am Schritt erhalten. Gesamtzeit als schlichte Überschrift, keine zusätzliche Zusammenfassung als Knoten und kein zweites Abhängigkeitsnetz. Zeilen sind nicht zeitlich maßstabsgetreu. Diese Korrektur folgt auf die visuelle Nutzerprüfung.
6. **Zusätzliche Ausgaben:** `.timeline.json`, `.timeline.mmd`, `.timeline.svg` und `.timeline.png` neben den bisherigen fünf Dateien. Dieselben lokalen Render-Voraussetzungen werden wiederverwendet.
7. **Fehler klar begrenzen:** Bestehende Ausgaben werden zuerst erzeugt. Scheitert nur die zusätzliche Planung/Ansicht, bleibt der aktuelle Graph erhalten; der Befehl meldet dennoch einen Fehler. Veraltete oder teilweise erzeugte Timeline-Bilder dürfen nicht als aktuell stehen bleiben.

## Grenzen und Risiken

- Keine Mehrpersonenplanung, Geräteverwaltung, Live-Timer oder optimale Küchenauslastung.
- Zeitbereiche sind ungefähre Planungswerte, keine Zusage. Aktive Arbeitszeit und notwendige Beaufsichtigung werden getrennt kenntlich gemacht.
- Zusätzlicher LLM-Aufwand wird gecacht. Reihenfolge und Zeitslots berechnet der Planer, nicht das LLM.
- Lesbarkeit anhand von Hefeteig und dem vorhandenen Apfelkuchen prüfen; nicht vorab zahlreiche Layoutoptionen bauen.

## Umsetzungsvorgehen

Tests vor Implementierung; vor Änderungen bestehender Symbole die vorgeschriebene Auswirkungsanalyse durchführen. Erst Datenmodell und Validierung, dann Planung, Darstellung und CLI-Integration. Anwendungscode wird erst nach ausdrücklichem Start der Umsetzung geändert. Ausführliche technische Begründung: [design.md](design.md).
