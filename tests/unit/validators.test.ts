import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, ticketCreateSchema, ticketUpdateSchema } from '@/lib/validators';

describe('validators.ts — registerSchema', () => {
  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.io',
      password: 'Strong123',
      name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a weak password (no uppercase)', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.io',
      password: 'weakpass1',
      name: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a weak password (no digit)', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.io',
      password: 'NoDigitsHere',
      name: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Strong123',
      name: 'John',
    });
    expect(result.success).toBe(false);
  });
});

describe('validators.ts — ticketCreateSchema', () => {
  it('applies MEDIUM priority by default', () => {
    const result = ticketCreateSchema.safeParse({
      title: 'My ticket',
      description: 'Something is broken for sure.',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.priority).toBe('MEDIUM');
  });

  it('rejects too short title', () => {
    const result = ticketCreateSchema.safeParse({
      title: 'No',
      description: 'A valid description here.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority enum', () => {
    const result = ticketCreateSchema.safeParse({
      title: 'My ticket',
      description: 'A valid description here.',
      priority: 'CRITICAL',
    });
    expect(result.success).toBe(false);
  });
});

describe('validators.ts - loginSchema', () => {
  it('accepts a valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'admin@helpdesk.io',
      password: 'Password123!',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@helpdesk.io',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});

describe('validators.ts - ticketUpdateSchema', () => {
  it('accepts a partial status update', () => {
    const result = ticketUpdateSchema.safeParse({
      status: 'IN_PROGRESS',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a nullable assigneeId', () => {
    const result = ticketUpdateSchema.safeParse({
      assigneeId: null,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = ticketUpdateSchema.safeParse({
      status: 'ARCHIVED',
    });

    expect(result.success).toBe(false);
  });
});
