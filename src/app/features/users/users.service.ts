import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from './models/user.model';
import { catchError, throwError } from 'rxjs';
import { CreateUserRequestModel } from './models/create-user-request.model';
import { UpdateUserRequestModel } from './models/update-user-request.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

  getUsers() {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('in service: Users API error:', error);

        return throwError(() => error);
      }),
    );
  }

  createUser(userData: CreateUserRequestModel) {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(userId: number, userData: UpdateUserRequestModel) {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }

  deleteUser(userId: number) {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
