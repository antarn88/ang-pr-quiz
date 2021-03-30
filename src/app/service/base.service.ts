import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T extends { id: number }> {

  serverAddress: string = 'http://localhost:3000';
  entityName: string = '';
  list$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  constructor(
    public http: HttpClient,
    @Inject('entityName') entityName: string
  ) {
    this.entityName = entityName;
  }

  getAll(): void {
    this.list$.next([]);
    this.http.get<T[]>(`${this.serverAddress}/${this.entityName}`).subscribe(
      list => this.list$.next(list),
      error => console.error(error)
    );
  }

  get(id: number): Observable<T> {
    return this.http.get<T>(`${this.serverAddress}/${this.entityName}/${id}`);
  }

  update(entity: T): Observable<T> {
    return this.http.patch<T>(`${this.serverAddress}/${this.entityName}/${entity.id}`, entity);
  }

  create(entity: T): Observable<T> {
    return this.http.post<T>(`${this.serverAddress}/${this.entityName}`, entity);
  }

  remove(id: number): Observable<T> {
    return this.http.delete<T>(`${this.serverAddress}/${id}`);
  }
}
