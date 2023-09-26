"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableQueue = void 0;
const rxjs_1 = require("rxjs");
class ObservableQueue {
    queue = [];
    itemResponse$ = new rxjs_1.ReplaySubject();
    itemError$ = new rxjs_1.ReplaySubject();
    nextItemResponseById$(id) {
        return this.itemResponse$.pipe((0, rxjs_1.filter)((itemResponse) => {
            return itemResponse.id === id;
        }), (0, rxjs_1.map)((itemResponse) => itemResponse.response));
    }
    nextErrorResponseById$(id) {
        return this.itemError$.pipe((0, rxjs_1.filter)((itemError) => itemError.id === id), (0, rxjs_1.map)((itemError) => itemError.error));
    }
    getObservableById$(id) {
        return new rxjs_1.Observable((subscriber) => {
            this.nextItemResponseById$(id)
                .pipe((0, rxjs_1.first)())
                .subscribe((res) => {
                subscriber.next(res);
                subscriber.complete();
            });
            this.nextErrorResponseById$(id)
                .pipe((0, rxjs_1.first)())
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
exports.ObservableQueue = ObservableQueue;
