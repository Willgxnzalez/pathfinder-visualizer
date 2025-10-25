export default class MinHeap<T> {
    private heap: { item: T, priority: number, tiebreaker: number }[];
    private positions: Map<T, number>;
    private compareFn: (a: number, b: number) => number;
    
    constructor(compareFn?: (a: number, b: number) => number) {
        this.heap = [];
        this.positions = new Map();
        this.compareFn = compareFn ?? ((a: number , b: number) => a-b);
    }

    private compare(a: { priority: number, tiebreaker: number }, b: { priority: number, tiebreaker: number }): number {
        const priorityDiff = this.compareFn(a.priority, b.priority);
        return priorityDiff !== 0 ? priorityDiff : a.tiebreaker - b.tiebreaker;
    }
    
    peek(): T | undefined {
        return this.heap.length === 0 ? undefined : this.heap[0].item;
    }
    
    getParentIndex(i: number): number {
        return Math.floor((i-1)/2);
    }
    
    getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }
    
    getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }
    
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    has(item: T): boolean {
        return this.positions.has(item);
    }
    
    extractMin(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const root = this.heap[0].item;
        const last = this.heap.pop()!;
        this.positions.delete(root);

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.positions.set(last.item, 0);
            this.heapifyDown(0);
        }

        return root;
    }

    insert(item: T, priority: number, tiebreaker: number = 0): void {
        this.heap.push({ item, priority, tiebreaker });
        const index = this.heap.length - 1;
        this.positions.set(item, index);
        this.heapifyUp(index);
    }
    
    decreaseKey(item: T, newPriority: number, newTiebreaker: number = 0) {
        const index = this.positions.get(item);
        if (index === undefined) return;

        if(this.compareFn(this.heap[index].priority, newPriority) < 0) return;
        
        this.heap[index].priority = newPriority;
        this.heap[index].tiebreaker = newTiebreaker;
        this.heapifyUp(index);
    }

    heapifyUp(index: number): void {
        let i: number = index;
        while (i > 0) {
            const parent = this.getParentIndex(i);
            if (this.compare(this.heap[i], this.heap[parent]) < 0) {
                this.swap(i, parent);
                i = parent;
            } else break;
        }
    }

    heapifyDown(index: number): void {
        let i: number = index;
        const n: number = this.heap.length;

        while(true) {
            const left = this.getLeftChildIndex(i);
            const right = this.getRightChildIndex(i);
            let smallest = i;
            
            if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) 
                smallest = left;
            if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) 
                smallest = right;

            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else break;
        }
    }

    swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
        this.positions.set(this.heap[i].item, i);
        this.positions.set(this.heap[j].item, j);
    }
}