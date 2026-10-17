import { CaseData } from "../types";

export const PRESET_CASES: CaseData[] = [
  {
    id: "GHOST-101",
    city: "Delhi",
    victim: "Maya Deshmukh (Paranormal Investigator & TV Host)",
    victim_detail: "A famous TV ghost hunter found dead during a midnight live séance inside India's most haunted fort, surrounded by strange spectral symbols.",
    scene: "Haunted Courtyard at Bhangarh Fort Complex",
    time_of_death: "11:45 PM, during the live phantom hunt stream",
    method: "Aerosolized toxic Datura plant extract sprayed into the fog machine, disguised as 'ghost ectoplasm mist'",
    suspects: ["Vikram Rathore", "Sneha Roy"],
    suspect_roles: ["Self-Proclaimed Exorcist & Medium", "Paranormal Show Executive Producer"],
    relationship: "Her exorcist co-host was exposed as a fake charlatan, while the producer faced a ₹5 Cr lawsuit for staging fake supernatural encounters.",
    shared_alibi: "standing near the fort entrance gate drinking hot spiced chai and reading electromagnetic field (EMF) ghost meters together.",
    hard_facts: [
      {
        fact: "The entrance chai stall closed and locked its shutters at 10:30 PM due to police curfew.",
        contradiction_triggers: ["drinking hot spiced chai", "bought chai at stall", "drank warm tea", "chai vendor served us"],
      },
      {
        fact: "All EMF meters in the team kit suffered battery drainage and died completely at 11:00 PM.",
        contradiction_triggers: ["reading EMF meters", "EMF meter was flashing green", "checked ghost reader", "meter was working"],
      },
      {
        fact: "The fort entrance arch lantern was smashed, plunging the entire gate area into pitch darkness.",
        contradiction_triggers: ["bright lantern light", "saw each other clearly under gate lamp", "well lit entrance"],
      },
      {
        fact: "A loud diesel generator powering production floodlights was roaring at 95dB right beside the gate.",
        contradiction_triggers: ["quiet gate", "peaceful night", "could whisper to each other", "no noise outside"],
      },
      {
        fact: "Heavy midnight fog rolled down the valley, making the inner courtyard invisible from the entrance gate.",
        contradiction_triggers: ["watched courtyard from gate", "saw Maya clearly in courtyard", "clear view of séance"],
      },
    ],
    evidence: [
      {
        id: "fog_canister",
        name: "Datura-Spiked Ectoplasm Canister",
        location: "Courtyard Stage",
        reveal_text: "A fog machine refill bottle containing lethal concentration of Belladonna and Datura stramonium alkaloids.",
        relevance: "supports_guilty",
        hint_question: "Who brought or refilled this custom fog machine canister before the séance?",
      },
      {
        id: "speaker_rig",
        name: "Hidden Ultrasonic Phantom Speaker",
        location: "Fort Wall Niche",
        reveal_text: "A micro-speaker rigged to play fake whispering phantom voices to induce panic.",
        relevance: "supports_guilty",
        hint_question: "Why did you hide an ultrasonic speaker in the fort wall?",
      },
      {
        id: "fraud_audit",
        name: "Exorcist Fraud Exposure Letter",
        location: "Maya's Satchel",
        reveal_text: "A signed document exposing Vikram's fake exorcism tricks and staged ghost sightings.",
        relevance: "supports_guilty",
        hint_question: "Did Maya threaten to ruin your career by publishing this fraud exposure?",
      },
      {
        id: "shattered_talisman",
        name: "Broken Brass Occult Talisman",
        location: "Fort Stairs",
        reveal_text: "An ancient brass amulet dropped near the ruined staircase.",
        relevance: "red_herring",
        hint_question: "Whose brass talisman was dropped on the fort stairs?",
      },
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "23:40 - 23:50 IST",
      cause_of_death: "Acute Anticholinergic Toxicity & Respiratory Failure from Inhaled Datura Tropane Alkaloids",
      toxicology_results: "Atropine and scopolamine concentration in bronchial mucosa >450 ng/mL.",
      stomach_contents: "Minimal water, mint lozenge.",
      external_injuries: [
        "Severe pupillary dilation (mydriasis)",
        "Severe mucosal dryness and facial flushing",
        "Cyanotic discoloration around lips"
      ],
      forensic_notes: "Victim inhaled concentrated tropane alkaloid mist; lost orientation within 30 seconds and suffered fatal respiratory arrest.",
      body_marks: [
        { x: 50, y: 18, label: "Mydriasis & Flushing", detail: "Classic tropane alkaloid anticholinergic toxidrome" },
        { x: 50, y: 50, label: "Bronchial Spasm", detail: "Datura toxin aerosolized via fog machine intake" }
      ]
    },
  },

  {
    id: "ZOMBIE-303",
    city: "Bangalore",
    victim: "Dr. Samar Sen (Chief Bio-Defense Geneticist)",
    victim_detail: "A lead virologist found locked inside a high-containment BSL-4 isolation chamber during an alleged 'zombie neuro-parasite outbreak'.",
    scene: "BSL-4 Bio-Hazard Containment Vault, Kaziranga Research Lab",
    time_of_death: "10:15 PM, during pathogen strain isolation",
    method: "Decompression airlock bypass that flooded the chamber with synthetic neuro-paralytic agent simulating viral aggression",
    suspects: ["Dr. Anika Das", "Major Devang Varma"],
    suspect_roles: ["Senior Bio-Geneticist", "Military Bio-Defense Inspector"],
    relationship: "Dr. Anika was about to be fired for selling gene-splicing code to illegal bioweapon syndicates, while the Major faced a court-martial.",
    shared_alibi: "sitting inside the decontamination breakroom drinking hot espresso and watching live BSL-4 camera feeds on the main wall monitor.",
    hard_facts: [
      {
        fact: "The decontamination breakroom espresso machine was undergoing chemical flushing and completely unplugged.",
        contradiction_triggers: ["drinking hot espresso", "brewed coffee in machine", "espresso machine was working", "drank warm coffee"],
      },
      {
        fact: "An EMP power surge at 9:55 PM fried all BSL-4 camera feeds, leaving all monitors displaying static error screens.",
        contradiction_triggers: ["watching live camera feeds", "saw BSL-4 room on monitor", "camera feeds were clear", "monitors worked fine"],
      },
      {
        fact: "The breakroom airlock door latch shorted shut, trapping anyone inside the room until 10:40 PM.",
        contradiction_triggers: ["walked out freely", "stepped out for air at 10:15", "left breakroom freely"],
      },
      {
        fact: "The breakroom dedicated AC unit was jammed on maximum freeze at 10°C with frost covering the vents.",
        contradiction_triggers: ["warm breakroom", "sweating in breakroom", "comfortable temperature", "hot inside"],
      },
      {
        fact: "The breakroom window glass was covered in opaque decontamination foam.",
        contradiction_triggers: ["looked out breakroom window", "saw hallway clearly through window"],
      },
    ],
    evidence: [
      {
        id: "valve_bypass",
        name: "Override Decompression Keycard",
        location: "Airlock Control Panel",
        reveal_text: "A master keycard used to trigger manual chamber depressurization and release toxic gas.",
        relevance: "supports_guilty",
        hint_question: "Who authorized the manual airlock decompression command?",
      },
      {
        id: "bioweapon_ledger",
        name: "Offshore Gene-Splitting Contract",
        location: "Dr. Anika's Encrypted Drive",
        reveal_text: "Audit proving $3M in illegal cryptocurrency received for exporting neural parasite samples.",
        relevance: "supports_guilty",
        hint_question: "Why did you export confidential neuro-parasite gene code offshore?",
      },
      {
        id: "court_martial_order",
        name: "Military Inquiry Summons",
        location: "Major's Briefcase",
        reveal_text: "Document summoning Major Varma for criminal negligence regarding bio-containment breaches.",
        relevance: "supports_guilty",
        hint_question: "Were you trying to silence Dr. Samar before his court-martial testimony?",
      },
      {
        id: "shattered_vial",
        name: "Cracked Sample Container",
        location: "Lab Floor",
        reveal_text: "An empty glass bio-vial with a hazmat warning label.",
        relevance: "red_herring",
        hint_question: "Whose sample vial was shattered on the lab floor?",
      },
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "22:10 - 22:20 IST",
      cause_of_death: "Acute Paralytic Hypoxia & Central Nervous System Collapse",
      toxicology_results: "High concentration of organophosphate neurotoxin in blood serum.",
      stomach_contents: "Energy drink, protein bar.",
      external_injuries: [
        "Subdermal capillary hemorrhaging across chest and neck",
        "Pore cyanosis around fingernails",
        "Muscle rigidity consistent with sudden tetanic spasms"
      ],
      forensic_notes: "Aerosolized neurotoxin flooded containment vault; caused neuromuscular paralysis in 15 seconds.",
      body_marks: [
        { x: 50, y: 22, label: "Cyanosis & Spasms", detail: "Neurotoxin triggered rapid respiratory paralysis" },
        { x: 50, y: 55, label: "Tetanic Rigidity", detail: "High organophosphate concentration in blood" }
      ]
    },
  },

  {
    id: "STALKER-606",
    city: "Mumbai",
    victim: "Kavya Malhotra (True-Crime Podcaster)",
    victim_detail: "A popular crime host abducted and found dead inside an old heritage tower, surrounded by creepy stalker photos, cryptic blood glyphs, and audio tapes.",
    scene: "Abandoned Heritage Tower overlooking Marine Drive, Mumbai",
    time_of_death: "11:20 PM, after receiving a cryptic stalker call",
    method: "Potassium cyanide spiked into her personal copper water bottle left on her recording desk",
    suspects: ["Rishi Saxena", "Priya Joshi"],
    suspect_roles: ["Obsessive Ex-Sound Editor & Stalker", "Podcast Brand Sponsorship Lead"],
    relationship: "Her ex-sound editor was fired after sending 500+ creepy stalker voice notes, while her sponsor manager embezzled ₹80 Lakhs in ad revenues.",
    shared_alibi: "sitting at the open-air tea stall across the street watching Marine Drive traffic and drinking hot cutting chai together.",
    hard_facts: [
      {
        fact: "Heavy monsoon rain and high sea waves flooded the street at 10:45 PM, forcing the tea stall to close.",
        contradiction_triggers: ["sitting at open-air tea stall", "drank cutting chai at stall", "tea vendor was serving us", "sat outside drinking tea"],
      },
      {
        fact: "The street floodlights shorted out at 11:00 PM, plunging the entire tower perimeter into pitch darkness.",
        contradiction_triggers: ["bright streetlights", "saw each other clearly under streetlight", "well lit street"],
      },
      {
        fact: "An industrial water pump on the corner was roaring loudly at 98dB while pumping flood water.",
        contradiction_triggers: ["quiet street", "peaceful night", "could whisper to each other", "no noise outside"],
      },
      {
        fact: "The tea stall area has no line of sight to the heritage tower rear stairwell exit.",
        contradiction_triggers: ["watched tower exit from tea stall", "saw her walk out of tower"],
      },
      {
        fact: "Cellular towers along Marine Drive failed due to rain, cutting off all mobile signals.",
        contradiction_triggers: ["checked phone notifications", "scrolled Instagram", "phone had full signal"],
      },
    ],
    evidence: [
      {
        id: "stalker_tape",
        name: "Creepy Cassette Tape & Blood Glyph",
        location: "Recording Desk",
        reveal_text: "An audio tape containing whispered threat recordings and a drawn blood symbol found on Kavya's desk.",
        relevance: "supports_guilty",
        hint_question: "Who recorded these stalker audio tapes and left them in Kavya's studio?",
      },
      {
        id: "spiked_flask",
        name: "Cyanide-Spiked Copper Bottle",
        location: "Tower Floor",
        reveal_text: "Kavya's water bottle showing potassium cyanide chemical residue on the cap thread.",
        relevance: "supports_guilty",
        hint_question: "Did you poison Kavya's copper water flask before her podcast stream?",
      },
      {
        id: "embezzlement_audit",
        name: "Ad Revenue Fraud Notice",
        location: "Priya's Handbag",
        reveal_text: "Audit notice proving ₹80 Lakhs in sponsor payments were funneled into a private account.",
        relevance: "supports_guilty",
        hint_question: "Why did you funnel ₹80 Lakhs of Kavya's podcast revenues into your private bank?",
      },
      {
        id: "stalker_camera",
        name: "Broken Telephoto Camera Lens",
        location: "Stairwell Bin",
        reveal_text: "A camera lens used for secret long-distance surveillance photos.",
        relevance: "red_herring",
        hint_question: "Whose camera lens was discarded in the stairwell?",
      },
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "23:15 - 23:25 IST",
      cause_of_death: "Acute Cellular Hypoxia & Respiratory Failure from Potassium Cyanide Ingestion",
      toxicology_results: "Blood cyanide level 3.8 mg/L (Lethal threshold >1.0 mg/L). Bitter almond odor noted.",
      stomach_contents: "Water, herbal tea residue.",
      external_injuries: [
        "Cherry-red skin discoloration characteristic of cyanide poisoning",
        "Subconjunctival hemorrhages",
        "Oral mucosal burns"
      ],
      forensic_notes: "Cyanide binds cytochrome c oxidase, shutting down cellular ATP synthesis; death within 2 minutes.",
      body_marks: [
        { x: 50, y: 20, label: "Cherry-Red Mucosa", detail: "Classic tissue oxygen saturation from cyanide poisoning" },
        { x: 50, y: 48, label: "Gastric Cyanide Residue", detail: "Potassium cyanide ingested via spiked copper bottle" }
      ]
    },
  },

  {
    id: "REELS-880",
    city: "Goa",
    victim: "Ananya Kapoor (Top Livestream Star)",
    victim_detail: "A famous 5M follower lifestyle influencer found dead mid-livestream on her beach villa's infinity pool deck in Anjuna.",
    scene: "Infinity Pool Deck at Luxury Anjuna Villa, Goa",
    time_of_death: "6:45 PM, during golden hour sunset livestream",
    method: "Cardiac-halting neurotoxin injected into custom coconut water hydration pouch",
    suspects: ["Rehaan Mehta", "Diya Oberoi"],
    suspect_roles: ["Brand Sponsorship Manager", "Rival Content Creator"],
    relationship: "Her manager was secretly stealing ₹1.5 Cr in brand deals, while her rival lost a major global beauty campaign to Ananya.",
    shared_alibi: "inside the villa kitchen prepping fresh tropical fruit smoothies together for 20 minutes before the stream.",
    hard_facts: [
      {
        fact: "The villa kitchen power tripped at 6:30 PM and stayed pitch black all evening, disabling all blender appliances.",
        contradiction_triggers: ["blended smoothies", "used electric blender", "kitchen lights were bright", "made fresh smoothie in blender"],
      },
      {
        fact: "A heavy sea fog rolled in at 6:30 PM, making the pool deck completely invisible from the kitchen window.",
        contradiction_triggers: ["saw her on pool deck clearly", "watched her stream from kitchen window", "clear view of pool"],
      },
      {
        fact: "The kitchen island was covered in sticky spilled honey with a swarm of hornets buzzing around.",
        contradiction_triggers: ["clean kitchen island", "sat peacefully at counter", "no insects or hornets", "spotless kitchen counter"],
      },
      {
        fact: "An industrial diesel backup generator was roaring at 95dB right outside the kitchen wall.",
        contradiction_triggers: ["quiet kitchen", "could whisper to each other", "peaceful room", "no noise outside"],
      },
      {
        fact: "The kitchen refrigerator door seal was broken, dripping water and flashing an emergency chime continuously.",
        contradiction_triggers: ["fridge was quiet", "fridge worked fine", "no warning lights or sound"],
      },
    ],
    evidence: [
      {
        id: "spiked_pouch",
        name: "Tampered Hydration Pouch",
        location: "Pool Deck Table",
        reveal_text: "Ananya's signature coconut pouch with micro-puncture marks and neurotoxin residue around the straw nozzle.",
        relevance: "supports_guilty",
        hint_question: "Did you handle or bring the coconut drink pouch to the pool deck?",
      },
      {
        id: "contract_dispute",
        name: "Embezzlement Audit Notice",
        location: "Manager Laptop",
        reveal_text: "Legal notice demanding accounting records for ₹1.5 Cr in missing international sponsorship wire transfers.",
        relevance: "supports_guilty",
        hint_question: "Why did Ananya's lawyers issue you an embezzlement audit demand?",
      },
      {
        id: "threat_dm",
        name: "Leaked Rivalry Audio DMs",
        location: "Rival Phone",
        reveal_text: "Heated voice notes threatening to 'ruin Ananya's golden hour stream permanently'.",
        relevance: "supports_guilty",
        hint_question: "What did you mean when you threatened to ruin Ananya's livestream?",
      },
      {
        id: "ring_light",
        name: "Smashed Stream Ring Light",
        location: "Pool Edge",
        reveal_text: "A broken studio ring light dropped near the pool water.",
        relevance: "red_herring",
        hint_question: "How did the studio ring light end up broken by the pool?",
      },
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "18:40 - 18:50 IST",
      cause_of_death: "Acute Cardiac Arrest from Organic Neurotoxin Poisoning",
      toxicology_results: "High level of tetrodotoxin detected in gastric pouch fluid.",
      stomach_contents: "Coconut water with synthetic flavorings.",
      external_injuries: [
        "Cyanosis around lips and fingernail beds",
        "Pupillary constriction",
        "Minor abrasions on elbows from sudden collapse"
      ],
      forensic_notes: "Rapid cardiac failure occurred within 90 seconds of ingestion; victim collapsed mid-sentence during stream.",
      body_marks: [
        { x: 50, y: 18, label: "Cyanotic Discoloration", detail: "Neurotoxin induced respiratory & cardiac depression" },
        { x: 50, y: 48, label: "Gastric Toxin Localization", detail: "Tetrodotoxin concentrated in upper digestive tract" }
      ]
    },
  },

  {
    id: "STARTUP-990",
    city: "Bangalore",
    victim: "Kabir Anand (Quantum Computing Founder)",
    victim_detail: "A visionary quantum computing architect found frozen inside his sub-zero server chamber in Whitefield.",
    scene: "Quantum Cryo-Server Chamber in Whitefield, Bangalore",
    time_of_death: "11:15 PM, during quantum chip calibration",
    method: "Liquid nitrogen coolant line valve manually diverted into cleanroom ventilation intake",
    suspects: ["Meher Chandok", "Arjun Pillai"],
    suspect_roles: ["Chief Quantum Hardware Lead", "Venture Capital Partner"],
    relationship: "The hardware lead was about to be ousted for falsifying quantum qubit benchmarks, while the VC was facing ₹40 Cr losses.",
    shared_alibi: "sitting in the glass breakout room drinking hot filter coffee and reviewing financial spreadsheets on a laptop.",
    hard_facts: [
      {
        fact: "The glass breakout room Wi-Fi router burned out at 10:45 PM, severing all cloud spreadsheet connections.",
        contradiction_triggers: ["reviewed spreadsheets online", "accessed cloud finance sheet", "wi-fi was fast", "full internet signal"],
      },
      {
        fact: "The breakout room espresso and coffee machine was undergoing acid descaling and completely unplugged.",
        contradiction_triggers: ["drank hot filter coffee", "brewed fresh coffee", "coffee machine was working", "hot cup of coffee"],
      },
      {
        fact: "The breakout room smart glass tint was stuck on 100% opaque black, blocking all view of the server room door.",
        contradiction_triggers: ["watched server door through glass", "saw Kabir enter room", "clear glass view"],
      },
      {
        fact: "An emergency nitrogen alarm strobe was flashing blinding red light inside the breakout room continuously.",
        contradiction_triggers: ["normal soft lighting", "dark quiet room", "no flashing lights"],
      },
      {
        fact: "The HVAC vents were blowing air at 35°C due to an overheating condenser outside.",
        contradiction_triggers: ["cool comfortable room", "freezing cold breakout room", "ac was blasting cold"],
      },
    ],
    evidence: [
      {
        id: "valve_wrench",
        name: "Modified Nitrogen Valve Key",
        location: "Server Room Floor",
        reveal_text: "A specialized magnetic torque tool used to bypass safety interlocks on liquid nitrogen lines.",
        relevance: "supports_guilty",
        hint_question: "Who possessed the magnetic torque tool to turn the cryogenic valve?",
      },
      {
        id: "benchmark_audit",
        name: "Falsified Qubit Audit Log",
        location: "Kabir's Desk",
        reveal_text: "Report proving 80% of quantum benchmark claims were artificially simulated.",
        relevance: "supports_guilty",
        hint_question: "Why did you fabricate the quantum computing benchmark results?",
      },
      {
        id: "term_sheet",
        name: "Hostile Clawback Contract",
        location: "VC Briefcase",
        reveal_text: "Signed document demanding immediate repayment of ₹40 Cr with criminal lawsuit threats.",
        relevance: "supports_guilty",
        hint_question: "Did you threaten Kabir with immediate bankruptcy and fraud charges?",
      },
      {
        id: "shattered_goggles",
        name: "Smashed Laser Safety Glasses",
        location: "Cleanroom Bin",
        reveal_text: "Laser safety eyewear with a cracked lens.",
        relevance: "red_herring",
        hint_question: "Whose safety goggles were broken in the server cleanroom?",
      },
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "23:10 - 23:20 IST",
      cause_of_death: "Severe Systemic Hypothermia & Cryogenic Frostbite Shock",
      toxicology_results: "Severe blood oxygen depletion. No chemical poisons found.",
      stomach_contents: "Energy bar digestate, herbal tea.",
      external_injuries: [
        "Widespread third-degree frostbite necrosis across hands and face",
        "Corneal freezing opacification",
        "Pulmonary edema from inhaling -80°C nitrogen air"
      ],
      forensic_notes: "Victim exposed to rapid liquid nitrogen evaporation; ambient temperature dropped to -60°C in under 45 seconds.",
      body_marks: [
        { x: 50, y: 20, label: "Corneal Frostbite", detail: "Sub-zero flash freezing of ocular tissue" },
        { x: 30, y: 65, label: "Cryogenic Necrosis", detail: "Severe frostbite on fingers from trying to open locked valve" }
      ]
    },
  },
];
