## Warum

Der freigegebene Apfelkuchen-Lauf erzeugte alle neun Dateien, aber kein einziges Icon: 0 von 21 geeigneten Knoten wurden erkannt. Reale Texte wie `3 Eier, Größe M` oder `250 g Mehl` passen nicht zur bisherigen Erkennung einfacher Begriffe.

## Änderungen

- Mengen, Einheiten und ausdrücklich unterstützte eindeutige Zusätze in Zutatenbeschriftungen erkennen; Rezeptdaten und sichtbare Texte unverändert lassen.
- Unterstützte Back-/Koch-/Brataktionen auch in vollständigen Prozessformulierungen erkennen.
- Alternativen, zusammengesetzte Zutaten, Verneinungen und Unbekanntes nicht per Teilzeichenfolge einem falschen Motiv zuordnen.
- Den vollständigen Offline-Weg vom Motiv bis zum sichtbaren SVG/PNG anhand einer bereinigten Apfelkuchen-Fixture prüfen, einschließlich bewusst nicht erkannter Fälle.
- Originale, Cache, Sitzungslimits, lokale/ausgeschaltete Modi und Timeline unverändert erhalten.

## Fähigkeiten und Umfang

Neue Fähigkeit `recipe-icon-motif-resolution`. Abhängig vom noch aktiven Change `add-generated-recipe-icons`; dessen Anforderungen sind noch nicht in den Hauptspecs veröffentlicht. Seine offenen Sicherheitsabnahmen werden weder ersetzt noch als erledigt betrachtet.

Hauptsächlich Motivauflösung, Tests und Offline-Fixtures betroffen. Keine neue KI-Auswertung, kein neues Backend, keine Schemaänderung und keine allgemeine Zutatenontologie. Weitere Live-Bildgenerierung benötigt gesonderte Freigabe.
