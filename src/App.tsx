import React, { useState, useReducer, CSSProperties, Dispatch } from 'react';
import './App.css';
import EFColor from './efcolor';

type ColorType = 'RGB' | 'HSL';
type ColorKind = 'Foreground' | 'Background';

type ColorElement = 'Red' | 'Green' | 'Blue' | 'Hue' | 'Saturation' | 'Lightness';

type ColorElementProp = {
  kind: ColorKind;
  element: ColorElement;
  label?: string; // 省略されたときは、elementの1文字目となる。
  max: number; // 値の最大値。ちなみに最小値は0固定。
  value: string;
  dispatch: Dispatch<Action>;
};

type ColorSelectorProps = {
  t: ColorType;
  kind: ColorKind;
  values: string[]; // 表示する各色の値。
  // onChange: (kind: ColorKind, element: ColorElement, value: string) => void;
  dispatch: Dispatch<Action>;
};

const FontFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
const FontWeights = ['normal', 'bold'];

// ------------------------------------------------------------------------
// 色の1要素の値のコンポーネント。スライダー・テキストボックス・値表示。
// ------------------------------------------------------------------------
const ColorElementSelector: React.FC<ColorElementProp> = ({ kind, element, label, max, value, dispatch }) => {
  // labelが省略されているとき、elementの1文字目を取得してlabelとする。
  if (label == null) {
    label = element.charAt(0);
  }

  return (
    <div className="color-element-selector">
      <label>
        {label}:
        <input type="range" min={0} max={max}
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
}


// ------------------------------------------------------------------------
// RGBまたはHSLを選択するコンポーネント。
// ------------------------------------------------------------------------
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

// ------------------------------------------------------------------------
// reducer
// ------------------------------------------------------------------------
// データとして、前景と背景は連動していないので、本来であれば別のreducerとして実装するべき？
// そのときは更新処理をreducerの外に出す。

type State = {
  foreground: {
    red: string;
    green: string;
    blue: string;
    hue: string;
    saturation: string;
    lightness: string;
  };
  background: {
    red: string;
    green: string;
    blue: string;
    hue: string;
    saturation: string;
    lightness: string;
  };
};

type Action = {
  kind: ColorKind;
  element: ColorElement;
  value: string;
};

const reducer = (state: State, action: Action) => {
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

// ------------------------------------------------------------------------
// メインコンポーネント。
// ------------------------------------------------------------------------
const App: React.FC = () => {

  // 初期値はRGBだけ指定してHSLは計算で出したいところだが、確実に1回だけ計算する方法がわからないのでベタ書き。
  const [{ background, foreground }, dispatch] = useReducer(reducer, {
    foreground: {
      red: '180',
      green: '230',
      blue: '230',
      hue: '180',
      saturation: '50',
      lightness: '80',
    },
    background: {
      red: '60',
      green: '160',
      blue: '160',
      hue: '180',
      saturation: '45',
      lightness: '43',
    },
  });

  const [fontFamily, setFontFamily] = useState(FontFamilies[1]);
  const [fontSize, setFontSize] = useState(80);
  const [fontWeight, setFontWeight] = useState(FontWeights[1]);
  const [textMessage, setTextMessage] = useState('This is sample text.');

  // テキスト・フォント関係の変更時のイベント処理
  const fontFamilyChanged = (value: string) => {
    setFontFamily(value);
  }
  const fontSizeChanged = (value: string) => {
    setFontSize(Number(value));
  }
  const fontWeightChanged = (value: string) => {
    setFontWeight(value);
  }
  const textMessageChanged = (value: string) => {
    setTextMessage(value);
  }

  // 表示に使用する色を生成する。
  const fgColor = new EFColor(Number(foreground.red), Number(foreground.green), Number(foreground.blue))
  const bgColor = new EFColor(Number(background.red), Number(background.green), Number(background.blue))

  // ページのタイトルを変更
  // document.title = 'Color Viewer';

  // 背景色を動的に設定。
  document.body.style.background = bgColor.colorCode();

  return (
    <div className="App">
      <h1>Color Viewer</h1>
      <div className="kind-box">
        <h2>Foreground (Text) - {fgColor.colorCode()} - {fgColor.cssRgb()} - {fgColor.cssHsl()}</h2>
        <ColorSelector
          t="RGB"
          kind="Foreground"
          values={[foreground.red, foreground.green, foreground.blue]}
          dispatch={dispatch}
        />
        <ColorSelector
          t="HSL"
          kind="Foreground"
          values={[foreground.hue, foreground.saturation, foreground.lightness]}
          dispatch={dispatch}
        />
        <div className="text-properties-box">
          <div className="title">Text Settings</div>&nbsp;
          Text:&nbsp;
          <input type="text" size={30} value={textMessage} onChange={(e) => textMessageChanged(e.currentTarget.value)}></input>
          &nbsp;&nbsp;&nbsp;
          Size:
          <input type="range" min={6} max={200} id="font-size-slider"
            onChange={(e) => fontSizeChanged(e.currentTarget.value)}
            value={fontSize} />
          {fontSize}px
          &nbsp;&nbsp;&nbsp;
          Font:&nbsp;
          <select
            name="font-family"
            value={fontFamily}
            onChange={(e) => fontFamilyChanged(e.currentTarget.value)}
          >
            {
              FontFamilies.map((v) => (
                <option value={v} key={v}>{v}</option>
              ))
            }
          </select>
          &nbsp;&nbsp;&nbsp;
          Weight:&nbsp;
          <select
            name="font-weight"
            value={fontWeight}
            onChange={(e) => fontWeightChanged(e.currentTarget.value)}
          >
            {
              FontWeights.map((v) => (
                <option value={v} key={v}>{v}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="kind-box">
        <h2>Background - {bgColor.colorCode()} - {bgColor.cssRgb()} - {bgColor.cssHsl()}</h2>
        <ColorSelector
          t="RGB"
          kind="Background"
          values={[background.red, background.green, background.blue]}
          dispatch={dispatch}
        />
        <ColorSelector
          t="HSL"
          kind="Background"
          values={[background.hue, background.saturation, background.lightness]}
          dispatch={dispatch}
        />
      </div>

      <div id="canvas-area" style={{
        color: fgColor.colorCode(),
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
      } as CSSProperties}>
        <p id="display-text">{textMessage}</p>
      </div>
    </div>
  );
}

export default App;
