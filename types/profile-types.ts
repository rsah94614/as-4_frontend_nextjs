export interface Designation {
    designation_id: string;
    designation_name: string;
    designation_code: string;
    level: number;
}

export interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
    department_type?: { type_name: string; type_code: string };
}

export interface Manager {
    employee_id: string;
    username: string;
    email: string;
}

export interface WalletInfo {
    wallet_id: string;
    available_points: number;
    redeemed_points: number;
    total_earned_points: number;
}

export interface Role {
    role_id: string;
    role_name: string;
    role_code: string;
}

export interface EmployeeDetail {
    employee_id: string;
    username: string;
    email: string;
    date_of_joining: string;
    is_active: boolean;
    designation?: Designation;
    department?: Department;
    manager?: Manager;
    wallet?: WalletInfo;
    roles: Role[];
    status?: { status_name: string };
}
