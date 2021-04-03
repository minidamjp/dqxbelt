/**
 * ベルトの各スロットの効果
 */
export interface Slot {
    // Category の categoryId
    category?: string;
    // Category の subCategoryOptions のインデックス
    subCategory?: number;
    // Categiry の attributeOptions のインデックス
    attribute?: number;
}
