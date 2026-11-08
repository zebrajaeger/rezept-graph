## Anforderungen in deutscher Sprache

Die verbindlichen, automatisiert prüfbaren Anforderungen und Szenarien stehen in [spec.md](spec.md). Diese Begleitdatei fasst denselben Umfang auf Deutsch zusammen.

1. **Zeitangaben mit Herkunft:** Jeder Wert stammt nachweislich aus dem Rezept oder ist als Schätzung mit Begründung markiert. Unbekannte Zeiten bleiben unbekannt; Garzeiten und Zielzustände werden nicht zur Planoptimierung verändert.
2. **Vollständige und gültige Daten:** Jeder Verarbeitungsschritt wird berücksichtigt. Ungültige Verweise, fehlende Schritte, unzulässige Dauerbereiche und zyklische Abhängigkeiten führen zu einem klaren Fehler.
3. **Eine Person:** Aktive und dauerhaft zu beaufsichtigende Tätigkeiten überschneiden sich nicht. Passive Phasen können parallel laufen. Eingriffe und Kontrollen erhalten eigene Aufmerksamkeit; alle Voraussetzungen bleiben erfüllt.
4. **Rechtzeitiges Vorheizen:** Einschalten und Aufheizen werden getrennt geplant. Wenn Vorbereitung und Aufheizen nicht passend überlappen können, wird Wartezeit sichtbar. Tatsächliche Ofenbereitschaft bleibt notwendig.
5. **Mit einem Blick verständlich:** Getrennte Darstellung von eigenen Handgriffen und passiven Vorgängen, relative Zeiten, Gesamtdauer beziehungsweise Zeitbereich, aktive Arbeitszeit, Beaufsichtigungsbedarf und deutliche Wiedereinstiegspunkte. Kurze Anweisungen enthalten relevante Mengen, Temperaturen und Zielzustände. Der Endpunkt der Gesamtdauer und gegebenenfalls fehlende Abkühlzeiten sind benannt.
6. **Ergänzende Ausgaben:** Vier Timeline-Dateien neben den bisherigen fünf Dateien, mit gemeinsamem Rezeptstamm und demselben Ausgabeverzeichnis. Das Ausblenden von Zwischenzuständen im Graphen verändert keine notwendigen Kochschritte.
7. **Begrenzte Fehlerfolgen:** Die bisherigen Ausgaben werden zuerst erzeugt. Fehler der Zusatzansicht werden ausdrücklich gemeldet; aktuelle Originalausgaben bleiben erhalten. Veraltete oder unvollständige Timeline-Bilder werden gezielt entfernt, fremde Dateien bleiben unberührt.

Wichtige Prüffälle sind Hefeteig mit paralleler Belagvorbereitung, ständig zu rührende Schritte, rechtzeitiges Vorheizen, der Eingriff nach 45 Minuten Backzeit, unbekannte Dauern und reproduzierbare Ergebnisse aus denselben Planungsdaten.
