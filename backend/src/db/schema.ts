export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DB {
  users: User;
}
