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

export interface AvailableTimesQuery {
  date_from?: string;
  date_to?: string;
}

export interface AvailableTimeBody {
  start_date: string;
  end_date: string;
}
