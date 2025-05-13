import { ServerResponse } from 'http';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: Error, res: ServerResponse) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', error);
  }

  if (error instanceof AppError) {
    res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'error',
        message: error.message,
      }),
    );
    return;
  }

  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'error',
      message: 'Internal server error. Please try again later.',
    }),
  );
};
