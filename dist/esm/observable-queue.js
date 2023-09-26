import { filter, first, map, Observable, ReplaySubject } from "rxjs";
export class ObservableQueue {
    queue = [];
    itemResponse$ = new ReplaySubject();
    itemError$ = new ReplaySubject();
    nextItemResponseById$(id) {
        return this.itemResponse$.pipe(filter((itemResponse) => {
            return itemResponse.id === id;
        }), map((itemResponse) => itemResponse.response));
    }
    nextErrorResponseById$(id) {
        return this.itemError$.pipe(filter((itemError) => itemError.id === id), map((itemError) => itemError.error));
    }
    getObservableById$(id) {
        return new Observable((subscriber) => {
            this.nextItemResponseById$(id)
                .pipe(first())
                .subscribe((res) => {
                subscriber.next(res);
                subscriber.complete();
            });
            this.nextErrorResponseById$(id)
                .pipe(first())
                .subscribe((error) => {
                subscriber.error(error);
                subscriber.complete();
            });
        });
    }
    addItem(observable) {
        const id = `${Math.random()}`;
        this.queue.push({ observable, id });
        if (this.queue.length === 1) {
            this.processNextItem();
        }
        return this.getObservableById$(id);
    }
    processNextItem() {
        this.queue.at(0)?.observable.subscribe({
            next: (response) => {
                this.itemResponse$.next({ id: this.queue[0].id, response });
            },
            error: (error) => {
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
