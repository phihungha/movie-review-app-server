export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class IncorrectLoginError extends AuthError {
  constructor(message = 'Incorrect username or password') {
    super(message);
    this.name = 'IncorrectLoginError';
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class NoJwtSecretError extends ConfigError {
  constructor(
    message = 'JWT_SECRET environment variable must be configured for auth usage'
  ) {
    super(message);
    this.name = 'NoJwtSecretError';
  }
}

export class NoS3BucketError extends ConfigError {
  constructor(
    message = 'S3_BUCKET environment variable must be configured for auth usage'
  ) {
    super(message);
    this.name = 'NoS3BucketError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
