export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
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

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

export class NotFoundError extends DataError {
  constructor(message = 'ID not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AlreadyExistsError extends DataError {
  constructor(itemName: string, message?: string) {
    super(message ?? `${itemName} already exists`);
    this.name = 'AlreadyExistsError';
  }
}
