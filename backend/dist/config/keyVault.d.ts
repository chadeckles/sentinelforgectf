/**
 * Get a secret from Azure Key Vault or fall back to environment variable
 * @param secretName - Name of the secret in Key Vault (e.g., 'JWT-SECRET')
 * @param envVarName - Fallback environment variable name
 * @returns Secret value
 */
export declare function getSecret(secretName: string, envVarName: string): Promise<string>;
/**
 * Initialize secrets from Key Vault and cache them in environment variables
 * Call this during application startup
 */
export declare function initializeSecrets(): Promise<void>;
//# sourceMappingURL=keyVault.d.ts.map