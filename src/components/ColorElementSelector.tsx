// 色を構成する1要素を表示・選択するコンポーネント。
// スライダー・テキストボックス・値表示で構成される。

import React, { Dispatch, memo } from 'react';
import { ColorKind, ColorElement, Action } from '../lib/eftypes';


export type ColorElementProp = {
  kind: ColorKind;
  element: ColorElement;
  label?: string;  // 省略されたときは、elementの1文字目となる。
  max: number;     // 値の最大値。ちなみに最小値は0固定。
  value: string;
  dispatch: Dispatch<Action>;
};


const ColorElementSelector: React.FC<ColorElementProp> = memo(({ kind, element, label, max, value, dispatch }) => {
  // labelが省略されているとき、elementの1文字目を取得してlabelとする。
  if (label == null) {
    label = element.charAt(0);
  }

  return (
    <div className="color-element-selector" >
      <label>
        {label}:
        <input
          type="range" min={0} max={max}
          onChange={(e) => dispatch({
            kind: kind,
            element: element,
            value: e.currentTarget.value,
          })}
          value={value} />
        <input
          type="text" size={3} maxLength={3}
          onChange={(e) => dispatch({
            kind: kind,
            element: element,
            value: e.currentTarget.value,
          })}
          value={value} />
        ({Math.round(Number(value) / max * 100)}%)
      </label>
    </div>
  )
});

export default ColorElementSelector;
