import { INode } from "../types";

export default class MinHeap<T> {
    private heap: { item: T, priority: number }[];
    private positions: Map<T, number>;
    private compareFn: (a: number, b: number) => number;

    constructor(compareFn?: (a: number, b: number) => number) {
        this.heap = [];
        this.positions = new Map();
        this.compareFn = compareFn ?? ((a: number , b: number) => a-b);

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
    
    extractMin(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const root = this.heap[0].item; // Root at index 0
        const last = this.heap.pop()!;
        this.positions.delete(root);

        if (this.heap.length > 0) { // If root != last
            this.heap[0] = last;
            this.positions.set(last.item, 0);
            this.heapifyDown(0);
        }

        return root;
    }

    insert(item: T, priority: number): void {
        this.heap.push({ item, priority });
        const index = this.heap.length - 1;
        this.positions.set(item, index);
        this.heapifyUp(index);
    }
    
    decreaseKey(item: T, newPriority: number) {
        const index = this.positions.get(item);
        if (index === undefined) return;

        if(this.compareFn(this.heap[index].priority, newPriority) < 0) return; // New priority was larger
        
        this.heap[index].priority = newPriority;
        this.heapifyUp(index);
    }

    heapifyUp(index: number): void { // Used when new value is smaller than parent
        let i: number = index;
        while (i > 0) {
            const parent = this.getParentIndex(i);
            if (this.compareFn(this.heap[i].priority, this.heap[parent].priority) < 0) {
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
            
            if (left < n && this.compareFn(this.heap[left].priority, this.heap[smallest].priority) < 0) 
                smallest = left;
            if (right < n && this.compareFn(this.heap[right].priority, this.heap[smallest].priority) < 0) 
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