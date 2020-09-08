import { State, Action } from '../lib/eftypes';
import EFColor from '../lib/efcolor';


export const reducer = (state: State, action: Action) => {
  let obj;
  let updateHslFlag = false;
  let updateRgbFlag = false;

  // 編集対象のオブジェクトをColorKindから判別して取得する。
  if (action.kind === 'Foreground') {
    obj = state.foreground;
  } else {
    obj = state.background;
  }

  switch (action.element) {
    case 'Red':
      obj.red = action.value;
      updateHslFlag = true;
      break;
    case 'Green':
      obj.green = action.value;
      updateHslFlag = true;
      break;
    case 'Blue':
      obj.blue = action.value;
      updateHslFlag = true;
      break;
    case 'Hue':
      obj.hue = action.value;
      updateRgbFlag = true;
      break;
    case 'Saturation':
      obj.saturation = action.value;
      updateRgbFlag = true;
      break;
    case 'Lightness':
      obj.lightness = action.value;
      updateRgbFlag = true;
      break;
  }

  if (updateHslFlag) {
    const color = new EFColor(Number(obj.red), Number(obj.green), Number(obj.blue));
    const [h, s, l] = color.hsl;
    const hsl = { hue: String(h), saturation: String(s), lightness: String(l) };
    obj = { ...obj, ...hsl };
  } else if (updateRgbFlag) {
    const color = EFColor.createFromHSL(Number(obj.hue), Number(obj.saturation), Number(obj.lightness));
    const [r, g, b] = color.rgb;
    const rgb = { red: String(r), green: String(g), blue: String(b) };
    obj = { ...obj, ...rgb };
  }

  // ColorKindに合わせてデータを更新。
  if (action.kind === 'Foreground') {
    return {
      foreground: obj,
      background: { ...state.background },
    };
  } else {
    return {
      foreground: { ...state.foreground },
      background: obj,
    };
  }
};
