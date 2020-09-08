import React, { useState, useReducer, CSSProperties } from 'react';
import ColorSelector from './ColorSelector'
import { reducer } from './appLogic'
import EFColor from '../lib/efcolor';
import { FontFamilies, FontWeights } from '../lib/eftypes';
import './Main.css';


const Main: React.FC = () => {
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

export default Main;