import { of, tap, throwError } from 'rxjs';
import { ObservableQueue } from './observable-queue';
describe('ObservableQueue', () => {
    let queue;
    beforeEach(() => {
        queue = new ObservableQueue();
    });
    describe('constructor', () => {
        it('should create instance', () => {
            expect(queue).toBeDefined();
        });
        it('Queue items should be executed and can be listened to', () => {
            const addItemSpy = jest.fn();
            const taskSpy = jest.fn();
            queue.addItem(of(1).pipe(tap(taskSpy)));
            queue.addItem(of(2).pipe(tap(taskSpy)));
            queue.addItem(of(3).pipe(tap(taskSpy))).subscribe(addItemSpy);
            expect(taskSpy).toHaveBeenCalledTimes(3);
            expect(addItemSpy).toHaveBeenCalledTimes(1);
            expect(addItemSpy).toHaveBeenLastCalledWith(3);
        });
        it('If queue item fails, we should get an error', () => {
            const errorSpy = jest.fn();
            queue
                .addItem(throwError(() => 'ERROR'))
                .subscribe({ next: errorSpy, error: errorSpy });
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenLastCalledWith('ERROR');
        });
    });
});
