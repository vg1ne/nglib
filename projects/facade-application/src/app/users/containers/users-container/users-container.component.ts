import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {UsersClientService} from '../../services';
import {User} from '../../models';
import {BehaviorSubject, combineLatest, Observable, throwError} from 'rxjs';
import {catchError, debounceTime, filter, map, share, switchMap, tap} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';

const controlSettings = {
  minLetters: 3,
  debounceTime: 1000
}

export function asObservable(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const newPropertyKey = `${propertyKey}`.substring(1)
    Object.defineProperty(target, newPropertyKey, {
      get() {
        return this[`${propertyKey}`].asObservable();
      }
    });
  };
}

export interface UsersContainerComponent {loading$: Observable<boolean>}
@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersContainerComponent implements OnInit {
  searchFormGroup: FormGroup;
  users$: Observable<User[]>;
  term$: Observable<string>;
  @asObservable()
    // tslint:disable-next-line:variable-name
  _loading$ = new BehaviorSubject(false)
  noResults$: Observable<boolean>
  constructor(private usersClient: UsersClientService, private formBuilder: FormBuilder) {
    this.initFormGroup();
  }

  ngOnInit() {
    this.term$ = this.searchControl.valueChanges.pipe(
      filter(val => !(val.length < controlSettings.minLetters)),
      debounceTime(controlSettings.debounceTime),
      map(val => val)
    );
    this.users$ = this.term$.pipe(
      tap(val => this._loading$.next(true)),
      switchMap(term => this.usersClient.fetchUsersByTerm(term)),
      catchError(e => {
        this._loading$.next(false)
        return throwError(e)
      }),
      map(result => {
        this._loading$.next(false)
        return result
      }),
      share(),
    );
    this.noResults$ = combineLatest(
      this.term$,
      this.users$,
      this.loading$
    ).pipe(
      map(([term, users, loading]) => {
        return term && !users.length && !loading
      })
    )
  }

  get searchControl() {
    return this.searchFormGroup.get('searchControl');
  }

  private initFormGroup() {
    this.searchFormGroup = this.formBuilder.group({
      searchControl: []
    });
  }
}
