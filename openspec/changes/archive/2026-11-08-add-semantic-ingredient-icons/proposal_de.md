## Warum

Die konservative Motivgrammatik erkennt viele reale Zutatenformulierungen und Alternativen nicht. Die Erkennung der Zutat soll besser werden, ohne für jede Menge ein neues KI-Bild zu erzeugen. Mengenvisualisierung ist ein Bonus und wird zunächst im kleinen Rahmen erprobt.

## Änderungen

- Optionales, separat konfiguriertes kleines LLM liefert validierte strukturierte Zutatenbedeutungen mit stabilen Identitäten und vorsichtigem Fallback.
- Vorhandene verlässliche Zutatenfelder wiederverwenden; Rezeptfakten bleiben erhalten. Das LLM bestimmt weder Dateipfade noch Bildprompts oder Generierungsregeln.
- Butter oder Margarine aus wiederverwendbaren Einzelmotiven und vom Renderer gesetztem „oder“ zusammensetzen. Beide Einzelmotive bleiben nutzbar.
- Für ein bis fünf Eier sind bedarfsgesteuerte Gruppenvarianten erlaubt. Darüber: Ei-Grundmotiv mit Zahlenbadge, niemals ein neu generiertes Mengenbild.
- Grundmotiv und ursprünglicher Mengentext bleiben Rückfallmöglichkeiten. Keine vorsorgliche Generierung aller Varianten, keine automatische Ausweitung auf alle Zutaten.
- Butter, Margarine, deren Alternative, drei und sechs Eier in tatsächlicher Graphgröße in einem ausdrücklich freigegebenen, begrenzten Probelauf vergleichen.

## Fähigkeiten

### Neu
- `ingredient-icon-presentation`: begrenzte Mengenvarianten, zusammengesetzte Alternativen, Fallback und visuelle Abnahme.

### Geändert
- `recipe-icon-motif-resolution`: optionale strukturierte Interpretation zusätzlich zur bestehenden deterministischen Erkennung; Alternativen und Rezeptfakten bleiben erhalten.

## Auswirkungen

Betroffen sind voraussichtlich `backend/src/icons`, die Zuordnung von Zutaten zu Knoten, LLM-Konfiguration und Cache, Graphanreicherung, Tests und zweisprachige Dokumentation. Bestehende Bildbeschaffung, Paketprüfung, Größenlimits, Prozessmotive und Timeline bleiben erhalten. Semantische Anfragen brauchen eine explizite Aktivierung und separate Modelleinstellungen; off/local-only dürfen keine neuen impliziten Netzaufrufe erhalten. Dieses Proposal startet keine Provider, Bildgenerierung, Paketinstallation oder Codeänderung.

Nicht enthalten: allgemeine Zutatenontologie, automatische ästhetische Freigabe, Mengenbilder für alle Lebensmittel, Portionsänderungen, freie generierte Bildprompts und Abschluss der offenen Sicherheitsarbeit des archivierten Bildgenerator-Changes.
