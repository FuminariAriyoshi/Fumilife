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
  const zoomedMediaRef = useRef(null); // いま寄っている動画（これ以外をクリックでズームアウト）
  const isCameraAnimatingRef = useRef(false); // ズームイン/アウト中は Observer のスクロールを無視
  const isObserverDisabledByZoomRef = useRef(false); // 動画押下後は Observer を起こさない（中心ズレ防止）
  const savedZoomOriginRef = useRef({ x: 0, y: 0 }); // ズーム時のコンテナ内の中心座標（リサイズで再計算用）
  const observerIgnoreEventsRef = useRef(0); // 新 Observer 作成直後のゴーストイベントを無視する件数（スクロール中クリック対策）

  useEffect(() => {
    if (videoList.length === 0) return;

    gsap.registerPlugin(Observer);

    const container = document.querySelector(".infinite-scroll-container .container");
    if (!container) return;

    gsap.set(container, { scale: 1 });

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

    /**
     * ズーム中のリサイズ時: 画面（viewport）のスクロールやレイアウトは触らず、
     * カメラ（container の transform）だけを更新し、選ばれている動画が画面中心に来るようにする。
     */
    const onResizeWhenZoomed = () => {
      const media = zoomedMediaRef.current;
      if (!media?.isConnected || !container?.isConnected || !section?.isConnected) return;

      const mr = media.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      const currentScale = gsap.getProperty(container, "scale") ?? 1;

      const isPortrait = mr.height >= mr.width;
      const targetVH = 0.7 * window.innerHeight;
      const targetVW = 0.7 * window.innerWidth;
      const targetScale = isPortrait
        ? Math.max(1, (targetVH * currentScale) / mr.height)
        : Math.max(1, (targetVW * currentScale) / mr.width);

      const centerX = Math.round(sr.left + sr.width / 2);
      const centerY = Math.round(sr.top + sr.height / 2);
      const targetX = centerX - Math.round(sr.left) - Math.round(savedZoomOriginRef.current.x);
      const targetY = centerY - Math.round(sr.top) - Math.round(savedZoomOriginRef.current.y);

      gsap.set(container, { x: targetX, y: targetY, scale: targetScale });
    };

    window.addEventListener("resize", onResizeWhenZoomed);

    const contentEl = document.querySelector(".infinite-scroll-container .content");
    const resizeObserver = contentEl
      ? new ResizeObserver(updateDimensions)
      : null;
    if (contentEl) resizeObserver.observe(contentEl);

    /** quickTo を作成するヘルパー（ズーム後に再作成するため関数化） */
    const createXTo = () => gsap.quickTo(container, "x", {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        x: (x) => {
          const w = dimensionsRef.current.halfX;
          if (w <= 0) return "0px";
          const wrapFn = gsap.utils.wrap(-w, 0);
          const num = parseFloat(x);
          const wrapped = typeof wrapFn === "function" ? wrapFn(num) : num;
          return `${Number(wrapped)}px`;
        },
      },
    });

    const createYTo = () => gsap.quickTo(container, "y", {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        y: (y) => {
          const h = dimensionsRef.current.halfY;
          if (h <= 0) return "0px";
          const wrapFn = gsap.utils.wrap(-h, 0);
          const num = parseFloat(y);
          const wrapped = typeof wrapFn === "function" ? wrapFn(num) : num;
          return `${Number(wrapped)}px`;
        },
      },
    });

    let xTo = createXTo();
    let yTo = createYTo();

    let incrX = 0,
      incrY = 0;
    let savedIncrX = 0,
      savedIncrY = 0;

    const section = document.querySelector(".infinite-scroll-container");
    if (!section) return;

    const observerHolder = { current: null };
    let observerCreateTimeoutId = null;

    const createObserver = () => {
      return Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        onChangeX: (self) => {
          if (observerIgnoreEventsRef.current > 0) {
            observerIgnoreEventsRef.current--;
            return;
          }
          if (isObserverDisabledByZoomRef.current) return;
          if (isCameraAnimatingRef.current) return;
          if (self.event.type === "wheel") incrX -= self.deltaX;
          else incrX += self.deltaX * 2;
          xTo(incrX);
        },
        onChangeY: (self) => {
          if (observerIgnoreEventsRef.current > 0) {
            observerIgnoreEventsRef.current--;
            return;
          }
          if (isObserverDisabledByZoomRef.current) return;
          if (isCameraAnimatingRef.current) return;
          if (self.event.type === "wheel") incrY -= self.deltaY;
          else incrY += self.deltaY * 2;
          yTo(incrY);
        },
      });
    };

    observerHolder.current = createObserver();

    /** 選択した動画以外をクリックしたら元のカメラに戻す */
    const zoomOut = () => {
      if (isCameraAnimatingRef.current) return;
      isCameraAnimatingRef.current = true;

      const w = dimensionsRef.current.halfX;
      const h = dimensionsRef.current.halfY;
      const wrapX = w <= 0 ? 0 : gsap.utils.wrap(-w, 0)(savedIncrX);
      const wrapY = h <= 0 ? 0 : gsap.utils.wrap(-h, 0)(savedIncrY);
      const numX = typeof wrapX === "number" ? wrapX : (parseFloat(wrapX) || 0);
      const numY = typeof wrapY === "number" ? wrapY : (parseFloat(wrapY) || 0);

      /**
       * quickTo 再作成 + Observer 復帰
       * gsap.to() が quickTo の内部 Tween を kill するため、
       * ズームアウト完了後に quickTo を新しく作り直す必要がある。
       */
      const restoreScrolling = () => {
        xTo = createXTo();
        yTo = createYTo();
        observerHolder.current?.kill();
        observerHolder.current = null;
        observerIgnoreEventsRef.current = 0;
        observerHolder.current = createObserver();
      };

      gsap.to(container, {
        scale: 1,
        x: numX,
        y: numY,
        duration: 0.6,
        ease: "power2.inOut",
        overwrite: "auto",
        onComplete: () => {
          container.style.transformOrigin = "0 0";
          incrX = numX;
          incrY = numY;
          gsap.set(container, { x: numX, y: numY });
          zoomedMediaRef.current = null;
          isCameraAnimatingRef.current = false;
          isObserverDisabledByZoomRef.current = false;
          updateDimensions();
          requestAnimationFrame(() => {
            restoreScrolling();
          });
        },
        onInterrupt: () => {
          const curX = parseFloat(gsap.getProperty(container, "x")) || 0;
          const curY = parseFloat(gsap.getProperty(container, "y")) || 0;
          const wrappedX = w <= 0 ? curX : (gsap.utils.wrap(-w, 0)(curX) ?? curX);
          const wrappedY = h <= 0 ? curY : (gsap.utils.wrap(-h, 0)(curY) ?? curY);
          incrX = typeof wrappedX === "number" ? wrappedX : (parseFloat(wrappedX) || 0);
          incrY = typeof wrappedY === "number" ? wrappedY : (parseFloat(wrappedY) || 0);
          isCameraAnimatingRef.current = false;
          isObserverDisabledByZoomRef.current = false;
          gsap.killTweensOf(container);
          gsap.set(container, { x: incrX, y: incrY, scale: 1 });
          requestAnimationFrame(() => {
            restoreScrolling();
          });
        },
      });
    };

    const handleClick = (e) => {
      if (!container?.isConnected || !section?.isConnected) return;
      if (isCameraAnimatingRef.current) return;

      const media = e.target.closest(".infinite-scroll-container .media");
      const currentScale = gsap.getProperty(container, "scale") ?? 1;

      if (currentScale > 1.5) {
        if (!media || media !== zoomedMediaRef.current) {
          zoomOut();
        }
        return;
      }

      if (!media) return;

      isCameraAnimatingRef.current = true;

      // quickTo の内部 Tween を事前に kill しておく（gsap.to との競合防止）
      if (xTo.tween) xTo.tween.kill();
      if (yTo.tween) yTo.tween.kill();
      gsap.killTweensOf(container);
      const currentX = parseFloat(gsap.getProperty(container, "x")) || 0;
      const currentY = parseFloat(gsap.getProperty(container, "y")) || 0;
      incrX = currentX;
      incrY = currentY;

      const cr = container.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      const mr = media.getBoundingClientRect();

      const isPortrait = mr.height >= mr.width;
      const targetVH = 0.7 * window.innerHeight;
      const targetVW = 0.7 * window.innerWidth;
      const targetScale = isPortrait
        ? Math.max(1, targetVH / mr.height)
        : Math.max(1, targetVW / mr.width);

      const localCenterX = mr.left - cr.left + mr.width / 2;
      const localCenterY = mr.top - cr.top + mr.height / 2;
      savedZoomOriginRef.current = { x: localCenterX, y: localCenterY };

      const centerX = Math.round(sr.left + sr.width / 2);
      const centerY = Math.round(sr.top + sr.height / 2);
      const targetX = centerX - Math.round(sr.left) - Math.round(localCenterX);
      const targetY = centerY - Math.round(sr.top) - Math.round(localCenterY);

      savedIncrX = currentX;
      savedIncrY = currentY;

      observerHolder.current?.kill();
      observerHolder.current = null;
      isObserverDisabledByZoomRef.current = true;

      container.style.transformOrigin = `${localCenterX}px ${localCenterY}px`;
      gsap.to(container, {
        scale: targetScale,
        x: targetX,
        y: targetY,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          incrX = targetX;
          incrY = targetY;
          isCameraAnimatingRef.current = false;
          requestAnimationFrame(() => {
            gsap.set(container, { x: targetX, y: targetY });
          });
        },
        onInterrupt: () => {
          isCameraAnimatingRef.current = false;
          isObserverDisabledByZoomRef.current = false;
          if (observerCreateTimeoutId != null) clearTimeout(observerCreateTimeoutId);
          // quickTo を再作成してから Observer を復帰
          xTo = createXTo();
          yTo = createYTo();
          observerIgnoreEventsRef.current = 0;
          observerHolder.current = createObserver();
        },
      });
      zoomedMediaRef.current = media;
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("resize", onResizeWhenZoomed);
      if (resizeObserver && contentEl) resizeObserver.unobserve(contentEl);
      if (observerCreateTimeoutId != null) clearTimeout(observerCreateTimeoutId);
      observerHolder.current?.kill();
      gsap.killTweensOf(container);
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
      {/* 四辺に白グラデーションの固定オーバーレイ（動画より前面） */}
      <div className="glid-edge-gradient" aria-hidden />
    </main>
  );
}
