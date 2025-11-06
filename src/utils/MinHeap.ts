interface HeapItem<T> {
    item: T;
    priority: number;
    tiebreaker: number;
}

export default class MinHeap<T> {
    private heap: HeapItem<T>[] = [];
    private itemMap: Map<T, number> = new Map();
    private tieCounter = 0;

    peek(): T | undefined {
        return this.heap.length === 0 ? undefined : this.heap[0].item;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    has(item: T): boolean {
        return this.itemMap.has(item);
    }

    insert(item: T, priority: number): void {
        if (this.has(item)) return;

        const heapItem: HeapItem<T> = {
            item,
            priority,
            tiebreaker: this.tieCounter++
        };

        // New items are added to end of heap
        this.heap.push(heapItem);
        const index = this.heap.length - 1;
        this.itemMap.set(item, index);
        this.heapifyUp(index);
    }

    extractMin(): T | undefined {
        if (this.heap.length === 0) return undefined;

        const root = this.heap[0].item;
        this.itemMap.delete(root);

        const last = this.heap.pop()!;

        if (this.heap.length > 0) { // If root wasn't only item in heap
            this.heap[0] = last;
            this.itemMap.set(last.item, 0);
            this.heapifyDown(0);
        }

        return root;
    }

    decreaseKey(item: T, newPriority: number): void {
        const index = this.itemMap.get(item);
        if (index === undefined) return;

        if (newPriority >= this.heap[index].priority) return; // Only update if the new priority is actually higher (lower value)

        this.heap[index].priority = newPriority;
        this.heap[index].tiebreaker = this.tieCounter++;
        this.heapifyUp(index);
    }

    private heapifyUp(index: number): void {
        while (index > 0) {
            const parent = this.getParentIndex(index);
            if (this.compare(this.heap[index], this.heap[parent]) < 0) { // If child has more priority
                this.swap(index, parent);
                index = parent;
            } else break;
        }
    }

    private heapifyDown(index: number): void {
        const n: number = this.heap.length;

        while (true) {
            const left = this.getLeftChildIndex(index);
            const right = this.getRightChildIndex(index);
            let smallest = index;

            if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0)
                smallest = left;
            if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0)
                smallest = right;

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else break;
        }
    }

    private compare(a: HeapItem<T>, b: HeapItem<T>): number {
        if (a.priority !== b.priority)
            return a.priority - b.priority;
        return a.tiebreaker - b.tiebreaker;
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
        this.itemMap.set(this.heap[i].item, i);
        this.itemMap.set(this.heap[j].item, j);
    }

    private getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }
}