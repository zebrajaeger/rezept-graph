# Umsetzungsplan

Der verbindliche Aufgabenstatus steht ausschließlich in [tasks.md](tasks.md).

1. **Ausgangslage sichern:** Laufende semantische Änderungen berücksichtigen, Offline-Tests ausführen und vor jeder bestehenden Symboländerung GitNexus-Auswirkungen melden. ComfyUI-API anhand versionierter, bereinigter Fixtures prüfen; nichts automatisch installieren.
2. **Vertrag und Konfiguration:** Zuerst fehlschlagende Tests für gemeinsame Ergebnisse, Fähigkeiten, alte Codex-Konfiguration und neue ComfyUI-Einstellungen. Danach Schnittstelle, Auswahl und Icon-Brücke implementieren. Ausgeschaltete/lokale Modi dürfen keinen Provider ansprechen.
3. **ComfyUI:** Jeweils zuerst Tests und danach Implementierung für Workflow-Bindungen, Auftragszuordnung, eindeutige Ausgabe, sichere Downloads, Zugangsdaten, Bildlimits, serielle Aufträge, Zeitgrenzen, Abbruch und Dateibereinigung. Keine automatischen Wiederholungen oder globalen Interrupts.
4. **Bibliothek:** Zuerst Regressionstests für alte Metadaten, neue Herkunftsangaben, unveränderte Wiederverwendung, Deduplizierung, Textfallback und Rendererfehler; danach Integration.
5. **Abnahme:** Zweisprachige Betriebs-/Konzeptdokumentation und Konfigurationsbeispiele ergänzen. Gesamte Offline-Prüfung, Typprüfung, Build und OpenSpec-Validierung ausführen. Vor einem Commit `detect_changes` prüfen; Commitnachricht auf Basis von `add-pluggable-image-generation`.
6. **Optionaler Live-Test:** Nur nach separater Freigabe ein kompatibles Modell samt Lizenz, Workflow und Endpunkt auswählen; maximal ein Bild auf der RTX 5060 Ti mit 16 GB erzeugen. Ergebnis messen und Grenzen dokumentieren. Alternativ Verzicht ausdrücklich festhalten, ohne Live-Verifikation zu behaupten.
