# DPIA — Avaluació d'impacte relativa a la protecció de dades

**Pathfinder · Fundació Tierra Digna**
Esborrany tècnic · juny 2026 · **pendent de validació jurídica**

> Aquest document descriu el tractament de dades personals que fa
> Pathfinder, per complir l'art. 35 RGPD (avaluació d'impacte) i la guia
> de l'AEPD sobre sistemes d'IA. És un esborrany redactat des del codi;
> **un advocat/DPO l'ha de revisar i signar abans de considerar-lo vàlid
> per a compliance.**

---

## 1. Responsable i context

- **Responsable del tractament**: Fundació Tierra Digna.
- **Encarregats del tractament** (subprocessadors):
  - **Supabase** (Postgres + Auth + Storage) — allotjament de dades. Regió a confirmar (preferible UE).
  - **Anthropic** (Claude API) — generació de respostes. Zero-retention recomanat.
  - **Voyage AI** — embeddings per a RAG.
  - **Vercel** — allotjament de l'aplicació i logs (regió `fra1`, Frankfurt).
- **Naturalesa**: eina d'orientació legal en immigració que recull dades
  per generar formularis oficials (EX-XX) i orientar sobre tràmits.

## 2. Descripció del tractament

| Què | Detall |
|---|---|
| **Finalitat** | Generar formularis d'estrangeria i orientar sobre tràmits |
| **Base legal** | Consentiment explícit (art. 6.1.a RGPD), demanat abans de recollir cap dada |
| **Categories d'interessats** | Persones migrants a Espanya (col·lectiu vulnerable) |
| **Origen de les dades** | Directament de l'interessat, via conversa en llenguatge natural |

### Categories de dades tractades

| Categoria | Exemples | Sensibilitat |
|---|---|---|
| Identificatives | Nom, cognoms, sexe, data/lloc naixement | Estàndard |
| Documentals | Passaport, NIE, tipus de document | Estàndard |
| Contacte | Domicili, telèfon, email | Estàndard |
| Familiars | Noms de pare/mare, familiars reagrupats | Estàndard |
| Situació administrativa | Tipus d'autorització sol·licitada, situació legal | **Potencialment sensible** (pot revelar irregularitat) |
| Geolocalització (SOS) | GPS en gravacions d'emergència | **Sensible** |
| Àudio/vídeo (SOS) | Gravacions en situacions de detenció/violència | **Categoria especial** (art. 9) |

> ⚠️ El mòdul SOS (gravacions amb GPS en situacions de detenció/violència)
> processa dades de categoria especial i mereix una secció DPIA pròpia i
> mesures reforçades. Vegeu §6.

## 3. Mesures tècniques implementades (verificables al codi)

| Mesura | On | Estat |
|---|---|---|
| Consentiment previ obligatori | Consent gate a `/api/chat` (mode collection) | ✅ |
| TTL automàtic de PII (24h) | `data_expires_at` + `cleanup_expired_pii()` (migr. 002) | ✅ (requereix cron actiu) |
| RLS per usuari | Migracions 004, 006, 007 (`auth.uid() = user_id`) | ✅ |
| Aïllament d'evidència SOS | `admin_users` + `requireAdmin()` (migr. 005) | ✅ |
| Xifratge en trànsit | HTTPS forçat + HSTS (`next.config.js`) | ✅ |
| Headers de seguretat | CSP, X-Frame-Options, etc. | ✅ |
| Logs sense PII | `console.error(err.message)`, mai objectes sencers | ✅ |
| Validació d'entrada | Zod a totes les rutes d'usuari | ✅ |
| Rate limiting | `/api/chat`, `/api/pdf/*`, `/api/email/*`, WhatsApp | ✅ |
| Disclosure d'IA (art. 50 AI Act) | Avís persistent al chat + `/privacy` | ✅ |

## 4. Riscos i mitigacions

| Risc | Probabilitat | Impacte | Mitigació |
|---|---|---|---|
| Filtració de PII de persones en situació irregular | Baixa | **Molt alt** | RLS + TTL 24h + logs sense PII + rotació de claus |
| Accés no autoritzat a gravacions SOS | Baixa | **Molt alt** | `admin_users` + token; export només admin |
| Re-identificació via logs de Vercel | Baixa | Alt | Logs només amb `err.message`; convId truncat |
| Transferència internacional (Anthropic/Voyage als EUA) | Mitjana | Mitjà | Clàusules contractuals tipus; zero-retention; minimitzar PII enviada al LLM |
| Persistència de PII més enllà de 24h si el cron falla | Mitjana | Alt | **Verificar que el cron `cleanup_expired_pii` està actiu a Supabase** |
| Inferència incorrecta del bot que perjudiqui l'usuari | Mitjana | Alt | Disclosure "no és advocat" + steer a entitats humanes |

## 5. Drets dels interessats

- **Accés, rectificació, supressió, portabilitat, oposició, limitació**:
  exercibles contactant la Fundació (vegeu `/privacy`).
- **Retirada del consentiment**: en qualsevol moment.
- **Reclamació**: davant l'AEPD.
- Implementació tècnica: l'usuari autenticat pot eliminar els seus casos
  des de `/cases/[id]` (botó eliminar, RLS DELETE migr. 006). Les dades
  anònimes s'esborren soles a les 24h.

## 6. Pendents abans de considerar el DPIA complet

1. **Validació jurídica** d'aquest document per un advocat/DPO.
2. **Confirmar la regió de Supabase** (preferible UE; si està als EUA, documentar la transferència).
3. **Signar DPAs** (acords d'encarregat) amb Supabase, Anthropic, Voyage, Vercel.
4. ~~**Verificar que el cron `cleanup_expired_pii()` està programat**~~ ✅ FET: Vercel Cron diari (`vercel.json` → `/api/cron/cleanup`, 03:00). Cal definir `CRON_SECRET` a Vercel perquè l'endpoint no sigui públic. Si cal neteja horària (Hobby limita a 1/dia), usar pg_cron a Supabase (instruccions al comentari del route).
5. **DPIA específica del mòdul SOS** (categoria especial: àudio/vídeo + GPS en context de detenció). Definir: retenció, qui hi accedeix, cadena de custòdia legal, base legal (interès vital art. 9.2.c?).
6. **Registre d'activitats de tractament** (art. 30 RGPD) formal.
7. **Minimització cap al LLM**: revisar que no s'envia més PII de la necessària a Anthropic en el `contextBlock` / historial.
8. **Cookie/consentiment**: confirmar que només s'usen cookies essencials (sessió auth) i documentar-ho.

## 7. Conclusió provisional

El tractament té una base tècnica sòlida (RLS, TTL, minimització de logs,
disclosure d'IA) i el risc principal —filtració de PII de col·lectiu
vulnerable— està raonablement mitigat per a un pilot. **Abans d'escalar a
ús massiu**, cal tancar els 8 punts del §6, especialment la DPIA del mòdul
SOS i la verificació del cron de neteja.
