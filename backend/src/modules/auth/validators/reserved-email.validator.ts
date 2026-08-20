import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Local-parts reserved for internal/system accounts — block impersonation attempts at signup.
const RESERVED_LOCAL_PART_REGEX =
  /^(admin|administrator|root|superadmin|sysadmin|system|support|webmaster|postmaster|security|noreply|no-reply)$/i;

// Company domain is reserved for staff accounts (created internally, never via public registration).
const RESERVED_DOMAIN_REGEX = /(^|\.)orkpad\.com$/i;

@ValidatorConstraint({ name: 'isAllowedRegistrationEmail', async: false })
export class IsAllowedRegistrationEmailConstraint implements ValidatorConstraintInterface {
  validate(email: unknown): boolean {
    if (typeof email !== 'string' || !email.includes('@')) return true;

    const [localPart, domain] = email.split('@');
    if (RESERVED_LOCAL_PART_REGEX.test(localPart)) return false;
    if (RESERVED_DOMAIN_REGEX.test(domain)) return false;

    return true;
  }

  defaultMessage(): string {
    return 'Este email no está permitido para el registro.';
  }
}

export function IsAllowedRegistrationEmail(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsAllowedRegistrationEmailConstraint,
    });
  };
}
