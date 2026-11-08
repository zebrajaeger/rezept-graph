## 1. Umfang und zunächst fehlschlagende Tests

- [x] 1.1 Icon-Pipeline und offenen Providerumbau lesen; vor jeder Symboländerung vorgelagerte GitNexus-Auswirkungsanalyse ausführen und Aufrufer, Abläufe sowie Risiko melden.
- [x] 1.2 Prompttests für transparenten Rand, verbotene Hintergründe und unveränderte Zustands-/Gruppenangaben sowie Versionsmetadaten ergänzen.
- [x] 1.3 Offline-Pixeltests für deckendes RGB/RGBA, weiße Motive auf Transparenz, geglättete Konturen, Alibitransparenz, deckende Ränder, leere Bilder, PNG-Filter 0–4, unterstützte 8-/16-Bit-Kodierungen, nicht unterstützte Kodierungen und Ressourcenlimits ergänzen.
- [x] 1.4 Bibliothekstests für Ablehnungsgrund, keine Veröffentlichung/Wiederholung, gemeinsame Aufrufgrenze, alte deckende Pakete und providerfreie lokale Modi ergänzen.

## 2. Annahme neuer Bilder implementieren

- [x] 2.1 Gemeinsame Stilversion erhöhen und echten transparenten PNG-Hintergrund samt Rand verlangen; Konzeptgrenzen und semantische Angaben erhalten.
- [x] 2.2 Begrenzte Alphaauswertung mit transparentem Rand und den beiden 1-%-Regeln implementieren; allgemeine PNG-Prüfung und alte Bibliothekssuche kompatibel halten.
- [x] 2.3 Prüfung vor Veröffentlichung einbauen, `background-not-transparent` melden und Textfallback verwenden; Originale, Revisionen und Aufrufgrenzen erhalten.

## 3. Darstellung und Dokumentation prüfen

- [x] 3.1 Zuerst Regressionstests für Alpha in Verkleinerung, Cache, SVG und fertigem PNG auf grünen Knoten ergänzen; nur nachgewiesene Fehler beheben und betroffene Cachetransformation versionieren.
- [x] 3.2 Offline-Kontaktbogen mit transparenten Fixtures auf kontrastierenden Flächen erstellen und weiße Details sowie Ränder prüfen; keine Live-Generierung.
- [x] 3.3 Englische/deutsche Icon-Dokumentation und deutsche `next_step.md` aktualisieren: Regeln, Grenzen, Providerverträglichkeit und separate Austauschfreigabe.
- [x] 3.4 Vollständige Offline-Tests, Typprüfung/Build, OpenSpec-Validierung und Diffprüfung ausführen. Vor Commit GitNexus `detect_changes`; Commitnachricht auf Basis von `require-transparent-recipe-icons`. Keine Modelle installieren, aktive Konfiguration ändern, Bilder austauschen oder Live-Provider aufrufen.
