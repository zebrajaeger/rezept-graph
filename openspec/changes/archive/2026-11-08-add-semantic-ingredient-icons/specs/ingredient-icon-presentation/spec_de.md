## ADDED Requirements

### Requirement: Icons ergänzen die vorhandenen Knoten
Zutatenicons MÜSSEN innerhalb der bestehenden grünen pillenförmigen Node links vom vollständigen Text erscheinen. Sie dürfen weder die Node durch ein Bildrechteck ersetzen noch den Text darunter platzieren. Klassen, Verbindungen und reine Textformen bleiben erhalten. SVG MUSS native eingebettete Bilder ohne foreignObject oder externe Ressourcen enthalten; PNG MUSS dieselbe fertige SVG rasterisieren. Ungültige Icons oder Platzmangel behalten Textfallback.

#### Scenario: Zutat mit Icon
- **WHEN** eine Zutat ein gültiges Icon hat
- **THEN** umschließt die grüne abgerundete Form links das Icon und rechts den Text ohne Überlappung

### Requirement: Zutat und Zustand bestimmen gemeinsam das Motiv
Zutatenidentität, kulinarischer Zustand und dargestellte Form MÜSSEN getrennt werden. Eiermotive MÜSSEN roh, gekocht und gebraten unterscheiden; die rohe Standarddarstellung MUSS ausdrücklich ein ganzes rohes Hühnerei mit intakter Schale zeigen. Gekochte/gebratene Eier dürfen rohe Eier auch bei Badges und Gruppenfallback nicht ersetzen. Gruppenvarianten MÜSSEN denselben Zustand wie ihr Grundmotiv behalten. Bestehende zustandsunspezifische Pakete dürfen nicht durch Metadatenänderung oder neue Prompts automatisch einen Zustand erhalten und MÜSSEN bis zur ausdrücklichen Sichtprüfung erhalten bleiben. Fehlende/ununterstützte Zustände bleiben Text. Neue zustandsabhängige Bilder benötigen die bestehende Generierungsregel und separate Freigabe für Versuchssitzungen.

#### Scenario: Vorhandenes Grundbild zeigt gekochte Hälfte
- **WHEN** das alte Grundbild ein halbiertes gekochtes Ei zeigt, das Rezept aber rohe Eier verlangt
- **THEN** wird es weder als rohes Grundmotiv noch Badgefallback verwendet und bleibt unverändert erhalten

#### Scenario: Rohe Dreiergruppe gesichtet
- **WHEN** ein vorhandenes Dreierbild ausdrücklich als drei ganze rohe Eier geprüft wurde
- **THEN** darf eine Offline-Rezeptvorschau genau dieses Bild verwenden, ohne anderen Eierbildern denselben Zustand zuzuschreiben

#### Scenario: Gekochte oder gebratene Zutat
- **WHEN** gekochtes Ei oder Spiegelei verlangt wird und kein passendes Zustandsbild vorliegt
- **THEN** bleibt vollständiger Text statt eines rohen oder anders zubereiteten Eis

### Requirement: Zutatenerkennung hat Vorrang vor Mengendarstellung
Die Darstellung MUSS die mengenunabhängige Grundidentität und ursprüngliche Beschriftungen, Mengen und Rezeptfakten erhalten. Anfangs dürfen nur genaue positive ganzzahlige Eier-Stückzahlen Gruppenvarianten auswählen. Fehlende, gebrochene, ununterstützte oder widersprüchliche Mengen dürfen nicht gerundet oder erfunden werden. Andere Zutaten verwenden Grundmotive und vorhandenen Mengentext.

#### Scenario: Gewicht erzeugt kein eigenes Motiv
- **WHEN** `250 g Butter` vorliegt
- **THEN** werden Butter-Grundmotiv und unveränderter Mengentext ohne 250-Gramm-Bildanfrage verwendet

#### Scenario: Keine genaue Eieranzahl
- **WHEN** die Eiermenge fehlt oder gebrochen ist
- **THEN** wird gegebenenfalls das Grundmotiv ohne erfundene ganze Anzahl verwendet

### Requirement: Eiergruppen haben eine endliche Generierungsgrenze
Ein Ei MUSS das Grundbild wiederverwenden. Zwei bis fünf Eier dürfen bedarfsgesteuerte wiederverwendbare Gruppenbilder nutzen, ohne unangefragte Varianten zu erzeugen. Über fünf MUSS das Grundbild mit genauer Renderer-Zahl verwendet werden; ein eigenes Mengenbild darf nicht angefragt werden. Fehlende/fehlgeschlagene Gruppenbilder MÜSSEN auf Grundbild plus Zahl oder vollständigen Text zurückfallen. Bestehende Modi, Deduplizierung und Sitzungsgrenzen gelten weiter.

#### Scenario: Drei Eier wiederverwenden
- **WHEN** drei Eier wiederholt bei aktivierter Generierung angefragt werden
- **THEN** darf nur die fehlende Dreiergruppe höchstens eine begrenzte Sitzung pro Lauf auslösen und wird danach wiederverwendet
- **AND** werden Zweier-, Vierer- und Fünfergruppen nicht vorsorglich erzeugt

#### Scenario: Sechs Eier ohne neues Mengenbild
- **WHEN** sechs oder zwölf Eier vorliegen
- **THEN** entstehen passende Zahlenbadges auf demselben Grundbild ohne mengenbezogene Bildsitzung

#### Scenario: Gruppenbild fehlt offline
- **WHEN** bei drei Eiern in local-only nur das Grundbild vorhanden ist
- **THEN** wird dieses mit Zahl drei ohne Netzaufruf angezeigt

### Requirement: Alternativen bleiben von Mischungen unterscheidbar
Butter und Margarine MÜSSEN einzeln und als lokal zusammengesetzte Alternative mit Renderer-Text „oder“ unterstützt werden. Umgekehrte Reihenfolge MUSS dieselbe normalisierte Kompositionsidentität verwenden. Es darf kein separates Alternativbild generiert oder die Auswahl auf eine Zutat reduziert werden. Fehlt eine Komponente, MUSS der vollständige Text erhalten bleiben. Mischungen dürfen nicht als Alternativen erscheinen.

#### Scenario: Umgekehrte Reihenfolge
- **WHEN** Butter oder Margarine und Margarine oder Butter dargestellt werden
- **THEN** werden Komponenten und Komposition mit deutlichem Alternativhinweis wiederverwendet und die Originalbeschriftungen erhalten

#### Scenario: Mischung oder fehlende Komponente
- **WHEN** Butter und Mehl vorliegt oder eine Alternativkomponente fehlt
- **THEN** bleibt vollständiger Text ohne irreführende Alternative oder Einzelauswahl erhalten

### Requirement: Ableitungen erhalten portable Ausgabe und Cacheverträge
Kompositionen und Badges MÜSSEN lokal unter bestehenden Bild-/Byte-/Mermaid-Grenzen entstehen. Derivatidentitäten MÜSSEN Komponentenprüfsummen, normalisierte Menge/Relation, Layoutversion und bestehende Laufzeiteingaben enthalten. Sie dürfen keine generierten Originale werden. Darstellungsfehler MÜSSEN Text erhalten; fatale Graph-Rendererfehler dürfen nicht verschluckt werden. Rezept-JSON und Timeline bleiben unverändert.

#### Scenario: Unterschiedliche Badges
- **WHEN** dasselbe Grundbild sechs und zwölf Eier darstellt
- **THEN** werden korrekte getrennte Derivate offline wiederverwendet, ohne neue Originalbilder

### Requirement: Begrenzter visueller Versuch mit Nutzerfeedback
Ein offline getesteter Kontaktbogen und Graphauszug MUSS Butter, Margarine, deren Alternative, drei und sechs Eier in echter Größe und vergrößert zeigen. Ein Live-Versuch MUSS eine separate ausdrückliche Freigabe fehlender Motive und einer maximalen Zahl neuer Generatorsitzungen erhalten. Vorbereitung darf keine kostenpflichtige Generierung starten. Zutatenerkennung, Alternativbedeutung, Anzahl und Badgelesbarkeit MÜSSEN mit Nutzerfeedback dokumentiert werden; technische Prüfung ist keine visuelle Freigabe.

#### Scenario: Vorbereitung offline
- **WHEN** automatisiert getestet oder ohne Live-Freigabe vorbereitet wird
- **THEN** werden ausschließlich lokale/injizierte Bilder ohne kostenpflichtigen Provider verwendet

#### Scenario: Darstellung abgelehnt
- **WHEN** der Nutzer falsche Anzahl oder unlesbare Alternative erkennt
- **THEN** werden Problem und Folgeentscheidung statt einer technischen Scheinfreigabe dokumentiert
