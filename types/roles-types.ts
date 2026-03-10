export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description?: string | null;
  created_at?: string;
}

export interface CreateRolePayload {
  role_name: string;
  role_code: string;
  description?: string;
}

export interface EmployeeRole {
  employee_role_id: string;
  assigned_at: string;
  is_active: boolean;
  employee: {
    id: string;
    username: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    code: string;
  };
}

export interface AssignRolePayload {
  employee_id: string;
  role_id: string;
}

export interface RoutePermission {
  route_key: string;
  roles: {
    role_id: string;
    role_code: string;
    role_name: string;
  }[];
}

export interface RoutePermissionPayload {
  route_key: string;
  role_id: string;
}
