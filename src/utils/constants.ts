/**
 * Application Constants
 */

export const JOB_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
} as const;

export type JobStatusType = typeof JOB_STATUS[keyof typeof JOB_STATUS];
