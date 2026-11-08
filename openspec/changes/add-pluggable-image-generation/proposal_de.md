## Warum

Die Bildbeschaffung besitzt bereits das Interface `IconGenerator`. Konfiguration, Herkunftsangaben und Workflow-Aufbau setzen jedoch noch Codex CLI voraus. Eine stabile Schnittstelle „Prompt → Bild“ soll den bestehenden Agentenablauf und lokale oder entfernte Bildgeneratoren austauschbar machen.

## Änderungen

- Asynchrone gemeinsame Schnittstelle mit typisierten Fehlern, unterstützten Fähigkeiten und überprüfbaren Herkunftsangaben.
- Bestehenden Codex-Weg mit seinen Ausführungs- und Sicherheitsgrenzen erhalten.
- ComfyUI über eine ausdrücklich konfigurierte lokale oder entfernte API anbinden; Grundlage ist eine versionierte API-Workflow-Vorlage des Betreibers.
- Motiverkennung, Prompt-Aufbau, Bibliothek, Bildprüfung, Cache und Rendering bleiben außerhalb der Provideradapter.
- Bestehende Konfigurationen und Bilder weiterverwenden; providerspezifische Einstellungen und abwärtskompatible Metadaten ergänzen.
- Aufträge, Wartezeit, Downloads, Abbruch und Parallelität begrenzen; keine stillen Wiederholungen oder Anbieterwechsel.
- Native Installation und Containerbetrieb erklären; manuellen, separat freizugebenden Test auf RTX 5060 Ti mit 16 GB vorsehen.

## Fähigkeiten

### Neu
- `image-generation`: Gemeinsamer Auftrag und Ergebnis, Fähigkeiten, Auswahl sowie Codex- und ComfyUI-Adapter.

### Geändert
- `recipe-icon-library`: Codex-spezifische Annahmen in Konfiguration und Herkunftsangaben lösen; Integritätsprüfungen, lokale Modi und Versuchslimits erhalten.

## Auswirkungen und Grenzen

Betroffen sind voraussichtlich Generatoren, Konfiguration, Workflow-Aufbau, Metadaten, Offline-Tests, Beispielkonfiguration und zweisprachige Dokumentation. Die laufenden, noch nicht committeten Änderungen aus `add-semantic-ingredient-icons` müssen erhalten und bei der Implementierung berücksichtigt werden. Vor Symboländerungen ist eine GitNexus-Auswirkungsanalyse erforderlich; Tests werden zuerst geschrieben.

Dieser Vorschlag implementiert nichts, ändert keine lokale Laufzeitkonfiguration und startet keine Bildgenerierung. Nicht enthalten sind Training, eine öffentliche Bild-API oder Oberfläche, dauerhafte Hintergrundaufträge, automatische Container-/Serververwaltung, beliebige Shellbefehle, ein Diffusers-Adapter, kostenpflichtiger Ersatzbetrieb oder eine automatische Qualitäts-/Rechtefreigabe. Offene Codex-Sicherheitsabnahmen bleiben offen. Docker ist eine Verpackungs- und Betriebsoption, kein eigener Generator.
