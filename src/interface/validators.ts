export interface SignupInfo {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  repeat_password: string;
  phone_number: string;
  role?: string;
}
export interface LoginInfo {
  username: string | undefined;
  password: string | undefined;
}

export interface UpdateInfo {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  role?: string;
}
