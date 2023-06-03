export class AuthError extends Error {}

export class ConfigError extends Error {}

export class NoJwtSecretError extends ConfigError {
  constructor() {
    super('JWT_SECRET environment variable must be configured for auth usage');
  }
}

export class NoS3BucketError extends ConfigError {
  constructor() {
    super(
      'S3_BUCKET environment variable must be configured for image upload usage'
    );
  }
}
