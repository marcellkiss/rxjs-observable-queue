import { filter, first, map, Observable, ReplaySubject } from "rxjs";
export class ObservableQueue {
    queue = [];
    itemResponse$ = new ReplaySubject();
    itemError$ = new ReplaySubject();
    nextItemResponseById$(id) {
        return this.itemResponse$.pipe(filter((itemResponse) => {
            return itemResponse.id === id;
        }), map((itemResponse) => itemResponse.response), first());
    }
    nextErrorResponseById$(id) {
        return this.itemError$.pipe(filter((itemError) => itemError.id === id), map((itemError) => itemError.error), first());
    }
    getObservableById$(id) {
        return new Observable((subscriber) => {
            this.nextItemResponseById$(id).subscribe((res) => {
                subscriber.next(res);
            });
            this.nextErrorResponseById$(id).subscribe((error) => subscriber.error(error));
        });
    }
    addItem(observable) {
        const id = `${Math.random()}`;
        const result$ = this.getObservableById$(id);
        this.queue.push({ observable, id });
        if (this.queue.length === 1) {
            this.processNextItem();
        }
        return result$;
    }
    processNextItem() {
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
