## Geänderte Anforderungen

### Versionierter, erkennungsorientierter Prompt

Der gemeinsame, versionierte Prompt muss echte PNG-Transparenz mit transparentem Rand verlangen. Neutrale deckende Hintergründe, weiße/farbige Rechtecke, aufgemalte Schachbretter und Szenenhintergründe sind ausgeschlossen. Motivbeschreibung, Zustände, Gruppen und bisherige Erkennungs-/Technikregeln bleiben erhalten.

- Bei Eieranforderungen werden gemeinsame Stilregeln, konkretes Motiv und Promptversion mitgeführt.
- Fehlerhafte, nicht unterstützte, zu große oder nicht dekodierbare Bilder werden nicht veröffentlicht.
- Neue Zutaten-, Gruppen- und Prozessbilder erhalten dieselbe ausdrückliche Transparenzanforderung.

## Zusätzliche Anforderungen

### Transparenzprüfung neuer Icons

Vor Veröffentlichung müssen begrenzt dekodierte effektive Alphawerte geprüft werden: alle äußersten Randpixel vollständig transparent; mindestens 1 % vollständig transparent und mindestens 1 % mit Alpha größer null. Ein deklarierter Alphakanal reicht nicht. Bestehende Byte-/Dimensionsgrenzen und begrenzte Dekodierallokation gelten weiterhin. Prüfung unabhängig vom Provider; keine Garantie vollständiger visueller Segmentierung.

- Neu erzeugte drei Eier auf deckendem Weiß, auch RGBA mit ausschließlich maximalem Alpha, werden mit `background-not-transparent` abgelehnt: Bedarfsmeldung und Textfallback, keine Veröffentlichung oder automatische Wiederholung.
- Weiße Eier-/Butterdetails bleiben unverändert erhalten; geglättete Konturen sind zulässig, wenn Rand- und Flächenregeln erfüllt sind.
- Einzelne transparente Alibipixel, deckende Randpixel oder ein leeres Bild reichen nicht.
- Alte gültige Pakete bleiben ohne Änderung, Neubewertung oder automatische Generierung verwendbar.
- Verkleinerung, Cache, SVG und PNG erhalten Alpha, sodass der Knotenhintergrund durchscheint.

Die maschinenlesbare normative Szenariostruktur steht in [spec.md](spec.md).
