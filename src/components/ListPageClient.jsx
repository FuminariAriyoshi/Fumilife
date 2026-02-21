"use client";

import { useState, useEffect, useLayoutEffect, useRef, useContext } from "react";
import { LoadContext } from "@/components/LoadPageWrapper";
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
  const [hasSelectedVideo, setHasSelectedVideo] = useState(false); // 初回選択前はfalse
  const [entranceDone, setEntranceDone] = useState(false); // サムネ entrance アニメ完了後は true（初回表示のチラつき防止）
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
  const clickPositionRef = useRef(null); // 初回選択時のクリック位置 { x, y }
  const hasRunInitialListEntranceRef = useRef(false); // list の y:100vh→0 はマウント時1回だけ
  const isLoadComplete = useContext(LoadContext);

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
    
    // DOMが完全にレンダリングされるまで待つ（複数のrequestAnimationFrameで確実に）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const mainRect = main.getBoundingClientRect();
        const mainHeight = mainRect.height;
        const mainTop = mainRect.top;
        const mainCenterY = mainTop + mainHeight / 2;
        
        // 画面の中心位置
        const viewportHeight = window.innerHeight;
        const viewportCenterY = viewportHeight / 2;
        
        // 必要な移動距離を計算（現在の位置から直接計算）
        const currentTranslateY = parseFloat(gsap.getProperty(wrapper, "y")) || 0;
        const targetTranslateY = currentTranslateY + (viewportCenterY - mainCenterY);
        
        // wrapper全体を動かしてmainが画面の中心に来るように（GSAPでアニメーション）
        gsap.to(wrapper, {
          y: targetTranslateY,
          duration: animate ? 0.6 : 0,
          ease: "power2.inOut",
        });
      });
    });
  }

  /**
   * 選択中のボタンにlineとsidebarを更新（hasSelectedVideo時のみ有効）
   */
  function updateLine() {
    if (!hasSelectedVideo) return;
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

  // ListPageClient が読み込まれたときだけ: list を y:100vh→0、各サムネを y:100→0 でスタガー（初回1回のみ）
  useLayoutEffect(() => {
    if (!isLoadComplete || hasSelectedVideo || videoList.length === 0) return;
    if (hasRunInitialListEntranceRef.current) return;
    hasRunInitialListEntranceRef.current = true;

    const id = requestAnimationFrame(() => {
      const withIds = videoList
        .map((video, idx) => {
          const btn = itemRefs.current[idx];
          const inner = btn?.querySelector(".list-page__thumb, .list-page__thumb-placeholder");
          return inner ? { el: inner, id: video.id } : null;
        })
        .filter(Boolean);
      if (!withIds.length) return;
      const sorted = [...withIds].sort((a, b) => {
        const na = Number(a.id);
        const nb = Number(b.id);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return nb - na;
        return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
      });
      const inners = sorted.map(({ el }) => el);
      const listEl = listRef.current;
      const duration = 2.5;
      const ease = "expo.out";

      const tl = gsap.timeline({
        onComplete: () => setEntranceDone(true),
      });
      tl.fromTo(
        inners,
        { y: 100 },
        {
          y: 0,
          duration,
          ease,
          stagger: { each: 0.05, from: "start" },
        },
        "<"
      );
      if (listEl) {
        tl.fromTo(listEl, { y: window.innerHeight }, { y: 0, duration, ease }, "<");
      }
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when load completes; videoList used inside for id order
  }, [isLoadComplete, hasSelectedVideo, videoList.length]);

  // GLID→LIST 遷移時: hasSelectedVideo が false に戻ったら ref をリセット（sideInitialAnimation を再実行可能に）
  useEffect(() => {
    if (!hasSelectedVideo && hasRunInitialListEntranceRef.current) {
      hasRunInitialListEntranceRef.current = false;
    }
  }, [hasSelectedVideo]);

  // wrapper全体を動かして中央のmainが画面のy座標中心に配置（選択済みのときのみ）
  useEffect(() => {
    if (!hasSelectedVideo) return;

    const isFirstRender = isFirstMainWrapperRenderRef.current;
    
    const handleResize = () => {
      updateMainWrapperPosition(true);
    };
    
    // 初回は entrance アニメ完了後に合わせて遅延（重ならないように）
    const timeoutId = setTimeout(() => {
      const shouldAnimate = !isFirstRender;
      updateMainWrapperPosition(shouldAnimate);
      isFirstMainWrapperRenderRef.current = false;
    }, isFirstRender ? 900 : 50);
    
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [hasSelectedVideo, selectedIndex]);

  // 初回選択時: mainを下から表示 + サムネイルをクリック位置からスタガーで移動（paint前に開始位置をセットするため useLayoutEffect）
  useLayoutEffect(() => {
    if (!hasSelectedVideo || !clickPositionRef.current) return;

    const wrapper = mainWrapperRef.current;
    const main = mainRef.current;
    const container = document.querySelector(".list-page__container");
    const items = itemRefs.current.filter(Boolean);

    if (!wrapper || !main || !container) return;

    const viewportHeight = window.innerHeight;
    const viewportCenterY = viewportHeight / 2;

    // 目標の wrapper y を計算（main が y=0 のときの main 中心から）
    const mainRect = main.getBoundingClientRect();
    const mainCenterY = mainRect.top + mainRect.height / 2;
    const targetWrapperY = viewportCenterY - mainCenterY;

    container.classList.add("list-page__container--overflow-hidden");
    gsap.killTweensOf(wrapper);
    gsap.set(wrapper, { y: viewportHeight });

    // 各アイテムの目標位置を取得（fixed にする前にリスト高さを保持）
    const list = listRef.current;
    const sidebar = sidebarRef.current;
    const listHeight = list ? list.getBoundingClientRect().height : 0;
    if (list) gsap.set(list, { minHeight: listHeight });

    // 初回選択のみ: list を right 13%・選択が中央になる y へ移動（stagger は既存の items アニメで実施）
    if (list && sidebar) {
      const viewportWidth = window.innerWidth;
      const listRect = list.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const targetLeft = viewportWidth * (1 - 0.13) - sidebarRect.width;
      const targetTop = viewportCenterY - listRect.height / 2;
      const deltaX = targetLeft - listRect.left;
      const deltaY = targetTop - listRect.top;
      gsap.killTweensOf(list);
      gsap.to(list, {
        x: deltaX,
        y: deltaY,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }

    const clickX = clickPositionRef.current.x;
    const clickY = clickPositionRef.current.y;
    const targetRects = items.map((el) => el.getBoundingClientRect());

    items.forEach((el, i) => {
      gsap.killTweensOf(el);
      const r = targetRects[i];
      if (!r) return;
      gsap.set(el, {
        position: "fixed",
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        zIndex: 1000,
      });
    });

    // クリック位置に一瞬移す（スタガー用の開始位置）
    items.forEach((el, i) => {
      const r = targetRects[i];
      if (!r) return;
      gsap.set(el, {
        left: clickX - r.width / 2,
        top: clickY - r.height / 2,
      });
    });

    const mainDuration = 0.7;
    const mainEase = "power2.out";

    gsap.to(wrapper, {
      y: targetWrapperY,
      duration: mainDuration,
      ease: mainEase,
    });

    gsap.to(items, {
      left: (i) => targetRects[i].left,
      top: (i) => targetRects[i].top,
      duration: 0.5,
      stagger: { from: selectedIndex, amount: 0.12 },
      ease: "power2.out",
      onComplete: () => {
        items.forEach((el) => {
          gsap.set(el, { clearProps: "all" });
        });
        if (listRef.current) {
          gsap.set(listRef.current, { clearProps: "minHeight,x,y" });
        }
        container.classList.remove("list-page__container--overflow-hidden");
        clickPositionRef.current = null;
        // list の transform をクリアしたので、sidebar を選択ボタン中央に再計算
        requestAnimationFrame(() => {
          const activeButton = document.querySelector(".list-page__item--active");
          if (activeButton && sidebarRef.current) {
            sidebarAnimation(activeButton, false);
            lineAnimation(activeButton, false);
          }
        });
      },
    });
    // 初回選択時のみ実行。selectedIndex はクリック時の値を意図的に使用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelectedVideo]);

  // 選択中のボタン（サムネイル）にlineをアニメーション
  useEffect(() => {
    if (!hasSelectedVideo) return;
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
  }, [hasSelectedVideo, selectedIndex]);

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

  // id 昇順で 01, 02, ... の表示番号を付与（id が一番小さい = 01）
  const sortedById = [...videoList].sort((a, b) => {
    const na = Number(a.id);
    const nb = Number(b.id);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  });
  const getDisplayNumber = (video) => {
    const i = sortedById.findIndex((v) => v.id === video.id);
    return String(i + 1).padStart(2, "0");
  };

  return (
    <main className="list-page">
      <div className={`list-page__container ${!hasSelectedVideo ? "list-page__container--pre-selection" : ""}`}>
        {/* main要素のwrapper（初回選択まで非表示） */}
        <div
          ref={mainWrapperRef}
          className={`list-page__main-wrapper ${!hasSelectedVideo ? "list-page__main-wrapper--hidden" : ""}`}
        >
          {/* 前の動画（常に表示、存在しない場合は高さ0で非表示） */}
          <div className={`list-page__main list-page__main--prev ${!prevVideo ? "list-page__main--hidden" : ""}`}>
            {prevVideo && (
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
            )}
          </div>

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
                  <div className="list-page__date">
                    {selectedVideo.postedOn?.trim() || (selectedVideo.date ? formatDate(selectedVideo.date) : "")}
                  </div>
                  <div className="list-page__source">
                    Shot on <span className="list-page__source-value">{selectedVideo.shotOn?.trim() || "iPhone 17 Pro"}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 次の動画（常に表示、存在しない場合は高さ0で非表示） */}
          <div className={`list-page__main list-page__main--next ${!nextVideo ? "list-page__main--hidden" : ""}`}>
            {nextVideo && (
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
            )}
          </div>
        </div>

        {/* 右側: アイテムリスト（番号 + media 写真） */}
        <div
          className={`list-page__sidebar ${!hasSelectedVideo ? "list-page__sidebar--pre-selection" : ""} ${isLoadComplete && !hasSelectedVideo && !entranceDone ? "list-page__sidebar--entrance-pending" : ""}`}
          ref={sidebarRef}
        >
          <ul className="list-page__list" ref={listRef}>
            {videoList.map((video, idx) => (
              <li key={video.id}>
                <button
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  className={`list-page__item ${idx === selectedIndex ? "list-page__item--active" : ""}`}
                  onClick={(e) => {
                    if (isAnimatingRef.current) return;
                    if (!hasSelectedVideo) {
                      clickPositionRef.current = { x: e.clientX, y: e.clientY };
                      setSelectedIndex(idx);
                      setHasSelectedVideo(true);
                    } else {
                      setSelectedIndex(idx);
                    }
                  }}
                  aria-pressed={idx === selectedIndex}
                >
                  <span>{getDisplayNumber(video)}</span>
                  <span className="list-page__item-title">{video.title ?? ""}</span>
                  <span className="medias">
                    {video.thumb ? (
                      <img src={video.thumb} alt="" className="media list-page__thumb" />
                    ) : (
                      <div className="list-page__thumb-placeholder" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={`list-page_line ${!hasSelectedVideo ? "list-page_line--hidden" : ""}`} ref={lineRef}></div>
      </div>
    </main>
  );
}
