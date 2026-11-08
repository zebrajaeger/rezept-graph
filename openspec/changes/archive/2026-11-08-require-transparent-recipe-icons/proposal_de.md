## Warum

Die Rezept-Icons haben uneinheitliche Hintergründe: Die drei Eier besitzen ein weißes Rechteck, während die Butter freigestellt erscheint. Neue Icons sollen sich durch echte Transparenz in die farbigen Rezeptknoten einfügen.

## Änderungen

- Zentraler, versionierter Icon-Prompt verlangt ausdrücklich einen transparenten PNG-Hintergrund.
- Tatsächliche Transparenz vor Veröffentlichung prüfen; ein Alphakanal allein genügt nicht.
- Undurchsichtige Ergebnisse mit verständlicher Bedarfsmeldung und Textfallback ablehnen; keine automatischen Wiederholungen oder pauschale Entfernung weißer Pixel.
- Bestehende Bildpakete und Aufrufgrenzen erhalten. Austausch des vorhandenen Eierbilds nur mit gesonderter Freigabe.
- Transparenz in Anzeigederivaten und SVG-/PNG-Ausgabe erhalten.

## Fähigkeiten

### Neue Fähigkeiten

Keine.

### Geänderte Fähigkeiten

- `recipe-icon-library`: Transparenzanforderung und Prüfung für neu erzeugte Icons ohne nachträgliche Ungültigkeit bestehender Pakete.

## Auswirkungen

Betroffen sind Icon-Prompt, PNG-Prüfung, Bibliotheksveröffentlichung, Cache-/Renderingtests und zweisprachige Betriebsdokumentation. Keine Installation, aktive Konfigurationsänderung oder kostenpflichtige Generierung. Abstimmung mit `add-pluggable-image-generation`: Transparenz gehört zur Icon-Fachlogik, nicht zwingend zu jeder allgemeinen Bildanfrage. Implementierung ausschließlich nach Symbol-Auswirkungsanalyse und testgetrieben.
