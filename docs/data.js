/* Steps, commands, checklists, and troubleshooting for the GUI app */
window.LAB_DATA = [
  {
    id: "intro",
    section: "Overview",
    title: "Introduction to SIEM & Wazuh",
    intro: "This project demonstrates a complete private XDR & SIEM simulation using Wazuh. It covers setup, agent deployment, testing of File Integrity Monitoring (FIM), log monitoring, intrusion detection, and review of results.",
    image: "assets/cover.png",
    caption: "My Private XDR & SIEM Simulation with Wazuh.",
    checklist: [
      "Understand SIEM: collects, analyses, and correlates security data.",
      "Recognize modern SIEM components: SIM, SEM, and incident response.",
      "Know Wazuh as an open-source SIEM/XDR platform integrating multiple security functions."
    ],
    commands: [],
    notes: [
      "SIEM combines SIM (storage) and SEM (real-time monitoring).",
      "Modern SIEM adds automated incident response and SOAR integration.",
      "Wazuh provides intrusion detection, log management, FIM, vulnerability detection, and compliance tools across endpoints, networks, and cloud."
    ],
    issues: []
  },
  {
    id: "reqs-system",
    section: "Project Requisites",
    title: "System Requirement",
    intro: "A physical device with 16 GB RAM and 256 GB storage was used to host the virtual machines efficiently.",
    image: "assets/reqs-system.png",
    caption: "Hardware baseline used for running multiple VMs.",
    checklist: [
      "Physical host with ≥16 GB RAM.",
      "≥256 GB storage capacity (SSD preferred)."
    ],
    commands: [],
    notes: [
      "Sufficient resources ensure smooth VM operations and effective log indexing.",
      "System stability is essential for continuous agent–manager communication."
    ],
    issues: []
  },
  {
    id: "reqs-software",
    section: "Project Requisites",
    title: "Software Requirement",
    intro: "To simulate a full XDR/SIEM environment, VMware Workstation Pro was used to host Windows and Ubuntu VMs for Wazuh deployment.",
    image: "assets/reqs-software.png",
    caption: "Software stack used for the simulation.",
    checklist: [
      "VMware Workstation Pro installed.",
      "Windows 10 Pro VM created (endpoint).",
      "Two Ubuntu 20.04 VMs created (one as endpoint, one as Wazuh server)."
    ],
    commands: [],
    notes: [
      "Wazuh central components require a 64-bit Linux OS.",
      "VMs simulate a real network environment for manager-agent communication."
    ],
    issues: []
  },
  {
    id: "method",
    section: "Methodology",
    title: "Methodology Phases",
    intro: "The methodology consists of three phases: Setup, Testing, and Review.",
    image: "assets/methodology.png",
    caption: "Structured approach to implementation.",
    checklist: ["Setup environment", "Test Wazuh capabilities", "Review outcomes"],
    commands: [],
    notes: [
      "This phased structure ensures an organized workflow and comprehensive evaluation."
    ],
    issues: []
  },
  {
    id: "env",
    section: "Setup",
    title: "Hypervisor & Virtual Machines (Bridged Networking)",
    intro: "Three VMs were created in VMware Workstation Pro: two Ubuntu VMs and one Windows VM. Networking was set to ‘Bridged’ to ensure each VM gets its own IP address from the local router.",
    image: "assets/step-1.png",
    caption: "VMs installed and connected via bridged mode.",
    checklist: [
      "VMware Workstation Pro installed.",
      "Ubuntu 20.04 VMs created (server and endpoint).",
      "Windows 10 Pro VM created (endpoint).",
      "All VMs set to ‘Bridged’ networking mode.",
      "Verify connectivity between all machines."
    ],
    commands: [
      { title: "Check IP and connectivity (Linux)", code: "ip a | grep inet\nping -c 3 <wazuh_server_ip>\nping -c 3 <endpoint_ip>" },
      { title: "Check IP (Windows PowerShell)", code: "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike \"169.*\"}" }
    ],
    notes: [
      "Bridged mode makes each VM act like a separate device on the LAN.",
      "This is crucial for proper agent–manager communication in Wazuh."
    ],
    issues: [
      {
        title: "VMs can’t reach each other",
        severity: "Network",
        body: [
          "If VMs don’t get LAN IPs or can’t ping, they may not be in Bridged mode."
        ],
        fixes: [
          { label: "Switch to Bridged networking (per VM)", code: "# In the hypervisor, set the VM’s network adapter to Bridged, then recheck IPs via:\n# Linux\nip a | grep inet\n# Windows (PowerShell)\nGet-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike \"169.*\"}" }
        ]
      },
      {
        title: "169.254.x.x (APIPA) address",
        severity: "Network",
        body: [
          "DHCP not reached; VM didn’t obtain a LAN lease."
        ],
        fixes: [
          { label: "Renew DHCP (Linux)", code: "sudo dhclient -r && sudo dhclient" },
          { label: "Renew DHCP (Windows)", code: "ipconfig /release && ipconfig /renew" }
        ]
      },
      {
        title: "Ping blocked from Windows",
        severity: "Network",
        body: [
          "ICMP may be blocked by Windows Firewall."
        ],
        fixes: [
          { label: "Allow ICMP (Admin PowerShell)", code: "New-NetFirewallRule -DisplayName 'Allow ICMPv4' -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow" }
        ]
      }
    ]
  },
  {
    id: "install",
    section: "Setup",
    title: "Installing Wazuh Server",
    intro: "The Wazuh Installation Assistant simplifies installing Wazuh Manager, Elasticsearch, and Kibana on Ubuntu.",
    image: "assets/step-2.png",
    caption: "Successful Wazuh installation using the assistant.",
    checklist: [
      "Ubuntu server updated.",
      "curl installed.",
      "Installation script executed.",
      "Credentials displayed upon completion."
    ],
    commands: [
      { title: "Install curl", code: "sudo snap install curl\n# or\nsudo apt install curl" },
      { title: "Install Wazuh 4.5 (Assistant)", code: "curl -sO https://packages.wazuh.com/4.5/wazuh-install.sh && sudo bash ./wazuh-install.sh -a" }
    ],
    notes: [
      "The assistant installs Wazuh Manager, Elasticsearch, and Kibana automatically.",
      "Credentials shown after installation provide dashboard access."
    ],
    issues: [
      {
        title: "curl not found",
        severity: "Install",
        body: [
          "The assistant download requires curl; install it first."
        ],
        fixes: [
          { label: "Install via snap", code: "sudo snap install curl" },
          { label: "Install via apt", code: "sudo apt install curl" }
        ]
      },
      {
        title: "Not sure installation succeeded",
        severity: "Install",
        body: [
          "Success output includes the dashboard URL and generated credentials."
        ],
        fixes: [
          { label: "Review installer output", code: "# Scroll terminal to find the printed Username and Password and the success message.\n# Keep the credentials to log into the dashboard." }
        ]
      },
      {
        title: "Dependency errors during install",
        severity: "Install",
        body: [
          "Package sources or dependencies may be stale/incomplete."
        ],
        fixes: [
          { label: "Refresh & fix broken", code: "sudo apt update && sudo apt -y upgrade && sudo apt -y --fix-broken install" }
        ]
      }
    ]
  },
  {
    id: "dashboard",
    section: "Setup",
    title: "Accessing the Wazuh Dashboard",
    intro: "Log into the Wazuh dashboard using the credentials generated during installation.",
    image: "assets/step-3.png",
    caption: "Wazuh dashboard login screen.",
    checklist: [
      "Confirm Wazuh service is active.",
      "Open dashboard via VM IP or localhost.",
      "Login successfully with generated credentials."
    ],
    commands: [
      { title: "Access dashboard", code: "http://<wazuh_server_ip>\nhttp://localhost" },
      { title: "Check listening ports", code: "sudo ss -lntp | egrep '(5601|443|22|1514|1515)' || true" },
      { title: "Open firewall (UFW example)", code: "sudo ufw allow 5601/tcp\nsudo ufw allow 443/tcp\nsudo ufw reload" }
    ],
    notes: [
      "Only authorized users can log in to view and manage security events.",
      "Dashboard centralizes management for agents, logs, and alerts."
    ],
    issues: [
      {
        title: "Dashboard not opening",
        severity: "Access",
        body: [
          "Using the wrong address or blocked ports prevents access."
        ],
        fixes: [
          { label: "Use correct URL", code: "http://<wazuh_server_ip>\n# or\nhttp://localhost" },
          { label: "Verify ports", code: "sudo ss -lntp | egrep '(5601|443)'" }
        ]
      },
      {
        title: "Can’t log in",
        severity: "Auth",
        body: [
          "The installer’s generated credentials are required for first login."
        ],
        fixes: [
          { label: "Use generated credentials", code: "# Enter the Username and Password printed by the installation assistant." }
        ]
      }
    ]
  },
  {
    id: "agents",
    section: "Deployment",
    title: "Deploying Agents (Linux & Windows)",
    intro: "Agents were deployed on Ubuntu and Windows endpoints using the Wazuh Manager dashboard.",
    image: "assets/step-4-linux.png",
    caption: "Adding a new agent via the Wazuh dashboard.",
    checklist: [
      "Determine endpoint OS, version, architecture, and Manager IP.",
      "Add agent via dashboard → select OS → generate install command.",
      "Run generated installer/command on each endpoint.",
      "Verify agents show as active in dashboard."
    ],
    commands: [
      { title: "Deploy Linux agent", code: "curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.5.0-1_amd64.deb\nsudo WAZUH_MANAGER='<manager_ip>' dpkg -i ./wazuh-agent.deb\nsudo systemctl enable --now wazuh-agent" },
      { title: "Restart Windows agent service", code: "net stop wazuh && net start wazuh" }
    ],
    notes: [
      "The dashboard simplifies enrollment by generating platform-specific commands.",
      "Agents automatically report their status and logs to the manager once connected."
    ],
    issues: [
      {
        title: "Agent not appearing as connected",
        severity: "Agent",
        body: [
          "Incorrect OS/architecture selection or wrong Manager IP prevents enrollment."
        ],
        fixes: [
          { label: "Regenerate enrollment command", code: "# In Dashboard: Agents → Add agent → pick OS/version/architecture → set Wazuh server IP → copy command/installer." },
          { label: "Run on the endpoint", code: "# Execute the generated command on Linux or run the downloaded installer on Windows." }
        ]
      },
      {
        title: "Agent shows 'never connected'",
        severity: "Agent",
        body: [
          "Manager ports may be blocked, or there is an IP/time mismatch."
        ],
        fixes: [
          { label: "Test connectivity to Manager", code: "nc -zv <manager_ip> 1514\nnc -zv <manager_ip> 1515" },
          { label: "Restart agent", code: "sudo systemctl restart wazuh-agent" }
        ]
      },
      {
        title: "Windows enrollment fails",
        severity: "Agent",
        body: [
          "Outbound connections may be blocked by Windows Defender Firewall."
        ],
        fixes: [
          { label: "Allow outbound to Manager", code: "New-NetFirewallRule -DisplayName 'Allow Wazuh Outbound' -Direction Outbound -Action Allow -Protocol TCP -RemotePort 1514,1515" }
        ]
      }
    ]
  },
  {
    id: "tests-fim",
    section: "Validation",
    title: "File Integrity Monitoring (FIM)",
    intro: "FIM detects any changes to files or directories, such as creation, modification, or deletion.",
    image: "assets/step-5-fim.png",
    caption: "Integrity monitoring results in the Wazuh dashboard.",
    checklist: [
      "Edit agent configuration to include monitored directory.",
      "Restart agent service.",
      "Perform file changes (create, modify, rename, delete).",
      "Confirm events logged in dashboard."
    ],
    commands: [
      { title: "Edit config file", code: "notepad \"C:\\\\Program Files (x86)\\\\ossec-agent\\\\ossec.conf\"" },
      { title: "Add syscheck directive", code: "<syscheck>\n  <directories>\n    <directory>C:\\\\Users\\\\<YourUsername>\\\\Documents</directory>\n  </directories>\n</syscheck>" },
      { title: "Restart Wazuh service", code: "net stop wazuh && net start wazuh" }
    ],
    notes: [
      "FIM shows event type (added, modified, deleted), file path, rule triggered, and timestamp.",
      "Drop-down details reveal hashes, event source, and alert rule."
    ],
    issues: [
      {
        title: "No FIM events after changes",
        severity: "FIM",
        body: [
          "The target directory may not be included or the agent wasn’t restarted."
        ],
        fixes: [
          { label: "Include directory & restart", code: "notepad \"C:\\\\Program Files (x86)\\\\ossec-agent\\\\ossec.conf\"\n# Add <syscheck> with Documents path, then:\nnet stop wazuh && net start wazuh" },
          { label: "View results in dashboard", code: "# Open the Wazuh dashboard → Security Events / Integrity monitoring to confirm entries." }
        ]
      }
    ]
  },
  {
    id: "tests-logs",
    section: "Validation",
    title: "Log Monitoring",
    intro: "Wazuh monitors system and security logs, detecting changes and user actions in real time.",
    image: "assets/step-5-logs.png",
    caption: "Monitoring logs on the Wazuh dashboard.",
    checklist: [
      "Start/stop agent service.",
      "Lock user account and test failed logins.",
      "Install software as root (Apache2).",
      "Verify events appear in dashboard."
    ],
    commands: [
      { title: "Restart agent and view logs", code: "sudo systemctl stop wazuh-agent && sudo systemctl start wazuh-agent\nsudo journalctl -u wazuh-agent --since \"5 min ago\"" },
      { title: "Install Apache2", code: "sudo apt update && sudo apt install -y apache2" }
    ],
    notes: [
      "Wazuh captured agent restarts, failed login attempts, and Apache installation events.",
      "These logs enable auditing user actions and privilege changes."
    ],
    issues: [
      {
        title: "No log entries visible",
        severity: "Logs",
        body: [
          "If nothing appears, trigger actions that generate logs and check the recent journal."
        ],
        fixes: [
          { label: "Generate activity & check journal", code: "sudo systemctl stop wazuh-agent && sudo systemctl start wazuh-agent\nsudo journalctl -u wazuh-agent --since \"5 min ago\"\n# Try failed logins or install Apache2 to create events." }
        ]
      }
    ]
  },
  {
    id: "tests-ids",
    section: "Validation",
    title: "Intrusion Detection (SSH Brute Force)",
    intro: "Intrusion detection was tested by simulating failed SSH login attempts from one VM to another.",
    image: "assets/step-5-ssh.png",
    caption: "SSH login failures detected in Wazuh dashboard.",
    checklist: [
      "Attempt SSH login with wrong password multiple times.",
      "Review alerts on Wazuh dashboard.",
      "Confirm failed authentication recorded and flagged."
    ],
    commands: [
      { title: "Simulate SSH attack", code: "ssh <user>@<endpoint_ip>\n# enter wrong password repeatedly" }
    ],
    notes: [
      "Wazuh logs failed logins as potential brute-force attempts.",
      "Each entry includes timestamp, user, and rule triggered."
    ],
    issues: [
      {
        title: "No SSH brute-force alert",
        severity: "IDS",
        body: [
          "Too few failed attempts or targeting the wrong host may not trigger rules."
        ],
        fixes: [
          { label: "Repeat failed logins", code: "ssh <user>@<endpoint_ip>\n# Enter an incorrect password several times to generate events, then review in the dashboard." }
        ]
      }
    ]
  },
  {
    id: "review",
    section: "Review",
    title: "Findings and Downsides",
    intro: "Wazuh performed well but revealed several usability challenges during the test.",
    image: "assets/review.png",
    caption: "Summary of Wazuh’s downsides and improvement areas.",
    checklist: [
      "Dashboard requires manual refresh for new data.",
      "Editing configuration files manually is error-prone.",
      "Generated credentials cannot easily be changed post-install."
    ],
    commands: [],
    notes: [
      "Auto-refresh would improve usability for live monitoring.",
      "Simpler configuration editing UI could reduce setup errors.",
      "Option to reset dashboard credentials is needed for better security."
    ],
    issues: []
  },
  {
    id: "capabilities",
    section: "Review",
    title: "Other Capabilities of Wazuh",
    intro: "Beyond the core tests, Wazuh supports additional features enhancing security posture.",
    image: "assets/capabilities.png",
    caption: "Extended Wazuh features for enterprise use.",
    checklist: [
      "Vulnerability Detection integrates CVE databases.",
      "Configuration Assessment validates system compliance.",
      "Cloud Security Monitoring for workloads and services.",
      "Active Response for automated threat mitigation."
    ],
    commands: [],
    notes: [
      "These features extend visibility and enable proactive response across on-premise and cloud systems."
    ],
    issues: []
  },
  {
    id: "conclusion",
    section: "Wrap-Up",
    title: "Conclusion",
    intro: "Wazuh is an effective open-source XDR & SIEM platform offering robust monitoring and response. Despite minor limitations, it remains a powerful solution for endpoint and server protection.",
    checklist: [
      "Wazuh setup completed successfully.",
      "All agents connected and reporting.",
      "Core features tested: FIM, logs, intrusion detection."
    ],
    commands: [],
    notes: [
      "Proper configuration and regular tuning are key to maximizing Wazuh’s capabilities.",
      "Understanding its limits helps tailor it to organizational needs."
    ],
    issues: []
  },
  {
    id: "sources",
    section: "Appendix",
    title: "References",
    intro: "References cited from official and academic resources used in this project.",
    checklist: [
      "Gartner SIEM glossary",
      "Wazuh platform overview",
      "Wazuh server installation guide"
    ],
    commands: [
      { title: "Reference links", code: "https://www.gartner.com/en/information-technology/glossary/security-information-and-event-management-siem\nhttps://wazuh.com/platform/overview/\nhttps://documentation.wazuh.com/current/installation-guide/wazuh-server/index.html" }
    ],
    notes: [],
    issues: []
  }
];
