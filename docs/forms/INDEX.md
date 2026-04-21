# Index de formularis EX — Mapeig de camps

## Resum

| Formulari | Descripció | Camps PDF | Text mapejats | Dates | Checkbox grups | Total mapejats | % cobertura |
|-----------|-----------|-----------|---------------|-------|----------------|----------------|-------------|
| [EX-00](EX-00.md) | Estancia de larga duración | 49 | 40 | 1 | 4 | 45 | 92% |
| [EX-01](EX-01.md) | Residencia temporal no lucrativa | 71 | 52 | 2 | 7 | 61 | 86% |
| [EX-02](EX-02.md) | Reagrupación familiar | 69 | 57 | 2 | 7 | 66 | 96% |
| [EX-03](EX-03.md) | Trabajo por cuenta ajena | 63 | 40 | 1 | 5 | 46 | 73% |
| [EX-04](EX-04.md) | Residencia para prácticas | 72 | 59 | 1 | 4 | 64 | 89% |
| [EX-06](EX-06.md) | Actividades de temporada | 80 | 58 | 1 | 4 | 63 | 79% |
| [EX-07](EX-07.md) | Trabajo por cuenta propia | 59 | 51 | 1 | 5 | 57 | 97% |
| [EX-09](EX-09.md) | Excepción de autorización de trabajo | 70 | 56 | 1 | 5 | 62 | 89% |
| [EX-10](EX-10.md) | Circunstancias excepcionales | 103 | 78 | 2 | 8 | 88 | 85% |
| [EX-11](EX-11.md) | Larga duración / larga duración-UE | 49 | 41 | 1 | 5 | 47 | 96% |
| [EX-19](EX-19.md) | Familiar ciudadano UE | 72 | 55 | 1 | 4 | 60 | 83% |
| [EX-24](EX-24.md) | Familiares de personas con nacionalidad española | 76 | 58 | 2 | 6 | 66 | 87% |
| [EX-25](EX-25.md) | Menores extranjeros | 78 | 59 | 1 | 3 | 63 | 81% |
| **TOTAL** | | **911** | **704** | **17** | **67** | **788** | **87%** |

## Detall checkbox grups per formulari

| Formulari | sexo | estadoCivil | tipoDoc | circunstancia | tipoAutorizacion | hijosEsc. | consentiment | Específics |
|-----------|------|-------------|---------|---------------|------------------|-----------|-------------|------------|
| EX-00 | ✓ | ✓ | — | — | ✓ (25) | — | ✓ | — |
| EX-01 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | titular_sexo, titular_estadoCivil |
| EX-02 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | familiar_sexo, familiar_estadoCivil |
| EX-03 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — |
| EX-04 | ✓ | ✓ | — | — | ✓ | — | ✓ | — |
| EX-06 | ✓ | ✓ | — | — | ✓ | — | ✓ | — |
| EX-07 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — |
| EX-09 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — |
| EX-10 | ✓ | — | ✓ | ✓ | — | — | ✓ | familiar_sexo, familiar_estadoCivil, formacio_tipus, formacio_modalitat |
| EX-11 | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — |
| EX-19 | ✓ | ✓ | — | — | ✓ | — | ✓ | — |
| EX-24 | ✓ | ✓ | — | — | ✓ | — | ✓ | espanyol_sexo, espanyol_estadoCivil |
| EX-25 | ✓ | — | — | — | ✓ | — | ✓ | — |

## Llegenda

- **Camps PDF**: Total de camps AcroForm al fitxer TypeScript (text + null)
- **Text mapejats**: Camps amb un `PersonalDataField` assignat (no null)
- **Dates**: Grups de data DD/MM/YYYY gestionats via `DATE_FIELDS`
- **Checkbox grups**: Nombre de grups de checkboxes actius (amb almenys una entrada)
- **Total mapejats**: Text mapejats + dates + checkbox grups actius
- **% cobertura**: Total mapejats / Camps PDF

## Notes

- Els camps `null` en `TEXT_FIELDS` corresponen a: (a) parts de data DD/MM/YYYY gestionades per `DATE_FIELDS`, (b) camps NIE lletra/control, (c) seccions específiques sense dades al PersonalData (contracte, firma, etc.)
- EX-10 és l'únic formulari que usa `tipoDoc`, `circunstancia`, `formacio_tipus` i `formacio_modalitat`
- EX-25 no té `estadoCivil` (formulari per a menors)
- Tots els formularis exporten els 9 blocs obligatoris: TEXT_FIELDS, DATE_FIELDS, SEXO_CHECKBOXES, ESTADO_CIVIL_CHECKBOXES, TIPO_DOC_CHECKBOXES, CIRCUNSTANCIA_CHECKBOXES, TIPO_AUTORIZACION_CHECKBOXES, HIJOS_ESCOLARIZACION_CHECKBOXES, CONSENTIMIENTO_CHECKBOX
