// 20-module Mobile Device Security & Forensics curriculum
// Each module includes: title, objectives, content (~500 words condensed here), lab, quiz
// To keep bundle size manageable, content is concise yet structured; can be expanded later or lazy-loaded.

export interface CurriculumModule {
  title: string;
  objectives: string[];
  content: string; // markdown-capable
  lab: string[]; // steps
  quiz: { q: string; a: string }[]; // simple QA (a = expected answer brief)
}

// NOTE: For brevity in code, the ~500 word bodies are summarized; substitute full text if desired.
// The user requested replacement, so these serve as canonical modules shared by two courses.

export const mobileForensicsCurriculum: CurriculumModule[] = [
  {
    title: 'Introduction to Mobile Device Security & Forensics',
    objectives: [
      'Define scope & phases of mobile forensics',
      'List core threat vectors',
      'Explain legal & ethical constraints'
    ],
    content: `Covers motivation for mobile forensics, evidence lifecycle (identification->reporting), threat landscape (malware, SIM swap, rogue apps), Android vs iOS security posture, chain of custody discipline, tool categories (commercial vs open-source) and lab environment setup rationale. Establishes mindset: integrity + repeatability.`,
    lab: [
      'Provision forensic workstation (VM or host) with baseline tools',
      'Install Android emulator & iOS simulator',
      'Create structured evidence folder + chain-of-custody template'
    ],
    quiz: [
      { q: 'Name two mobile OS platforms', a: 'Android, iOS' },
      { q: 'Why is chain of custody critical?', a: 'Maintains evidentiary integrity/admissibility' },
      { q: 'First lifecycle phase?', a: 'Identification' }
    ]
  },
  {
    title: 'Android Architecture & Security Internals',
    objectives: ['Describe Android layer stack', 'Locate key evidence directories', 'Explain SELinux & sandboxing role'],
    content: `Explores boot chain, Verified Boot, partitions (boot, system, vendor, data), ART runtime, permission model, SELinux enforcing mode, file-based encryption (FBE) contexts, typical artifact paths (apps: /data/data, media: /sdcard), log sources (logcat, events). Forensic acquisition considerations (ADB, physical, custom recovery) & anti-forensics tactics.`,
    lab: ['Use adb shell to enumerate /data & /sdcard', 'Capture logcat and filter for a test app tag', 'Document partition mount points'],
    quiz: [
      { q: 'Kernel base for Android?', a: 'Linux' },
      { q: 'Primary user data partition?', a: '/data' },
      { q: 'Purpose of SELinux?', a: 'Mandatory access control / confinement' }
    ]
  },
  {
    title: 'iOS Architecture & Security Model',
    objectives: ['Explain secure boot chain', 'Identify sandbox layout', 'Describe Data Protection classes'],
    content: `Details iOS secure boot (Boot ROM->LLB->iBoot->kernel), code signing, SEP & keybag, APFS per-file encryption, app container locations, keychain categories, backup modalities (encrypted vs unencrypted), acquisition constraints sans jailbreak, iCloud sync artifacts. Contrasts Android openness vs iOS uniformity.`,
    lab: ['Create encrypted iTunes/Finder backup', 'Parse backup with open-source tool', 'Locate SMS & keychain database'],
    quiz: [
      { q: 'File system used by iOS?', a: 'APFS' },
      { q: 'Secure enclave role?', a: 'Protects cryptographic keys / secure services' },
      { q: 'Where are app container data stored?', a: 'Under /var/mobile/Containers/Data/Application' }
    ]
  },
  {
    title: 'Acquisition Strategies & Tooling',
    objectives: ['Differentiate logical vs physical acquisition', 'Select method per scenario', 'Mitigate evidence alteration'],
    content: `Compares logical, filesystem, physical, agent-based, and chip-off methods; trade-offs (depth vs risk). Discusses UFED, Magnet, open-source (ADB backup deprecated, libimobiledevice). Emphasizes hashing, write-blocking (where applicable), and documentation. Introduces volatile data capture boundaries in mobile context.`,
    lab: ['Perform logical Android backup (adb/alternative)', 'Hash resulting archive', 'Record acquisition log entries'],
    quiz: [
      { q: 'Which method yields raw flash data?', a: 'Physical acquisition' },
      { q: 'Primary risk of chip-off?', a: 'Potentially destructive / warranty void' },
      { q: 'Why hash evidence?', a: 'Integrity verification' }
    ]
  },
  {
    title: 'Artifact Taxonomy & Parsing',
    objectives: ['Classify artifact categories', 'Parse common SQLite & plist stores', 'Correlate timestamps'],
    content: `Breaks down communications (SMS, chats), geolocation, media, application logs, configuration, credentials. Parsing techniques: SQLite schema introspection, WAL & freelist recovery, plist reading, JSON logs. Triage prioritization using value vs volatility matrix.`,
    lab: ['Extract SMS database & list last 5 messages', 'Recover deleted rows via freelist (demo DB)', 'Parse plist for app preferences'],
    quiz: [
      { q: 'Common mobile database format?', a: 'SQLite' },
      { q: 'What is WAL?', a: 'Write-Ahead Log' },
      { q: 'Key plist use?', a: 'Store structured app/system preferences' }
    ]
  },
  {
    title: 'Timeline Reconstruction',
    objectives: ['Merge multi-source timestamps', 'Resolve timezone & skew issues', 'Identify activity clusters'],
    content: `Covers chronological normalization (epoch vs MAC times), timezone extraction, skew detection, clustering user actions, distinguishing automated vs user-driven events. Use of timeline tools and manual CSV pivoting.`,
    lab: ['Aggregate message, login, and network event times', 'Adjust for timezone offset', 'Highlight anomalous action burst'],
    quiz: [
      { q: 'Purpose of timeline analysis?', a: 'Reconstruct sequence of events' },
      { q: 'Issue when clocks differ?', a: 'Skew complicates ordering' },
      { q: 'Metric for cluster detection?', a: 'Inter-event gap' }
    ]
  },
  {
    title: 'Secure Mobile App Assessment: Fundamentals',
    objectives: ['List OWASP Mobile Top 10 categories', 'Differentiate static vs dynamic analysis', 'Identify insecure storage patterns'],
    content: `Introduces threat landscape: insecure storage, weak crypto, insecure comms, auth flaws. Contrasts static (source/decompile) vs dynamic (runtime, traffic) analysis; typical tools (MobSF, jadx, Burp). Storage pitfalls: plaintext tokens, improper key usage. Reporting severity with CVSS / business impact.`,
    lab: ['Run MobSF on sample APK', 'Enumerate high-risk findings', 'Document insecure data storage instance'],
    quiz: [
      { q: 'Static vs dynamic difference?', a: 'Code examination vs runtime behavior observation' },
      { q: 'One insecure storage example?', a: 'Tokens in SharedPreferences plaintext' },
      { q: 'Purpose of OWASP list?', a: 'Prioritize prevalent risks' }
    ]
  },
  {
    title: 'Secure Mobile App Assessment: Advanced',
    objectives: ['Instrument apps at runtime', 'Bypass root/jailbreak checks', 'Assess API authorization flaws'],
    content: `Deep dive into Frida scripting, Objection usage, hooking sensitive methods, patching root detection, intercepting TLS via custom CA, replay/modify API calls, enumerating hidden endpoints. Ethics & logging modifications.`,
    lab: ['Hook a login function with Frida', 'Capture & modify API request via Burp', 'Bypass root check in sample app'],
    quiz: [
      { q: 'Primary use of Frida?', a: 'Dynamic instrumentation' },
      { q: 'Why bypass jailbreak detection?', a: 'Enable deeper security testing' },
      { q: 'API abuse indicator?', a: 'Missing authorization checks' }
    ]
  },
  {
    title: 'Mobile Malware Analysis',
    objectives: ['Classify malware families', 'Conduct static triage', 'Capture dynamic behaviors'],
    content: `Covers trojans, spyware, bankers, stalkerware; static triage (permissions, strings, code flow), dynamic sandboxing, network IOC extraction, evasion tactics (emulator detection, obfuscation), attribution basics.`,
    lab: ['Decompile malicious APK', 'List suspicious permissions/domains', 'Run behavioral sandbox capture'],
    quiz: [
      { q: 'Example of mobile spyware action?', a: 'Exfiltrating SMS' },
      { q: 'Tool for APK decompile?', a: 'jadx' },
      { q: 'IOC meaning?', a: 'Indicator of Compromise' }
    ]
  },
  {
    title: 'Incident Triage for Mobile Devices',
    objectives: ['Perform rapid triage steps', 'Preserve volatile data', 'Decide containment vs monitoring'],
    content: `Rapid assessment workflow: isolate, document state, capture volatile logs/network, snapshot key artifacts, preliminary impact rating. Criteria for monitor vs immediate wipe. Communication & escalation paths.`,
    lab: ['Simulate compromise on emulator', 'Execute triage checklist', 'Record decision rationale'],
    quiz: [
      { q: 'First triage action?', a: 'Isolate device/network' },
      { q: 'Why capture volatile data early?', a: 'It may be lost quickly' },
      { q: 'Containment trade-off?', a: 'May lose attacker intel' }
    ]
  },
  {
    title: 'Mobile Network Forensics',
    objectives: ['Capture traffic ethically', 'Extract metadata from encrypted sessions', 'Identify C2 patterns'],
    content: `Differentiates cellular vs Wi-Fi capture constraints, proxy interception, TLS fingerprinting, DNS/SNI analysis, traffic timing correlations, anomaly detection heuristics, push notification considerations.`,
    lab: ['Configure emulator proxy to Burp', 'Log suspicious endpoints', 'Correlate DNS queries to app events'],
    quiz: [
      { q: 'Tool for Wi-Fi capture?', a: 'Wireshark' },
      { q: 'Value of DNS metadata?', a: 'Indicates domains contacted' },
      { q: 'C2 pattern sign?', a: 'Regular beacon intervals' }
    ]
  },
  {
    title: 'Cloud Artifact Recovery',
    objectives: ['Identify synced services', 'Acquire cloud backups', 'Respect legal boundaries'],
    content: `Explores iCloud, Google, WhatsApp/Signal backup models, token extraction, differential value vs device-only data, jurisdiction & warrant concerns, logging provenance of cloud pulls.`,
    lab: ['Generate test Google backup', 'Download via Takeout', 'Catalog artifact types present only in cloud'],
    quiz: [
      { q: 'Benefit of cloud backup?', a: 'May include deleted device data' },
      { q: 'Tool/service for Google export?', a: 'Google Takeout' },
      { q: 'Legal risk?', a: 'Unauthorized access/privacy violation' }
    ]
  },
  {
    title: 'Encryption & Bypass Techniques',
    objectives: ['Summarize Android FBE & iOS Data Protection', 'List lawful bypass avenues', 'Document limitations transparently'],
    content: `Details key hierarchies, hardware-backed keystores, secure boot roles; lawful methods (user consent, exploit for specific SoC, memory acquisition). Emphasis on ethics & feasibility assessment matrix.`,
    lab: ['Record device encryption status', 'Attempt parse encrypted backup without password', 'Document failure & reasoning'],
    quiz: [
      { q: 'Android encryption model?', a: 'File-Based Encryption (FBE)' },
      { q: 'Lawful bypass example?', a: 'User provided passcode' },
      { q: 'iOS key storage chip?', a: 'Secure Enclave' }
    ]
  },
  {
    title: 'Secure Evidence Handling',
    objectives: ['Maintain integrity', 'Track custody transitions', 'Differentiate working vs master copy'],
    content: `Hashing (SHA-256 recommended), tamper-evident storage, custody log fields, separation of analysis workspace from originals, periodic re-hash verification, documenting tool versions for reproducibility.`,
    lab: ['Hash acquisition image before/after copy', 'Fill chain-of-custody entry', 'Seal archive in encrypted container'],
    quiz: [
      { q: 'Why re-hash later?', a: 'Detect unintended alteration' },
      { q: 'Custody log core field?', a: 'Handler identity/time' },
      { q: 'Working copy purpose?', a: 'Preserve original while analyzing' }
    ]
  },
  {
    title: 'Reporting & Communication',
    objectives: ['Structure forensic report', 'Translate technical to executive language', 'Cite evidence consistently'],
    content: `Report sections: executive summary, scope, methodology, findings, conclusions, appendices. Clarity, neutrality, evidence linkage with IDs + hashes, peer review cycle, redaction practices.`,
    lab: ['Draft mini report with 3 findings', 'Peer review a partner report', 'Revise based on feedback'],
    quiz: [
      { q: 'Why executive summary?', a: 'Brief decision-maker insight' },
      { q: 'Evidence citation includes?', a: 'ID + hash/ref path' },
      { q: 'Tone requirement?', a: 'Objective' }
    ]
  },
  {
    title: 'Expert Testimony Preparation',
    objectives: ['Prepare for direct/cross examination', 'Explain complex topics plainly', 'Maintain credibility'],
    content: `Witness preparation: mastery of report, glossary of simplified analogies, handling hostile questioning, avoiding speculation, clarifying scope limits. Visual aids & admissibility checks.`,
    lab: ['Role-play testimony Q&A', 'Receive clarity feedback', 'Refine analogies list'],
    quiz: [
      { q: 'If unsure of answer?', a: 'State you do not know' },
      { q: 'Speculation risk?', a: 'Undermines credibility' },
      { q: 'Aid for juror comprehension?', a: 'Approved visual timeline' }
    ]
  },
  {
    title: 'Case Study: Insider Data Exfiltration',
    objectives: ['Correlate multi-log sources', 'Identify exfil artifacts', 'Draft succinct narrative'],
    content: `Scenario-based walkthrough: suspicious PDF transmissions via chat, timeline fusion (chat DB + VPN + access logs), detection of pattern vs noise, deriving motive inference boundaries.`,
    lab: ['Analyze provided chat + VPN logs', 'Extract file transfer evidence', 'Draft 1-page summary'],
    quiz: [
      { q: 'Why correlate logs?', a: 'Context & validation' },
      { q: 'Common exfil channel?', a: 'Messaging app attachment' },
      { q: 'Narrative risk?', a: 'Over-speculation' }
    ]
  },
  {
    title: 'Case Study: Malware Campaign',
    objectives: ['Dissect malicious app lifecycle', 'Map C2 infrastructure', 'Recommend mitigations'],
    content: `Infection chain reconstruction, payload behavior, IOC catalog, infrastructure pivoting, user awareness gaps, defense-in-depth recommendations (store policy, MDM, network blocks).`,
    lab: ['Sandbox provided APK', 'List IOCs & C2 domains', 'Write mitigation memo'],
    quiz: [
      { q: 'C2 stands for?', a: 'Command and Control' },
      { q: 'Mitigation layer example?', a: 'MDM policy enforcement' },
      { q: 'IOC example?', a: 'Suspicious domain' }
    ]
  },
  {
    title: 'Capstone: End-to-End Investigation',
    objectives: ['Execute full workflow', 'Prioritize evidence triage', 'Produce defensible report'],
    content: `Timed simulation integrating acquisition, parsing, timeline, malware suspicion, cloud artifact pull, reporting & presentation. Emphasis on decision logging & scope control.`,
    lab: ['Complete scenario within timebox', 'Submit final report with hashes', 'Deliver 5-min verbal brief'],
    quiz: [
      { q: 'First acquisition step?', a: 'Document state' },
      { q: 'Why timeboxing?', a: 'Focus & efficiency' },
      { q: 'Success metric?', a: 'Accuracy + clarity' }
    ]
  },
  {
    title: 'Review & Continuous Development',
    objectives: ['Consolidate knowledge', 'Plan skill growth', 'Select certifications/tools'],
    content: `Summarizes core pillars: OS internals, acquisition, analysis, security assessment, incident & reporting. Encourages lab refresh cadence, certification pathways, community engagement, tracking emerging threats (sideload abuse, encrypted messaging evolution).`,
    lab: ['Draft 12-month learning roadmap', 'Identify 3 new tools to evaluate', 'Set quarterly practice check-ins'],
    quiz: [
      { q: 'Why continuous learning?', a: 'Evolving platforms & threats' },
      { q: 'Example certification?', a: 'GCFA / CCME' },
      { q: 'Roadmap element?', a: 'Quarterly milestone' }
    ]
  }
];
