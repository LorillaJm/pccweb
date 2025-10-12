import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataCache, fetchWithCache, batchRequests } from '../dataFetching';

describe('Data Fetching Utilities', () => {
  beforeEach(() => {
    dataCache.clear();
    vi.clearAllMocks();
  });

  describe('DataCache', () => {
    it('should store and retrieve data', () => {
      const testData = { id: 1, name: 'Test' };
      dataCache.set('test-key', testData);

      const retrieved = dataCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = dataCache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should expire data after specified time', () => {
      vi.useFakeTimers();
      
      const testData = { id: 1, name: 'Test' };
      dataCache.set('test-key', testData, 1000);

      expect(dataCache.get('test-key')).toEqual(testData);

      vi.advanceTimersByTime(1001);

      expect(dataCache.get('test-key')).toBeNull();

      vi.useRealTimers();
    });

    it('should check if key exists', () => {
      dataCache.set('test-key', { data: 'test' });
      
      expect(dataCache.has('test-key')).toBe(true);
      expect(dataCache.has('non-existent')).toBe(false);
    });

    it('should delete specific keys', () => {
      dataCache.set('test-key', { data: 'test' });
      expect(dataCache.has('test-key')).toBe(true);

      dataCache.delete('test-key');
      expect(dataCache.has('test-key')).toBe(false);
    });

    it('should clear all data', () => {
      dataCache.set('key1', { data: 'test1' });
      dataCache.set('key2', { data: 'test2' });

      dataCache.clear();

      expect(dataCache.has('key1')).toBe(false);
      expect(dataCache.has('key2')).toBe(false);
    });
  });

  describe('batchRequests', () => {
    it('should execute multiple requests in parallel', async () => {
      const request1 = vi.fn().mockResolvedValue('result1');
      const request2 = vi.fn().mockResolvedValue('result2');
      const request3 = vi.fn().mockResolvedValue('result3');

      const results = await batchRequests([request1, request2, request3]);

      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(request1).toHaveBeenCalled();
      expect(request2).toHaveBeenCalled();
      expect(request3).toHaveBeenCalled();
    });

    it('should handle failed requests', async () => {
      const request1 = vi.fn().mockResolvedValue('result1');
      const request2 = vi.fn().mockRejectedValue(new Error('Failed'));

      await expect(batchRequests([request1, request2])).rejects.toThrow('Failed');
    });
  });
});
