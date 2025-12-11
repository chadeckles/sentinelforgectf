import { useState, useRef, useEffect } from 'react'
import { Terminal as TerminalIcon, Copy, Check, Info } from 'lucide-react'
import './Terminal.css'

function Terminal({ commands = [], title = "Terminal Output", autoFocusInput = false }) {
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [executedCommands, setExecutedCommands] = useState([])
  const [showHint, setShowHint] = useState(true)
  const inputRef = useRef(null)
  const terminalBodyRef = useRef(null)

  const availableCommands = commands.map(cmd => cmd.command)

  useEffect(() => {
    // Auto-scroll to bottom when new commands are executed
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [executedCommands])

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      executeCommand(inputValue.trim())
      setInputValue('')
      setShowHint(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Auto-complete with next available command
      if (currentCommandIndex < commands.length) {
        setInputValue(commands[currentCommandIndex].command)
      }
    }
  }

  const executeCommand = (cmd) => {
    // Find matching command from the available commands
    const matchingCmd = commands.find(c => c.command === cmd)
    
    if (matchingCmd) {
      setExecutedCommands(prev => [...prev, { command: cmd, output: matchingCmd.output, success: true }])
      const nextIndex = commands.findIndex(c => c.command === cmd) + 1
      setCurrentCommandIndex(nextIndex)
    } else {
      // Check for various discovery command patterns
      
      // Pattern 1: Azure Blob Storage secrets.json download
      const downloadPattern = /az storage blob download.*--account-name\s+sentinelctf2025data.*--container-name\s+customer-data.*--name\s+secrets\.json/i
      
      // Pattern 2: Reading container host flag
      const containerFlagPattern = /cat\s+\/host\/root\/flag\.txt/i
      
      // Pattern 3: Key Vault flag-secret retrieval
      const keyVaultFlagPattern = /az keyvault secret show.*--vault-name\s+sentinelforge-kv.*--name\s+flag-secret/i
      
      // Pattern 4: GitHub Actions malicious PR creation
      const ghMaliciousPRPattern = /gh pr create\s+--title\s+['"][^'"]*[";$].*FLAG_SECRET.*['"].*--body/i
      
      // Pattern 5: Git History - show deleted .env file
      const gitShowEnvPattern = /git show\s+[a-f0-9^]+:\.env/i
      
      if (downloadPattern.test(cmd)) {
        // Azure Blob Storage - secrets.json
        const secretsOutput = `{
  "api_keys": {
    "stripe_key": "sk_live_51H*********************",
    "sendgrid_key": "SG.**********************",
    "azure_devops_pat": "ghp_**********************"
  },
  "database_credentials": {
    "host": "prod-db.postgres.database.azure.com",
    "username": "dbadmin",
    "password": "P@ssw0rd123!",
    "database": "production_db"
  },
  "internal_notes": "TODO: Move these secrets to Key Vault ASAP!",
  "flag": "flag{pub1ic_bl0bs_l3ak_d4ta}"
}`
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: secretsOutput,
          success: true 
        }])
        setShowHint(false)
      } else if (containerFlagPattern.test(cmd)) {
        // Container Escape - host flag
        const flagOutput = `🏴 CONTAINER ESCAPE SUCCESSFUL! 🏴

You've successfully escaped the container and accessed the host filesystem.

In a real attack scenario, you could now:
- Read sensitive files
- Install persistence mechanisms
- Pivot to other systems
- Exfiltrate data
- Compromise the entire host

This demonstrates why privileged containers are dangerous!

Flag: flag{c0nt41n3r_3sc4p3_m4st3r}

Remember: Always follow the principle of least privilege!`
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: flagOutput,
          success: true 
        }])
        setShowHint(false)
      } else if (keyVaultFlagPattern.test(cmd)) {
        // Key Vault - flag-secret
        const kvFlagOutput = `"flag{k3y_v4ult_m1sc0nf1g_pwn3d}"

🚨 SECRET EXPOSED!

The misconfigured Key Vault allowed:
1. Public network access without IP restrictions
2. Managed Identity with "list" + "get" permissions on ALL secrets
3. No RBAC, using less granular access policies
4. No Private Endpoint enforcement

In a real scenario, you could:
- Retrieve database credentials
- Access API keys
- Compromise the entire application
- Pivot to other resources

Secure Key Vault properly!`
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: kvFlagOutput,
          success: true 
        }])
        setShowHint(false)
      } else if (ghMaliciousPRPattern.test(cmd)) {
        // GitHub Actions - Malicious PR with injection
        const ghActionsOutput = `Creating pull request for exploit:main into main in sentinelforge-ctf/cicd-vulnerable

https://github.com/sentinelforge-ctf/cicd-vulnerable/pull/2

✅ Pull request created successfully!
   Workflow triggered...
   
📋 Workflow execution logs:

Run actions/checkout@v3
  Checking out repository...
  ✓ Repository checked out

Run actions/setup-node@v3
  Setting up Node.js 18...
  ✓ Node.js installed

Run tests
  echo "Testing PR: Test"; echo $FLAG_SECRET; echo ""
  Testing PR: Test
  flag{c1cd_1nj3ct10n_d4ng3r0us}
  
  npm test
  > test
  > jest
  
  PASS  src/app.test.js
  ✓ app works (2 ms)

🎯 SUCCESS! The injection worked!

The workflow executed your malicious command and exposed the FLAG_SECRET 
environment variable in the workflow logs.

Flag: flag{c1cd_1nj3ct10n_d4ng3r0us}

🔒 Remediation:
1. Never use \${{ }} expressions directly with user input in 'run:' blocks
2. Use environment variables: env: PR_TITLE: \${{ github.event.pull_request.title }}
3. Or use toJSON() to safely escape: echo \${{ toJSON(github.event.pull_request.title) }}
4. Enable GitHub Advanced Security and secret scanning
5. Use 'pull_request' trigger instead of 'pull_request_target' for untrusted code`
        
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: ghActionsOutput,
          success: true 
        }])
        setShowHint(false)
      } else if (gitShowEnvPattern.test(cmd)) {
        // Git History - show deleted .env file
        const gitEnvOutput = `DATABASE_URL=postgresql://localhost:5432/myapp
API_BASE_URL=https://api.example.com
API_KEY=sk-prod-abc123xyz789
SECRET_FLAG=flag{g1t_h1st0ry_n3v3r_f0rg3ts}
LOG_LEVEL=info

🎯 SUCCESS! You found the exposed secret in the git history!

📊 Analysis: The .env file contained sensitive credentials including:
- An API_KEY (sk-prod-abc123xyz789)
- A SECRET_FLAG that should never have been committed

This is a common mistake - developers commit secrets then try to remove them.
But git never forgets! The secret remains in the commit history.

🔒 Security Best Practices:
1. Never commit secrets to git repositories
2. Use .gitignore to exclude .env files
3. Store secrets in Azure Key Vault or similar services
4. Use GitHub Advanced Security for secret scanning
5. If secrets are exposed, rotate them immediately AND clean git history
6. Use tools like git-filter-repo or BFG Repo-Cleaner to remove secrets from history

Flag: flag{g1t_h1st0ry_n3v3r_f0rg3ts}`
        
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: gitEnvOutput,
          success: true 
        }])
        setShowHint(false)
      } else {
        // Command not found - show helpful error with available commands
        const availableList = commands.slice(0, 3).map(c => `  • ${c.command}`).join('\n')
        setExecutedCommands(prev => [...prev, { 
          command: cmd, 
          output: `💡 Command not available in this simulated environment.

📋 Available commands for this challenge:
${availableList}${commands.length > 3 ? '\n  • ... and more (see suggestions below)' : ''}

🔍 Tip: Use the suggested commands below or press TAB for auto-complete.`,
          success: false 
        }])
      }
    }
  }

  const runAllCommands = () => {
    const allCommands = commands.map(cmd => ({
      command: cmd.command,
      output: cmd.output,
      success: true
    }))
    setExecutedCommands(allCommands)
    setCurrentCommandIndex(commands.length)
    setShowHint(false)
  }

  const resetTerminal = () => {
    setExecutedCommands([])
    setCurrentCommandIndex(0)
    setInputValue('')
    setShowHint(true)
    inputRef.current?.focus()
  }

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-controls">
          <span className="control red" onClick={resetTerminal} title="Reset terminal"></span>
          <span className="control yellow" title="Minimize (disabled)"></span>
          <span className="control green" title="Maximize (disabled)"></span>
        </div>
        <div className="terminal-title">
          <TerminalIcon size={16} />
          <span>{title}</span>
        </div>
        <div className="terminal-actions">
          <button className="terminal-btn" onClick={runAllCommands} title="Run all commands">
            Run All
          </button>
          <button className="terminal-btn" onClick={resetTerminal} title="Clear terminal">
            Clear
          </button>
        </div>
      </div>

      {showHint && executedCommands.length === 0 && (
        <div className="terminal-hint">
          <Info size={14} />
          <span>💡 Type commands below or press TAB to auto-complete. Try running the suggested commands to explore the environment!</span>
        </div>
      )}
      
      <div className="terminal-body" ref={terminalBodyRef}>
        {/* Show executed commands */}
        {executedCommands.map((cmd, index) => (
          <div key={index} className="terminal-block">
            <div className="terminal-command">
              <span className="terminal-prompt">$</span>
              <span className="terminal-cmd-text">{cmd.command}</span>
              <button
                className="copy-button"
                onClick={() => handleCopy(cmd.command, `cmd-${index}`)}
                title="Copy command"
              >
                {copiedIndex === `cmd-${index}` ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div className={`terminal-output ${cmd.success ? '' : 'error'}`}>
              <pre>{cmd.output}</pre>
              {cmd.output.length > 50 && (
                <button
                  className="copy-button copy-output"
                  onClick={() => handleCopy(cmd.output, `out-${index}`)}
                  title="Copy output"
                >
                  {copiedIndex === `out-${index}` ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Interactive input line */}
        <div className="terminal-input-line">
          <span className="terminal-prompt">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            placeholder={currentCommandIndex < commands.length ? 
              `Try: ${commands[currentCommandIndex].command.substring(0, 40)}...` : 
              'Type a command...'}
            autoFocus={autoFocusInput}
          />
        </div>
      </div>

      {/* Command hints */}
      <div className="terminal-footer">
        <div className="command-hints">
          <span className="hint-label">💡 Suggested commands:</span>
          {commands
            .filter((cmd, idx) => !executedCommands.some(exec => exec.command === cmd.command))
            .slice(0, 4)
            .map((cmd, idx) => (
              <button
                key={idx}
                className="hint-command"
                onClick={() => {
                  executeCommand(cmd.command)
                  setShowHint(false)
                }}
                title="Click to run this command"
              >
                {cmd.command.length > 60 ? cmd.command.substring(0, 60) + '...' : cmd.command}
              </button>
            ))}
          {commands.filter((cmd, idx) => !executedCommands.some(exec => exec.command === cmd.command)).length === 0 && (
            <span className="hint-complete">✅ All suggested commands executed!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Terminal
