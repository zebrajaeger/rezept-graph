# Aufgabenübersicht

Die nachverfolgte Checkliste steht in [tasks.md](tasks.md). Diese Übersetzung erzeugt keine zweite Fortschrittsliste. Implementierung erst nach Verlassen des Erkundungsmodus; vor Änderungen bestehender Symbole GitNexus-Auswirkungsanalyse mit Bericht, bei hohem Risiko ausdrücklich warnen. Immer zuerst fehlschlagende Tests, dann Implementierung.

## 1. Machbarkeit und Grenzen

1.1 Vorhandene Änderungen und Timeline-Change prüfen, gemeinsame Stellen identifizieren und fremde Arbeit erhalten.

1.2 Mit lokalem PNG echten Offline-Renderingtest für sichtbare Bilder und Text in SVG/PNG erstellen. Ausgaben ohne Bibliothekszugriff testen. Falls keine portable Mermaid-Lösung möglich ist, Design vor Integration anpassen.

1.3 Austauschbare Schnittstelle und sichere Cache-Übernahme nachweisen. Interne Codex-Cache-Schreibzugriffe ausdrücklich von eingeschränkten Agentenbefehlen trennen. Zuerst `exec` mit strukturierter Sitzungskennung und exklusivem frischem Sitzungsordner prüfen, App-Server nur falls nötig. Simulierte Prozesse testen null/ein/mehrere PNGs, begrenzte Auflistung, Pfade/Links/Junctions/Hardlinks/Austauschrennen, Originalerhalt sowie fehlende CLI/Anmeldung/Fähigkeit, Textantworten, Windows-Aufruf, Prozessbaum und Geheimnisschutz. Technisches Bildaufrufbudget klären. Benutzer-Screenshot belegt gemeldete Generierung, nicht sichere Übernahme. Weitere echte Generierung nur nach ausdrücklicher Zustimmung; ohne Vertrag Integration stoppen.

## 2. Konfiguration und Motive

Akzeptierte Präzisierung für 1.3/3.4: „ein Versuch“ bezeichnet höchstens eine begrenzte Codex-Sitzung je Motiv und Programmlauf, ohne automatische Anwendungswiederholungen. Keine Garantie für nur eine interne Bildanfrage oder einen festen Geldbetrag; Sitzungsgrenze testen und dokumentieren. Der frühere Auftrag zur technischen Einzelaufrufbegrenzung ist dadurch ersetzt.

2.1 Modi, Standard ohne Icons, relative Pfade, Codex-Programmpfad/Profil/optionales Agentenmodell, endliche Limits, externe Codex-Anmeldung und Fehler testen, danach implementieren. Keine direkte Bild-API verpflichtend machen oder globale Codex-Einstellungen ändern.

2.2 Motivauflösung testen und implementieren: Ei/Eier, häufige Zutaten, klare Kochaktionen, mehrdeutige Komposita, unabhängige IDs, Temperatur allein, Zwischenzustände und sichere Pfade.

2.3 Stilprompt, abgegrenzte Motivbeschreibung und Versionierung zuerst testen, danach bauen.

## 3. Ablage und Beschaffung

3.1 Wiederverwendung und Umzug, geänderte Prompts, Metadaten ohne Bild, fehlende/defekte Metadaten, defekte/zu große Bilder, Prüfsummen und unverwaltete Dateien testen. Begrenzte PNG-Prüfung und sichere Ablage umsetzen; konkrete Grenzen dokumentieren.

3.2 Unterbrochene Veröffentlichung, Benutzerdateien, neue Revisionen und deterministische Auswahl testen; sichere Veröffentlichung mit Metadaten zuletzt bauen.

3.3 Adapter gegen 1.3 umsetzen: eingeschränkte Agentenbefehle, explizit vertrauenswürdige interne Cache-Ablage, sicherer Aufruf, begrenzte Diagnosen und Prozessbaumbeendigung. Anwendung prüft das eindeutig sitzungszugeordnete PNG und kopiert es ins feste Staging-Ziel; Originale erhalten und mehrdeutige/externe Kandidaten ablehnen. Backend/CLI und Agentenmodell vom bestätigten Bildmodell trennen; unbekannt markieren. Kein stiller Generatorwechsel.

3.4 Einmalige Generierung und sofortige Nutzung, spätere Wiederverwendung, Reparatur, lokaler Modus, parallele gleiche Anfragen und maximal ein Versuch je Motiv/Lauf testen; Ablauf implementieren.

3.5 Nichtfatale Provider-/Speicherfehler, Bedarfsbericht mit Anzahl und Rezeptreferenz, erfolgreiche Reparaturen, Berichtswarnungen und Geheimnisschutz testen und umsetzen.

## 4. Graphintegration

4.1 Ein Bild je geeignetem Knoten, unveränderte Rezeptdaten/Zutatenliste, vollständige Texte/Ausführungshinweise/Verbindungen und bisheriges Verhalten ohne Icons testen. Asynchrone Beschaffung außerhalb der reinen Darstellung integrieren.

4.2 Bewiesene portable Einbettung mit echten Renderingtests und Determinismus für feste Eingangsdaten umsetzen.

4.2a Offline-Tests zuerst: begrenzte PNG-Anzeigederivate mit Originalerhalt/Seitenverhältnis, ungültige/zu große Bilder ablehnen, Icons anhand des gesamten Quelltextbudgets deterministisch auswählen und Mermaid-Fehlerkarten trotz Exit 0 ablehnen. Keine globalen Grenzerhöhungen, bestehende Graph-/Timeline-Ausgaben und fatale Bereinigung erhalten.

4.3 Bildbeschaffungsfehler mit erfolgreicher Fünf-Dateien-Ausgabe sowie weiterhin fatale Rendererfehler und Bereinigung testen; Fehlergrenzen integrieren.

## 5. Dokumentation und Abnahme

5.1 Zweisprachige Dokumentation und Beispiele ergänzen: Modi, Codex-Installation/Anmeldung/Bildfähigkeit und eingeschränkte Ausführung, Limits, Stil, Herkunft/Nutzungsbedingungen, Git-Auswahl, Revisionen, Löschen/Nachgenerierung, unvollständiger Klon, Offline- und Einzel-Schreiber-Betrieb. Lokale Container-KI als späteren eigenen Change dokumentieren. README-Verweise und deutsche next_step.md aktualisieren.

5.2 Typprüfung, Build, vollständige Tests, echtes Offline-Rendering und Paketinhalt/Pfade prüfen. Neue automatische Tests benötigen weder echtes Codex noch kostenpflichtige Generierung oder Rezeptnetzwerk.

5.3 Optional nach ausdrücklicher Zustimmung mit installiertem, angemeldetem und bildfähigem Codex echter kleiner Probelauf und visueller Vergleich der neun Motive bei Zielgröße. Probleme dokumentieren, keine automatische Freigabe oder Rechtsgarantie behaupten.

5.4 OpenSpec validieren, tatsächlichen Änderungsumfang und Timeline-Verträglichkeit prüfen. Vor einem Commit GitNexus detect_changes ausführen und Commitnachricht auf `add-generated-recipe-icons` aufbauen.
- [x] 4.4 Entbehrlichen Derivat-Cache testgetrieben ergänzen: Wiederverwendung über Knoten/Läufe, Original-/Regeländerungen, Löschung, Defekt, Schreibfehler, Originalerhalt, Config-relative Pfade und Git-Ausschlüsse prüfen. Originale samt Metadaten versionieren, Demand pro Lauf neu berechnen.
- [x] 5.5 Auf Benutzerwunsch generate-missing in lokaler Config und Root-Beispiel aktivieren, andere Einstellungen erhalten; lokalen nativen Codex-Pfad und Beispielplatzhalter verwenden, ohne Generierung prüfen.
