# Rezept-Icon-Motivauflösung

## Zweck

Reale Zutatenformulierungen konservativ erkennen und optional strukturiert interpretieren, ohne Rezeptfakten zu verändern. Die vollständigen unverändert fortgeltenden Regeln für unterstützte Mengenformulierungen und Prozessaktionen stehen in [der englischen Spezifikation](spec.md); diese Datei beschreibt die ergänzte semantische Erkennung.

## Requirements

### Requirement: Mehrdeutigkeit und identitätsändernde Begriffe bleiben erhalten
Die deterministische Auflösung MUSS bei ununterstützten Alternativen, Mischungen, Verneinungen, zusammengesetzten Begriffen und unbekannten Zusätzen verzichten. Eine explizit aktivierte semantische Interpretation darf unterstützte eindeutige Alternativen ausschließlich als validierte Alternativbeschreibung auflösen, niemals als einzelnes Teilmotiv. Ununterstützte oder widersprüchliche Deutungen bleiben Text. Identitäten dürfen nicht aus IDs, Teilwortsuche oder beliebigem Abschneiden entstehen. Unsichere pfadartige oder zu lange Eingaben dürfen kein Motiv liefern.

#### Scenario: Zutatenalternativen
- **WHEN** `125 g weiche Margarine oder Butter` oder `50 g Zucker oder Zimtzucker zum Bestreuen` vorliegt
- **THEN** wird kein einzelnes Butter- oder Zuckermotiv ausgewählt
- **AND** darf nur die unterstützte Butter/Margarine-Alternative bei aktivierter Interpretation oder erlaubtem validiertem Cache eine Alternativbeschreibung liefern; ununterstützte Alternativen bleiben Text

#### Scenario: Ähnlicher Begriff ist andere Zutat
- **WHEN** Ei-Ersatz, Apfelsaft, Butter und Mehl oder Etwas Fett für die Form vorliegt
- **THEN** bleibt Text statt einer falschen Teilwortzuordnung zu Ei, Apfel, Butter oder Mehl

### Requirement: Reale Motivauflösung wird portabel offline geprüft
Ein automatisierter Akzeptanztest MUSS die bereinigte Apfelkuchen-Fixture durch Auflösung, Beschaffung, Derivatcache und echten Graph-Renderer ohne Live-Provider prüfen. Unterstützte Knoten MÜSSEN sichtbare SVG-/PNG-Icons erhalten; mehrdeutige/ununterstützte Knoten bleiben Text, außer eine unterstützte validierte Alternative ist ausdrücklich aktiviert. Deduplizierung, Rezept-JSON, Zutatentext, Beschriftungen, Details, Hinweise, Kanten, off/local-only, Originalpakete und Timeline-Verhalten MÜSSEN kompatibel bleiben. Aktivierte Mengen-/Alternativdarstellungen brauchen zusätzliche Offline-Abdeckung mit injizierten Beschreibungen und Bildern.

#### Scenario: Apfelkuchenregression
- **WHEN** die Fixture mit injiziertem PNG-Generator und lokalem Renderer ohne semantische Interpretation verarbeitet wird
- **THEN** werden unterstützte Motive sichtbar statt eines erfolgreichen Null-Icon-Graphen gerendert
- **AND** werden bewusste Nichttreffer und unveränderte Rezept-/Zutatenbytes geprüft

#### Scenario: Wiederholte Motive
- **WHEN** mehrere Knoten dasselbe Motiv benötigen
- **THEN** gelten bestehende gemeinsame Beschaffung und Derivatwiederverwendung ohne zusätzliche Sitzungen pro Knoten

#### Scenario: Alternative offline
- **WHEN** gültige injizierte Butter/Margarine-Beschreibung und lokale Komponenten aktiviert sind
- **THEN** erscheint die Alternative in SVG und PNG ohne Live-Provider oder geänderte Rezeptfakten


### Requirement: Optionale Interpretation liefert begrenzte validierte Zutatenbedeutung
Eine separat konfigurierte, explizit aktivierte Interpretation MUSS für bisher ungelöste Zutatenformulierungen über die bestehende OpenAI-kompatible Schnittstelle möglich sein. Unterstützte deterministische Identitäten und zuverlässig zugeordnete Zutatenfelder haben Vorrang. Zutaten-/Knoten-IDs dürfen nicht gleichgesetzt werden. Die Antwort MUSS eine begrenzte schemageprüfte Einzel-/Alternativbeschreibung mit kuratierten Identitäten, optionaler genauer Menge/Einheit und unterstützten Zusätzen sein, keine Pfade, Renderanweisungen oder freien Bildprompts. Margarine MUSS anfangs unterstützt werden. Unbekannte Identitäten, Verneinungen, Mischungen, ungültige Antworten, Faktenkonflikte und Providerfehler MÜSSEN nichtfatal zu keiner Zuordnung führen. Modellkonfidenz allein genügt nicht. Ein-/Ausgabe, Dauer und Versuche MÜSSEN begrenzt sein; höchstens eine Anwendungsanfrage pro unterschiedlicher Eingabe/Lauf ohne automatische Wiederholung.

#### Scenario: Bekannte komplexe Formulierung
- **WHEN** eine ungelöste Formulierung ausdrücklich weiche Margarine beschreibt und Interpretation aktiv ist
- **THEN** darf eine gültige Margarinebeschreibung das kanonische Grundmotiv auswählen, ohne den Originaltext zu ändern

#### Scenario: Modellantwort bestimmt keine Dateien
- **WHEN** das Modell Pfade, unbekannte Identitäten, falsche Struktur oder Anweisungen liefert
- **THEN** wird dies ohne beliebigen Dateizugriff oder Bildgenerierung abgelehnt und Text bleibt erhalten

#### Scenario: Keine geratene Mengenübernahme
- **WHEN** keine verlässliche Zuordnung eines Knotens zu einer strukturierten Zutat besteht
- **THEN** wird keine Menge aus geratenen IDs oder Listenpositionen übernommen; nur eigener begrenzter Knotenkontext wird interpretiert

### Requirement: Interpretation erhält Opt-in und Offlinebetrieb
Semantische Interpretation MUSS standardmäßig aus sein und bei Aktivierung unabhängige Modell-/Verbindungseinstellungen verwenden. Icons off MUSS semantische Arbeit vollständig umgehen. local-only darf keinen semantischen Provider aufrufen, sondern nur Regeln und bei Aktivierung validierte vorhandene Interpretationen oder Fallback nutzen. Gültige Interpretationen MÜSSEN anhand Eingabe/Kontext, Schema-/Promptversion und Modellkonfigurationsidentität ohne Geheimnisse gecacht und dedupliziert werden. Providerfehler/abgelehnte Antworten bleiben nichtfatal und dürfen keine gültigen Bildpakete überschreiben. Ohne Interpretation bleibt die bisherige Erkennung erhalten.

#### Scenario: Cachelücke offline
- **WHEN** eine ungelöste Formulierung in local-only keinen gültigen Interpretationseintrag hat
- **THEN** wird kein Modell-/Bildprovider kontaktiert und der Fallback bleibt erhalten

#### Scenario: Wiederverwendung
- **WHEN** dieselbe Eingabe und Konfiguration einen gültigen Cacheeintrag haben
- **THEN** wird die Beschreibung erneut validiert, aber keine semantische Anfrage gestellt

#### Scenario: Geänderte Version oder Modellkonfiguration
- **WHEN** Schema, Prompt oder Modellkonfigurationsidentität wechselt
- **THEN** werden inkompatible Interpretationen nicht still wiederverwendet und local-only bleibt netzfrei
