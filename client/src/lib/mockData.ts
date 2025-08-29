// This file provides utilities for mock data generation during development
// Note: No actual mock data is generated here to avoid placeholder content

export interface MockDataConfig {
  count?: number;
  type?: string;
  severity?: string;
}

export class MockDataGenerator {
  /**
   * Generates mock sensor readings for development
   * WARNING: This should only be used in development mode
   */
  static generateSensorReadings(config: MockDataConfig = {}) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mock data generation is not allowed in production');
    }
    
    // Implementation would go here for development use
    // Currently returns empty array to avoid generating placeholder data
    return [];
  }

  /**
   * Generates mock alert data for development
   * WARNING: This should only be used in development mode
   */
  static generateAlerts(config: MockDataConfig = {}) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mock data generation is not allowed in production');
    }
    
    // Implementation would go here for development use
    // Currently returns empty array to avoid generating placeholder data
    return [];
  }

  /**
   * Generates mock community reports for development
   * WARNING: This should only be used in development mode
   */
  static generateReports(config: MockDataConfig = {}) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mock data generation is not allowed in production');
    }
    
    // Implementation would go here for development use
    // Currently returns empty array to avoid generating placeholder data
    return [];
  }
}

/**
 * Utility function to check if we should use mock data
 */
export function shouldUseMockData(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.VITE_USE_MOCK_DATA === 'true';
}

/**
 * Utility to validate mock data before using it
 */
export function validateMockData(data: any[], type: string): boolean {
  if (!Array.isArray(data)) {
    console.warn(`Invalid mock data for ${type}: not an array`);
    return false;
  }
  
  if (data.length === 0) {
    console.info(`Empty mock data array for ${type}`);
    return true;
  }
  
  // Additional validation logic could go here
  return true;
}

/**
 * Helper to format mock coordinates
 */
export function formatMockCoordinates(lat: number, lng: number): { latitude: string; longitude: string } {
  return {
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
  };
}

/**
 * Helper to generate random severity levels
 */
export function getRandomSeverity(): 'low' | 'medium' | 'high' | 'critical' {
  const severities = ['low', 'medium', 'high', 'critical'] as const;
  return severities[Math.floor(Math.random() * severities.length)];
}

/**
 * Helper to generate random threat types
 */
export function getRandomThreatType(): 'storm_surge' | 'cyclone' | 'erosion' | 'pollution' | 'algal_bloom' {
  const types = ['storm_surge', 'cyclone', 'erosion', 'pollution', 'algal_bloom'] as const;
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Helper to generate random report types
 */
export function getRandomReportType(): 'pollution' | 'erosion' | 'wildlife' | 'storm' | 'other' {
  const types = ['pollution', 'erosion', 'wildlife', 'storm', 'other'] as const;
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Helper to generate timestamps for development
 */
export function generateTimestamp(hoursAgo: number = 0): Date {
  const now = new Date();
  now.setHours(now.getHours() - hoursAgo);
  return now;
}

/**
 * Configuration for different mock data types
 */
export const MOCK_DATA_CONFIGS = {
  sensors: {
    coastal: { count: 10, type: 'tide_gauge' },
    weather: { count: 5, type: 'weather_station' },
    pollution: { count: 8, type: 'pollution_monitor' },
  },
  alerts: {
    critical: { count: 2, severity: 'critical' },
    medium: { count: 5, severity: 'medium' },
    low: { count: 3, severity: 'low' },
  },
  reports: {
    recent: { count: 10 },
    thisWeek: { count: 25 },
    thisMonth: { count: 100 },
  },
} as const;

export default MockDataGenerator;
