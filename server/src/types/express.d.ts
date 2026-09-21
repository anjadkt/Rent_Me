import { UserRole } from "./auth.types";

declare global {
  namespace Express {
    interface User {
      _id: string;
      role: UserRole;
    }
  }
}

export {};