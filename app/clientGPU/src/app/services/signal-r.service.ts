import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions } from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { distinctUntilKeyChanged, map } from "rxjs/operators";

export interface Progress {
  id: string,
  currentProgress: number,
  totalProgress: number
}

const options: IHttpConnectionOptions = {
  accessTokenFactory: () => {
    return localStorage.getItem("access_token")!;
  }
};

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  public progress: BehaviorSubject<{ [key: string] : Progress }>
    = new BehaviorSubject<{[p: string]: Progress}>({});
  public connectionId?: string;
  private hubConnection?: HubConnection;

  constructor() { }



  public startConnection = () => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/progresshub', options)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .then(() => {
        this.getConnectionId();
        this.addListener();
      })
      .catch(err => console.log('Error while starting connection: ' + err))


  }

  public listen(id: string) {
    // @ts-ignore
    return this.progress.pipe(distinctUntilKeyChanged(id))
      .pipe(map(all => all[id]))
    //return of(this.progress[id]);
  }

  public getConnectionId = () => {
    this.hubConnection?.invoke('getconnectionid').then(
      (data) => {
        this.connectionId = data;
      }
    );
  }

  public addListener = () => {
    this.hubConnection?.on('broadcastprogress', (data) => {
      const progress = data as Progress;
      const src = {...this.progress.value};
      src[progress.id] = progress;
      this.progress.next(src);
    })
  }


}
