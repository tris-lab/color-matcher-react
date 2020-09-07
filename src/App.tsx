import React, { useState, CSSProperties } from 'react';
import './App.css';
import EFColor from './efcolor';

type ColorType = 'RGB' | 'HSL';
type ColorKind = 'Foreground' | 'Background' | null;

type ColorElement = 'Red' | 'Green' | 'Blue' | 'Hue' | 'Saturation' | 'Lightness';

type ColorElementProp = {
  kind: ColorKind;
  element: ColorElement;
  label?: string; // 省略されたときは、elementの1文字目となる。
  max: number; // 値の最大値。省略時は100。ちなみに最小値は0固定。
  value: string;
  onChange: (kind: ColorKind, element: ColorElement, value: string) => void;
};

type ColorSelectorProps = {
  t: ColorType;
  kind: ColorKind;
  values: string[]; // 表示する各色の値。
  onChange: (kind: ColorKind, element: ColorElement, value: string) => void;
};

const FontFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
const FontWeights = ['normal', 'bold'];

// ------------------------------------------------------------------------
// 色の1要素の値のコンポーネント。スライダー・テキストボックス・値表示。
// ------------------------------------------------------------------------
const ColorElementSelector: React.FC<ColorElementProp> = ({ kind, element, label, max, value, onChange }) => {
  // labelが省略されているとき、elementの1文字目を取得してlabelとする。
  if (label == null) {
    label = element.charAt(0);
  }

  return (
    <div className="color-element-selector">
      <label>
        {label}:
        <input type="range" min={0} max={max}
          onChange={(e) => onChange(kind, element, e.currentTarget.value)}
          value={value} />
        <input
          type="text" size={3} maxLength={3}
          onChange={(e) => onChange(kind, element, e.currentTarget.value)}
          value={value} />
          ({Math.round(Number(value) / max * 100)}%)
      </label>
    </div>
  )
}


// ------------------------------------------------------------------------
// RGBまたはHSLを選択するコンポーネント。
// ------------------------------------------------------------------------
const ColorSelector: React.FC<ColorSelectorProps> = ({ t, kind, values, onChange }) => {
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
      onChange: onChange,
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
// メインコンポーネント。
// ------------------------------------------------------------------------
const App: React.FC = () => {

  // Background
  const [bgRed, setBgRed] = useState('60');
  const [bgGreen, setBgGreen] = useState('160');
  const [bgBlue, setBgBlue] = useState('160');
  const [bgColor, setBgColor] = useState(() => new EFColor(Number(bgRed), Number(bgGreen), Number(bgGreen)));

  let [h, s, l] = EFColor.hslFromRgb(Number(bgRed), Number(bgGreen), Number(bgBlue));
  const [bgHue, setBgHue] = useState(String(Math.round(h)));
  const [bgSaturation, setBgSaturation] = useState(String(Math.round(s)));
  const [bgLightness, setBgLightness] = useState(String(Math.round(l)));

  // Foreground (Text)
  const [fgRed, setFgRed] = useState('180');
  const [fgGreen, setFgGreen] = useState('230');
  const [fgBlue, setFgBlue] = useState('230');
  const [fgColor, setFgColor] = useState(() => new EFColor(Number(fgRed), Number(fgGreen), Number(fgGreen)));

  [h, s, l] = EFColor.hslFromRgb(Number(fgRed), Number(fgGreen), Number(fgBlue));
  const [fgHue, setFgHue] = useState(String(Math.round(h)));
  const [fgSaturation, setFgSaturation] = useState(String(Math.round(s)));
  const [fgLightness, setFgLightness] = useState(String(Math.round(l)));

  const [fontFamily, setFontFamily] = useState(FontFamilies[1]);
  const [fontSize, setFontSize] = useState(80);
  const [fontWeight, setFontWeight] = useState(FontWeights[1]);
  const [textMessage, setTextMessage] = useState('This is sample text.');

  // 色の要素の値が変更されたときに実行される関数。
  // useStateの更新用関数で値を更新しても反映にはタイムラグがあるので書き方に注意(別変数を作って処理している)。
  const colorElementChanged = (kind: ColorKind, element: ColorElement, value: string) => {
    let color: EFColor;
    let source: EFColor;

    if (kind === 'Background') {
      source = new EFColor(Number(bgRed), Number(bgGreen), Number(bgBlue));
      const [h, s, l] = [Number(bgHue), Number(bgSaturation), Number(bgLightness)];

      switch (element) {
        case 'Red':
          color = new EFColor(Number(value), source.g, source.b);
          setBgRed(value);
          updateHsl(kind, color);
          break;
        case 'Green':
          color = new EFColor(source.r, Number(value), source.b);
          setBgGreen(value);
          updateHsl(kind, color);
          break;
        case 'Blue':
          color = new EFColor(source.r, source.g, Number(value));
          setBgBlue(value);
          updateHsl(kind, color);
          break;
        case 'Hue':
          color = EFColor.createFromHSL(Number(value), s, l);
          setBgHue(value);
          updateRgb(kind, color);
          break;
        case 'Saturation':
          color = EFColor.createFromHSL(h, Number(value), l);
          setBgSaturation(value);
          updateRgb(kind, color);
          break;
        case 'Lightness':
          color = EFColor.createFromHSL(h, s, Number(value));
          setBgLightness(value);
          updateRgb(kind, color);
          break;
      }
    } else {
      source = new EFColor(Number(fgRed), Number(fgGreen), Number(fgBlue));
      const [h, s, l] = [Number(fgHue), Number(fgSaturation), Number(fgLightness)];

      switch (element) {
        case 'Red':
          color = new EFColor(Number(value), source.g, source.b);
          setFgRed(value);
          updateHsl(kind, color);
          break;
        case 'Green':
          color = new EFColor(source.r, Number(value), source.b);
          setFgGreen(value);
          updateHsl(kind, color);
          break;
        case 'Blue':
          color = new EFColor(source.r, source.g, Number(value));
          setFgBlue(value);
          updateHsl(kind, color);
          break;
        case 'Hue':
          color = EFColor.createFromHSL(Number(value), s, l);
          setFgHue(value);
          updateRgb(kind, color);
          break;
        case 'Saturation':
          color = EFColor.createFromHSL(h, Number(value), l);
          setFgSaturation(value);
          updateRgb(kind, color);
          break;
        case 'Lightness':
          color = EFColor.createFromHSL(h, s, Number(value));
          setFgLightness(value);
          updateRgb(kind, color);
          break;
      }
    }
  }

  const updateRgb = (kind: ColorKind, color: EFColor) => {
    if (kind === 'Background') {
      setBgRed(String(Math.round(color.r)));
      setBgGreen(String(Math.round(color.g)));
      setBgBlue(String(Math.round(color.b)));

      setBgColor(color);
    } else {
      setFgRed(String(Math.round(color.r)));
      setFgGreen(String(Math.round(color.g)));
      setFgBlue(String(Math.round(color.b)));

      setFgColor(color);
    }
  }

  // HSLの値を更新する。
  const updateHsl = (kind: ColorKind, color: EFColor) => {
    const [h, s, l] = color.hsl;

    if (kind === 'Background') {
      setBgHue(String(Math.round(h)));
      setBgSaturation(String(Math.round(s)));
      setBgLightness(String(Math.round(l)));

      setBgColor(color);
    } else {
      setFgHue(String(Math.round(h)));
      setFgSaturation(String(Math.round(s)));
      setFgLightness(String(Math.round(l)));

      setFgColor(color);
    }
  }

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
          values={[fgRed, fgGreen, fgBlue]}
          onChange={colorElementChanged}
        />
        <ColorSelector
          t="HSL"
          kind="Foreground"
          values={[fgHue, fgSaturation, fgLightness]}
          onChange={colorElementChanged}
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
          values={[bgRed, bgGreen, bgBlue]}
          onChange={colorElementChanged}
        />
        <ColorSelector
          t="HSL"
          kind="Background"
          values={[bgHue, bgSaturation, bgLightness]}
          onChange={colorElementChanged}
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
