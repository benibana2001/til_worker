import { FC, RefObject, useRef, useState } from 'react';

import styles from './components.module.css';
import { changeFileSize } from '@/lib/changeFileSize';
/**
 * ユーザーがアップした画像を表示するコンポーネント
 */
export const MasterImageList: FC<{ file: File; childKey: string }> = ({
  file,
  childKey
}) => {
  console.group('CanvasImae FunctionComponent');
  console.log('file loading ...');
  /**
   * canvas領域の画像に対して画像を書き出す
   * その際にRefを使用してDOMを
   */
  const [doneLoadingFile, setDoneFileLoading] = useState<boolean>(() => false);
  const [sourceBitMap, setSourceBitMap] = useState<ImageBitmap | null>(null);
  const initialRef = document.createElement('canvas');
  const canvasRef: RefObject<HTMLCanvasElement> =
    useRef<HTMLCanvasElement>(initialRef);

  const ctx = canvasRef.current?.getContext('2d');
  if (ctx) {
    createImageBitmap(file).then((bitMap) => {
      /**
       * サイズ変更してサムネイルを描画
       *
       * たて、よこ、どちらか大きい方に合わせる。
       * 画像がサイズに満たない場合はoriginalを返す。
       */
      changeFileSize(canvasRef, ctx, bitMap, () => {
        setDoneFileLoading(true);
        // setSourceBitMap(bitMap);
      });
    });
  }

  console.groupEnd();

  return (
    <div className={styles.master_image_display_area}>
      {/* サムネイル画像 */}
      <canvas
        key={childKey}
        ref={canvasRef}
        onClick={() => console.log(file.name)}
      />
      {/* マスター画像情報 */}
      <ul>
        <li>Name: {file.name}</li>
        <li>Size: {Math.round(file.size / 1000)} KB</li>
      </ul>
      {/* 編集機能 */}
      {/* リサイズ */}
      {/* PNG */}
      {sourceBitMap && <DownLoadButton bitMap={sourceBitMap} />}
      {/* JPG */}
      {/* 変形 */}
    </div>
  );
};

const DownLoadButton: FC<{ bitMap: ImageBitmap }> = ({
  bitMap: ImageBitmap
}) => {
  return <>hello</>;
};

const onClickSmear = (e: MouseEvent) => {
  console.log(e);
  console.log('onClickSmear');
};

const Util = {
  /**
   * 画像をにじませる
   */
  smear(
    ctx: CanvasRenderingContext2D,
    n: number, // にじみの強さ
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    let pixels = ctx.getImageData(x, y, w, h);

    let width = pixels.width,
      height = pixels.height;

    let data: Uint8ClampedArray = pixels.data; // 8bit符号なし整数の配列。オーバーフローなし。

    let m = n - 1;
    for (let row = 0; row < height; row++) {
      let i = row * width * 4 + 4; // 行数 x (一つのピクセルにRGBA(4つの値)) + (次のピクセルを指定するため1ピクセルをプラス)
      data[i] = (data[i] + data[i - 4] * m) / n; // （現在のR + 前のピクセルのR * 前のピクセルの強さ） / にじみの強さ
      data[i + 1] = (data[i + 1] + data[i - 3] * m) / n; // G
      data[i + 2] = (data[i + 2] + data[i - 2] * m) / n; // B
      data[i + 3] = (data[i + 3] + data[i - 1] * m) / n; // A
    }

    return pixels;
    // ctx.putImageData(pixels, x, y);
  }
};
