"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import "../app/list/list.css";

/**
 * Listページ: 右側にアイテムリスト、中央に選択中の動画を表示（Figmaデザイン準拠）。
 */
/**
 * 日付フォーマット（例: "17/2/26"）
 */
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

export default function ListPageClient({ videos = [] }) {
  const videoList = Array.isArray(videos) ? videos : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVideo = videoList[selectedIndex] || null;
  const [isLandscape, setIsLandscape] = useState(true); // 動画が横型かどうか
  const lineRef = useRef(null);
  const lineAnimationRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const isFirstMainWrapperRenderRef = useRef(true); // updateMainWrapperPosition専用の初回レンダリングフラグ
  const itemRefs = useRef([]);
  const listRef = useRef(null);
  const sidebarRef = useRef(null); // sidebar全体のref
  const wheelObserverRef = useRef(null);
  const isAnimatingRef = useRef(false); // アニメーション中フラグ
  const videoRef = useRef(null); // 動画要素のref
  const mainWrapperRef = useRef(null); // main要素のwrapperのref
  const mainRef = useRef(null); // 中央のmain要素のref

  /**
   * sidebar全体を移動して選択中のボタンを画面の中心に表示
   * @param {HTMLElement} targetButton - 対象のボタン要素
   * @param {boolean} animate - アニメーションするか（初回はfalse）
   */
  function sidebarAnimation(targetButton, animate = true) {
    const sidebar = sidebarRef.current;
    const list = listRef.current;
    if (!targetButton || !sidebar || !list) return;

    // 既存のアニメーションを停止する前に、現在のtranslateYを取得（キャッシュを避けるため）
    const currentTranslateY = parseFloat(gsap.getProperty(sidebar, "y")) || 0;
    
    // 既存のアニメーションを停止してキャッシュをクリア
    gsap.killTweensOf(sidebar);

    const viewportHeight = window.innerHeight;
    const viewportCenterY = viewportHeight / 2;
    
    // ボタンの実際のviewport位置を取得（現在のtransform適用後の位置）
    const buttonRect = targetButton.getBoundingClientRect();
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    
    // ボタンの中心が画面の中心に来るように、sidebarを移動する距離を計算
    // 現在のボタンの中心位置: buttonCenterY
    // 目標位置: viewportCenterY
    // 必要な移動距離: viewportCenterY - buttonCenterY
    // 新しいtranslateY = 現在のtranslateY + 必要な移動距離
    const targetTranslateY = currentTranslateY + (viewportCenterY - buttonCenterY);

    // GSAPでsidebarを移動
    gsap.to(sidebar, {
      y: targetTranslateY,
      duration: animate ? 0.6 : 0,
      ease: "power2.inOut",
    });
  }

  /**
   * lineを画面のy中心に固定
   * @param {HTMLElement} targetButton - 対象のボタン要素
   * @param {boolean} animate - アニメーションするか（初回はfalse）
   */
  function lineAnimation(targetButton, animate = true) {
    const line = lineRef.current;
    const sidebar = sidebarRef.current;
    if (!line || !targetButton || !sidebar) return;

    const rect = targetButton.getBoundingClientRect();
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;

    const paddingLine = 10;
    const targetWidth = buttonWidth + paddingLine * 2;
    const targetHeight = buttonHeight + paddingLine * 2;

    // sidebarの位置を取得
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarLeft = sidebarRect.left;

    // lineは画面のy中心に固定（CSSでtransform: translateY(-50%)が適用されているため、topをviewportHeight / 2に設定）
    const viewportHeight = window.innerHeight;
    const targetTop = viewportHeight / 2; // translateY(-50%)により、lineの中心が画面の中心に来る
    const targetLeft = sidebarLeft - paddingLine; // sidebarの左端に合わせる

    // 既存のアニメーションを停止
    if (lineAnimationRef.current) {
      lineAnimationRef.current.kill();
      isAnimatingRef.current = false;
    }

    // アニメーションする場合のみフラグを立てる
    if (animate) {
      isAnimatingRef.current = true;
    }

    // GSAPでlineのアニメーション
    lineAnimationRef.current = gsap.to(line, {
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      left: `${targetLeft}px`,
      top: `${targetTop}px`,
      duration: animate ? 0.6 : 0,
      ease: "power2.inOut",
      onComplete: () => {
        // アニメーション完了時にフラグを下ろす
        isAnimatingRef.current = false;
      },
    });
  }

  /**
   * wrapper全体を動かして中央のmainが画面のy座標中心に配置
   * @param {boolean} animate - アニメーションするか（初回はfalse）
   */
  function updateMainWrapperPosition(animate = true) {
    const wrapper = mainWrapperRef.current;
    const main = mainRef.current;
    if (!wrapper || !main) return;

    // 既存のアニメーションを停止
    gsap.killTweensOf(wrapper);
    
    // 現在のtransformを取得
    const currentTranslateY = parseFloat(gsap.getProperty(wrapper, "y")) || 0;
    
    // transformを一時的にリセットして正確な位置を取得
    gsap.set(wrapper, { y: 0 });
    
    // リセット後の位置を取得（DOMが完全にレンダリングされるまで少し待つ）
    requestAnimationFrame(() => {
      const mainRect = main.getBoundingClientRect();
      const mainHeight = mainRect.height;
      const mainTop = mainRect.top;
      const mainCenterY = mainTop + mainHeight / 2;
      
      // 画面の中心位置
      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;
      
      // 必要な移動距離を計算
      const targetTranslateY = viewportCenterY - mainCenterY;
      
      // wrapper全体を動かしてmainが画面の中心に来るように（GSAPでアニメーション）
      gsap.to(wrapper, {
        y: targetTranslateY,
        duration: animate ? 0.6 : 0,
        ease: "power2.inOut",
      });
    });
  }

  /**
   * 選択中のボタンにlineとsidebarを更新
   */
  function updateLine() {
    const activeButton = document.querySelector(".list-page__item--active");
    if (!activeButton) return;
    const isFirstRender = isFirstRenderRef.current;
    const animate = !isFirstRender;
    
    // sidebarとlineのアニメーションを同時に実行
    sidebarAnimation(activeButton, animate);
    lineAnimation(activeButton, animate);
    
    isFirstRenderRef.current = false;
  }

  /**
   * selectedIndexの範囲チェック
   */
  function validateSelectedIndex() {
    if (videoList.length > 0 && selectedIndex >= videoList.length) {
      setSelectedIndex(0);
    }
  }

  useEffect(() => {
    validateSelectedIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoList.length, selectedIndex]);

  // wheelイベントで1つずつ動画を切り替え
  useEffect(() => {
    if (videoList.length === 0) return;

    gsap.registerPlugin(Observer);

    /**
     * 次の動画に移動（1つずつ）
     */
    function moveToNext() {
      // アニメーション中は何もしない
      if (isAnimatingRef.current) return;
      
      setSelectedIndex((prev) => {
        const next = prev + 1;
        return next >= videoList.length ? 0 : next;
      });
    }

    /**
     * 前の動画に移動（1つずつ）
     */
    function moveToPrev() {
      // アニメーション中は何もしない
      if (isAnimatingRef.current) return;
      
      setSelectedIndex((prev) => {
        const prevIndex = prev - 1;
        return prevIndex < 0 ? videoList.length - 1 : prevIndex;
      });
    }

    // DOMがマウントされるまで待つ
    const timeoutId = setTimeout(() => {
      // window全体でwheelイベントを監視（より確実）
      wheelObserverRef.current = Observer.create({
        target: window,
        type: "wheel",
        onChangeY: (self) => {
          // 下にスクロール = 次の動画
          if (self.deltaY > 0) {
            moveToNext();
          }
          // 上にスクロール = 前の動画
          else if (self.deltaY < 0) {
            moveToPrev();
          }
        },
        tolerance: 10, // 小さな動きは無視
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (wheelObserverRef.current) {
        wheelObserverRef.current.kill();
        wheelObserverRef.current = null;
      }
    };
  }, [videoList.length]);

  // 動画のアスペクト比を検出
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function handleLoadedMetadata() {
      const aspectRatio = video.videoWidth / video.videoHeight;
      setIsLandscape(aspectRatio >= 1); // 横型（1以上）か縦型（1未満）か
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    // 既にメタデータが読み込まれている場合
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [selectedVideo]);

  // wrapper全体を動かして中央のmainが画面のy座標中心に配置
  useEffect(() => {
    const isFirstRender = isFirstMainWrapperRenderRef.current;
    const delay = isFirstRender ? 200 : 100; // prev/nextのレンダリングを待つため少し長めに
    
    const handleResize = () => {
      updateMainWrapperPosition(true);
    };
    
    const timeoutId = setTimeout(() => {
      // 複数のrequestAnimationFrameで確実にDOMがレンダリングされるまで待つ
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // selectedIndexが変更された時は常にアニメーション、初回レンダリング時のみ即座に設定
          const shouldAnimate = !isFirstRender;
          updateMainWrapperPosition(shouldAnimate);
          isFirstMainWrapperRenderRef.current = false;
        });
      });
    }, delay);
    
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
     
  }, [selectedIndex]);

  // 選択中のボタン（サムネイル）にlineをアニメーション
  useEffect(() => {
    // DOMが更新された後に実行（初回は少し遅延を入れて確実にレンダリング完了後に実行）
    const isFirstRender = isFirstRenderRef.current;
    const delay = isFirstRender ? 100 : 0;
    
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        updateLine();
      });
    }, delay);
    
    window.addEventListener("resize", updateLine);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateLine);
      if (lineAnimationRef.current) {
        lineAnimationRef.current.kill();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  if (videoList.length === 0) {
    return (
      <main className="list-page">
        <div className="list-page__empty">
          <p>動画がありません（Prismic の mov を確認してください）</p>
        </div>
      </main>
    );
  }

  // 前後の動画を取得（最初の動画はprevなし、最後の動画はnextなし）
  const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : null;
  const nextIndex = selectedIndex < videoList.length - 1 ? selectedIndex + 1 : null;
  const prevVideo = prevIndex !== null ? videoList[prevIndex] || null : null;
  const nextVideo = nextIndex !== null ? videoList[nextIndex] || null : null;

  return (
    <main className="list-page">
      <div className="list-page__container">
        {/* main要素のwrapper */}
        <div ref={mainWrapperRef} className="list-page__main-wrapper">
          {/* 前の動画 */}
          {prevVideo && (
            <div className="list-page__main list-page__main--prev">
              <div className="list-page__video-wrapper list-page__video-wrapper--prev">
                <video
                  src={prevVideo.src}
                  loop
                  muted
                  playsInline
                  poster={prevVideo.thumb ?? undefined}
                  className="list-page__video"
                />
              </div>
            </div>
          )}

          {/* 中央: 選択中の動画表示 */}
          <div ref={mainRef} className="list-page__main">
            {selectedVideo && (
              <>
                <div className={`list-page__video-wrapper ${isLandscape ? "list-page__video-wrapper--landscape" : "list-page__video-wrapper--portrait"}`}>
                  <video
                    ref={videoRef}
                    src={selectedVideo.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={selectedVideo.thumb ?? undefined}
                    className="list-page__video"
                  />
                </div>
                <div className="list-page__info">
                  {selectedVideo.date && (
                    <div className="list-page__date">{formatDate(selectedVideo.date)}</div>
                  )}
                  <div className="list-page__source">Shot on iPhone 17 pro</div>
                </div>
              </>
            )}
          </div>

          {/* 次の動画 */}
          {nextVideo && (
            <div className="list-page__main list-page__main--next">
              <div className="list-page__video-wrapper list-page__video-wrapper--next">
                <video
                  src={nextVideo.src}
                  loop
                  muted
                  playsInline
                  poster={nextVideo.thumb ?? undefined}
                  className="list-page__video"
                />
              </div>
            </div>
          )}
        </div>

        {/* 右側: アイテムリスト */}
        <div className="list-page__sidebar" ref={sidebarRef}>
          <div className="list-page__list" ref={listRef}>
            {videoList.map((video, idx) => (
              <button
                key={video.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                className={`list-page__item ${idx === selectedIndex ? "list-page__item--active" : ""}`}
                onClick={() => {
                  // アニメーション中は何もしない
                  if (isAnimatingRef.current) return;
                  setSelectedIndex(idx);
                }}
                aria-pressed={idx === selectedIndex}
              >
                {video.thumb ? (
                  <img src={video.thumb} alt="" className="list-page__thumb" />
                ) : (
                  <div className="list-page__thumb-placeholder" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="list-page_line" ref={lineRef}></div>
      </div>
    </main>
  );
}
