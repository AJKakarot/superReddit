// server/src/config/monitoring.config.ts

export interface MonitoringConfig {
  // Database optimization settings
  enableCaching: boolean;
  reduceQueryFrequency: boolean;
  useBatchOperations: boolean;
  
  // Timing settings
  producerIntervalMinutes: number;
  workerPollingIntervalMs: number;
  keywordRescanIntervalHours: number;
  
  // Processing settings
  batchSize: number;
  rateLimitDelayMs: number;
  
  // Reddit API settings
  searchLimit: number;
  searchTimeWindow: 'day' | 'week' | 'month';
  
  // Performance settings
  enableAdaptiveDelays: boolean;
  maxConsecutiveEmptyBatches: number;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enableCaching: true,
  reduceQueryFrequency: true,
  useBatchOperations: true,
  
  producerIntervalMinutes: 30, // Reduced from 5 minutes
  workerPollingIntervalMs: 10000, // 10 seconds base
  keywordRescanIntervalHours: 1, // Reduced from 15 minutes
  
  batchSize: 5, // Reduced from 10
  rateLimitDelayMs: 2000, // 2 seconds between Reddit API calls
  
  searchLimit: 50, // Reduced from 100
  searchTimeWindow: 'week', // Reduced from 'month'
  
  enableAdaptiveDelays: true,
  maxConsecutiveEmptyBatches: 3,
};

export const PERFORMANCE_MONITORING_CONFIG: MonitoringConfig = {
  ...DEFAULT_MONITORING_CONFIG,
  producerIntervalMinutes: 60, // Even more conservative
  workerPollingIntervalMs: 30000, // 30 seconds
  keywordRescanIntervalHours: 2, // 2 hours between scans
  batchSize: 3, // Very small batches
  rateLimitDelayMs: 5000, // 5 seconds between calls
};

export const AGGRESSIVE_MONITORING_CONFIG: MonitoringConfig = {
  ...DEFAULT_MONITORING_CONFIG,
  producerIntervalMinutes: 15, // More frequent
  workerPollingIntervalMs: 5000, // 5 seconds
  keywordRescanIntervalHours: 0.5, // 30 minutes
  batchSize: 10, // Larger batches
  rateLimitDelayMs: 1000, // 1 second between calls
};

// Environment-based configuration
export function getMonitoringConfig(): MonitoringConfig {
  const env = process.env.NODE_ENV || 'development';
  const mode = process.env.MONITORING_MODE || 'default';
  
  switch (mode) {
    case 'performance':
      return PERFORMANCE_MONITORING_CONFIG;
    case 'aggressive':
      return AGGRESSIVE_MONITORING_CONFIG;
    case 'default':
    default:
      return DEFAULT_MONITORING_CONFIG;
  }
}

// Runtime configuration updates
export function updateMonitoringConfig(updates: Partial<MonitoringConfig>): void {
  const config = getMonitoringConfig();
  Object.assign(config, updates);
  console.log('Monitoring configuration updated:', config);
}

// Configuration validation
export function validateMonitoringConfig(config: MonitoringConfig): string[] {
  const errors: string[] = [];
  
  if (config.producerIntervalMinutes < 1) {
    errors.push('Producer interval must be at least 1 minute');
  }
  
  if (config.workerPollingIntervalMs < 1000) {
    errors.push('Worker polling interval must be at least 1 second');
  }
  
  if (config.batchSize < 1 || config.batchSize > 20) {
    errors.push('Batch size must be between 1 and 20');
  }
  
  if (config.rateLimitDelayMs < 500) {
    errors.push('Rate limit delay must be at least 500ms to respect Reddit API limits');
  }
  
  return errors;
}
