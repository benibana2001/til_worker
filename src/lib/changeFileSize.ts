import { Dispatch, RefObject, SetStateAction, FC } from 'react';

export const changeFileSize = (
  canvasRef: RefObject<HTMLCanvasElement>,
  ctx: CanvasRenderingContext2D,
  bitMap: ImageBitmap,
  doneCallback: Function
) => {
  const maxDestinationPixel = 200;
  let width = bitMap.width,
    height = bitMap.height;
  if (bitMap.width > 200 || bitMap.height > 200) {
    const ratio = bitMap.width / bitMap.height;
    // 横長の画像
    if (bitMap.width >= bitMap.height) {
      width = maxDestinationPixel;
      height = maxDestinationPixel / ratio;
    } else {
      height = maxDestinationPixel;
      width = maxDestinationPixel * ratio;
    }
  }
  if (canvasRef.current) {
    canvasRef.current.width = width;
    canvasRef.current.height = height;
  }
  console.log('CONTEXT_DRAW_IMAGE');
  ctx.drawImage(bitMap, 0, 0, width, height);

  //  画像セットが完了したことをsetStateしないと画像がリアクティブ表示しない
  // setDoneFileLoading(true);
  doneCallback();
};

/**
 *
 */
