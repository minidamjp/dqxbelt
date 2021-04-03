import { Belt } from './belt';

export interface Savedata {
    // セーブデータのバージョン。後方互換性で使うかも。思いついた日の yyyymmdd でいいのでは。
    version?: number;
    // ベルトのデータ
    belts: Belt[];
}
