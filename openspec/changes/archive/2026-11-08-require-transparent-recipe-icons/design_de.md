## Kontext

Der gemeinsame Prompt erlaubt neutrale Hintergründe. Die PNG-Prüfung kontrolliert Struktur und entpackte Zeilengrößen, aber nicht rekonstruierte Alphawerte. Die Bibliothek veröffentlicht technisch gültige Bilder und verwendet ältere Promptversionen weiter.

## Ziele / Nicht-Ziele

**Ziele:** Eindeutiger Transparenzprompt, messbare Prüfung neuer Bilder, Erhalt weißer Motivdetails und begrenzter Speicherverbrauch; reine Offline-Tests.

**Nicht-Ziele:** Automatischer Austausch vorhandener Eierbilder, Freistellungsdienst, Weiß-Entfernung, neuer Provider oder Live-Generierung.

## Entscheidungen

1. Gemeinsame Stilversion erhöhen. Freigestelltes Motiv mit transparentem Rand verlangen; kein weißes/farbiges Rechteck, Schachbrett oder Szenenhintergrund. Semantische Zustands-/Gruppenangaben erhalten. Gilt auch für spätere Provideradapter, aber nicht für beliebige allgemeine Bildanfragen.
2. Zusätzliche Prüfung vor Veröffentlichung: PNG-Filter korrekt rekonstruieren und effektive Alphawerte auswerten; bisherige Größen- und Dekodiergrenzen erhalten. Unterstützte 8-/16-Bit-Varianten korrekt behandeln; nicht unterstützte Transparenzkodierung explizit ablehnen.
3. Messbare Annahmeregel: alle äußersten Randpixel vollständig transparent, mindestens 1 % der Bildfläche vollständig transparent und mindestens 1 % mit Alpha größer null. Teiltransparente geglättete Konturen im Inneren sind erlaubt. Leere Bilder, vollständig deckendes RGBA und einzelne transparente Alibipixel genügen nicht.
4. Weiße Eier/Mehl/Glanzlichter niemals per Farbschlüssel entfernen. Ablehnung mit `background-not-transparent`, Bedarfsmeldung und bestehendem Textfallback; kein weiterer Versuch.
5. Prüfung nur für neue Kandidaten. Alte gültige Pakete bleiben unverändert verwendbar. Austausch benötigt gesonderte Freigabe, revisionssichere Ablage und bewusste Auswahl; die aktuelle Suche bevorzugt ältere Revisionen. Kein Austauschbefehl Bestandteil dieses Changes.
6. Alphaerhalt in Verkleinerung, Cache, SVG und PNG mit transparenten Fixtures auf grünem Knoten prüfen. Cacheversion nur bei tatsächlicher Transformationsänderung erhöhen; Originalprüfsummen erhalten.

## Risiken / Abwägungen

- Provider liefert keine Transparenz → klare Ablehnung, keine automatische Wiederholung oder Providerumschaltung.
- Randprüfung lehnt randfüllende Motive ab → transparenter Rand ist ausdrücklich Teil des Prompts.
- Innere Hintergrundreste bleiben möglich → technische Prüfung nicht als vollständige visuelle Freigabe darstellen; Offline-Kontaktbogen auf kontrastierenden Flächen prüfen.
- Vorhandenes weißes Eier-Rechteck bleibt → kompatible Wiederverwendung erklären; Korrektur separat freigeben lassen.
- Überschneidung mit Providerumbau → vor Implementierung aktuellen Stand lesen und Symbol-Auswirkungsanalyse ausführen.

## Einführung / Rücknahme

Zuerst fehlschlagende Tests, dann Prompt und Prüf-Gate, anschließend Cache-/Renderingnachweise und zweisprachige Dokumentation. Vollständige Offline-Tests, Typprüfung/Build und OpenSpec-Validierung. Keine Daten- oder Konfigurationsmigration; Rücknahme ohne Änderung vorhandener Originale.

## Offene Fragen

Keine Planungsblocker. Echte Providerqualität und Austausch des vorhandenen Eierbilds benötigen gesonderte Freigabe.
