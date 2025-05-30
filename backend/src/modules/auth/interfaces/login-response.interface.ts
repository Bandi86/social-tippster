export interface LoginResponse {
  access_token: string;
  user: {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}
