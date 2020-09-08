// 色を表示・選択するコンポーネント。
// RGBまたはHSLの3色をまとめて表示する。

import React, { Dispatch } from 'react';
import ColorElementSelector, { ColorElementProp } from './ColorElementSelector'
import { ColorKind, ColorElement, ColorType, Action } from '../lib/eftypes';


export type ColorSelectorProps = {
  t: ColorType;
  kind: ColorKind;
  values: string[];   // 表示する各色の値。
  dispatch: Dispatch<Action>;
};


const ColorSelector: React.FC<ColorSelectorProps> = ({ t, kind, values, dispatch }) => {
  let elements: ColorElementProp[] = [];
  let colors: ColorElement[];
  let maxes: number[]

  if (t === 'RGB') {
    colors = ['Red', 'Green', 'Blue'];
    maxes = [255, 255, 255];
  } else {
    // HSL
    colors = ['Hue', 'Saturation', 'Lightness'];
    maxes = [360, 100, 100];
  }

  for (const i in colors) {
    elements.push({
      kind: kind,
      element: colors[i],
      max: maxes[i],
      value: values[i],
      dispatch: dispatch,
    });
  }

  return (
    <div className="color-box">
      {
        elements.map((v) => (
          <ColorElementSelector key={v.element} {...v} />
        ))
      }
    </div>
  );
}

export default ColorSelector;
