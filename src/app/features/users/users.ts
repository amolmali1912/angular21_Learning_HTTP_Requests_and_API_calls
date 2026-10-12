import { Component, inject, signal } from '@angular/core';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserRequestModel } from './models/create-user-request.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent {
  private usersService = inject(UsersService);
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  //
  newUserFullName = signal('');
  newUserUsername = signal('');
  newUserEmail = signal('');
  editingUserId = signal<number | null>(null);

  creatingUser = signal(false);
  createSuccess = signal<string | null>(null);
  createError = signal<string | null>(null);

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.usersService
      .getUsers()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (users) => {
          this.users.set(users);
        },
        error: (error) => {
          // Error already handled by catchError
          console.error('in Component: Error reached subscribe');
        },
      });
  }

  createUser() {
    const userData: CreateUserRequestModel = {
      name: this.newUserFullName(),
      username: this.newUserUsername(),
      email: this.newUserEmail(),
    };

    this.creatingUser.set(true);
    this.createSuccess.set(null);
    this.createError.set(null);

    const editingId = this.editingUserId();

    const request$ =
      editingId !== null
        ? this.usersService.updateUser(editingId, userData)
        : this.usersService.createUser(userData);

    request$.pipe(finalize(() => this.creatingUser.set(false))).subscribe({
      next: (user) => {
        this.createSuccess.set(
          editingId !== null
            ? `User updated successfully. ID: ${user.id}`
            : `User created successfully. ID: ${user.id}`,
        );

        if (editingId !== null) {
          this.users.update((currentUsers) =>
            currentUsers.map((currentUser) => (currentUser.id === editingId ? user : currentUser)),
          );

          this.editingUserId.set(null);
        }

        this.newUserFullName.set('');
        this.newUserUsername.set('');
        this.newUserEmail.set('');
      },
      error: () => {
        this.createError.set(
          editingId !== null ? 'Unable to update user.' : 'Unable to create user.',
        );
      },
    });
  }

  deleteUser(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);

    if (!confirmed) {
      return;
    }

    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((currentUsers) =>
          currentUsers.filter((currentUser) => currentUser.id !== user.id),
        );

        // If the deleted user was being edited, clear the form.
        if (this.editingUserId() === user.id) {
          this.editingUserId.set(null);
          this.newUserFullName.set('');
          this.newUserUsername.set('');
          this.newUserEmail.set('');
        }
      },
      error: (error: unknown) => {
        console.error('Unable to delete user:', error);
      },
    });
  }

  startEdit(user: User) {
    console.log('Editing user:', user);

    this.editingUserId.set(user.id);

    this.newUserFullName.set(user.name);
    this.newUserUsername.set(user.username);
    this.newUserEmail.set(user.email);

    this.createSuccess.set(null);
    this.createError.set(null);
  }
}
