# Codex-Artefaktvertrag: Befunde und Änderungsvorschlag

Status: Vorschlag zur Prüfung, kein freigegebener Ersatz der bisherigen Anforderungen. In dieser Untersuchung keine weitere echte Modell-/Bildanfrage und keine Produktionsänderung. Fortschritt weiterhin 2/18 Aufgaben.

Englisch mit vollständiger Quellentabelle: [codex-contract-review_en.md](codex-contract-review_en.md).

## Versionsgenau belegte Befunde

Upstream-Tag `rust-v0.167.0` verweist auf Commit `086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a`. Das erklärt das vorgesehene Verhalten der passenden Version, ersetzt aber weder eine Prüfung der installierten Binärdatei noch einen erfolgreichen Bild-Probelauf.

- [Werkzeugschema](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/tool.rs): Prompt, Transparenz und Bildreferenzen, aber kein Ausgabeziel.
- [App-Server-Einbindung](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/app-server/src/extensions.rs): Speicherwurzel ist `config.codex_home`. Auch `exec` verwendet einen eingebetteten App-Server-Client.
- [Pfadbildung](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/artifact.rs): `<CODEX_HOME>/generated_images/<bereinigte Sitzungs-ID>/<bereinigte Aufruf-ID>.png`.
- `save_image_generation_result` schreibt im lokalen Speicherzweig ausdrücklich mit `sandbox: None`; Verzeichnisanlage folgt symbolischen Verknüpfungen. Die Befehls-Sandbox beschränkt diese internen Schreibzugriffe nicht.
- Strukturierte abgeschlossene Bildereignisse enthalten Status, Aufrufkennung und gegebenenfalls `saved_path`. Erfolgreiche Generierung kann trotz fehlgeschlagener Speicherung ohne Dateipfad enden.
- [JSON-Ausgabe von exec](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/exec/src/event_processor_with_jsonl_output.rs): Bildereignisse werden nicht auf Ausgabeelemente abgebildet; unbekannte Varianten werden verworfen. `exec --json` allein genügt hier nicht.
- Diese Version fordert im Bildwerkzeug `gpt-image-2` an. Das ist ein angefragtes Modell, keine bestätigte Identität des tatsächlich verwendeten Bildmodells.

Damit ist die frühere Agentenauskunft zum fehlenden Ausgabeparameter unabhängig bestätigt. Der Befehls-Sandboxtest beweist keine Isolation des Bildwerkzeugs. Aus Antworttext extrahierte Pfade oder die Suche nach der neuesten Cache-Datei sind kein akzeptabler Vertrag. Der alternative Arbeitsverzeichnis-Speicherzweig im Quellcode ist nicht automatisch nutzbar: Der geprüfte App-Server übergibt ausdrücklich eine Speicherwurzel.

## Konkreter Designvorschlag

Die Forderung „Codex schreibt selbst ausschließlich das festgelegte Staging-PNG“ durch zwei ausdrücklich getrennte Vertrauensgrenzen ersetzen:

1. **Agentenbefehle:** technisch erzwungene Schreibrechte nur in Staging; keine Projektschreibrechte, pauschale Umgehung oder zusätzlichen allgemeinen Werkzeugoberflächen.
2. **Codex-interne Bildablage:** ausdrücklich erlaubte, versionsgeprüfte Cache-Konvention des vertrauenswürdigen Codex-Clients. Das ist eine eng begrenzte Vertrauensausnahme, **keine** durch das Betriebssystem erzwungene Staging-Isolation für interne Schreibzugriffe. Bleibt vollständige technische Schreibisolation zwingend, ist dieser Ansatz abzulehnen und Codex bleibt blockiert.

Strukturierte Bildereignisse über das App-Server-Protokoll der vorhandenen Codex-CLI beziehen; Kompatibilität separat prüfen. Kein dauerhaft laufender Anwendungsdienst. Aus Sitzungs- und Aufrufkennung den erwarteten Pfad selbst herleiten und mit dem Ereignispfad vergleichen. Danach Datei prüfen und in das von unserer Anwendung festgelegte Staging-PNG übernehmen. Die austauschbare Generator-Schnittstelle kann also ihr festes PNG-Ziel behalten; nur der Adapter übernimmt aus Codex' Ablage.

Vor Übernahme Cache-Wurzel und vorhandene Pfadkomponenten auf tatsächliche Lage, Symlinks, Junctions und Reparse Points prüfen; nur reguläre größenbegrenzte PNGs akzeptieren. Prüfung und Einlesen über denselben Dateihandle, soweit möglich mit Identitätskontrolle. Hardlinks und Austauschrennen ausdrücklich behandeln; bei unzureichenden Plattformgarantien verweigern. Einzel-Schreiber-Betrieb bleibt Voraussetzung und schützt nicht vor feindlichen gleichzeitigen lokalen Prozessen. Keine beliebigen Agentenpfade und keine Zeitstempelsuche akzeptieren.

Codex-Originale nicht löschen oder verändern, auch nicht bei Fehlern. Nur eigene Staging-Dateien bereinigen. `CODEX_HOME` nicht durch Kopieren oder Verknüpfen von Zugangsdaten umleiten. Die verbleibenden Cache-Dateien dokumentieren.

## Bei Zustimmung anzupassende Artefakte und Aufgaben

- Proposal, Design und Prozessvertragsanforderung um beide Grenzen und die ausdrückliche Vertrauensausnahme ergänzen.
- Aufgaben 1.3/3.3 und Übersetzungen für strukturierte Ereignisse, exakte Sitzungs-/Aufrufzuordnung, fehlende Pfade, Protokoll-/Versionsabweichungen, Cache-Konflikte, Links und Austauschrennen erweitern. Originale erhalten. Aufgabe 1.3 erst nach Vertragstests und freigegebenem begrenztem Bild-Probelauf abschließen.
- Nichtinteraktives App-Server-Protokoll, Anmeldung, wirksame Werkzeugbeschränkung, Ereignisschema, Prozessbaumbeendigung und begrenzte Ereignisverarbeitung vor Integration belegen.
- Anmeldung bei Codex belassen; globale Konfiguration unverändert. Angefragtes und bestätigtes Bildmodell unterscheiden.
- Bildaufrufe begrenzen, nicht nur Adapterstarts: Ein Agent kann innerhalb einer Sitzung mehrfach generieren. Durchsetzbares Werkzeugaufrufbudget nachweisen oder die Kostengarantie ausdrücklich ändern; ein Prompt genügt dafür nicht.
- Automatische Tests bleiben offline; Text-Fallback und Verbot stiller Backendwechsel bleiben bestehen.

## Empfehlung und nächste Entscheidung

Zuerst die begrenzte Vertrauensausnahme für Codex' Cache freigeben oder ablehnen. Bei Zustimmung zunächst das App-Server-Protokoll ohne Bildgenerierung prüfen und erst mit vorbereiteten Artefaktprüfungen einen gesonderten Ein-Bild-Probelauf freigeben lassen. Bei Ablehnung oder technischer Unmöglichkeit lokale Bibliothek/Rendering als kleineren Change vorschlagen und Generierung verschieben. Weder diese Umfangsreduktion noch die Protokollintegration ist mit diesem Dokument implementiert.
