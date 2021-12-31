import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from "rxjs";
import { User } from "../model/user";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";

interface SignInResponse {
  user: User,
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private _userSubject = new BehaviorSubject<User | null>(null);
  public user = this._userSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  public currentUserValue(): User | null {
    return this._userSubject.value;
  }

  public signIn(email: string, password: string): Observable<User> {
    return this.http.post<SignInResponse>('https://localhost:5001/api/authentication/signin', { email, password })
      .pipe(
        catchError(err => {
          console.error(err)
          return EMPTY;
        }),
        tap(x => {
          this._userSubject.next(x.user)
          localStorage.setItem('access_token', x.token)
        })
      );
  }

}
