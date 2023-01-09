import { Observable, ReplaySubject } from "rxjs";
export declare class ObservableQueue<ResponseType = unknown, ErrorType = unknown> {
    private queue;
    itemResponse$: ReplaySubject<ItemResponse<ResponseType>>;
    itemError$: ReplaySubject<ItemError<ErrorType>>;
    private nextItemResponseById$;
    private nextErrorResponseById$;
    private getObservableById$;
    addItem(observable: Observable<ResponseType>): Observable<ResponseType>;
    private processNextItem;
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
