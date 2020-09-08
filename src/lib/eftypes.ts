
export type ColorType = 'RGB' | 'HSL';

export type ColorKind = 'Foreground' | 'Background';

export type ColorElement = 'Red' | 'Green' | 'Blue' | 'Hue' | 'Saturation' | 'Lightness';

export const FontFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
export const FontWeights = ['normal', 'bold'];


// ----------------------------------------------------------------------
// useReduce用の定義
// ----------------------------------------------------------------------
export type State = {
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

export type Action = {
  kind: ColorKind;
  element: ColorElement;
  value: string;
};

