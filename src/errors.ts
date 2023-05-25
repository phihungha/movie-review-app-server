export class AuthError extends Error {}

export class ConfigError extends Error {}

export class NoJwtSecretError extends ConfigError {
  constructor() {
    super('JWT_SECRET must be configured for auth usage');
  }
}
