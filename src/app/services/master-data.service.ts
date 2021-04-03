import { Injectable } from '@angular/core';

import { Categories } from '../data/categories';
import { AnluceaGroups, MaumetGroups } from '../data/groups';
import { Category } from '../models/category';
import { Group } from '../models/group';

/**
 * ベルトのマスターデータを提供するサービス
 *
 * 将来データベースに引っ越したら移行できるように
 * サービスに分割しておく。
 *
 * データそのものを直接書くと大変なことになるので、
 * データ自体は data/ 以下に書いて import する。
 */
@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  constructor() { }

  getMaumetGroups(): Group[] {
    return MaumetGroups;
  }

  getAnluceaGroups(): Group[] {
    return AnluceaGroups;
  }

  /**
   * Optional なフィールドを埋めたデータを作成する。
   *
   * @param category just a category
   * @return itself, but fixed.
   */
  fixCategory(category: Category): Category {
    if (category.shortLabel == null) {
      category.shortLabel = category.label;
    }
    return category;
  }

  getCategoriesOfGroup(group: Group): Category[] {
    const categories: Category[] = [];
    const categoryIdPrefix = group.beltType.toString() + group.groupId.toString();
    for (const category of Categories) {
      if (category.categoryId.startsWith(categoryIdPrefix)) {
        categories.push(this.fixCategory(category));
      }
    }
    return categories;
  }

  getCategory(categoryId: string): Category {
    for (const category of Categories) {
      if (category.categoryId === categoryId) {
        return category;
      }
    }
    return this.fixCategory({
      categoryId,
      attributeOptions: [],
      label: 'error',
      descTemplate: 'template error',
    });
  }
}
