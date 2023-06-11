import { ZodError, ZodFormattedError } from 'zod';
import {
  AlreadyExistsError,
  AuthError,
  IncorrectLoginError,
  NotFoundError,
} from '../errors';
import { schemaBuilder } from '../schema-builder';

const ErrorInterface = schemaBuilder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

schemaBuilder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

schemaBuilder.objectType(AuthError, {
  name: 'AuthError',
  interfaces: [ErrorInterface],
});

schemaBuilder.objectType(IncorrectLoginError, {
  name: 'IncorrectLoginError',
  interfaces: [ErrorInterface],
});

schemaBuilder.objectType(NotFoundError, {
  name: 'NotFoundError',
  interfaces: [ErrorInterface],
});

schemaBuilder.objectType(AlreadyExistsError, {
  name: 'AlreadyExistsError',
  interfaces: [ErrorInterface],
});

function flattenErrors(
  error: ZodFormattedError<unknown>,
  path: string[]
): { path: string[]; message: string }[] {
  // eslint-disable-next-line no-underscore-dangle
  const errors = error._errors.map((message) => ({
    path,
    message,
  }));

  Object.keys(error).forEach((key) => {
    if (key !== '_errors') {
      errors.push(
        ...flattenErrors(
          (error as Record<string, unknown>)[key] as ZodFormattedError<unknown>,
          [...path, key]
        )
      );
    }
  });

  return errors;
}

const ZodFieldError = schemaBuilder
  .objectRef<{
    message: string;
    path: string[];
  }>('FieldValidationError')
  .implement({
    fields: (t) => ({
      message: t.exposeString('message'),
      path: t.exposeStringList('path'),
    }),
  });

schemaBuilder.objectType(ZodError, {
  name: 'ValidationError',
  interfaces: [ErrorInterface],
  fields: (t) => ({
    fieldErrors: t.field({
      type: [ZodFieldError],
      resolve: (err) => flattenErrors(err.format(), []),
    }),
  }),
});
