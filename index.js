"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableQueue = void 0;
const rxjs_1 = require("rxjs");
class ObservableQueue {
    constructor() {
        this.queue = [];
        this.itemResponse$ = new rxjs_1.ReplaySubject();
        this.itemError$ = new rxjs_1.ReplaySubject();
    }
    nextItemResponseById$(id) {
        return this.itemResponse$.pipe((0, rxjs_1.filter)((itemResponse) => {
            return itemResponse.id === id;
        }), (0, rxjs_1.map)((itemResponse) => itemResponse.response), (0, rxjs_1.first)());
    }
    nextErrorResponseById$(id) {
        return this.itemError$.pipe((0, rxjs_1.filter)((itemError) => itemError.id === id), (0, rxjs_1.map)((itemError) => itemError.error), (0, rxjs_1.first)());
    }
    getObservableById$(id) {
        return new rxjs_1.Observable((subscriber) => {
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
        var _a;
        (_a = this.queue.at(0)) === null || _a === void 0 ? void 0 : _a.observable.subscribe({
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
exports.ObservableQueue = ObservableQueue;
