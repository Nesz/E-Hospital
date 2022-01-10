import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from "rxjs";
import { User } from "../model/user";
import { HttpClient } from "@angular/common/http";
import { catchError, map, tap } from "rxjs/operators";

interface SignInResponse {
  user: User,
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private _userSubject = new BehaviorSubject<User | undefined>(undefined);
  public user = this._userSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  public currentUserValue(): User | undefined {
    return this._userSubject.value;
  }

  public signIn(email: string, password: string): Observable<User> {
    return this.http.post<SignInResponse>('https://localhost:5001/api/authentication/signin', { email, password })
      .pipe(
        catchError(err => {
          console.error(err)
          return EMPTY;
        }),
        map(x => {
          this._userSubject.next(x.user)
          localStorage.setItem('access_token', x.token)
          return x.user;
        })
      );
  }

  public me(): Observable<User> {
    return this.http.get<User>('https://localhost:5001/api/user/me')
      .pipe(
        catchError(err => {
          console.error(err)
          //this.logout();
          return EMPTY;
        }),
        tap(x => {
          this._userSubject.next(x)
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

}
