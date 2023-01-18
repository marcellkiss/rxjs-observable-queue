import { filter, first, map, Observable, ReplaySubject } from "rxjs";

export class ObservableQueue<ResponseType = unknown, ErrorType = unknown> {
  private queue: QueueItem<ResponseType>[] = [];
  public itemResponse$ = new ReplaySubject<ItemResponse<ResponseType>>();
  public itemError$ = new ReplaySubject<ItemError<ErrorType>>();

  private nextItemResponseById$(id: string): Observable<ResponseType> {
    return this.itemResponse$.pipe(
      filter((itemResponse: ItemResponse<ResponseType>) => {
        return itemResponse.id === id;
      }),
      map((itemResponse: ItemResponse<ResponseType>) => itemResponse.response),
      first()
    );
  }

  private nextErrorResponseById$(id: string): Observable<ErrorType> {
    return this.itemError$.pipe(
      filter((itemError: ItemError<ErrorType>) => itemError.id === id),
      map((itemError: ItemError<ErrorType>) => itemError.error),
      first()
    );
  }

  private getObservableById$(id: string): Observable<ResponseType> {
    return new Observable((subscriber) => {
      this.nextItemResponseById$(id).subscribe((res: ResponseType) => {
        subscriber.next(res);
      });
      this.nextErrorResponseById$(id).subscribe((error: ErrorType) =>
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
      next: (response: ResponseType) => {
        this.itemResponse$.next({ id: this.queue[0].id, response });
      },
      error: (error: ErrorType) => {
        this.itemError$.next({ id: this.queue[0].id, error });
        this.queue = [];
      },
      complete: () => {
        this.queue.shift();
        this.processNextItem();
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
