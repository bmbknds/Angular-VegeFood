import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  username: string;
  email: string;
  password?: string; // Optional, not exposed to UI
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject: BehaviorSubject<User | null>;
  public readonly currentUser: Observable<User | null>;
  private readonly USERS_KEY = 'registeredUsers';
  private readonly TOKEN_KEY = 'authToken';

  constructor(private readonly router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Register a new user
   */
  register(data: RegisterData): { success: boolean; message: string } {
    // Get existing users
    const users = this.getRegisteredUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Validate password length
    if (data.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser: User = {
      username: data.username,
      email: data.email,
      password: data.password // In real app, would hash this
    };

    // Store user
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return { success: true, message: 'Registration successful! Please login.' };
  }

  /**
   * Login user with email and password
   */
  login(data: LoginData): { success: boolean; message: string } {
    const users = this.getRegisteredUsers();
    
    // Find user by email and password
    const user = users.find(u => u.email === data.email && u.password === data.password);

    if (user) {
      // Create user object without password
      const loggedInUser: User = {
        username: user.username,
        email: user.email
      };

      // Generate simple token (in real app, would come from backend)
      const token = btoa(`${user.email}:${Date.now()}`);
      
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      localStorage.setItem(this.TOKEN_KEY, token);
      this.currentUserSubject.next(loggedInUser);

      return { success: true, message: 'Login successful!' };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get all registered users from localStorage
   */
  private getRegisteredUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
}
