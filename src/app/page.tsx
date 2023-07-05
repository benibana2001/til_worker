'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './page.module.css';
import { MasterImageList } from '@/components/MasterImageList';

export default function Home() {
  // uploadされたファイルを保持する
  const initializeFiles = () => []; //initializerはfunctionとして記述しないと毎度うまく回らない
  const [currentFiles, setCurrentFiles] = useState<File[]>(initializeFiles);
  const [isDragOn, setIsDragOn] = useState<boolean>(false);
  /**
   * Event Functions
   * - Dragイベントはクリック時は発火しない
   * - DragOverはファイルを重ねているときは連続で発火し続ける
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
      console.log('DO SET_FILES');
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
            return (
              <MasterImageList key={i} childKey={`canvas_${i}`} file={file} />
            );
          })}
      </ul>
    </main>
  );
}



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
