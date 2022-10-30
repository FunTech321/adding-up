'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs });
const prefectureDataMap = new Map(); // key:都道府県 value:集計データのオブジェクト
rl.on('line', lineString => {
    //一行読み込んだら、ファイル内の[,]を境に0123で分割した配列を作る
    const columns = lineString.split(',');
    //配列の0番目で、文字列を整数に変換して、変数に代入する
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = null;
        //すでにMapのオブジェクトが存在すれば、そこから呼ぶ
        if (prefectureDataMap.has(prefecture)) {
            value = prefectureDataMap.get(prefecture);
        } else {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
//closeイベントは、すべての行を処理し終わった後に呼び出される
rl.on('close', () => {
    //closeイベントの無名関数で、変化率を求める
    for (const [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    //データを変化率ごとに並び変える
    //Arrayで連想配列を普通の配列に変える＋Arrayのsort関数に、比較関数として無名関数（アロー関数）を渡す
    //連想配列のkeyとvalueの対を配列として、その配列を要素(0,1,2,3,...)にした配列に変換される
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        //pair1と2には、それぞれ0に都道府県で、1に集計データオブジェクトが入っている
        return pair2[1].change - pair1[1].change;
    });
    //出力形式を整える
    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}`;
    });
    console.log(rankingStrings);
});