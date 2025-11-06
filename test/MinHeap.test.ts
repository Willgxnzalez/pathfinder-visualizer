import { describe, it, expect, beforeEach } from "vitest";
import MinHeap from "../src/utils/MinHeap";

describe("MinHeap", () => {
    let heap: MinHeap<number>;

    beforeEach(() => {
        heap = new MinHeap<number>();
    });

    it("should insert elements and maintain min-heap order", () => {
        heap.insert(5, 5);
        heap.insert(3, 3);
        heap.insert(8, 8);
        heap.insert(1, 1);

        expect(heap.peek()).toBe(1);
    });

    it("should extract min elements in sorted order", () => {
        heap.insert(10, 10);
        heap.insert(4, 4);
        heap.insert(7, 7);
        heap.insert(2, 2);

        expect(heap.extractMin()).toBe(2);
        expect(heap.extractMin()).toBe(4);
        expect(heap.extractMin()).toBe(7);
        expect(heap.extractMin()).toBe(10);
        expect(heap.isEmpty()).toBe(true);
    });

    it("should return undefined when extracting from empty heap", () => {
        expect(heap.extractMin()).toBe(undefined);
    });

    it("should ignore duplicate insertions", () => {
        heap.insert(2, 2);
        heap.insert(2, 2);  // Should be ignored
        heap.insert(3, 3);
        heap.insert(1, 1);

        expect(heap.extractMin()).toBe(1);
        expect(heap.extractMin()).toBe(2);
        expect(heap.extractMin()).toBe(3);
        expect(heap.extractMin()).toBe(undefined);
    });

    it("should support peek/top operation", () => {
        heap.insert(9, 9);
        heap.insert(6, 6);
        expect(heap.peek()).toBe(6);
        heap.extractMin();
        expect(heap.peek()).toBe(9);
    });

    it("should be empty after removing all elements", () => {
        [3, 1, 4, 5].forEach(n => heap.insert(n, n));
        while (!heap.isEmpty()) {
            heap.extractMin();
        }
        expect(heap.isEmpty()).toBe(true);
        expect(heap.peek()).toBe(undefined);
    });

    it("should work correctly after interleaved insertions and removals", () => {
        heap.insert(7, 7);
        heap.insert(2, 2);
        expect(heap.extractMin()).toBe(2);
        heap.insert(5, 5);
        expect(heap.extractMin()).toBe(5);
        heap.insert(1, 1);
        heap.insert(9, 9);
        expect(heap.extractMin()).toBe(1);
        expect(heap.extractMin()).toBe(7);
        expect(heap.extractMin()).toBe(9);
        expect(heap.extractMin()).toBe(undefined);
    });

    it("should support decreaseKey", () => {
        heap.insert(5, 5);
        heap.insert(8, 8);
        heap.insert(2, 2);
        heap.decreaseKey(8, 1); // Now 8 should be first
        expect(heap.extractMin()).toBe(8);
        expect(heap.extractMin()).toBe(2);
        expect(heap.extractMin()).toBe(5);
    });
});
