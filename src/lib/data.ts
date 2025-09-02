export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string;
  duration: string;
  icon: string;
  rating: number;
  students: number;
  instructor: string;
  topics: string[];
  image: string;
  // Optional extended structure
  modules?: {
    title: string;
    type: 'lesson' | 'lab' | 'quiz';
    duration?: string; // e.g. '30m', '1h'
    content?: string;  // markdown/plain content
  }[];
}

export interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points: number;
  solved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  membershipType: 'Basic' | 'Pro' | 'Enterprise';
  enrolledCourses: string[];
  completedCourses: string[];
  certificates: string[];
  ctfPoints: number;
  role?: 'admin' | 'user';
  learningPaths?: string[]; // enrolled learning path IDs
  pathCertificates?: string[]; // completed learning path IDs for certificate
}

// Generate 500 diverse cybersecurity courses
export const courses: Course[] = [
  // Original courses
  {
    id: 'eh-fund',
    title: 'Ethical Hacking Fundamentals',
    description: 'Learn the basics of ethical hacking and penetration testing with hands-on labs and real-world scenarios.',
    level: 'Beginner',
    price: 'FREE',
    duration: '8 weeks',
    icon: 'shield',
    rating: 4.8,
    students: 12543,
    instructor: 'Dr. Sarah Johnson',
    topics: ['Network Scanning', 'Vulnerability Assessment', 'Social Engineering', 'Web Application Testing'],
    image: '/assets/courses/ethical-hacking.jpg',
    modules: [
      { title: 'Introduction & Lab Setup', type: 'lesson', duration: '20m', content: 'Overview of ethical hacking process, legal considerations, and setting up a safe lab environment.' },
      { title: 'Reconnaissance Basics', type: 'lesson', duration: '35m', content: 'Passive vs active recon, WHOIS, DNS enumeration, search operators.' },
      { title: 'Lab: Footprinting a Target', type: 'lab', duration: '40m', content: 'Use whois, nslookup, dig, and search engines to gather open-source intel.' },
      { title: 'Scanning & Enumeration', type: 'lesson', duration: '45m', content: 'Port scanning strategies, service/version detection, banner grabbing.' },
      { title: 'Lab: Nmap Scan Profiles', type: 'lab', duration: '50m', content: 'Experiment with SYN, UDP, service detection and timing templates.' },
      { title: 'Vulnerability Assessment Intro', type: 'lesson', duration: '30m', content: 'Understanding CVEs, CVSS, false positives.' },
      { title: 'Quiz: Recon & Scanning', type: 'quiz' },
      { title: 'Social Engineering Fundamentals', type: 'lesson', duration: '25m', content: 'Psychology, phishing tactics, pretexting examples.' },
      { title: 'Web App Testing Overview', type: 'lesson', duration: '40m', content: 'OWASP Top 10 overview and testing workflow.' },
      { title: 'Lab: Simple Web Vuln Discovery', type: 'lab', duration: '45m', content: 'Identify basic input validation issues on a demo site.' }
    ]
  },
  {
    id: 'df-ess',
    title: 'Digital Forensics Essentials',
    description: 'Master digital forensics techniques for incident response and cybercrime investigation.',
    level: 'Intermediate',
    price: '$49.99',
    duration: '10 weeks',
    icon: 'search',
    rating: 4.9,
    students: 8932,
    instructor: 'Michael Chen',
    topics: ['File System Analysis', 'Memory Forensics', 'Network Forensics', 'Mobile Forensics'],
    image: '/assets/courses/digital-forensics.jpg',
    modules: [
      { title: 'Forensics Methodology', type: 'lesson', duration: '25m', content: 'Evidence handling, volatility order, chain of custody.' },
      { title: 'Filesystem Structures', type: 'lesson', duration: '35m', content: 'NTFS, EXT4, timestamps, artifacts.' },
      { title: 'Lab: Disk Image Mount & Triage', type: 'lab', duration: '40m', content: 'Mount a provided image and extract initial indicators.' },
      { title: 'Memory Acquisition Basics', type: 'lesson', duration: '30m', content: 'Memory dumping tools & anti-forensics.' },
      { title: 'Lab: Volatility Plugin Walkthrough', type: 'lab', duration: '45m', content: 'Use volatility to enumerate processes, DLLs, network.' },
      { title: 'Quiz: Core Artifacts', type: 'quiz' },
      { title: 'Network Capture Analysis', type: 'lesson', duration: '30m', content: 'PCAP triage, protocol carving, suspicious patterns.' },
      { title: 'Lab: PCAP Indicator Extraction', type: 'lab', duration: '35m', content: 'Identify beaconing & exfil traces.' }
    ]
  },
  {
    id: 'ans',
    title: 'Advanced Network Security',
    description: 'Deep dive into network security architecture, monitoring, and incident response.',
    level: 'Advanced',
    price: '$79.99',
    duration: '12 weeks',
    icon: 'lock',
    rating: 4.7,
    students: 5621,
    instructor: 'Jessica Williams',
    topics: ['Firewall Configuration', 'IDS/IPS', 'VPN Security', 'Network Monitoring'],
    image: '/assets/courses/network-security.jpg',
    modules: [
      { title: 'Zero Trust Overview', type: 'lesson', duration: '30m', content: 'Principles, segmentation strategy, identity-centric design.' },
      { title: 'Firewall Rule Design', type: 'lesson', duration: '35m', content: 'Least privilege, auditing, shadow rule detection.' },
      { title: 'Lab: Harden a Firewall Policy', type: 'lab', duration: '45m', content: 'Refactor permissive rules into least privilege sets.' },
      { title: 'IDS/IPS Tuning', type: 'lesson', duration: '30m', content: 'Signature noise reduction, anomaly baselining.' },
      { title: 'Lab: Suricata Rule Authoring', type: 'lab', duration: '50m', content: 'Write and test custom detection rules.' },
      { title: 'Quiz: Architecture & Controls', type: 'quiz' },
      { title: 'Encrypted Traffic Visibility', type: 'lesson', duration: '25m', content: 'Metadata analysis, TLS fingerprinting.' },
      { title: 'Incident Containment Playbook', type: 'lesson', duration: '30m', content: 'Segmentation actions, comms, metrics.' }
    ]
  },
  {
    id: 'malware',
    title: 'Malware Analysis & Reverse Engineering',
    description: 'Learn to analyze and reverse engineer malware using static and dynamic analysis techniques.',
    level: 'Advanced',
    price: '$89.99',
    duration: '14 weeks',
    icon: 'bug',
    rating: 4.6,
    students: 3847,
    instructor: 'Robert Kim',
    topics: ['Static Analysis', 'Dynamic Analysis', 'Debuggers', 'Disassemblers'],
    image: '/assets/courses/malware-analysis.jpg',
    modules: [
      { title: 'Course Orientation & Lab Safety', type: 'lesson', duration: '25m', content: 'Overview of analysis workflow, legal considerations, safe handling of samples.' },
      { title: 'Static Analysis Fundamentals', type: 'lesson', duration: '40m', content: 'PE structure, strings, imports, packers, signatures.' },
      { title: 'Lab: Unpacking & Strings Triage', type: 'lab', duration: '45m', content: 'Use tools (peid, Detect It Easy, strings) to triage a packed sample.' },
      { title: 'Dynamic Analysis Basics', type: 'lesson', duration: '35m', content: 'Sandboxing, monitoring processes, network simulation.' },
      { title: 'Lab: API Monitor & Network Capture', type: 'lab', duration: '45m', content: 'Execute sample in isolated VM; capture key behavioral indicators.' },
      { title: 'Reverse Engineering with a Disassembler', type: 'lesson', duration: '50m', content: 'Function identification, control flow graphs, common obfuscations.' },
      { title: 'Quiz: Static vs Dynamic Concepts', type: 'quiz' },
      { title: 'Advanced Techniques & Anti-Analysis', type: 'lesson', duration: '40m', content: 'Anti-debugging, anti-VM, timing checks, evasion strategies.' },
      { title: 'Lab: Neutralizing Anti-Debugging', type: 'lab', duration: '50m', content: 'Patch common anti-debug patterns and re-run dynamic analysis.' },
      { title: 'Reporting & Intelligence Sharing', type: 'lesson', duration: '30m', content: 'YARA rule authoring, IOC extraction, structured reporting.' }
    ]
  },
  {
    id: 'cloud-sec',
    title: 'Cloud Security Fundamentals',
    description: 'Secure cloud environments across AWS, Azure, and Google Cloud platforms.',
    level: 'Intermediate',
    price: '$59.99',
    duration: '9 weeks',
    icon: 'cloud',
    rating: 4.5,
    students: 7234,
    instructor: 'Amanda Rodriguez',
    topics: ['IAM', 'Encryption', 'Compliance', 'Monitoring'],
    image: '/assets/courses/cloud-security.jpg',
    modules: [
      { title: 'Cloud Shared Responsibility Model', type: 'lesson', duration: '25m', content: 'Understanding division of duties across IaaS, PaaS, SaaS.' },
      { title: 'Identity & Access Management Deep Dive', type: 'lesson', duration: '35m', content: 'Principle of least privilege, role design, temporary elevation.' },
      { title: 'Lab: Hardening IAM Policies', type: 'lab', duration: '40m', content: 'Refactor broad permissions into scoped, auditable policies.' },
      { title: 'Data Protection & Encryption', type: 'lesson', duration: '30m', content: 'KMS, envelope encryption, key rotation, secret storage.' },
      { title: 'Lab: Implementing Encryption at Rest & Transit', type: 'lab', duration: '40m', content: 'Configure storage & network encryption baselines.' },
      { title: 'Logging & Monitoring Essentials', type: 'lesson', duration: '30m', content: 'Centralized logging, anomaly detection, alert tuning.' },
      { title: 'Quiz: IAM & Encryption', type: 'quiz' },
      { title: 'Compliance & Governance Overview', type: 'lesson', duration: '30m', content: 'Mapping controls to frameworks, evidence generation.' }
    ]
  },
  {
    id: 'incident',
    title: 'Incident Response & Threat Hunting',
    description: 'Build skills in incident response, threat hunting, and digital forensics.',
    level: 'Advanced',
    price: '$69.99',
    duration: '11 weeks',
    icon: 'alert-triangle',
    rating: 4.8,
    students: 4567,
    instructor: 'David Thompson',
    topics: ['DFIR', 'Threat Intelligence', 'SIEM', 'Playbooks'],
    image: '/assets/courses/incident-response.jpg',
    modules: [
      { title: 'IR Lifecycle & Preparation', type: 'lesson', duration: '30m', content: 'Preparation, identification, containment, eradication, recovery, lessons learned.' },
      { title: 'Threat Hunting Mindset', type: 'lesson', duration: '35m', content: 'Hypothesis-driven hunting, data sources, prioritization.' },
      { title: 'Lab: SIEM Query Crafting', type: 'lab', duration: '45m', content: 'Develop detection queries to isolate suspicious lateral movement.' },
      { title: 'Memory & Endpoint Triage', type: 'lesson', duration: '35m', content: 'Volatile data capture, rapid artifact extraction.' },
      { title: 'Lab: Endpoint Timeline Reconstruction', type: 'lab', duration: '45m', content: 'Correlate event logs, prefetch, registry, and file metadata.' },
      { title: 'Quiz: Hunting Foundations', type: 'quiz' },
      { title: 'Playbook Design & Automation', type: 'lesson', duration: '30m', content: 'Standardizing response actions, SOAR integration.' },
      { title: 'Reporting & Metrics', type: 'lesson', duration: '25m', content: 'KPIs, tracking dwell time, communicating outcomes.' }
    ]
  },
  // Custom Mobile Device Security & Forensics courses
  {
    id: 'mobile-forensics-fund',
    title: 'Mobile Device Security & Forensics Fundamentals',
    description: 'Learn core principles of smartphone architecture, mobile OS security models, acquisition techniques, and basic forensic workflows.',
    level: 'Beginner',
  price: '$5.00',
  duration: '5 hr',
    icon: 'smartphone',
    rating: 4.7,
    students: 1320,
    instructor: 'Elena Martinez',
    topics: ['Android Security', 'iOS Security', 'Logical Acquisition', 'Chain of Custody'],
    image: '/assets/courses/mobile-forensics-fund.jpg',
    modules: [
      { title: 'Foundation & Ecosystem Overview', type: 'lesson', duration: '25m', content: 'Mobile threat landscape, hardware trust anchors, update channels.' },
      { title: 'Android Security Basics', type: 'lesson', duration: '30m', content: 'Permission model, APK structure, secure storage primitives.' },
      { title: 'iOS Security Basics', type: 'lesson', duration: '30m', content: 'Code signing, sandbox, keychain fundamentals.' },
      { title: 'Lab: Logical Acquisition Walkthrough', type: 'lab', duration: '40m', content: 'Capture a logical backup and verify integrity hashes.' },
      { title: 'Evidence Handling & Chain of Custody', type: 'lesson', duration: '25m', content: 'Documentation, hashing, secure storage, legal considerations.' },
      { title: 'Quiz: Core Fundamentals', type: 'quiz' }
    ]
  },
  {
    id: 'mobile-forensics-adv',
    title: 'Advanced Mobile Application & Device Forensics',
    description: 'Deep dive into encrypted app data analysis, low-level artifact carving, secure messaging analysis, and anti-forensics detection techniques.',
    level: 'Advanced',
    price: '$29.99',
    duration: '8 weeks',
    icon: 'shield',
    rating: 4.9,
    students: 820,
    instructor: 'Dr. Priya Singh',
    topics: ['Encrypted Containers', 'Jailbreak/Root Artifacts', 'SQLite Analysis', 'Memory Dumps'],
    image: '/assets/courses/mobile-forensics-adv.jpg',
    modules: [
      { title: 'Advanced Environment & Tooling', type: 'lesson', duration: '30m', content: 'Rooted/Jailbroken device handling, isolation strategies.' },
      { title: 'Encrypted Container Analysis', type: 'lesson', duration: '35m', content: 'Keychain/keystore extraction, brute-force considerations.' },
      { title: 'Lab: Decrypt Secure Backup', type: 'lab', duration: '45m', content: 'Work through a protected backup decrypt & artifact parse.' },
      { title: 'SQLite Internals & WAL Artifacts', type: 'lesson', duration: '35m', content: 'Record recovery, freelist parsing, carving deleted entries.' },
      { title: 'Lab: Chat Database Carving', type: 'lab', duration: '45m', content: 'Recover deleted messages & attachments from WAL + freelist.' },
      { title: 'Memory Acquisition & Triage', type: 'lesson', duration: '30m', content: 'Mobile memory snapshot techniques, volatile secrets.' },
      { title: 'Quiz: Artifact & Container Concepts', type: 'quiz' },
      { title: 'Anti-Forensics & Detection', type: 'lesson', duration: '30m', content: 'Tampering indicators, log manipulation, secure wiping patterns.' }
    ]
  },
  {
    id: 'mobile-incident-response',
    title: 'Mobile Incident Response & Evidence Handling',
    description: 'Master rapid triage, volatile data preservation, evidence integrity, and cross-platform incident response playbooks for mobile ecosystems.',
    level: 'Intermediate',
    price: '$59.99',
    duration: '7 weeks',
    icon: 'lock',
    rating: 4.8,
    students: 1045,
    instructor: 'Marcus Lee',
    topics: ['Live Triage', 'Artifact Timeline', 'Secure Imaging', 'Reporting Standards'],
    image: '/assets/courses/mobile-incident-response.jpg',
    modules: [
      { title: 'Incident Scoping & First Response', type: 'lesson', duration: '25m', content: 'Initial containment, prioritization, evidence volatility.' },
      { title: 'Volatile Data Preservation', type: 'lesson', duration: '30m', content: 'Capturing ephemeral logs, sandbox states, secure transfers.' },
      { title: 'Lab: Rapid Mobile Triage', type: 'lab', duration: '40m', content: 'Execute a structured triage checklist on a compromised device image.' },
      { title: 'Artifact Timeline Construction', type: 'lesson', duration: '30m', content: 'Normalizing disparate timestamps, sequencing events.' },
      { title: 'Lab: Timeline Correlation Exercise', type: 'lab', duration: '40m', content: 'Combine multiple artifact sources into coherent attack narrative.' },
      { title: 'Secure Imaging & Integrity', type: 'lesson', duration: '25m', content: 'Hashing, verification, chain-of-custody updates.' },
      { title: 'Quiz: Triage & Preservation', type: 'quiz' },
      { title: 'Reporting Standards & Handoff', type: 'lesson', duration: '25m', content: 'Structuring executive & technical summaries, maintaining defensibility.' }
    ]
  },
  {
    id: 'mobile-forensics-core',
    title: 'Mobile Device Security & Forensics',
    description: 'Comprehensive, accelerated 24-hour track covering deeper mobile OS internals, acquisition strategies, artifact analysis, secure app assessment, incident triage, and reporting—includes hands-on labs & quizzes.',
    level: 'Intermediate',
    price: '$15.00',
    duration: '24 hr',
    icon: 'smartphone',
    rating: 4.8,
    students: 0,
    instructor: 'Elena Martinez',
    topics: [
      'Android Internals', 'iOS Security Architecture', 'Acquisition (Logical & File-System)', 'Cloud Artifact Correlation', 'Secure App Assessment',
      'Encryption & Keychains', 'Artifact Timeline Reconstruction', 'Messaging & Chat App Artifacts', 'Mobile Malware Indicators', 'Reporting & Chain of Custody'
    ],
    image: '/assets/courses/mobile-forensics-core.jpg',
    modules: [
  { title: 'Orientation & Environment Setup', type: 'lesson', duration: '30m', content: 'Course structure, toolchain installation, safe lab baseline.' },
  { title: 'Mobile OS Architecture Deep Dive (Android/iOS)', type: 'lesson', duration: '1h', content: 'Kernel layers, system services, app lifecycle, security boundaries.' },
  { title: 'Security Models & Sandboxing', type: 'lesson', duration: '45m', content: 'Permission mediation, sandbox isolation, inter-process communication controls.' },
  { title: 'Acquisition Methods Overview', type: 'lesson', duration: '45m', content: 'Logical, file-system, physical, selective extraction trade-offs.' },
  { title: 'Lab: Logical Acquisition & Hash Verification', type: 'lab', duration: '1h', content: 'Extract a logical image, compute hashes, validate integrity.' },
  { title: 'File-System & Advanced Extraction Techniques', type: 'lesson', duration: '1h', content: 'Full file-system, agent-based, exploit-assisted approaches.' },
  { title: 'Encrypted Containers & Keychain / Keystore', type: 'lesson', duration: '45m', content: 'Key derivation, secure element, escrow services, extraction challenges.' },
  { title: 'Lab: Decrypting & Parsing Encrypted Backups', type: 'lab', duration: '1h', content: 'Use provided passphrase to decrypt and parse backup metadata + artifacts.' },
  { title: 'Artifact Categories (Apps, Logs, Caches)', type: 'lesson', duration: '40m', content: 'Categorizing volatile vs persistent data; log source triage.' },
  { title: 'Messaging & Secure Chat Artifacts (Signal, WhatsApp)', type: 'lesson', duration: '50m', content: 'Database schema, attachments, ephemeral message remnants.' },
  { title: 'Lab: Chat Database & Attachment Recovery', type: 'lab', duration: '1h', content: 'Recover deleted records & associated media from WAL + freelist.' },
  { title: 'SQLite, WAL & Journal Forensics', type: 'lesson', duration: '40m', content: 'Row formats, freelist, WAL sequences, journal carving tactics.' },
  { title: 'Quiz: Core Acquisition & Artifacts', type: 'quiz' },
  { title: 'Mobile Malware & Persistence Indicators', type: 'lesson', duration: '45m', content: 'Startup hooks, binary modifications, abnormal permission usage.' },
  { title: 'Lab: Static & Dynamic Indicators Hunt', type: 'lab', duration: '1h', content: 'Identify persistence & C2 patterns using static and behavioral traces.' },
  { title: 'Timeline Reconstruction & Correlation', type: 'lesson', duration: '45m', content: 'Unifying multi-source timestamps; resolving time skews & gaps.' },
  { title: 'Incident Triage Playbook (Rapid Response)', type: 'lesson', duration: '30m', content: 'Prioritized checklist for fast containment & artifact capture.' },
  { title: 'Quiz: Incident & Malware Analysis', type: 'quiz' },
  { title: 'Reporting, Documentation & Chain of Custody', type: 'lesson', duration: '30m', content: 'High-integrity note taking, versioned evidence logs, executive summaries.' }
    ]
  },
  // Generate 494 additional courses
  ...Array.from({ length: 494 }, (_, index) => {
    const courseId = `course-${index + 7}`;
    const levels: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
    const level = levels[index % 3];
    const instructors = [
      'Dr. Alex Morgan', 'Prof. Lisa Chang', 'Mark Stevens', 'Dr. Rachel Green', 'James Wilson',
      'Dr. Emily Davis', 'Carlos Martinez', 'Dr. Nina Patel', 'Ryan O\'Connor', 'Dr. Kevin Lee',
      'Sarah Mitchell', 'Dr. Tom Anderson', 'Maria Gonzalez', 'Dr. John Smith', 'Ashley Brown',
      'Dr. Chris Taylor', 'Jennifer White', 'Dr. Paul Johnson', 'Michelle Adams', 'Dr. Steve Clark'
    ];
    
    const courseTitles = [
      'Web Application Security Testing', 'Mobile Security Assessment', 'Cryptography for Beginners',
      'Advanced Penetration Testing', 'OSINT Intelligence Gathering', 'Social Engineering Defense',
      'Wireless Network Security', 'IoT Security Fundamentals', 'Blockchain Security Analysis',
      'AI/ML Security Threats', 'Zero Trust Architecture', 'DevSecOps Implementation',
      'Container Security', 'Kubernetes Security', 'API Security Testing',
      'Red Team Operations', 'Blue Team Defense', 'Purple Team Collaboration',
      'Threat Modeling', 'Risk Assessment', 'Compliance & Governance',
      'GDPR Implementation', 'HIPAA Security', 'PCI DSS Compliance',
      'ISO 27001 Framework', 'NIST Cybersecurity Framework', 'Security Awareness Training',
      'Phishing Prevention', 'Ransomware Defense', 'Data Loss Prevention',
      'Endpoint Security', 'SIEM Implementation', 'Log Analysis',
      'Vulnerability Management', 'Patch Management', 'Security Automation',
      'Python for Security', 'PowerShell Security', 'Bash Scripting for Security',
      'Linux Security Hardening', 'Windows Security', 'macOS Security',
      'Database Security', 'Email Security', 'DNS Security',
      'SSL/TLS Implementation', 'PKI Management', 'Identity Management',
      'Access Control Systems', 'Biometric Security', 'Multi-Factor Authentication',
      'Security Architecture', 'Secure Coding Practices', 'Code Review Security',
      'Application Security', 'OWASP Top 10', 'SQL Injection Prevention',
      'XSS Attack Prevention', 'CSRF Protection', 'Security Headers',
      'Content Security Policy', 'HTTPS Implementation', 'Security Testing',
      'Bug Bounty Hunting', 'Responsible Disclosure', 'Security Research',
      'Cyber Threat Intelligence', 'Dark Web Investigation', 'Attribution Analysis',
      'Malware Sandboxing', 'Behavioral Analysis', 'Memory Forensics',
      'Network Forensics', 'Mobile Forensics', 'Cloud Forensics',
      'Incident Handling', 'Crisis Management', 'Business Continuity',
      'Disaster Recovery', 'Backup Security', 'Data Recovery',
      'Privacy Engineering', 'Data Protection', 'Anonymization Techniques',
      'Secure Communications', 'Encrypted Messaging', 'Secure File Transfer',
      'VPN Configuration', 'Tor Network Security', 'Proxy Security',
      'Firewall Management', 'IDS Configuration', 'IPS Deployment',
      'Network Segmentation', 'VLAN Security', 'Switch Security',
      'Router Security', 'BGP Security', 'DNS Security',
      'Email Security Gateway', 'Web Security Gateway', 'DLP Implementation',
      'CASB Deployment', 'Cloud Access Security', 'SaaS Security',
      'PaaS Security', 'IaaS Security', 'Serverless Security',
      'Microservices Security', 'Service Mesh Security', 'Container Orchestration Security',
      'CI/CD Security', 'Infrastructure as Code Security', 'Configuration Management Security',
      'Secrets Management', 'Key Management', 'Certificate Management',
      'Hardware Security Modules', 'Trusted Platform Modules', 'Secure Boot',
      'UEFI Security', 'Firmware Security', 'Embedded Systems Security',
      'SCADA Security', 'Industrial Control Systems', 'OT Security',
      'Smart Grid Security', 'Automotive Security', 'Aviation Security',
      'Maritime Security', 'Healthcare Security', 'Financial Services Security',
      'Government Security', 'Military Cybersecurity', 'Critical Infrastructure Protection',
      'Cyber Warfare', 'Nation-State Threats', 'APT Analysis',
      'Cyber Espionage', 'Cyber Terrorism', 'Information Warfare',
      'Psychological Operations', 'Influence Operations', 'Disinformation Defense',
      'Media Manipulation Detection', 'Deepfake Detection', 'AI-Generated Content Analysis',
      'Quantum Cryptography', 'Post-Quantum Cryptography', 'Quantum Computing Threats',
      'Homomorphic Encryption', 'Zero-Knowledge Proofs', 'Secure Multi-Party Computation',
      'Differential Privacy', 'Federated Learning Security', 'Edge Computing Security',
      '5G Security', '6G Security Research', 'Satellite Communication Security',
      'Space Cybersecurity', 'Drone Security', 'Autonomous Vehicle Security',
      'Smart City Security', 'Smart Home Security', 'Wearable Device Security',
      'Augmented Reality Security', 'Virtual Reality Security', 'Metaverse Security',
      'Gaming Security', 'Esports Security', 'Streaming Platform Security',
      'Social Media Security', 'Content Moderation', 'Online Harassment Prevention',
      'Cyberbullying Prevention', 'Digital Wellness', 'Screen Time Management',
      'Parental Controls', 'Child Online Safety', 'Senior Citizen Cyber Safety',
      'Disability-Inclusive Security', 'Accessibility in Cybersecurity', 'Inclusive Design',
      'Diversity in Cybersecurity', 'Women in Cybersecurity', 'Minority Representation',
      'Cybersecurity Career Development', 'Professional Certifications', 'Skill Development',
      'Leadership in Cybersecurity', 'Team Management', 'Project Management',
      'Vendor Management', 'Third-Party Risk', 'Supply Chain Security',
      'Procurement Security', 'Contract Security', 'Legal Aspects of Cybersecurity',
      'Cyber Law', 'Digital Evidence', 'Expert Testimony',
      'Courtroom Presentation', 'Report Writing', 'Documentation Standards',
      'Audit Preparation', 'Compliance Reporting', 'Metrics and KPIs',
      'Security Dashboards', 'Executive Reporting', 'Board Presentations',
      'Budget Planning', 'ROI Calculation', 'Cost-Benefit Analysis',
      'Insurance Considerations', 'Cyber Insurance', 'Risk Transfer',
      'Business Impact Analysis', 'Asset Valuation', 'Threat Assessment',
      'Vulnerability Assessment', 'Penetration Testing Methodology', 'Red Team Exercises',
      'Tabletop Exercises', 'Simulation Training', 'Crisis Simulation',
      'War Gaming', 'Scenario Planning', 'Strategic Planning',
      'Tactical Operations', 'Operational Security', 'Personnel Security',
      'Physical Security Integration', 'Convergence Security', 'Holistic Security',
      'Security Culture', 'Awareness Programs', 'Training Development',
      'Behavior Change', 'Human Factors', 'Psychology of Security',
      'Cognitive Biases', 'Decision Making', 'Risk Perception',
      'Communication Skills', 'Presentation Skills', 'Technical Writing',
      'Research Methodology', 'Data Analysis', 'Statistical Analysis',
      'Machine Learning for Security', 'Deep Learning Applications', 'Neural Networks',
      'Natural Language Processing', 'Computer Vision Security', 'Pattern Recognition',
      'Anomaly Detection', 'Behavioral Analytics', 'User Entity Behavior Analytics',
      'Security Orchestration', 'Automated Response', 'Playbook Development',
      'Workflow Automation', 'Integration Platforms', 'API Security',
      'Microservices Architecture', 'Event-Driven Architecture', 'Serverless Computing',
      'Edge Computing', 'Fog Computing', 'Distributed Systems Security',
      'Peer-to-Peer Security', 'Mesh Networks', 'Ad-Hoc Networks',
      'Sensor Networks', 'RFID Security', 'NFC Security',
      'Bluetooth Security', 'WiFi Security', 'Cellular Security',
      'Satellite Security', 'Radio Frequency Security', 'Signal Intelligence',
      'Electronic Warfare', 'Spectrum Management', 'Interference Mitigation',
      'Jamming Countermeasures', 'Anti-Jamming Techniques', 'Spread Spectrum',
      'Frequency Hopping', 'Direct Sequence', 'Ultra-Wideband',
      'Software Defined Radio', 'Cognitive Radio', 'Dynamic Spectrum Access',
      'Mesh Networking', 'Network Topology', 'Routing Protocols',
      'Network Optimization', 'Quality of Service', 'Traffic Engineering',
      'Load Balancing', 'Failover Systems', 'High Availability',
      'Scalability Planning', 'Performance Tuning', 'Capacity Planning',
      'Resource Management', 'Asset Management', 'Configuration Management',
      'Change Management', 'Version Control', 'Release Management',
      'Deployment Strategies', 'Blue-Green Deployment', 'Canary Releases',
      'Feature Flags', 'A/B Testing Security', 'Experimentation Platforms',
      'Data Science Security', 'Analytics Security', 'Business Intelligence Security',
      'Data Warehousing Security', 'ETL Security', 'Data Pipeline Security',
      'Stream Processing Security', 'Real-Time Analytics', 'Event Processing',
      'Complex Event Processing', 'Time Series Analysis', 'Predictive Analytics',
      'Forecasting Models', 'Optimization Algorithms', 'Decision Support Systems',
      'Expert Systems', 'Knowledge Management', 'Information Architecture',
      'Content Management Security', 'Document Security', 'Records Management',
      'Archival Security', 'Digital Preservation', 'Long-Term Storage',
      'Backup Strategies', 'Recovery Planning', 'Data Retention',
      'Data Lifecycle Management', 'Information Governance', 'Data Classification',
      'Data Handling Procedures', 'Secure Disposal', 'Media Sanitization',
      'Degaussing Techniques', 'Physical Destruction', 'Certificate Destruction',
      'Witness Procedures', 'Chain of Custody', 'Evidence Handling',
      'Investigation Procedures', 'Interview Techniques', 'Interrogation Methods',
      'Behavioral Analysis', 'Deception Detection', 'Statement Analysis',
      'Timeline Analysis', 'Link Analysis', 'Pattern Analysis',
      'Social Network Analysis', 'Communication Analysis', 'Metadata Analysis',
      'Traffic Analysis', 'Flow Analysis', 'Protocol Analysis',
      'Packet Analysis', 'Deep Packet Inspection', 'Application Layer Analysis',
      'Session Analysis', 'Connection Analysis', 'Endpoint Analysis',
      'Host-Based Analysis', 'File System Analysis', 'Registry Analysis',
      'Log File Analysis', 'Event Correlation', 'Timeline Reconstruction',
      'Digital Reconstruction', 'Crime Scene Reconstruction', 'Incident Reconstruction',
      'Root Cause Analysis', 'Failure Analysis', 'Post-Mortem Analysis',
      'Lessons Learned', 'Continuous Improvement', 'Process Optimization',
      'Methodology Development', 'Best Practices', 'Standards Development',
      'Framework Development', 'Model Development', 'Tool Development',
      'Custom Solutions', 'Bespoke Security', 'Tailored Approaches',
      'Industry-Specific Security', 'Sector-Specific Threats', 'Vertical Solutions',
      'Horizontal Integration', 'Cross-Platform Security', 'Multi-Vendor Environments',
      'Hybrid Architectures', 'Legacy System Security', 'Modernization Security',
      'Digital Transformation Security', 'Cloud Migration Security', 'Data Migration Security',
      'System Integration Security', 'Merger & Acquisition Security', 'Divestiture Security',
      'Organizational Change Security', 'Cultural Change Management', 'Transformation Leadership',
      'Change Communication', 'Stakeholder Management', 'Executive Engagement',
      'Board Governance', 'Risk Governance', 'Security Governance',
      'IT Governance', 'Data Governance', 'Information Governance',
      'Enterprise Architecture', 'Security Architecture', 'Solution Architecture',
      'Technical Architecture', 'Infrastructure Architecture', 'Application Architecture',
      'Data Architecture', 'Integration Architecture', 'Service Architecture',
      'Platform Architecture', 'Cloud Architecture', 'Hybrid Architecture',
      'Multi-Cloud Strategy', 'Cloud-Native Security', 'Cloud-First Security',
      'Digital-First Security', 'Mobile-First Security', 'API-First Security',
      'Security-First Development', 'Privacy-First Design', 'Zero-Trust Design',
      'Secure-by-Design', 'Privacy-by-Design', 'Security-by-Default',
      'Fail-Safe Design', 'Resilient Design', 'Adaptive Security',
      'Self-Healing Systems', 'Autonomous Security', 'Intelligent Security',
      'Predictive Security', 'Proactive Security', 'Preventive Security',
      'Detective Security', 'Corrective Security', 'Recovery Security',
      'Compensating Controls', 'Alternative Controls', 'Equivalent Controls',
      'Layered Security', 'Defense in Depth', 'Security Onion',
      'Castle Approach', 'Perimeter Security', 'Internal Security',
      'Endpoint Security', 'Network Security', 'Application Security',
      'Data Security', 'Identity Security', 'Access Security',
      'Privilege Security', 'Administrative Security', 'Operational Security',
      'Physical Security', 'Environmental Security', 'Personnel Security',
      'Information Security', 'Communication Security', 'Computer Security',
      'Cyber Security', 'Digital Security', 'Online Security',
      'Internet Security', 'Web Security', 'Email Security',
      'Mobile Security', 'Wireless Security', 'Cloud Security',
      'IoT Security', 'OT Security', 'IT Security',
      'Enterprise Security', 'Corporate Security', 'Business Security',
      'Commercial Security', 'Industrial Security', 'Critical Infrastructure Security',
      'National Security', 'Homeland Security', 'Public Safety',
      'Emergency Management', 'Crisis Management', 'Continuity Management',
      'Resilience Management', 'Risk Management', 'Threat Management',
      'Vulnerability Management', 'Incident Management', 'Problem Management',
      'Change Management', 'Configuration Management', 'Asset Management',
      'Service Management', 'Quality Management', 'Performance Management',
      'Capacity Management', 'Availability Management', 'Continuity Management',
      'Security Management', 'Compliance Management', 'Audit Management',
      'Governance Management', 'Strategy Management', 'Program Management',
      'Project Management', 'Portfolio Management', 'Resource Management',
      'Financial Management', 'Procurement Management', 'Vendor Management',
      'Contract Management', 'Relationship Management', 'Communication Management',
      'Knowledge Management', 'Information Management', 'Document Management',
      'Records Management', 'Content Management', 'Digital Asset Management',
      'Brand Management', 'Reputation Management', 'Crisis Communication',
      'Public Relations', 'Media Relations', 'Stakeholder Relations',
      'Customer Relations', 'Partner Relations', 'Supplier Relations',
      'Investor Relations', 'Regulatory Relations', 'Government Relations',
      'International Relations', 'Diplomatic Security', 'Embassy Security',
      'Consular Security', 'Travel Security', 'Executive Protection',
      'VIP Security', 'Celebrity Security', 'High-Net-Worth Security',
      'Family Office Security', 'Private Security', 'Corporate Security',
      'Retail Security', 'Banking Security', 'Insurance Security',
      'Healthcare Security', 'Education Security', 'Government Security',
      'Military Security', 'Intelligence Security', 'Law Enforcement Security',
      'Legal Security', 'Judicial Security', 'Correctional Security',
      'Transportation Security', 'Aviation Security', 'Maritime Security',
      'Rail Security', 'Highway Security', 'Border Security',
      'Port Security', 'Airport Security', 'Stadium Security',
      'Event Security', 'Convention Security', 'Trade Show Security',
      'Conference Security', 'Meeting Security', 'Venue Security',
      'Facility Security', 'Building Security', 'Campus Security',
      'School Security', 'University Security', 'Hospital Security',
      'Clinic Security', 'Laboratory Security', 'Research Security',
      'Manufacturing Security', 'Factory Security', 'Warehouse Security',
      'Distribution Security', 'Logistics Security', 'Supply Chain Security',
      'Procurement Security', 'Sourcing Security', 'Vendor Security'
    ];

    const topics = [
      ['Penetration Testing', 'Vulnerability Assessment', 'Security Auditing', 'Risk Analysis'],
      ['Threat Detection', 'Incident Response', 'Forensic Analysis', 'Malware Analysis'],
      ['Network Security', 'Firewall Configuration', 'IDS/IPS', 'VPN Setup'],
      ['Web Security', 'SQL Injection', 'XSS Prevention', 'OWASP Top 10'],
      ['Mobile Security', 'App Security', 'Device Management', 'BYOD Policies'],
      ['Cloud Security', 'AWS Security', 'Azure Security', 'GCP Security'],
      ['Cryptography', 'Encryption', 'Digital Signatures', 'PKI'],
      ['Identity Management', 'Access Control', 'Authentication', 'Authorization'],
      ['Compliance', 'GDPR', 'HIPAA', 'PCI DSS'],
      ['Risk Management', 'Business Continuity', 'Disaster Recovery', 'Crisis Management']
    ];

    const prices = ['FREE', '$29.99', '$39.99', '$49.99', '$59.99', '$69.99', '$79.99', '$89.99', '$99.99', '$129.99'];
    const durations = ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks', '14 weeks', '16 weeks'];
    const icons = ['shield', 'lock', 'search', 'bug', 'cloud', 'alert-triangle', 'key', 'eye', 'server', 'smartphone'];

    const titleIndex = index % courseTitles.length;
    const title = courseTitles[titleIndex];
    const instructor = instructors[index % instructors.length];
    const price = index < 50 ? 'FREE' : prices[index % prices.length];
    const duration = durations[index % durations.length];
    const icon = icons[index % icons.length];
    const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
    const students = Math.floor(Math.random() * 15000) + 100;
    const topicSet = topics[index % topics.length];

    const modules = [
      { title: `${title}: Introduction`, type: 'lesson', duration: '20m', content: `Overview of ${title.toLowerCase()} objectives, scope, and learning outcomes.` },
      ...topicSet.map(t => ({ title: t, type: 'lesson' as const, duration: '30m', content: `Deep dive into ${t.toLowerCase()} concepts as applied to ${title.toLowerCase()}.` })),
      { title: 'Hands-on Lab', type: 'lab', duration: '40m', content: `Practical application of ${title.toLowerCase()} skills in a guided scenario.` },
      { title: 'Quiz: Core Concepts', type: 'quiz' }
    ];
    return {
      id: courseId,
      title,
      description: `Comprehensive ${level.toLowerCase()} course covering ${title.toLowerCase()} with practical exercises and real-world applications.`,
      level,
      price,
      duration,
      icon,
      rating,
      students,
      instructor,
      topics: topicSet,
      image: `/assets/courses/${courseId}.jpg`,
      modules
    };
  })
];

// Optional learning paths (ordered course sequences)
export const learningPaths: { id: string; title: string; description: string; courses: { id: string; note?: string }[] }[] = [
  {
    id: 'mobile-forensics-path',
    title: 'Mobile Device Security & Forensics Path',
    description: 'Start with core fundamentals, then advance to deeper artifact, malware, and incident workflows.',
    courses: [
      { id: 'mobile-forensics-fund', note: 'Foundational concepts (Beginner)' },
      { id: 'mobile-forensics-core', note: 'Deeper analysis & incident skills (Intermediate)' }
    ]
  }
];

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'web1',
    title: 'SQL Injection Basics',
    description: 'Find and exploit a SQL injection vulnerability in this web application.',
    difficulty: 'Easy',
    category: 'Web',
    points: 100,
    solved: false
  },
  {
    id: 'crypto1',
    title: 'Caesar Cipher',
    description: 'Decrypt this message encrypted with a Caesar cipher.',
    difficulty: 'Easy',
    category: 'Cryptography',
    points: 50,
    solved: true
  },
  {
    id: 'forensics1',
    title: 'Hidden Files',
    description: 'Find the hidden flag in this disk image.',
    difficulty: 'Medium',
    category: 'Forensics',
    points: 200,
    solved: false
  },
  {
    id: 'pwn1',
    title: 'Buffer Overflow',
    description: 'Exploit a buffer overflow vulnerability to get shell access.',
    difficulty: 'Hard',
    category: 'Binary Exploitation',
    points: 500,
    solved: false
  },
  {
    id: 'reverse1',
    title: 'Reverse Me',
    description: 'Reverse engineer this binary to find the flag.',
    difficulty: 'Medium',
    category: 'Reverse Engineering',
    points: 300,
    solved: false
  }
];

export const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Security Analyst',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    text: 'The ethical hacking course transformed my career. The hands-on labs and real-world scenarios gave me the confidence to tackle complex security challenges.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'IT Manager',
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
    text: 'The CTF challenges are the best I\'ve encountered online. They\'re challenging, educational, and incredibly well-designed.',
    rating: 5
  },
  {
    name: 'Jessica Williams',
    role: 'Digital Forensics Specialist',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'The digital forensics course gave me practical skills I use daily. The instructor\'s expertise really shows in the quality of content.',
    rating: 5
  }
];

export const membershipPlans = [
  {
    name: 'Basic',
    price: '$0',
    period: 'month',
    description: 'Perfect for beginners starting their cybersecurity journey',
    features: [
      'Access to fundamental courses',
      'Basic CTF challenges',
      'Community forum access',
      'Certificates available for purchase'
    ],
    popular: false,
    buttonText: 'Get Started'
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'month',
    description: 'For serious learners who want full access and certificates',
    features: [
      'All fundamental & advanced courses',
      'All CTF challenges',
      '3 free certificates per month',
      'Priority support',
      '30% discount on additional certificates'
    ],
    popular: true,
    buttonText: 'Start Pro Trial'
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'month',
    description: 'For organizations and teams needing bulk access',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      '10 free certificates per month',
      'Team progress tracking',
      'Custom learning paths',
      'Dedicated account manager'
    ],
    popular: false,
    buttonText: 'Contact Sales'
  }
];