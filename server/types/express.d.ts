import { UserDocument } from './models';

declare global {
  namespace Express {
    interface Request {
      /**
       * The authenticated user, set by the auth middleware
       */
      user?: UserDocument;

      /**
       * The session ID for the current authenticated session
       */
      sessionId?: string;

      /**
       * The JWT access token from the request
       */
      token?: string;
    }
  }
}

export {};
