export const isUnauthorizedError = (error: any): boolean => {
  if (error instanceof Error) {
    return error.message.includes('401') || error.message.includes('Unauthorized');
  }
  return false;
};