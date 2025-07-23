import { apiHelper } from "@/lib/apiHelper";

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

export interface UserDto {
  id: string;
  name: string;
  username: string;
}

export class AuthService {
  // Login user
  static async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiHelper.post<LoginResponseDto>(
      "/users/login",
      credentials
    );

    // Store token after successful login
    this.setAuthToken(response.token);

    return response;
  }

  // Token management methods
  static setAuthToken(token: string): void {
    localStorage.setItem("token", token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem("token");
  }

  static clearAuthToken(): void {
    localStorage.removeItem("token");
  }

  static isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }
}
