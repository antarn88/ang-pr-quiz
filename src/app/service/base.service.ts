import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T extends { id: number }> {

  serverAddress = 'http://localhost:3000';
  entityName = '';
  list$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  constructor(
    public http: HttpClient,
    @Inject('entityName') entityName: string
  ) {
    this.entityName = entityName;
  }

  async getAll(): Promise<void> {
    this.list$.next([]);
    const list = await this.http.get<T[]>(`${this.serverAddress}/${this.entityName}`).toPromise();
    this.list$.next(list);
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
    return this.http.delete<T>(`${this.serverAddress}/${this.entityName}/${id}`);
  }
}
