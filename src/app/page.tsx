'use client';
import { FC, RefObject, useCallback, useRef, useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import styles from './page.module.css';

/**
 * ユーザーがアップした画像を表示するコンポーネント
 */
const CanvasImage: FC<{ file: File; childKey: string }> = ({
  file,
  childKey
}) => {
  console.group('CanvasImae FunctionComponent');
  // TODO ファイルが読み込み中であるフラグを立てる
  console.log('file loading ...');
  /**
   * canvas領域の画像に対して画像を書き出す
   * その際にRefを使用してDOMを
   */
  const [doneLoadingFile, setDoneFileLoading] = useState(() => false);
  const initialRef = document.createElement('canvas')
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(initialRef);
    console.log('😀')
  // if (canvasRef.current) {

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      createImageBitmap(file).then((bitMap) => {
        const MaxPixel = 200;
        // サイズ変更して描画
        let width = bitMap.width,
          height = bitMap.height;
        if (bitMap.width > 200 || bitMap.height > 200) {
          const ratio = bitMap.width / bitMap.height;
          // 横長の画像
          if (bitMap.width >= bitMap.height) {
            width = MaxPixel;
            height = MaxPixel / ratio;
          } else {
            height = MaxPixel;
            width = MaxPixel * ratio;
          }
        }
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
        console.log('CONTEXT_DRAW_IMAGE');
        ctx.drawImage(bitMap, 0, 0, width, height);

        // TODO 画像セットが完了したことをsetStateする
        console.log('file loading DONE !!!!!');
        setDoneFileLoading(true);
      });
    }
  // }
  console.groupEnd();


  return  <canvas key={childKey} ref={canvasRef} />;
};

export default function Home() {
  // uploadされたファイルを保持する
  const initializeFiles = () => []; //initializerはfunctionとして記述しないと毎度うまく回らない
  const [currentFiles, setCurrentFiles] = useState<File[]>(initializeFiles);
  const [isDragOn, setIsDragOn] = useState<boolean>(false);
  /**
   * Event Functions
   * - Dragイベントはクリック時は発火しない
   * - DragOverはファイルを重ねているときは連続で発火し続ける
   *
   */
  const onDragEnter = () => {
    setIsDragOn(true);
  };
  const onDragLeave = () => {
    setIsDragOn(false);
  };
  const onDragOver = () => {};
  /**
   * DropしたファイルはここでsetStateする
   */
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      console.group('***** ON_DROP_ACCEPTED *****');
      let files: File[] = [];
      acceptedFiles.forEach((file) => {
        files.push(file);
      });
      console.log('DO SET_SET_FILES');
      setCurrentFiles([...currentFiles, ...files]);
      console.log('currentFiles', currentFiles);
      console.groupEnd();
    },
    // 状態更新を検知するためにdepsには現在のstateを指定する
    [currentFiles]
  );

  const onDropRejected = useCallback(() => {
    console.error(`files were rejected !!!`);
    alert('files wer rejected!! ');
  }, []);

  // UseDropxoneはreact customHook として機能するため、ファイル読み込み時に個別のプロパティは更新される
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
    <main className={styles.main}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          className={
            isDragOn
              ? `${styles.draggable_area} ${styles.drag_on}`
              : styles.draggable_area
          }
        >
          ファイルをドラッグ＆ドロップするか、ここをクリックして選択してください。
        </p>
      </div>
      <ul>
        {currentFiles &&
          currentFiles.map((file, i) => {
            return <CanvasImage key={i} childKey={`canvas_${i}`} file={file} />;
          })}
      </ul>
    </main>
  );
}

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
  },
  /**
   * 画像のValidation
   */
  validateImageFile(file: File): boolean {
    if (
      file.type !== 'image/png' &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/jpg'
    ) {
      return false;
    }
    return true;
  }
};

// useEffect(() => {
//   const ctx = canvasRef.current?.getContext('2d');
//   if (ctx) {
//     // 線のスタイルを設定
//     ctx.strokeStyle = '#e0e0e0';
//     ctx.lineWidth = 1;

//     // 絵を描く
//     ctx.beginPath();
//     ctx.fillStyle = 'red';
//     ctx.fillRect(20, 20, 60, 60);
//     ctx.closePath();
//     ctx.stroke(); // 描画

//     // コピーしてref2に貼り付け
//     const ctx2 = canvasRef2.current?.getContext('2d');
//     if (ctx2) {
//       const pixels = smear(ctx, 100, 0, 0, 100, 100);
//       if (pixels) {
//         ctx2.putImageData(pixels, 0, 0);
//       }
//     }
//   }
// });
