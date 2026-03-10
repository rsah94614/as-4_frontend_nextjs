export interface User {
  employee_id: string;
  username: string;
  email: string;
  designation_id: string | null;
  department_id: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  employee: User;
}
