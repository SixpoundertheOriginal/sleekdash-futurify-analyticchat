
import { describe, it, expect, vi } from 'vitest';
import { validateFile, getFileFormat, validateFileContent } from '../FileValidation';
import { createMockFile } from '@/test/mocks/fileMocks';

describe('FileValidation utilities', () => {
  describe('validateFile', () => {
    it('should accept valid file types', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      const excelFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const jsonFile = createMockFile('test.json', 'application/json');
      
      expect(validateFile(csvFile)).toBeNull();
      expect(validateFile(excelFile)).toBeNull();
      expect(validateFile(jsonFile)).toBeNull();
    });
    
    it('should reject invalid file types', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const error = validateFile(pdfFile);
      
      expect(error).not.toBeNull();
      expect(error).toContain('Unsupported file type');
    });
    
    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.csv', { type: 'text/csv' });
      const error = validateFile(emptyFile);
      
      expect(error).not.toBeNull();
      expect(error).toContain('File is empty');
    });
    
    it('should reject files that are too large', () => {
      // Mock a large file by overriding the size property
      const largeFile = createMockFile('large.csv', 'text/csv');
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      
      const error = validateFile(largeFile);
      
      expect(error).not.toBeNull();
      expect(error).toContain('File is too large');
    });
  });
  
  describe('getFileFormat', () => {
    it('should detect csv format correctly', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      expect(getFileFormat(csvFile)).toBe('csv');
    });
    
    it('should detect excel format correctly', () => {
      const xlsxFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const xlsFile = createMockFile('test.xls', 'application/vnd.ms-excel');
      
      expect(getFileFormat(xlsxFile)).toBe('excel');
      expect(getFileFormat(xlsFile)).toBe('excel');
    });
    
    it('should detect json format correctly', () => {
      const jsonFile = createMockFile('test.json', 'application/json');
      expect(getFileFormat(jsonFile)).toBe('json');
    });
    
    it('should detect text format correctly', () => {
      const textFile = createMockFile('test.txt', 'text/plain');
      expect(getFileFormat(textFile)).toBe('text');
    });
    
    it('should return unknown for unsupported formats', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      expect(getFileFormat(pdfFile)).toBe('unknown');
    });
  });
  
  describe('validateFileContent', () => {
    it('should validate json content correctly', async () => {
      const validJson = new File([JSON.stringify({ data: [1, 2, 3] })], 'valid.json', { type: 'application/json' });
      const invalidJson = new File(['{ "data": [1, 2,'], 'invalid.json', { type: 'application/json' });
      
      const validResult = await validateFileContent(validJson, 'json');
      const invalidResult = await validateFileContent(invalidJson, 'json');
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Invalid JSON format');
    });
    
    it('should validate csv content correctly', async () => {
      const validCsv = new File(['header1,header2\nvalue1,value2'], 'valid.csv', { type: 'text/csv' });
      const invalidCsv = new File(['no commas or new lines'], 'invalid.csv', { type: 'text/csv' });
      
      const validResult = await validateFileContent(validCsv, 'csv');
      const invalidResult = await validateFileContent(invalidCsv, 'csv');
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Invalid CSV format');
    });
  });
});
