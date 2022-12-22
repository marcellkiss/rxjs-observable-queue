# rxjs-observable-queue

Add rxjs observables to the queue and let them be executed sequentially.

## Usage

```typescript
import { ObservableQueue } from "./observable-queue";
import { of, delay } from "rxjs";

const queue = new ObservableQueue();

// Some asynchronous tasks, eg. sending requests to server
const mockRequest1 = of(1).pipe(delay(500));
const mockRequest2 = of(2).pipe(delay(500));
const mockRequest3 = of(3).pipe(delay(500));

// All the added items will be executed sequentially
queue.addItem(mockRequest1).subscribe(console.log); // prints '1', after 500ms
queue.addItem(mockRequest2).subscribe(console.log); // prints '2', after 1000ms
queue.addItem(mockRequest3).subscribe(console.log); // prints '3', after 1500ms
```

## Notes

In case of errors, the execution will be interrupted and the queue will be emptied.
The observable - returned by addItem - will throw the same exception.

If you need any changes in the API, let me know by opening an issue.
