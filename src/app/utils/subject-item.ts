import { Observable, Subject } from 'rxjs';

export class SubjectItem<T> {
  readonly subject: Subject<T>;
  readonly value$: Observable<T>;

  constructor() {
    this.subject = new Subject<T>();
    this.value$ = this.subject.asObservable();
  }

  public next(value: T): void {
    this.subject.next(value);
  }
}
