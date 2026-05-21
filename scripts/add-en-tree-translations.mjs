import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const en = {
  "b1-p0": {
    id: "b1-p0",
    text: "Do you have your passport accessible right now?",
    note: "Without a valid passport, no residence authorization can be processed. This is the first critical fork.",
    opts: ["Yes, I have it", "Held by the Immigration Police (Brigada de Extranjería)", "I lost or destroyed it", "I've never had one", "I have a national ID from my country but no passport"],
  },
  "b1-block-a": {
    id: "b1-block-a",
    text: "Passport held by the Provincial Immigration and Borders Brigade",
    note: "The Brigada holds the passport when there are doubts about the age declared at entry. It can take 6–7 months. You can request a certificate showing the document is being held. Your tutoring entity can follow up.",
    opts: ["Is there a criminal case open with the prosecutor?", "No, it's an administrative hold → wait"],
  },
  "b1-p0b": {
    id: "b1-p0b",
    text: "Has the Brigada told you a criminal case has been opened with the prosecutor?",
    note: "Administrative holding of the passport is common and temporary. If there is also a criminal case for alleged document forgery, the situation is different and requires a lawyer urgently.",
    opts: ["Yes, there's a criminal case", "No, only an administrative hold"],
  },
  "b1-sos1-doc": {
    id: "b1-sos1-doc",
    text: "Criminal case open over your entry documents",
    note: "You need a lawyer specialized in criminal law and immigration. Don't try to handle this alone. Court-appointed counsel can be assigned for free if you don't have resources.",
    opts: ["Contact CEAR / SJM / court-appointed counsel", "Find a specialized lawyer urgently"],
  },
  "b1-block-a-wait": {
    id: "b1-block-a-wait",
    text: "Administrative hold — wait for resolution (6–7 months)",
    note: "While you wait, gather: padrón (city census), health card, school or work reports, certificates from your tutoring entity. When you recover the passport, come back here and continue.",
    opts: ["✓ I have the passport again → continue with P1", "Request a hold certificate from the Brigada"],
  },
  "b1-block-b": {
    id: "b1-block-b",
    text: "Lost or destroyed passport — renew at your country's consulate",
    note: "Bring the national ID from your country of origin. Senegal, Guinea, Gambia and Benin usually accept renewal with the national ID. Estimated time: 1–3 months. Your entity can accompany you to the consulate.",
    opts: ["✓ I have the new passport → continue with P1", "Contact entity for accompaniment to the consulate"],
  },
  "b1-block-c": {
    id: "b1-block-c",
    text: "No travel document at all — apply for a passport at the consulate",
    note: "Bring any ID document you have. WARNING: if there is risk of persecution in your country of origin, ask about international protection BEFORE going to the consulate — going may be dangerous.",
    opts: ["⚠ There's risk → redirect to Asylum Branch (B4)", "✓ I have the new passport → continue with P1", "Contact entity for accompaniment"],
  },
  "b1-block-d": {
    id: "b1-block-d",
    text: "You have a national ID from your country of origin but no passport",
    note: "The national ID from your country has no validity in Spain as a travel document. With it you can: register on the padrón, access healthcare and education. You CANNOT process any residence authorization until you have a passport.",
    opts: ["Apply for a passport at the consulate using the ID", "Contact reference entity"],
  },
  "b1-p1": {
    id: "b1-p1",
    text: "Are you a minor, or did you turn 18 less than 3 months ago?",
    note: "Unaccompanied-minor pathway (art. 174 RD 1155/2024): for those who were under the guardianship of a child protection service and reach adulthood without a residence authorization. Window: 2 months BEFORE up to 3 months AFTER turning 18. Exceptional path: up to age 20 if there are duly documented external causes + a report from the Autonomous Community.",
    opts: ["Yes, I'm a minor (< 18)", "I had guardianship and turned 18 less than 3 months ago", "I turned 18 between 3 months and 2 years ago (exceptional path up to 20)", "No, I'm an adult without guardianship"],
  },
  "b1-r-menor": {
    id: "b1-r-menor",
    text: "Unaccompanied-minor pathway — apply NOW (art. 174 RD 1155/2024)",
    note: "Requirements: be under guardianship, custody or care of a child protection service + have participated in training programmed by the entity (or show integration) + sufficient financial means (IMV or public/private program). Window: 2 months BEFORE up to 3 months AFTER turning 18. Form EX-25. Allows employment by others and self-employment. Administrative silence: UNFAVOURABLE (3 months without response = denied).",
    opts: ["Form: EX-25", "Contact the Autonomous Community's child protection service"],
  },
  "b1-p2": {
    id: "b1-p2",
    text: "Extraordinary regularization — do you meet the requirements?",
    note: "Window: 16 April – 30 June 2026 (ACTIVE NOW). Requirements: (1) Be in Spain before 1 January 2026. (2) Continuous stay of at least 5 months. (3) No criminal record. NO passport needed — accepts cédula de inscripción or travel title. CANNOT have any other application in process.",
    opts: ["Yes, I meet all requirements", "No / I don't know"],
  },
  "b1-r-reg": {
    id: "b1-r-reg",
    text: "Extraordinary regularization — APPLY NOW (until 30/06/2026)",
    note: "Documents: copy of passport / cédula de inscripción / travel title + proof of being in Spain before 01/01/2026 + proof of 5 months of stay + criminal record certificate (Spain + country of origin). Online channel: available 24h. In-person channel: appointment required. Tel. 060 (9:30–14h and 16:30–19:30h). Once admitted to processing you can already work. Resulting authorization: 1 year.",
    opts: ["Online channel (24h, no appointment)", "In-person — request appointment", "Tel. 060 for questions and appointments"],
  },
  "b1-p3": {
    id: "b1-p3",
    text: "How long have you been living in Spain continuously?",
    note: "You must be able to prove continuous residence: padrón, bills, school reports, health card, social services certificates. If you've been here less than 5 months or arrived after 1/1/2026, the extraordinary regularization doesn't apply either.",
    opts: ["Less than 1 year", "Between 1 and 2 years", "More than 2 years"],
  },
  "b1-r-aviat": {
    id: "b1-r-aviat",
    text: "Too soon — gather documentation for the future",
    note: "Start collecting now: padrón, bills with your address, dated photos, school or social-services reports. When you reach 2 years, come back to the tree.",
    opts: ["Referral: CEAR / SJM / local entity"],
  },
  "b1-r-gairebe": {
    id: "b1-r-gairebe",
    text: "Almost there — start preparing arraigo social now",
    note: "Request the integration report from your Autonomous Community now (it can take months). Gather proof of continuous residence. Look for a pre-contract for work if possible.",
    opts: ["Request the AC integration report now"],
  },
  "b1-p4": {
    id: "b1-p4",
    text: "Do you have an employer willing to give you a work contract?",
    note: "The contract must be at least 90 days and at least 20h/week. Salary must be at least the proportional minimum wage (SMI) for the working hours. Any contract type is accepted. The company must be up-to-date with Social Security.",
    opts: ["Yes, I have a contract or pre-contract", "No"],
  },
  "b1-r-laboral": {
    id: "b1-r-laboral",
    text: "Arraigo sociolaboral",
    note: "Requirements: 2 years of continuous residence + active contract of at least 90 days (3 months) and at least 20h/week + minimum salary at proportional SMI. Any contract type accepted: open-ended, temporary, permanent intermittent, replacement. From admission to processing you can already work. Authorization: 1 year. Form EX-10.",
    opts: ["Form: EX-10 arraigo sociolaboral", "From admission to processing → you can already work"],
  },
  "b1-p5": {
    id: "b1-p5",
    text: "Are you enrolled, or can you enrol, in official training in Spain?",
    note: "Training valid for arraigo socioformativo: vocational training (FP) middle or higher level, professional certificates (levels 1, 2 or 3), ESO / adult education, SEPE training oriented to employment. NON-official courses or unaccredited academies do NOT count. At most 50% online. You can work 30h/week while studying.",
    opts: ["Yes, I'm enrolled or I can enrol", "No"],
  },
  "b1-r-formatiu": {
    id: "b1-r-formatiu",
    text: "Arraigo socioformativo",
    note: "Requirements: 2 years of continuous residence + enrollment in valid official training (FP, professional certificate, adult ESO, SEPE training) + AC social-integration report. You can work 30h/week while studying (self-employed or employee). When you complete the training → modification to a work permit. Form EX-10.",
    opts: ["Form: EX-10 arraigo socioformativo", "You can work 30h/week while studying"],
  },
  "b1-p6": {
    id: "b1-p6",
    text: "Do you have direct family members with legal residence or Spanish nationality?",
    note: "WARNING: Classic arraigo familiar is now for parents of minor EU citizens (not Spanish). If the family member is SPANISH, the procedure is different: it's a 'residence authorization for a family member of a Spanish national' (EX-24), not arraigo. Family members of legal residents (spouse/partner or 1st-degree direct-line relative) go via arraigo social with proof of financial means.",
    opts: ["Yes, child or parent of a Spaniard", "Yes, spouse or partner of a legal resident", "Yes, parent of a minor EU citizen (non-Spanish)", "No"],
  },
  "b1-r-familiar": {
    id: "b1-r-familiar",
    text: "Arraigo social via family ties (spouse/partner of legal resident)",
    note: "Requirements: 2 years of continuous residence + proven family bond (spouse or registered domestic partner, or 1st-degree direct-line relative, with legal residence) + financial means at 200% IPREM (~€1,200/month). Form EX-10. Note: if the family member is SPANISH, see EX-24 option.",
    opts: ["Form: EX-10 arraigo social"],
  },
  "b1-p7": {
    id: "b1-p7",
    text: "Do you have, or can you get, a social-integration report from your Autonomous Community?",
    note: "You request the integration report from the AC where you live (social services or equivalent body). In Catalonia: Departament de Drets Socials. In Madrid: Comunidad de Madrid. It can take 2–6 months. Request it well in advance. It certifies: time of stay, language knowledge, participation in social activities.",
    opts: ["Yes, I have it or can request it", "No / in process"],
  },
  "b1-r-social": {
    id: "b1-r-social",
    text: "Arraigo social",
    note: "Requirements: 2 years of continuous residence + AC integration report (or family ties with legal residents) + own or family financial means equivalent to 100% IPREM. Allows self-employment or employment by others. Form EX-10.",
    opts: ["Form: EX-10 arraigo social", "Request the AC integration report now (takes months)"],
  },
  "b1-p8": {
    id: "b1-p8",
    text: "Does your situation involve immediate risk? (detention, expulsion, police)",
    note: "If you're being held right now or have an imminent expulsion notice, activate SOS mode. If the situation is stable but you have no pathway, contact an entity.",
    opts: ["Yes, immediate risk now", "No, situation is stable"],
  },
  "b1-sos2": {
    id: "b1-sos2",
    text: "SOS MODE — Immediate risk",
    note: "You have the right to free legal assistance. You have the right to an interpreter. You should not sign any document without reading and understanding it. You can ask that your lawyer or reference entity be contacted.",
    opts: ["Call CEAR: 91 598 05 35", "Call SJM: 91 445 90 85", "Show this screen to the police"],
  },
  "b1-r-sense": {
    id: "b1-r-sense",
    text: "No active pathway right now — accompaniment and preparation",
    note: "No active pathway right now for your profile. Contact a reference entity: CEAR, SJM, Red Cross or local entity. Gather residence documentation. If your situation changes (work, training, family), come back to the tree. The 'second-chance' arraigo does NOT apply if you've never had a residence authorization.",
    opts: ["Referral: nearby local entity"],
  },
  "b1-r-familiar-espanyol": {
    id: "b1-r-familiar-espanyol",
    text: "Residence authorization as family member of a Spanish national",
    note: "Child of a Spanish parent of origin (no age limit), spouse or partner of a Spaniard, dependent ascendant/descendant. Does NOT require minimum residence time in Spain. Initial authorization 5 years. Form EX-24.",
    opts: ["Form: EX-24", "No minimum residence time required"],
  },
  "b1-r-familiar-ue": {
    id: "b1-r-familiar-ue",
    text: "Arraigo familiar — parent of a non-Spanish minor EU citizen",
    note: "For parents of a minor EU/EEA/Swiss (non-Spanish) child. You must have the minor in your care and live with them. Form EX-10.",
    opts: ["Form: EX-10 arraigo familiar"],
  },
  "b1-r-menor-excepcional": {
    id: "b1-r-menor-excepcional",
    text: "Exceptional minor pathway — up to age 20",
    note: "If the ordinary window (3 months after turning 18) has passed but you haven't yet turned 20, you can apply exceptionally if you prove duly documented external causes + a report from the Autonomous Community or municipality. URGENTLY contact the entity that had your guardianship or a lawyer specialized in minors.",
    opts: ["URGENT: contact child protection service", "Lawyer specialized in foreign minors", "CEAR / SJM: free advice"],
  },
  "b2-p0": {
    id: "b2-p0",
    text: "What type of authorization do you have or did you have?",
    note: "Look at your card (TIE) or the resolution. The type is stated on the document.",
    opts: ["Temporary residence (1–2 years, valid)", "Long-term residence (5+ years, valid)", "I have an authorization but it has expired", "I had an authorization but lost it (irregular now)", "I don't know what type I have"],
  },
  "b2-r-identificar": {
    id: "b2-r-identificar",
    text: "Identify your document — bring it to an entity",
    note: "Bring your physical document (TIE or resolution) to a reference entity or immigration office. They'll be able to tell you exactly what type of authorization you have and what options you have.",
    opts: ["Referral: immigration office or entity"],
  },
  "b2-p1": {
    id: "b2-p1",
    text: "When does your temporary residence authorization expire?",
    note: "Official window: from 60 days BEFORE up to 90 days AFTER expiry. With the application filed on time, validity is extended until resolution (max. 3 months). Administrative silence is FAVOURABLE on renewal.",
    opts: ["More than 2 months (60 days)", "Less than 2 months", "Already expired (less than 90 days)"],
  },
  "b2-r-ok": {
    id: "b2-r-ok",
    text: "You have time — prepare the renewal now",
    note: "Submit between 60 days before and the expiry date. Approved renewal lasts 2 years. Base documents: relevant EX form, valid passport, padrón, criminal-record certificate + documents specific to your permit type. Online (Mercurio) or in person with appointment.",
    opts: ["Employee → EX-13 + contract + work history", "Self-employed → EX-15 + activity + SS contributions", "Non-profit → EX-07 + financial means + insurance"],
  },
  "b2-r-urgent": {
    id: "b2-r-urgent",
    text: "URGENT — less than 2 months to expiry",
    note: "Submit the application THIS WEEK. With the application filed, validity is extended until resolution. Administrative silence FAVOURABLE: if no response in 3 months, it's deemed approved.",
    opts: ["Mercurio (online) or urgent in-person appointment", "Consult support entity"],
  },
  "b2-r-critic": {
    id: "b2-r-critic",
    text: "CRITICAL — expires in less than 1 month",
    note: "Very urgent situation. Submit the application today if possible. With the application filed, even out of window, a positive resolution will regularize your situation. Get help from a lawyer or specialized entity.",
    opts: ["CEAR: 91 598 05 35", "SJM: 91 445 90 85", "File application today"],
  },
  "b2-r-ld": {
    id: "b2-r-ld",
    text: "Long-term residence — stable situation",
    note: "Long-term residence is indefinite. The TIE must be renewed every 5 years (simple procedure, doesn't reopen the merits). You have full labour rights, can sponsor family reunification and time counts toward nationality.",
    opts: ["Expired TIE → renew (EX-17, simple)", "Next goal → nationality application"],
  },
  "b2-p2": {
    id: "b2-p2",
    text: "How long ago did your authorization expire?",
    note: "Past 90 days from expiry without filing, ordinary renewal is no longer possible.",
    opts: ["Less than 90 days → you can still renew", "Between 90 days and 1 year", "More than 1 year"],
  },
  "b2-r-caducada-recent": {
    id: "b2-r-caducada-recent",
    text: "Expired less than 90 days ago — you can still renew",
    note: "Legally you can file up to 90 days AFTER expiry. Note: you are in irregular status (minor offence if <3 months, serious if >3 months). File today. A penalty file may be opened, but an approved renewal regularizes the situation.",
    opts: ["File the renewal today", "Get support from an entity or lawyer"],
  },
  "b2-r-caducada-mitja": {
    id: "b2-r-caducada-mitja",
    text: "Expired between 90 days and 1 year — serious irregularity",
    note: "Ordinary renewal no longer possible. Serious irregular status (fine or expulsion file possible). Options: (1) 2 years in Spain → arraigo Branch 1. (2) Authorization in last 2 years → second-chance arraigo. (3) Extraordinary regularization until 30/06/2026 if you meet requirements.",
    opts: ["2 years in Spain → Branch 1 arraigo", "Second-chance arraigo", "Extraordinary regularization until 30/06/2026", "Consult lawyer or CEAR/SJM urgently"],
  },
  "b2-r-caducada-llarga": {
    id: "b2-r-caducada-llarga",
    text: "Expired more than 1 year ago — complex situation",
    note: "Ordinary renewal is probably not viable. Options depend on the specific situation: if you've been in Spain 2+ years you can opt for arraigo (see Branch 1). If you had authorization in the last 2 years, you can opt for second-chance arraigo.",
    opts: ["2 years in Spain? → Branch 1 arraigo", "Authorization in last 2 years → second-chance arraigo", "Consult lawyer urgently"],
  },
  "b2-p3": {
    id: "b2-p3",
    text: "When did you lose or stop having the authorization?",
    note: "Second-chance arraigo requires having had a residence authorization in the 2 years immediately before the application.",
    opts: ["Less than 2 years ago", "More than 2 years ago"],
  },
  "b2-r-2a-op": {
    id: "b2-r-2a-op",
    text: "Second-chance arraigo",
    note: "For someone who had a residence authorization (NOT for exceptional circumstances, i.e. not a previous arraigo) in the last 2 years and couldn't renew for reasons OTHER than public order or security. Requirements: 2 years of continuous residence + no criminal record. EXCLUDES active asylum applicants and those coming from a previous arraigo. Authorization: 1 year + work. Form EX-10.",
    opts: ["Form: EX-10 second-chance arraigo", "Was the previous authorization an arraigo? → doesn't apply"],
  },
  "b2-r-antiga": {
    id: "b2-r-antiga",
    text: "Authorization more than 2 years ago — second-chance arraigo unavailable",
    note: "Second-chance arraigo requires the authorization to have been in the last 2 years. If it's older, this pathway isn't available. Options: if you've been in Spain 2+ years, look at Branch 1 arraigo pathways (sociolaboral, socioformativo, social).",
    opts: ["2 years in Spain? → Branch 1", "Consult lawyer or entity"],
  },
  "b3-p0": {
    id: "b3-p0",
    text: "Are you a citizen of the EU, EEA or Switzerland?",
    note: "EU: Germany, Austria, Belgium, Bulgaria, Croatia, Denmark, Slovakia, Slovenia, Spain, Estonia, Finland, France, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Sweden, Czech Republic, Cyprus. EEA also: Iceland, Liechtenstein, Norway. Switzerland by bilateral agreement.",
    opts: ["Yes, I'm an EU/EEA/Swiss citizen", "No, I'm a non-EU family member of an EU citizen", "I'm a family member of a Spanish national"],
  },
  "b3-p1": {
    id: "b3-p1",
    text: "How long have you been in Spain or do you plan to stay?",
    note: "EU freedom of movement allows up to 90 days with no procedure. From day 91 onwards, registration is mandatory.",
    opts: ["Less than 3 months (90 days)", "More than 3 months"],
  },
  "b3-r-curta": {
    id: "b3-r-curta",
    text: "Short stay — no procedure needed",
    note: "Up to 90 days you can stay in Spain freely with your passport or national ID. You don't need to register or get any document. If you want to work, you need the NIE for tax purposes, but it's not mandatory for the stay.",
    opts: ["If you'll work → request NIE at the immigration office"],
  },
  "b3-p2": {
    id: "b3-p2",
    text: "Have you registered at the Central Registry of Foreigners (green certificate)?",
    note: "The green certificate (NIE verde / CUE) is mandatory if you reside more than 3 months. It must be requested in the first 3 months from entry. Obtained at the immigration office or police station of your province. Form EX-18. Issued same day.",
    opts: ["No, I haven't done it", "Yes, I already have it"],
  },
  "b3-r-registre": {
    id: "b3-r-registre",
    text: "You must register — get the green certificate (NIE verde)",
    note: "Mandatory if you stay or will stay more than 3 months. Window: first 3 months from entry. Where: immigration office or police station of your province. Appointment required (high demand, book early). Documents: form EX-18 + valid passport/ID + documents justifying the residence reason (contract, enrollment, financial means + health insurance). Fee: 790 code 012. The certificate is issued same day. Doesn't expire but residence must be maintained.",
    opts: ["Employee → work contract or company declaration", "Self-employed → tax registration or SS", "Student → enrollment + financial means + insurance", "No activity → sufficient financial means + health insurance"],
  },
  "b3-p3": {
    id: "b3-p3",
    text: "How long have you been legally residing in Spain?",
    note: "Permanent residence is acquired with 5 years of continuous legal residence. Interruptions of less than 2 consecutive years don't affect the count.",
    opts: ["Less than 5 years", "5 years or more"],
  },
  "b3-r-permanent": {
    id: "b3-r-permanent",
    text: "EU permanent residence — full rights",
    note: "With 5 years of continuous legal residence you're entitled to permanent residence. The EU permanent residence certificate is obtained at the immigration office or police station. Form EX-18. Validity: 10 years, automatically renewable. Rights: work, social services, healthcare, family reunification, option to nationality (10 years total legal residence, reduced to 2 years for Ibero-Americans and other countries with agreements).",
    opts: ["Request permanent residence certificate (EX-18)", "Start nationality process if you have 10 years"],
  },
  "b3-p4": {
    id: "b3-p4",
    text: "What is your main goal right now?",
    note: "",
    opts: ["Work in Spain", "Bring family from outside the EU", "Study", "Access healthcare or social services"],
  },
  "b3-r-treball": {
    id: "b3-r-treball",
    text: "Work in Spain as an EU citizen",
    note: "You have free access to the Spanish labour market. With the green certificate (NIE verde) you can work without any additional permit. You need the NIE for tax and labour matters. The company must register you with Social Security. If self-employed: register with the tax authority (form 036/037) + register with SS.",
    opts: ["Have the green certificate? → you can work", "Don't have it → register first (EX-18)"],
  },
  "b3-r-familia": {
    id: "b3-r-familia",
    text: "Bring family from outside the EU — community regime",
    note: "Non-EU family members (spouse, children <21 or dependent, dependent ascendants, registered partner) have the right to accompany you or reunify. The community regime is more favourable than the general regime. They must apply for the EU citizen family-member residence card. Form EX-19. Validity: 5 years. Application window: 90 days from entry to Spain. Cost: fee 790 code 012 (equivalent to a Spanish DNI).",
    opts: ["Family member files EX-19 within 90 days of entry", "Spanish spouse? → EX-19 if they exercised free movement, EX-24 otherwise"],
  },
  "b3-r-estudis": {
    id: "b3-r-estudis",
    text: "Study in Spain as an EU citizen",
    note: "You have the right to study under equal conditions as Spaniards (prices, scholarships, access). You need the green certificate if the stay is longer than 3 months. Documents for registration: form EX-18 + enrollment from the educational center + sufficient financial means (show you won't be a burden on the state) + public or private health insurance with adequate coverage.",
    opts: ["Register (EX-18) + enrollment + means + insurance"],
  },
  "b3-r-serveis": {
    id: "b3-r-serveis",
    text: "Access to healthcare and social services as an EU citizen",
    note: "With the green certificate and contributing to Social Security you have full access to public healthcare. If you don't work, you must show financial means and health insurance. Padrón registration gives you access to municipal and regional services. Individual health card: request it at the CAP or health centre in your area.",
    opts: ["Padrón + green certificate → access to services"],
  },
  "b3-p-familiar": {
    id: "b3-p-familiar",
    text: "What is your relationship with the EU citizen?",
    note: "The community regime is very favourable for family members. The application must be made within 90 days from entry to Spain. Form EX-19.",
    opts: ["Spouse or registered partner", "Child under 21 or dependent", "Dependent ascendant (parent...)", "Other family member (siblings, uncles...)"],
  },
  "b3-r-familiar-ue": {
    id: "b3-r-familiar-ue",
    text: "EU citizen family-member residence card",
    note: "Apply within 90 days from entry. Documents: form EX-19 + valid passport + documentation of family bond (apostilled and translated marriage/birth certificate) + green NIE of the EU family member. Cost: fee 790 code 012 (DNI price). Initial validity: 5 years. After 5 years → permanent residence (10 years, automatically renewable). Form EX-19.",
    opts: ["Form: EX-19 (within 90 days of entry)", "5 years → automatic permanent residence"],
  },
  "b3-r-familiar-altres": {
    id: "b3-r-familiar-altres",
    text: "Extended family — case-by-case assessment",
    note: "Other family members (siblings, in-laws, nephews/nieces...) don't have automatic right to the community regime. You must show economic dependence or 24 months of cohabitation in the country of origin. The decision is discretionary at the immigration office. We recommend a lawyer specialized in EU law.",
    opts: ["Consult a lawyer specialized in EU law"],
  },
  "b3-r-familiar-espanyol": {
    id: "b3-r-familiar-espanyol",
    text: "Family of a Spanish national — two possible pathways",
    note: "If your Spanish family member has exercised the right to free movement (lived in another EU country), you can go via EX-19 (community regime, very favourable). If they haven't exercised free movement, you must go via EX-24 (general regime for family of a Spaniard). When in doubt, consult a lawyer — the EX-19 pathway is much more favourable and worth exploring.",
    opts: ["Has lived in another EU country → EX-19 (community)", "Has never lived outside Spain → EX-24 (general)", "Consult a lawyer to determine best pathway"],
  },
  "b4-p0": {
    id: "b4-p0",
    text: "Where are you right now?",
    note: "The place where you are determines how you must proceed. You have the right to apply for international protection regardless of where you are.",
    opts: ["In Spain, on national territory", "At the Spanish border, port or airport", "In a CIE (Detention Centre)"],
  },
  "b4-r-frontera": {
    id: "b4-r-frontera",
    text: "RIGHT TO REQUEST ASYLUM AT THE BORDER — Show this screen",
    note: "You have the right to request international protection at any entry point. Say clearly: 'I request international protection'. They cannot expel you until the application is processed. You have the right to a free interpreter. You have the right to a free lawyer. The application is CONFIDENTIAL — it's not communicated to your country of origin. If your application is not admitted for processing, you have 2 working days to file a re-examination.",
    opts: ["Say: I REQUEST INTERNATIONAL PROTECTION", "ACNUR Spain: 91 556 35 49", "CEAR: 91 598 05 35"],
  },
  "b4-r-cie": {
    id: "b4-r-cie",
    text: "In a CIE — you can request asylum from here",
    note: "You can request international protection even while detained in a CIE. Ask to speak with the duty lawyer or contact UNHCR or CEAR. You have the right to a free interpreter and lawyer. The application halts the expulsion procedure while it's being processed.",
    opts: ["Request asylum from CIE staff", "ACNUR: 91 556 35 49", "CEAR: 91 598 05 35"],
  },
  "b4-p1": {
    id: "b4-p1",
    text: "Have you already filed the international protection application?",
    note: "The window for asylum is 1 month from entry to Spain. If you've passed the month, you can show justified cause to extend the window. The procedure is free.",
    opts: ["No, I haven't applied yet", "Yes, awaiting resolution", "Yes, they denied me"],
  },
  "b4-p-nosol": {
    id: "b4-p-nosol",
    text: "Have you been in Spain for less than 1 month?",
    note: "Official window is 1 month from entry. After the window, you can claim justified cause. The procedure is free and confidential.",
    opts: ["Yes, less than 1 month", "No, more than 1 month"],
  },
  "b4-r-com-sol": {
    id: "b4-r-com-sol",
    text: "How to request international protection in Spain",
    note: "Where to file: Asylum and Refuge Office (OAR) — Madrid: C/ Pradillo 40; Police stations with immigration service (any province); Border posts. Appointment required (high demand). The procedure is FREE — beware of anyone charging. Documents: passport or ID document (if you have one — applications without documents are also possible). At the appointment: explain the reasons for your application. They'll give you a 'Manifestación de voluntad' that protects you from expulsion. Then: formal interview → white sheet (receipt) → red card (applicant document).",
    opts: ["OAR Madrid: C/ Pradillo 40, 28002", "Police station (any province)", "ACNUR advice: 91 556 35 49"],
  },
  "b4-r-fora-termini": {
    id: "b4-r-fora-termini",
    text: "Outside the 1-month window — but still possible",
    note: "You can claim justified cause to exceed the window. Contact a lawyer or specialized entity (CEAR, SJM, UNHCR) to assess your case. If you're in irregular status, an asylum application halts any expulsion file while it's processed.",
    opts: ["Contact CEAR/SJM/UNHCR to assess the case", "File application claiming justified cause"],
  },
  "b4-p-espera": {
    id: "b4-p-espera",
    text: "What stage is your application at?",
    note: "The maximum resolution window is 6 months from admission to processing, but in practice it can take much longer. You have the right to consult your file at any time.",
    opts: ["Awaiting admission to processing (<1 month)", "Admitted, awaiting resolution", "I have the red card, I'm in the system"],
  },
  "b4-r-espera-admissio": {
    id: "b4-r-espera-admissio",
    text: "Awaiting admission to processing — you have the white sheet",
    note: "The white sheet (Filing Receipt) is your valid document while you wait. The OAR has 1 month to decide whether to admit it for processing. In practice, it's almost always admitted automatically. If you don't get a notification within 1 month → the application is deemed admitted. Renew the document when it expires (9 months after the white sheet).",
    opts: ["Renew appointment when the white sheet expires (9 months)", "If not admitted → appeal within 2 working days"],
  },
  "b4-r-espera-resolucio": {
    id: "b4-r-espera-resolucio",
    text: "Application admitted — awaiting final resolution",
    note: "Maximum window: 6 months (can take much longer in practice). You have the right to work 6 months after the application if you've received no resolution. Access to healthcare, education and the reception system (limited spots). Renew the red card annually while you wait. You can check the status of your file at the OAR.",
    opts: ["Right to work 6 months without resolution", "Renew red card annually", "2026 extraordinary regularization if you meet requirements"],
  },
  "b4-r-tarjeta-roja": {
    id: "b4-r-tarjeta-roja",
    text: "You have the red card — active status",
    note: "The red card certifies you're an international-protection applicant. Rights: access to healthcare, education, reception system. Right to work 6 months after the application if there's no resolution. Renew it annually. If you applied for asylum before 01/01/2026, you can opt for the 2026 extraordinary regularization.",
    opts: ["Right to work after 6 months", "Extraordinary regularization until 30/06/2026", "Renew red card annually"],
  },
  "b4-r-reg-ext": {
    id: "b4-r-reg-ext",
    text: "2026 extraordinary regularization — pathway for asylum applicants",
    note: "If you applied for international protection BEFORE 01/01/2026, you can opt for the extraordinary regularization until 30/06/2026. Requirements: adult + in Spain + 5 continuous months + no criminal record + passport/cédula/travel title (valid or expired). If approved → you must withdraw the asylum application or the appeal. Authorization: 1 year + right to work.",
    opts: ["Apply by 30/06/2026 (online or in person)", "Tel. 060 for questions and appointments"],
  },
  "b4-p-denegat": {
    id: "b4-p-denegat",
    text: "When were you notified of the denial?",
    note: "Appeal windows are very strict. Don't miss them.",
    opts: ["Less than 2 working days ago (non-admission)", "Less than 1 month ago (final resolution)", "More than 1 month ago"],
  },
  "b4-r-reexamen": {
    id: "b4-r-reexamen",
    text: "URGENT — Re-examination: 2 working days",
    note: "If you weren't admitted to processing, you have ONLY 2 working days to file a re-examination. Authorities have 48 hours to respond. Contact a lawyer or entity IMMEDIATELY. The service is free.",
    opts: ["CEAR: 91 598 05 35 — URGENT", "SJM: 91 445 90 85 — URGENT", "Court-appointed lawyer: request at the police station"],
  },
  "b4-r-recurs": {
    id: "b4-r-recurs",
    text: "URGENT — Appeal against denial: 1 month",
    note: "You have 1 month from notification to file an optional appeal for reconsideration before the OAR, or 2 months for a contentious-administrative appeal before the National Court. Contact a lawyer specialized in international protection. The service is free if you don't have resources. Consider whether you met requirements for the 2026 extraordinary regularization (until 30/06/2026).",
    opts: ["Reconsideration appeal (1 month) → OAR", "Contentious appeal (2 months) → National Court", "Extraordinary regularization if it applies → until 30/06/2026", "CEAR/SJM/UNHCR — free advice"],
  },
  "b4-r-denegat-antic": {
    id: "b4-r-denegat-antic",
    text: "Denial more than 1 month ago — residual options",
    note: "Appeal windows have passed. Options: (1) If you applied for asylum before 01/01/2026, you can opt for the extraordinary regularization until 30/06/2026. (2) If you've been in Spain 2 years, you can opt for arraigo (see Branch 1). (3) Humanitarian protection on health or personal-risk grounds. Consult a lawyer or specialized entity.",
    opts: ["Extraordinary regularization until 30/06/2026", "2 years in Spain → Branch 1 arraigo", "Consult CEAR/SJM/UNHCR"],
  },
  "b4-r-resolucio-positiva": {
    id: "b4-r-resolucio-positiva",
    text: "Favourable resolution — Refugee status or subsidiary protection",
    note: "Congratulations. You have the right to: residence and work in Spain, travel document (refugees), family reunification, equal access to social services, nationality application after 5 years (refugees, instead of the usual 10). The card must be renewed periodically but the status is stable.",
    opts: ["Apply for TIE as a refugee", "Family reunification — request extension", "Nationality after 5 years (refugee status)"],
  },
};

const file = path.join(__dirname, "..", "data", "tree-translations.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const expectedIds = Object.keys(data.es);
const enIds = Object.keys(en);

const missing = expectedIds.filter((id) => !enIds.includes(id));
const extra = enIds.filter((id) => !expectedIds.includes(id));
if (missing.length || extra.length) {
  console.error("Mismatch — missing:", missing, " extra:", extra);
  process.exit(1);
}

// Check opts arity matches.
for (const id of expectedIds) {
  if (en[id].opts.length !== data.es[id].opts.length) {
    console.error(`Opts length mismatch for ${id}: en=${en[id].opts.length} es=${data.es[id].opts.length}`);
    process.exit(1);
  }
}

data.en = en;
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Wrote ${enIds.length} EN entries to tree-translations.json`);
