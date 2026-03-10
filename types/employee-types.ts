export interface Employee {
  employee_id: string;
  username: string;
  email: string;
  designation_id?: string;
  designation_name?: string;
  department_id?: string;
  department_name?: string;
  manager_id?: string;
  manager_name?: string;
  status_id?: string;
  status_name?: string;
  is_active: boolean;
  date_of_joining: string;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeDetail {
  employee_id: string;
  username: string;
  email: string;
  is_active: boolean;
  date_of_joining: string;
  designation?: {
    designation_id: string;
    designation_name: string;
    designation_code: string;
    level: number;
  };
  department?: {
    department_id: string;
    department_name: string;
    department_code: string;
  };
  manager?: {
    employee_id: string;
    username: string;
    email: string;
  };
  status?: {
    status_id: string;
    status_code: string;
    status_name: string;
  };
  roles?: { role_id: string; role_name: string; role_code: string }[];
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  designation?: string;
}
