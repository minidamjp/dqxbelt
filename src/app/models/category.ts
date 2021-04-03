/**
 * ベルトの各スロットに入る効果のデータ
 */
export interface Category {
    // 効果の大項目の識別子。
    // 4桁で、上の桁から
    // 1 桁目...戦神(0) , 輝石(1)
    // 2 桁目...大分類 (武器系など)
    // 3, 4 桁目...大分類内での連番。
    categoryId: string;
    // 属性の表示。全部の効果に属性があるわけではないので、その場合は null になる。
    subCategoryOptions?: string[];
    // 効果の強さを表す表示。小さいものから大きいものの順に格納。
    attributeOptions: string[];
    // ボタンで使うテキスト
    label: string;
    // ボタンで使うテキスト。大分類はされている前提で、一部を省略したもの。
    // 設定がない場合は、 labal を使うこと。
    shortLabel?: string;
    // 効果の説明テキストのテンプレート。
    // 以下のテキストは置き換えられます。
    // %label%
    // %subCategory%
    // %attribute%
    // 設定がない場合は標準のテンプレートが使われます。
    descTemplate: string;
}
