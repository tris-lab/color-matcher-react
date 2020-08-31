
/**
 * 色のモードを表す型。
 */
export type ColorMode =
  | 'RGB'
  | 'HSL';

/**
 * 色を表す自作クラス。
 */
export default class EFColor {
  // console.logのときに表示される名前を変える。
  [Symbol.toStringTag] = "EFColor";

  private _r: number;
  private _g: number;
  private _b: number;

	/**
	 * EFColorのインスタンスを作成する。
	 * @constructor
	 * @param a RGBのときはR(赤)(0-255)、HSLのときはH(色相)(0-360)。
	 * @param b RGBのときはG(緑)(0-255)、HSLのときはS(彩度)(0-100)。
	 * @param c RGBのときはB(青)(0-255)、HSLのときはL(明度)(0-100)。
	 * @param mode カラーモード。'RGB' or 'HSL'。省略時はRGBとして動作する。
	 */
  constructor(a: number, b: number, c: number, mode?: ColorMode) {
    if (mode === undefined || mode === 'RGB') {
      this._r = remapValue(a, 0, 255);
      this._g = remapValue(b, 0, 255);
      this._b = remapValue(c, 0, 255);
    } else if (mode === 'HSL') {
      let array = EFColor.rgbFromHsl(a, b, c);
      this._r = array[0];
      this._g = array[1];
      this._b = array[2];
    } else {
      this._r = 0;
      this._g = 0;
      this._b = 0;
    }
  }


  public get r(): number {
    return Math.round(this._r);
  }
  public set r(value: number) {
    this._r = remapValue(value, 0, 255);
  }

  public get g(): number {
    return Math.round(this._g);
  }
  public set g(value: number) {
    this._g = remapValue(value, 0, 255);
  }

  public get b(): number {
    return Math.round(this._b);
  }
  public set b(value: number) {
    this._b = remapValue(value, 0, 255);
  }

  /**
   * HSLの値(整数)を返す。値の範囲は、H(0-359)、S(0-100)、L(0-100)。
   */
  public get hsl(): number[] {
    const [h, s, l] = EFColor.hslFromRgb(this._r, this._g, this._b);
    return [Math.round(h), Math.round(s), Math.round(l)]
  }

  /**
   * RGBの文字列を返す。「R:xx G:xx B:xx」
   */
  rgbString = (): string => {
    return `R:${this._r} G:${this._g} B:${this._b}`;
  }

  /**
   * HTMLのカラーコードを返す。「#FFFFFF」形式。
   */
  colorCode = (): string => {
    return `#${doubleHex(this._r)}${doubleHex(this._g)}${doubleHex(this._b)}`
  }

  /**
   * CSSのRGB指定の文字列を返す。「rgb(xx, xx, xx)」形式。各色0-255。値は整数。
   */
  cssRgb = (): string => {
    return `rgb(${this.r}, ${this.g}, ${this.b})`
  }

  /**
   * CSSのHSL指定の文字列を返す。「hsl(xx, xx%, xx%)」形式。Hは0-359、SとLは0-100。値は整数。
   */
  cssHsl = (): string => {
    const [h, s, l] = this.hsl;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  /**
   * EFColorのインスタンスを、RGB値を元に生成して返すファクトリメソッド。
   * @param r R(赤)。0-255。
   * @param g G(緑)。0-255。
   * @param b B(青)。0-255。
   */
  static createFromRgb = (r: number, g: number, b: number): EFColor => {
    return new EFColor(r, g, b, 'RGB');
  }

  /**
   * EFColorのインスタンスを、HSL値を元に生成して返すファクトリメソッド。
   * @param h 色相。0-359[deg]。360以上も可。
   * @param s 彩度。0-100[%]。
   * @param l 明度。0-100[%]。
   */
  static createFromHSL = (h: number, s: number, l: number): EFColor => {
    const c = EFColor.rgbFromHsl(h, s, l);
    return new EFColor(c[0], c[1], c[2], 'RGB');
  }

  /**
   * HSLの値を変換したRGBの値(RGB値の配列)を返す関数。戻り値は小数部を含む。
   * @param h 色相。0-359[deg]。360以上も可。
   * @param s 彩度。0-100%。
   * @param l 明度。0-100%。
   */
  static rgbFromHsl(h: number, s: number, l: number): number[] {
    let r: number;
    let g: number;
    let b: number;
    let max, min: number;

    // Hを360度に収める。
    h %= 360;

    // 引数の範囲チェック。
    h = remapValue(h, 0, 360);
    s = remapValue(s, 0, 100);
    l = remapValue(l, 0, 100);

    if (l < 49) {
      max = 2.55 * (l + l * (s / 100))
      min = 2.55 * (l - l * (s / 100))
    } else {
      max = 2.55 * (l + (100 - l) * (s / 100))
      min = 2.55 * (l - (100 - l) * (s / 100))
    }

    if (h < 60) {
      r = max
      g = min + (max - min) * h / 60
      b = min
    } else if (h < 120) {
      r = min + (max - min) * (120 - h) / 60
      g = max
      b = min
    } else if (h < 180) {
      r = min
      g = max
      b = min + (max - min) * (h - 120) / 60
    } else if (h < 240) {
      r = min
      g = min + (max - min) * (240 - h) / 60
      b = max
    } else if (h < 300) {
      r = min + (max - min) * (h - 240) / 60
      g = min
      b = max
    } else {
      r = max
      g = min
      b = min + (max - min) * (360 - h) / 60
    }

    return [r, g, b];
  }

  /**
   * RGBの値を変換したHSLの値(HSL値の配列)を返す関数。
   * 戻り値は小数部を含む。Hは0-359、SとLは0-100。
   * @param r R(赤)。0-255。
   * @param g G(緑)。0-255。
   * @param b B(青)。0-255。
   */
  static hslFromRgb = (r: number, g: number, b: number): number[] => {
    let h = 0, s, l: number;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max === min) {
      h = 0;
    } else if (min === b) {
      h = 60 * (g - r) / (max - min) + 60;
    } else if (min === r) {
      h = 60 * (b - g) / (max - min) + 180;
    } else if (min === g) {
      h = 60 * (r - b) / (max - min) + 300;
    }

    if (h < 0) {
      h += 360;
    }

    l = ((max + min) / 2) / 255 * 100;

    const cnt = (max + min) / 2;
    if (cnt <= 127) {
      if (max === 0 && min === 0) {
        s = 0;
      } else {
        s = (max - min) / (max + min) * 100;
      }
    } else {
      if (max === 255 && min === 255) {
        s = 100;
      } else {
        s = (max - min) / (510 - max - min) * 100;
      }
    }

    return [h, s, l];
  }
}



/**
 * 渡された値を、最小値と最大値の間に収める。最小値より小さいときは最小値、最大値より大きいときは最大値とする。
 * @param num 値。
 * @param min 最小値。
 * @param max 最大値。
 */
const remapValue = (num: number, min: number, max: number): number => {
  if (num < min) {
    return min;
  } else if (num > max) {
    return max;
  }
  return num;
};

/**
 * 渡された数値を2桁の16進数文字列(大文字)にする関数。
 * 例：255→'FF'、10→'0A'
 * @param num 0～255の数字。範囲外のときは丸められる。整数でない場合は四捨五入される。
 */
const doubleHex = (num: number): string => {
  if (num < 0) {
    return '00';
  }
  if (num > 255) {
    return 'FF';
  }

  let str = Math.round(num).toString(16);

  // 1桁だけのときは頭に0を付ける。
  if (num < 16) {
    str = `0${str}`;
  }

  return str.toUpperCase();
}

