export default function Docs() {
  return (
    <>
      <header className="hero">
        <div className="hero-pill"><span className="pulse"></span> Project Kickoff Document</div>
        <h1><span className="gr">SecMCP</span><br />Security MCP Servers<br />for Web Pentesting</h1>
        <p className="hero-sub">A collection of MCP servers that bring offensive web security tools directly into AI coding environments — enabling researchers to run pentests from Claude Code, Cursor, or any MCP-compatible IDE.</p>
        <div className="hero-meta">
          <span className="meta-chip">◉ Kickoff / Investigation</span>
          <span className="meta-chip">◎ Dor Skoler + Shelly Ehud</span>
          <span className="meta-chip">◷ March 31, 2026</span>
        </div>
      </header>

      {/* Section 01 — Project Summary */}
      <section>
        <div className="sl"><span className="sn">01</span><h2 className="st">Project Summary</h2></div>
        <div className="vt">
          <p style={{ marginBottom: '.85rem' }}><strong>What:</strong> An open-source collection of MCP servers that expose web offensive security tools to AI agents. When installed, a researcher opens Claude Code and can say <em>"scan example.com for XSS vulnerabilities"</em> — and the AI calls the tools directly, interprets results, and chains findings together.</p>
          <p style={{ marginBottom: '.85rem' }}><strong>Why:</strong> MCP is becoming the standard for connecting AI agents to external tools. Hundreds of MCP servers exist for dev tools, but the offensive security space is nearly empty. Security researchers are copy-pasting terminal output into Claude. We bridge that gap with native tool integration.</p>
          <p style={{ marginBottom: '.85rem' }}><strong>Who uses it:</strong> Penetration testers, bug bounty hunters, security researchers, red teamers, and AppSec engineers who use AI-powered coding tools.</p>
          <p><strong>Differentiation:</strong> Existing security MCP servers (like GhidraMCP) focus on reverse engineering. Nobody has built a comprehensive <strong>web pentesting</strong> MCP toolkit. We own this space by being first and backed by real offensive expertise.</p>
        </div>
        <div className="sg">
          <div className="glass sc"><h3>Deliverable</h3><p>Open-source GitHub monorepo with 5–7 MCP servers, each wrapping a security tool. Installable via npm/pip with a single command. MIT or Apache 2.0 licensed.</p></div>
          <div className="glass sc"><h3>Target MVP</h3><ul><li>3 MCP servers working end-to-end</li><li>README + install guide</li><li>Demo video with Claude Code</li><li>Published to GitHub with docs</li></ul></div>
          <div className="glass sc"><h3>Success Metrics</h3><ul><li>Install in under 5 minutes</li><li>Claude chains 2+ tools autonomously</li><li>Finds a real vuln in test target</li><li>GitHub stars as signal</li></ul></div>
          <div className="glass sc"><h3>Non-Goals (for now)</h3><ul><li>No web UI / dashboard</li><li>No cloud-hosted scanning service</li><li>No paid tier / SaaS</li><li>No binary / RE analysis</li></ul></div>
        </div>
      </section>

      {/* Section 02 — MCP Servers */}
      <section>
        <div className="sl"><span className="sn">02</span><h2 className="st">MCP Servers — Planned</h2></div>
        <div className="mg">
          <div className="glass mc p0"><div className="mi">🔍</div><div className="mb"><h3>Recon MCP <span className="pp">P0 — MVP</span></h3><p className="md">Subdomain enumeration, tech stack fingerprinting, port scanning, endpoint discovery. The starting point — the AI maps the attack surface first.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>enumerate_subdomains(domain)</li><li>fingerprint_tech(url)</li><li>scan_ports(host, ports)</li><li>discover_endpoints(url)</li><li>check_headers(url)</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>Subfinder / Amass</li><li>httpx — probing & tech detect</li><li>Nmap (light) — port scan</li><li>Wappalyzer — fingerprint</li></ul></div></div><div className="tags"><span className="tag">Python or TypeScript</span><span className="tag">subprocess wrappers</span><span className="tag">JSON parsing</span></div></div></div>

          <div className="glass mc p0"><div className="mi">💉</div><div className="mb"><h3>Web Fuzzer MCP <span className="pp">P0 — MVP</span></h3><p className="md">Active vulnerability scanning for OWASP Top 10 — XSS, SQLi, SSRF, path traversal, command injection. The core offensive tool.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>fuzz_xss(url, params)</li><li>fuzz_sqli(url, params)</li><li>fuzz_ssrf(url, params)</li><li>fuzz_path_traversal(url)</li><li>fuzz_cmdi(url, params)</li><li>custom_fuzz(url, payloads)</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>Custom Python httpx fuzzer</li><li>SecLists / PayloadAllTheThings</li><li>ffuf — dir/param fuzzing</li><li>Response analysis logic</li></ul></div></div><div className="tags"><span className="tag">Python</span><span className="tag">async httpx</span><span className="tag">payload databases</span><span className="tag">Shelly's expertise</span></div></div></div>

          <div className="glass mc p0"><div className="mi">☢️</div><div className="mb"><h3>Nuclei MCP <span className="pp">P0 — MVP</span></h3><p className="md">Wrapper around ProjectDiscovery's Nuclei — the most popular open-source vulnerability scanner. Run templates, parse results for the AI.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>scan_target(url, templates[])</li><li>scan_with_severity(url, level)</li><li>list_templates(category)</li><li>get_finding_details(id)</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>Nuclei CLI + JSON output</li><li>Templates repo</li><li>Custom template authoring</li></ul></div></div><div className="tags"><span className="tag">Go binary</span><span className="tag">Python/TS wrapper</span><span className="tag">YAML templates</span></div></div></div>

          <div className="glass mc p1"><div className="mi">🌐</div><div className="mb"><h3>OSINT & Threat Intel MCP <span className="pp">P1 — Post-MVP</span></h3><p className="md">Query VirusTotal, Shodan, CVE databases, MISP feeds from within the AI agent. Enriches findings with threat context.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>query_shodan(query)</li><li>lookup_cve(cve_id)</li><li>check_virustotal(indicator)</li><li>query_misp(indicator)</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>Shodan API</li><li>NVD / CVE API</li><li>VirusTotal API</li><li>MISP REST API</li></ul></div></div><div className="tags"><span className="tag">API wrappers</span><span className="tag">API key mgmt</span><span className="tag">MISP — Shelly's exp.</span></div></div></div>

          <div className="glass mc p1"><div className="mi">🔑</div><div className="mb"><h3>Auth & Access Control MCP <span className="pp">P1 — Post-MVP</span></h3><p className="md">Test authentication flaws — brute force, default creds, IDOR, JWT analysis, session testing.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>brute_login(url, users, pass)</li><li>test_idor(url, param, range)</li><li>analyze_jwt(token)</li><li>test_default_creds(url)</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>Hydra — brute force</li><li>Custom IDOR logic</li><li>PyJWT</li><li>SecLists default-creds</li></ul></div></div><div className="tags"><span className="tag">Python</span><span className="tag">Hydra</span><span className="tag">JWT</span><span className="tag">Shelly's expertise</span></div></div></div>

          <div className="glass mc p2"><div className="mi">📡</div><div className="mb"><h3>Traffic Interceptor MCP <span className="pp">P2 — Future</span></h3><p className="md">Lightweight HTTP proxy that captures request/response pairs. Could complement Burp Suite.</p><div className="mdet"><div className="dg"><h4>Exposed Tools</h4><ul><li>start_proxy(port)</li><li>get_captured_requests()</li><li>replay_request(id, mods)</li><li>analyze_traffic_patterns()</li></ul></div><div className="dg"><h4>Tools to Investigate</h4><ul><li>mitmproxy</li><li>Burp Suite REST API</li><li>Custom lightweight proxy</li></ul></div></div><div className="tags"><span className="tag">mitmproxy</span><span className="tag">Python</span><span className="tag">advanced</span></div></div></div>
        </div>
      </section>

      {/* Section 03 — Team */}
      <section>
        <div className="sl"><span className="sn">03</span><h2 className="st">Team Responsibilities & Investigation</h2></div>
        <div className="tg">
          <div className="glass tc dor">
            <div className="ta">D</div>
            <div className="tn">Dor Skoler</div>
            <div className="tr">Infrastructure · MCP Protocol · Packaging · DevOps</div>
            <div className="ib"><h4><span className="di"></span> MCP Protocol Deep Dive</h4><p>Understand how MCP servers are built, registered, and consumed.</p><ul><li>Read MCP spec — tools, resources, prompts, transports (stdio vs SSE)</li><li>Study 2–3 existing MCP servers — note code patterns</li><li>Build a "hello world" MCP server — verify in Claude Code</li><li>Compare TypeScript SDK vs Python SDK for our use case</li><li>How do servers handle long-running ops (60s scans)?</li><li>One server with multiple tools, or one per tool?</li></ul></div>
            <div className="ib"><h4><span className="di"></span> Repo Structure & Packaging</h4><p>Design monorepo so each server is independently installable.</p><ul><li>Research monorepo patterns — Turborepo, Lerna, workspaces</li><li>Define shared utilities (logging, errors, LLM output formatting)</li><li>Set up CI/CD — GitHub Actions</li><li>Packaging: one per server or @secmcp/toolkit?</li><li>Docker images for servers needing CLI tools</li></ul></div>
            <div className="ib"><h4><span className="di"></span> Tool Integration Layer</h4><p>Build the pattern for wrapping CLI tools safely.</p><ul><li>Bundle / check for external tool dependencies</li><li>Subprocess timeout handling</li><li>JSON output parsing across tool formats</li><li>Docker-based execution for hard-to-install tools?</li></ul></div>
            <div className="ib"><h4><span className="di"></span> LLM-Friendly Output Design</h4><p>Tools must return data the LLM can reason about.</p><ul><li>Study GhidraMCP/ReVa output formatting patterns</li><li>Design standard schema (severity, finding, evidence, next_steps)</li><li>Keep outputs concise for context limits</li></ul></div>
          </div>

          <div className="glass tc shelly">
            <div className="ta">S</div>
            <div className="tn">Shelly Ehud</div>
            <div className="tr">Offensive Security · Payloads · Tool Selection · Validation</div>
            <div className="ib"><h4><span className="di"></span> Web Fuzzer Design</h4><p>Design the core fuzzing logic — your attack expertise becomes the product.</p><ul><li>Define payload sets per vuln class: XSS, SQLi, SSRF, path traversal, cmdi</li><li>Research best wordlists — SecLists, PayloadAllTheThings, custom</li><li>Define detection logic — how we KNOW a payload worked</li><li>Build vs wrap: custom Python fuzzer or wrap ffuf/wfuzz?</li><li>Parameter discovery — find injectable params automatically</li><li>Rate limiting & safety — avoid DoSing the target</li></ul></div>
            <div className="ib"><h4><span className="di"></span> Attack Methodology Playbooks</h4><p>Per vuln type, define the playbook an AI agent should follow.</p><ul><li>XSS: injection points, reflection testing, DOM vs reflected vs stored</li><li>SQLi: error-based → blind → UNION, testing order</li><li>SSRF: internal IPs, cloud metadata, DNS rebinding</li><li>Path Traversal: OS detect → payload select</li><li>Command Injection: separators, blind detection</li><li>CSRF: tokens, SameSite cookies, origin/referer</li></ul></div>
            <div className="ib"><h4><span className="di"></span> Nuclei Templates Curation</h4><p>Curate the most useful template subsets.</p><ul><li>Which categories matter most for web pentest?</li><li>Custom templates for uncovered areas?</li><li>Map findings to MITRE ATT&CK</li></ul></div>
            <div className="ib"><h4><span className="di"></span> Vulnerable Test Application</h4><p>Build a deliberately vulnerable app to test our tools.</p><ul><li>Flask/PHP with XSS, SQLi, SSRF, IDOR, path traversal, cmdi</li><li>Dockerized — anyone can spin it up</li><li>Each vuln documented — becomes regression test suite</li></ul></div>
            <div className="ib"><h4><span className="di"></span> MCP Basics (Cross-Training)</h4><p>Get comfortable with MCP to work independently.</p><ul><li>Read MCP overview — tools, resources, prompts</li><li>Run Dor's hello-world server</li><li>Write tool descriptions that help Claude use tools correctly</li></ul></div>
          </div>
        </div>
      </section>

      {/* Section 04 — Development Phases */}
      <section>
        <div className="sl"><span className="sn">04</span><h2 className="st">Development Phases</h2></div>
        <div className="tline">
          <div className="ph active"><div className="pd"></div><div className="pt">Phase 0 — Now</div><h3>Investigation & Setup</h3><p>Both research independently and reconvene. Dor owns MCP protocol. Shelly owns offensive tool selection and payloads. Ends with a hello-world server and a vulnerable test app.</p><div className="pr"><span className="prf">SEC-001</span><span className="prf">SEC-002</span><span className="prf">SEC-003</span><span className="prf">SEC-004</span><span className="prf">SEC-005</span><span className="prf">SEC-006</span><span className="prf">SEC-007</span><span className="prf">SEC-008</span><span className="prf">SEC-013</span></div></div>
          <div className="ph"><div className="pd"></div><div className="pt">Phase 1</div><h3>MVP — First 3 MCP Servers</h3><p>Build Recon, Web Fuzzer, and Nuclei MCP servers. Each working end-to-end in Claude Code. Tested against the vulnerable app.</p><div className="pr"><span className="prf">SEC-009</span><span className="prf">SEC-010</span><span className="prf">SEC-011</span><span className="prf">SEC-012</span></div></div>
          <div className="ph"><div className="pd"></div><div className="pt">Phase 2</div><h3>Expand & Polish</h3><p>Add OSINT and Auth MCP servers. Comprehensive docs. Demo video. Publish with logo, badges, examples.</p><div className="pr"><span className="prf">SEC-014</span></div></div>
          <div className="ph"><div className="pd"></div><div className="pt">Phase 3</div><h3>Community & Growth</h3><p>Share on X, Reddit, Hacker News. Blog post. Accept contributions. Docker image. Explore Traffic Interceptor MCP.</p></div>
        </div>
      </section>

      {/* Section 05 — Tech Stack */}
      <section>
        <div className="sl"><span className="sn">05</span><h2 className="st">Proposed Tech Stack</h2></div>
        <div className="stg">
          <div className="glass stc"><h4>MCP Servers</h4><div className="sti"><div className="si"><span className="b"></span>Python or TypeScript (TBD)</div><div className="si"><span className="b"></span>MCP SDK (official)</div><div className="si"><span className="b"></span>asyncio / async subprocess</div><div className="si"><span className="b"></span>JSON schema tool defs</div></div></div>
          <div className="glass stc"><h4>Security Tools</h4><div className="sti"><div className="si"><span className="b"></span>Nuclei — vuln scanning</div><div className="si"><span className="b"></span>Subfinder / httpx — recon</div><div className="si"><span className="b"></span>Nmap — port scanning</div><div className="si"><span className="b"></span>Custom fuzzer (httpx)</div><div className="si"><span className="b"></span>SecLists / PayloadAllTheThings</div></div></div>
          <div className="glass stc"><h4>Infrastructure</h4><div className="sti"><div className="si"><span className="b"></span>GitHub monorepo</div><div className="si"><span className="b"></span>GitHub Actions CI/CD</div><div className="si"><span className="b"></span>Docker (test app + images)</div><div className="si"><span className="b"></span>npm / PyPI publishing</div></div></div>
        </div>
      </section>

      <div className="ft">
        <p>SecMCP — Kickoff Document v0.1 — Dor Skoler & Shelly Ehud — March 2026</p>
        <p style={{ marginTop: '.4rem' }} className="ac">This is a living document. Update as investigation progresses.</p>
      </div>
    </>
  )
}
