import { test, expect } from '@playwright/test';

test.describe('Simple Passing Tests', () => {
  test('test 1', async () => {
    expect(1 + 1).toBe(2);
  });
  
  test('test 2', async () => {
    expect('hello').toBe('hello');
  });
});
