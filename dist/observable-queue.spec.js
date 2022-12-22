"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const observable_queue_1 = require("./observable-queue");
describe('ObservableQueue', () => {
    let queue;
    beforeEach(() => {
        queue = new observable_queue_1.ObservableQueue();
    });
    describe('constructor', () => {
        it('should create instance', () => {
            expect(queue).toBeDefined();
        });
        it('Queue items should be executed and can be listened to', () => {
            const addItemSpy = jest.fn();
            const taskSpy = jest.fn();
            queue.addItem((0, rxjs_1.of)(1).pipe((0, rxjs_1.tap)(taskSpy)));
            queue.addItem((0, rxjs_1.of)(2).pipe((0, rxjs_1.tap)(taskSpy)));
            queue.addItem((0, rxjs_1.of)(3).pipe((0, rxjs_1.tap)(taskSpy))).subscribe(addItemSpy);
            expect(taskSpy).toHaveBeenCalledTimes(3);
            expect(addItemSpy).toHaveBeenCalledTimes(1);
            expect(addItemSpy).toHaveBeenLastCalledWith(3);
        });
        it('If queue item fails, we should get an error', () => {
            const errorSpy = jest.fn();
            queue
                .addItem((0, rxjs_1.throwError)(() => 'ERROR'))
                .subscribe({ next: errorSpy, error: errorSpy });
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenLastCalledWith('ERROR');
        });
    });
});
