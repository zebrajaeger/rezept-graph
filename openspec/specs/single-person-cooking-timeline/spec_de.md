# Kochablauf für eine Person

## Zweck

Eine ergänzende visuelle Kochanleitung zeigt einer einzelnen Person Reihenfolge,
ungefähren Zeitbedarf, passive Phasen und notwendige Eingriffe. Der vorhandene
Rezeptgraph bleibt unverändert erhalten.

## Anforderungen

Die verbindlichen Anforderungen und Prüfszenarien stehen in [spec.md](spec.md).

- Rezeptzeiten, Schätzungen und unbekannte Dauern eindeutig unterscheiden.
- Jeden Verarbeitungsschritt abdecken; Verweise, Zeitbereiche und Abhängigkeiten validieren.
- Aktive und dauerhaft beaufsichtigte Tätigkeiten für eine Person nacheinander planen;
  passive Phasen dürfen parallel laufen. Eingriffe müssen berücksichtigt werden.
- Ofen einschalten und Aufheizen getrennt vor dem Ofeneinsatz einplanen;
  tatsächliche Bereitschaft bleibt Voraussetzung.
- Relative Zeiten, Gesamtzeit bis zum benannten Endpunkt, aktive Arbeitszeit,
  Beaufsichtigungsbedarf und Wiedereinstiegspunkte verständlich anzeigen.
- Vier zusätzliche Timeline-Dateien neben den bestehenden fünf Ausgaben erzeugen.
- Fehler der Zusatzansicht ausdrücklich melden, ursprüngliche aktuelle Ausgaben
  erhalten und fehlerhafte beziehungsweise veraltete Timeline-Bilder gezielt entfernen.
