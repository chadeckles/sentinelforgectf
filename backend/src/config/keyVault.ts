import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Initialize Key Vault client if running in Azure
let secretClient: SecretClient | null = null;

if (process.env.KEY_VAULT_URL) {
  const credential = new DefaultAzureCredential();
  secretClient = new SecretClient(process.env.KEY_VAULT_URL, credential);
}

/**
 * Get a secret from Azure Key Vault or fall back to environment variable
 * @param secretName - Name of the secret in Key Vault (e.g., 'JWT-SECRET')
 * @param envVarName - Fallback environment variable name
 * @returns Secret value
 */
export async function getSecret(secretName: string, envVarName: string): Promise<string> {
  // If Key Vault is configured, try to fetch from there
  if (secretClient) {
    try {
      const secret = await secretClient.getSecret(secretName);
      if (secret.value) {
        console.log(`✓ Retrieved secret '${secretName}' from Key Vault`);
        return secret.value;
      }
    } catch (error) {
      console.warn(`⚠ Failed to retrieve secret '${secretName}' from Key Vault:`, error);
      console.log(`  Falling back to environment variable '${envVarName}'`);
    }
  }

  // Fall back to environment variable
  const envValue = process.env[envVarName];
  if (!envValue) {
    throw new Error(
      `Secret '${secretName}' not found in Key Vault and environment variable '${envVarName}' is not set`
    );
  }

  return envValue;
}

/**
 * Initialize secrets from Key Vault and cache them in environment variables
 * Call this during application startup
 */
export async function initializeSecrets(): Promise<void> {
  if (!secretClient) {
    console.log('ℹ Key Vault not configured, using environment variables');
    return;
  }

  console.log('🔐 Initializing secrets from Azure Key Vault...');

  try {
    // Fetch JWT secret
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = await getSecret('JWT-SECRET', 'JWT_SECRET');
    }

    // Fetch SQL password
    if (!process.env.AZURE_SQL_PASSWORD) {
      process.env.AZURE_SQL_PASSWORD = await getSecret('SQL-ADMIN-PASSWORD', 'AZURE_SQL_PASSWORD');
    }

    console.log('✓ Secrets initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize secrets:', error);
    throw error;
  }
}
