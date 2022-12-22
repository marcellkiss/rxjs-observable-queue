import { filter, first, map, Observable, ReplaySubject } from 'rxjs';

export class ObservableQueue<ResponseType = unknown, ErrorType = unknown> {
  private queue: QueueItem<ResponseType>[] = [];
  public itemResponse$ = new ReplaySubject<ItemResponse<ResponseType>>();
  public itemError$ = new ReplaySubject<ItemError<ErrorType>>();

  private nextItemResponseById$(id: string): Observable<ResponseType> {
    return this.itemResponse$.pipe(
      filter((itemResponse) => {
        return itemResponse.id === id;
      }),
      map((itemResponse) => itemResponse.response),
      first()
    );
  }

  private nextErrorResponseById$(id: string): Observable<ErrorType> {
    return this.itemError$.pipe(
      filter((itemError) => itemError.id === id),
      map((itemError) => itemError.error),
      first()
    );
  }

  private getObservableById$(id: string): Observable<ResponseType> {
    return new Observable((subscriber) => {
      this.nextItemResponseById$(id).subscribe((res) => {
        subscriber.next(res);
      });
      this.nextErrorResponseById$(id).subscribe((error) =>
        subscriber.error(error)
      );
    });
  }

  public addItem(
    observable: Observable<ResponseType>
  ): Observable<ResponseType> {
    const id = `${Math.random()}`;
    const result$ = this.getObservableById$(id);

    this.queue.push({ observable, id });
    if (this.queue.length === 1) {
      this.processNextItem();
    }

    return result$;
  }

  private processNextItem() {
    this.queue.at(0)?.observable.subscribe({
      next: (response) => {
        this.itemResponse$.next({ id: this.queue[0].id, response });
        this.queue.shift();
        this.processNextItem();
      },
      error: (error) => {
        this.itemError$.next({ id: this.queue[0].id, error });
        this.queue = [];
      },
    });
  }
}

export interface QueueItem<R> {
  id: string;
  observable: Observable<R>;
}

export interface ItemError<E> {
  id: string;
  error: E;
}

export interface ItemResponse<R> {
  id: string;
  response: R;
}
