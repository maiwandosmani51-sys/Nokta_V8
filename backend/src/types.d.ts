export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export type RoleType =
  | 'super_admin'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'family_student'
  | 'family'
  | 'accountant'
  | 'librarian';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: RoleType;
      };
    }
  }
}
