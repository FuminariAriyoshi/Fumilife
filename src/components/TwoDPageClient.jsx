"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import "../app/2D.css";

/**
 * Tutorial 026 風: 1本の .content + 3つの重複（duplicates）で無限2Dグリッド。
 * https://madewithgsap.com/effects/tutorial026
 */

/** 動画数 N に対して空セルが0になる列数を返す（3〜6列を優先）。空セル0が無理な場合は最少の列数を返す。 */
function getOptimalGridCols(N) {
  if (N <= 0) return 1;
  const prefer = [4, 5, 3, 6, 2, 7, 8]; // 見た目優先順
  // まず空セル0（割り切れる）の列数を探す
  for (const cols of prefer) {
    if (cols > N) continue;
    if (N % cols === 0) return cols; // 割り切れる = 空セル0
  }
  // 空セル0が無理な場合は最少の列数を返す
  let bestCols = 1;
  let minEmpty = N;
  for (const cols of prefer) {
    if (cols > N) continue;
    const rows = Math.ceil(N / cols);
    const empty = rows * cols - N;
    if (empty < minEmpty) {
      minEmpty = empty;
      bestCols = cols;
    }
  }
  return bestCols;
}

/**
 * 画面に入ってきたら動画を読み込み（1本ずつ）、読み込み中は thumb を表示。
 * 動画のメタデータ取得後にセルを動画サイズ（アスペクト比）に合わせる。
 */
function VideoWithThumb({ src, thumb }) {
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsInView(true);
      },
      { rootMargin: "50px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showThumb = (thumb && !loaded) || (!isInView && thumb);
  const shouldLoad = isInView;

  return (
    <div
      className="media media--video"
      ref={containerRef}
      style={aspectRatio ? { aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}` } : undefined}
    >
      {showThumb && thumb && (
        <img src={thumb} alt="" className="media__thumb" aria-hidden />
      )}
      {shouldLoad ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          poster={thumb ?? undefined}
          onLoadedMetadata={(e) => {
            const v = e.target;
            if (v.videoWidth && v.videoHeight) {
              setAspectRatio({ w: v.videoWidth, h: v.videoHeight });
            }
          }}
          onCanPlay={() => setLoaded(true)}
          onLoadedData={() => setLoaded(true)}
          className={showThumb ? "media__video media__video--loading" : "media__video"}
        />
      ) : (
        <div className="media__video media__video--loading" aria-hidden />
      )}
    </div>
  );
}

const DUPLICATES_COUNT = 3; // 1本 + 3重複 = 4ブロックで2x2無限グリッド（Tutorial 026）

export default function TwoDPageClient({ videos = [] }) {
  const videoList = Array.isArray(videos) ? videos : [];
  const dimensionsRef = useRef({ halfX: 0, halfY: 0 });

  useEffect(() => {
    if (videoList.length === 0) return;

    gsap.registerPlugin(Observer);

    const container = document.querySelector(".infinite-scroll-container .container");
    if (!container) return;

    const updateDimensions = () => {
      const content = document.querySelector(".infinite-scroll-container .content");
      if (content) {
        dimensionsRef.current.halfX = content.offsetWidth;  // 1セル幅
        dimensionsRef.current.halfY = content.offsetHeight; // 1セル高さ
      }
    };

    updateDimensions();
    setTimeout(updateDimensions, 100);
    setTimeout(updateDimensions, 500);
    window.addEventListener("resize", updateDimensions);

    const contentEl = document.querySelector(".infinite-scroll-container .content");
    const resizeObserver = contentEl
      ? new ResizeObserver(updateDimensions)
      : null;
    if (contentEl) resizeObserver.observe(contentEl);

    const xTo = gsap.quickTo(container, "x", {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        x: (x) => {
          const w = dimensionsRef.current.halfX;
          if (w <= 0) return "0px";
          const wrapFn = gsap.utils.wrap(-w, 0);
          return gsap.utils.unitize(wrapFn)(x);
        },
      },
    });

    const yTo = gsap.quickTo(container, "y", {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        y: (y) => {
          const h = dimensionsRef.current.halfY;
          if (h <= 0) return "0px";
          const wrapFn = gsap.utils.wrap(-h, 0);
          return gsap.utils.unitize(wrapFn)(y);
        },
      },
    });

    let incrX = 0,
      incrY = 0;

    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      onChangeX: (self) => {
        if (self.event.type === "wheel") incrX -= self.deltaX;
        else incrX += self.deltaX * 2;
        xTo(incrX);
      },
      onChangeY: (self) => {
        if (self.event.type === "wheel") incrY -= self.deltaY;
        else incrY += self.deltaY * 2;
        yTo(incrY);
      },
    });

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver && contentEl) resizeObserver.unobserve(contentEl);
      observer.kill();
    };
  }, [videoList.length]);

  const gridCols = getOptimalGridCols(videoList.length);

  return (
    <main>
      <section className="infinite-scroll-container">
        <div className="container">
          {videoList.length === 0 ? (
            <div className="content content--empty">
              <p className="content__empty-msg">動画がありません（Prismic の mov を確認してください）</p>
            </div>
          ) : (
            <>
              {/* 1本目: メイン（スクリーンリーダー用） */}
              <div
                className="content"
                style={{ "--grid-cols": gridCols }}
              >
                {videoList.map((item, idx) => (
                  <VideoWithThumb
                    key={`0-${idx}-${item.src}`}
                    src={item.src}
                    thumb={item.thumb}
                  />
                ))}
              </div>

              {/* 重複 3つ: 無限ループ用（Tutorial 026） */}
              {Array.from({ length: DUPLICATES_COUNT }, (_, i) => (
                <div
                  key={`dup-${i}`}
                  className="content"
                  aria-hidden="true"
                  style={{ "--grid-cols": gridCols }}
                >
                  {videoList.map((item, idx) => (
                    <VideoWithThumb
                      key={`${i + 1}-${idx}-${item.src}`}
                      src={item.src}
                      thumb={item.thumb}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
