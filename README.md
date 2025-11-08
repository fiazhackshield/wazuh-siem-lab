# Wazuh SIEM Lab — Private XDR & SIEM Simulation

**Author:** [@fiazhackshield](https://github.com/fiazhackshield)  
**Live Demo:** [fiazhackshield.github.io/wazuh-siem-lab](https://fiazhackshield.github.io/wazuh-siem-lab)  
**Tech Stack:** Wazuh · SIEM · XDR · VMware · Ubuntu · Windows · JavaScript (Static GUI)

---

## Overview
This project demonstrates a **complete private XDR & SIEM simulation** using **Wazuh**, an open-source security platform that integrates **threat detection, visibility, and response** across endpoints, servers, and networks.

The guided lab includes:
- Step-by-step **setup walkthrough**
- **Agent deployment** on Linux and Windows
- **Testing** File Integrity Monitoring (FIM), log monitoring, and intrusion detection
- A built-in **interactive GUI** for navigation and troubleshooting

---

## Key Features
- **Wazuh-based XDR/SIEM** deployment for endpoint and network monitoring  
- **Virtualized environment** using VMware Workstation Pro  
- **Automated installation** via Wazuh Installation Assistant  
- **Interactive validation** for FIM, log, and intrusion testing  
- **Issue solver** and command reference in GUI  
- **Light/Dark theme toggle** and **progress tracking**

---

## Methodology
1. **Setup:**  
   Create Ubuntu & Windows VMs (Bridged networking) and install Wazuh Server.
2. **Deployment:**  
   Add and register Linux/Windows agents via the Wazuh dashboard.
3. **Testing:**  
   Validate File Integrity Monitoring, Log Monitoring, and Intrusion Detection.
4. **Review:**  
   Summarize findings and assess usability limitations of Wazuh.

---

## Tested Capabilities
| Module | Description |
|--------|--------------|
| **File Integrity Monitoring (FIM)** | Detects file creation, modification, and deletion. |
| **Log Monitoring** | Tracks user activity, login attempts, and system events. |
| **Intrusion Detection** | Identifies brute-force SSH login attempts. |
| **Vulnerability & Compliance** | Highlights configuration and patching gaps. |

---

## Requirements
**Hardware**
- 16 GB RAM · 256 GB+ Storage

**Software**
- VMware Workstation Pro  
- Ubuntu 20.04 (Wazuh Server & Endpoint)  
- Windows 10 Pro (Endpoint)

---

## Run Locally
```bash
# Clone repository
git clone https://github.com/fiazhackshield/wazuh-siem-lab.git
cd wazuh-siem-lab

# Open the static web app
# For local testing (VS Code Live Server or any static host)
````

Or view the live hosted version:

**[https://fiazhackshield.github.io/wazuh-siem-lab](https://fiazhackshield.github.io/wazuh-siem-lab)**

---

## Project Structure

```
wazuh-siem-lab/
├── index.html          # GUI-driven static app
├── app.js              # Core app logic & navigation
├── data.js             # Step data, commands, notes
├── styles.css          # Layout & theme
└── assets/             # Images & logo
```

---

## Findings & Downsides

* Manual refresh required on Wazuh dashboard
* XML-based config editing prone to syntax errors
* Auto-generated credentials not easily resettable

---

## Conclusion

Wazuh is a **powerful open-source SIEM/XDR** solution capable of real-time monitoring and detection.

This lab demonstrates its deployment, testing, and management in a controlled virtual environment.

---

## References

* [Gartner SIEM Glossary](https://www.gartner.com/en/information-technology/glossary/security-information-and-event-management-siem)
* [Wazuh Platform Overview](https://wazuh.com/platform/overview/)
* [Wazuh Server Installation Guide](https://documentation.wazuh.com/current/installation-guide/wazuh-server/index.html)

---

> **“Visibility drives security. Automate what you can, observe what you must.”**

```
