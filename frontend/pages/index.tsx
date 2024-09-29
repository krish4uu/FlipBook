/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Book, ChevronLeft, ChevronRight } from "lucide-react";

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
});

interface BookData {
  filename: string;
  pageCount: number;
}

export default function Home() {
  const [book, setBook] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isSinglePage = aspectRatio < 0.75;
      const width = Math.min(window.innerWidth * 0.9, 1000);
      const height = width * (isSinglePage ? 1.4 : 0.7);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNextPage();
      } else if (event.key === "ArrowLeft") {
        handlePrevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        setBook(result);
        setCurrentPage(0);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const onPageChange = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const handlePrevPage = useCallback(() => {
    if (flipBookRef.current && typeof flipBookRef.current.pageFlip === 'function') {
      flipBookRef.current.pageFlip().flipPrev();
    } else {
      console.error('pageFlip method is not available');
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (flipBookRef.current && typeof flipBookRef.current.pageFlip === 'function') {
      flipBookRef.current.pageFlip().flipNext();
    } else {
      console.error('pageFlip method is not available');
    }
  }, []);

  const isSinglePage = dimensions.width / dimensions.height < 0.75;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-neutral-100 dark:bg-neutral-900">
      <motion.h1
        className="text-4xl font-bold text-center text-primary-800 dark:text-primary-200 mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Flip Book
      </motion.h1>
      <motion.div
        className="mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <label
          htmlFor="file-upload"
          className="btn btn-primary flex items-center gap-2 cursor-pointer"
        >
          <Upload size={24} />
          <span>Choose a PDF file</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.div>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Processing your PDF...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {book && (
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {dimensions.width > 0 && dimensions.height > 0 && (
          <HTMLFlipBook
            width={210}
            height={300}
            size="stretch"
            minWidth={300}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPageChange}
            className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={isSinglePage}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={0}
            showPageCorners={true}
            disableFlipByClick={false}
            ref={flipBookRef}
          >
            {[...Array(book.pageCount)].map((_, index) => (
              <div key={index} className="relative w-full h-full">
                <Image
                  src={`http://localhost:3001/uploads/${
                    book.filename.split(".")[0]
                  }/page.${index + 1}.png`}
                  alt={`Page ${index + 1}`}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
          </HTMLFlipBook>
          )}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              className="btn btn-secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full">
              <Book size={18} />
              <span>
                {isSinglePage
                  ? `Page ${currentPage + 1} of ${book.pageCount}`
                  : `Pages ${currentPage + 1} - ${Math.min(
                      currentPage + 2,
                      book.pageCount
                    )} of ${book.pageCount}`}
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleNextPage}
              disabled={currentPage >= book.pageCount - (isSinglePage ? 1 : 2)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
