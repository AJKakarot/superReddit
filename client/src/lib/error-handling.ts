export interface APIError {
  message: string;
  statusCode?: number;
}

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

export function handleAPIError(error: unknown): APIError {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as ErrorResponse;
    const message = axiosError.response?.data?.error || 'An unexpected error occurred';
    const statusCode = axiosError.response?.status;
    
    return {
      message,
      statusCode
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message
    };
  }
  
  // Handle unknown errors
  return {
    message: 'An unexpected error occurred'
  };
}
