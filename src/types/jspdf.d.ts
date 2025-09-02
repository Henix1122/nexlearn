declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    setFont(f: string, style?: string): this;
    setFontSize(size: number): this;
    setTextColor(r: number, g?: number, b?: number): this;
    text(txt: string, x: number, y: number, options?: any): this;
    setFillColor(r: number, g?: number, b?: number): this;
    setDrawColor(r: number, g?: number, b?: number): this;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): this;
    output(type: 'blob'): Blob;
  }
  const _default: any;
  export default _default;
}