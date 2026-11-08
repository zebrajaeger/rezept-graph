# Rezept-Icon-Bibliothek

Die vollständige normative Spezifikation steht in [spec.md](spec.md). Betriebsanleitung: [Rezept-Icons](../../../docs/recipe_icons_de.md).

## Transparente neue Bilder

Der gemeinsame versionierte Erkennungsprompt verlangt echte PNG-Transparenz mit transparenten Rändern statt deckender weißer/farbiger Flächen, aufgemalter Schachbretter oder Szenenhintergründe. Zustände und Gruppenangaben bleiben erhalten; Prompt und Stilversion werden dokumentiert. Technische Annahme ersetzt keine menschliche oder rechtliche Freigabe.

Vor Veröffentlichung neuer Bilder prüft die Bibliothek begrenzt dekodierte effektive Alphawerte unabhängig vom Provider:

- Sämtliche äußersten Randpixel sind vollständig transparent.
- Mindestens 1 % der Fläche ist vollständig transparent und mindestens 1 % besitzt Alpha größer null.
- Ein Alphakanal allein genügt nicht; deckendes RGBA, einzelne transparente Alibipixel und leere Bilder werden abgelehnt.
- Weiße Motivdetails und geglättete Konturen bleiben erhalten, sofern Rand- und Flächenregeln erfüllt sind.
- Deckende Ergebnisse führen zu `background-not-transparent`, bestehendem Fallback und Bedarfsmeldung, ohne Veröffentlichung, automatische Wiederholung oder Entfernung weißer Pixel.
- Alte gültige Pakete bleiben ohne Änderung oder automatische Neugenerierung verwendbar.
- Verkleinerung, Cachewiederverwendung sowie SVG-/PNG-Ausgabe erhalten die Transparenz.

Bestehende Grenzen für Dateigröße, Dimensionen und Dekodierspeicher gelten weiterhin. Die Prüfung ist keine vollständige visuelle Hintergrundsegmentierung.
