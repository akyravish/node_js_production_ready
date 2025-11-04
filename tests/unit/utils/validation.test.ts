import {
  delay,
  formatDate,
  generateRandomString,
  isValidEmail,
  safeJsonParse,
  sanitizeString,
} from '../../../src/utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeString('<div>Hello</div>')).toBe('Hello');
      expect(sanitizeString('<p>Text</p>')).toBe('Text');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\tworld\n\t')).toBe('world');
    });

    it('should remove remaining angle brackets', () => {
      expect(sanitizeString('test<>test')).toBe('testtest');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format valid Date objects', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should format valid date strings', () => {
      const result = formatDate('2024-01-01T00:00:00Z');
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return null for null or undefined', () => {
      expect(formatDate(null)).toBeNull();
      expect(formatDate(undefined)).toBeNull();
    });

    it('should return null for invalid date strings', () => {
      expect(formatDate('invalid-date')).toBeNull();
    });
  });

  describe('generateRandomString', () => {
    it('should generate a string of the specified length', () => {
      const result = generateRandomString(10);
      expect(result).toHaveLength(10);
    });

    it('should generate a string of default length (8)', () => {
      const result = generateRandomString();
      expect(result).toHaveLength(8);
    });

    it('should generate alphanumeric characters only', () => {
      const result = generateRandomString(20);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different strings on each call', () => {
      const result1 = generateRandomString(20);
      const result2 = generateRandomString(20);
      // Very unlikely to be the same
      expect(result1).not.toBe(result2);
    });
  });

  describe('delay', () => {
    it('should delay execution for the specified time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      const elapsed = end - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(elapsed).toBeLessThan(150);
    });

    it('should return a promise', () => {
      const result = delay(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON strings', () => {
      const json = '{"name":"test","value":123}';
      const result = safeJsonParse(json, {});
      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should return fallback for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      const fallback = { error: 'parse failed' };
      const result = safeJsonParse(invalidJson, fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for empty strings', () => {
      const fallback = { default: true };
      const result = safeJsonParse('', fallback);
      expect(result).toBe(fallback);
    });

    it('should handle null fallback', () => {
      const result = safeJsonParse('invalid', null);
      expect(result).toBeNull();
    });
  });
});
