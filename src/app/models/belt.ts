import { Slot } from './slot';

/**
 * ベルトのデータ
 */
export interface Belt {
    // ベルトを識別する ID。実装に合わせて time って言っているけれど別になんでもいい。
    keyTime: string;
    // 0: 邪神 1: 輝石
    beltType: number;
    // メモ書く欄　必須ではない
    note?: string;
    // スロット。要素は 5 固定。
    slots: Slot[];
}
