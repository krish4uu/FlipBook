import { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
interface BookData {
  filename: string;
  pageCount: number;
}

export default function Home() {
  const [book, setBook] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setBook(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const onPageChange = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flip-Book</h1>
      <input type="file" accept=".pdf" onChange={handleFileUpload} className={styles.fileInput} />
      {isLoading && <p>Loading...</p>}
      {book && (
        <div className={styles.bookContainer}>
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPageChange}
            className={styles.flipBook}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={0}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {[...Array(book.pageCount)].map((_, index) => (
              <div key={index} className={styles.page}>
                <Image
                  src={`http://localhost:3001/uploads/${book.filename.split('.')[0]}/page.${index + 1}.png`}
                  alt={`Page ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  width={600}
                  height={600}
                />
              </div>
            ))}
          </HTMLFlipBook>
          <div className={styles.pageInfo}>
            Page {currentPage + 1} of {book.pageCount}
          </div>
        </div>
      )}
    </div>
  );
}