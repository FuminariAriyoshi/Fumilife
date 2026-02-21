"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { runLoadPageLeave } from "@/lib/barbaTransition";
import "../app/load.css";

const RIGHT_TEXTS = ["WHO FUMI IS", "WHAT FUMI VALUES", "HOW FUMI THINKS"];

/**
 * ロードページ（Figmaデザイン準拠）
 * Tutorial 037風のグラデーションマスクを使ったフェーディングトランジション
 * 時間経過で画像が切り替わる（スクロールではなく）
 */
export default function LoadPage({ images = [], onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const imagesRef = useRef(null);
  const rightTextsRef = useRef(null);
  const infoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const timelineRef = useRef(null);
  
  // アニメーションタイミング管理（一括管理）
  // 画像切り替えテンポ（秒）を変更すると、他のdurationも自動計算される
  const durationTime = 2.0; // 画像切り替えの間隔（メインのテンポ）
  
  // durationTimeから計算される比率（画像切り替えテンポに応じて自動調整）
  const fadeInRatio = 0.8; // フェードインの比率（80%）
  const fadeOutRatio = 0.8; // フェードアウトの比率（80%）
  const textFadeRatio = 0.25; // テキストフェードの比率（25%）
  const infoFadeOutRatio = 0.2; // メタデータフェードアウトの比率（20%）
  const infoFadeInRatio = 0.3; // メタデータフェードインの比率（30%）
  
  // 計算されたduration
  const fadeInDuration = durationTime * fadeInRatio;
  const fadeOutDuration = durationTime * fadeOutRatio;
  const textFadeDuration = durationTime * textFadeRatio;
  const infoFadeDuration = durationTime * infoFadeOutRatio;
  const infoFadeInDuration = durationTime * infoFadeInRatio;

  // 画像URLの配列とメタデータの配列を分離（メモ化）
  const imageUrls = useMemo(
    () => images.map((img) => (typeof img === "string" ? img : img.url)),
    [images]
  );
  const imageMetas = useMemo(
    () =>
      images.map((img) => ({
        postedOn: typeof img === "object" ? img.postedOn : null,
        shotOn: typeof img === "object" ? img.shotOn : null,
      })),
    [images]
  );

  function imageAnimation(tl) {
    const imageElements = imagesRef.current?.querySelectorAll(".load-page__image-wrapper");
    if (!imageElements?.length) return;

    imageElements.forEach((wrapper, index) => {
      const img = wrapper.querySelector(".load-page__image");
      if (!img) return;

      if (index === 0) {
        gsap.set(wrapper, { opacity: 1 });
      } else {
        gsap.set(wrapper, { opacity: 0 });
      }

      const switchTime = index * durationTime;
      const fadeOutStartTime = switchTime + fadeInDuration;

      tl.to(
        wrapper,
        {
          maskImage: "linear-gradient(transparent -25%, #000 0%, #000 100%)",
          opacity: 1,
          duration: fadeInDuration,
          ease: "power2.inOut",
        },
        switchTime
      ).to(
        wrapper,
        {
          opacity: 0,
          duration: fadeOutDuration,
          ease: "power2.inOut",
        },
        fadeOutStartTime
      );
    });
  }

  function textAnimation(tl, imageCount) {
    const textEls = rightTextsRef.current?.querySelectorAll(".load-page__right");
    if (!textEls || textEls.length !== RIGHT_TEXTS.length) return;

    // テキスト初期状態: 1本目だけ表示
    gsap.set(textEls[0], { opacity: 1 });
    gsap.set(textEls[1], { opacity: 0 });
    gsap.set(textEls[2], { opacity: 0 });

    // 画像が切り替わるタイミングでテキストも切り替え（durationTimeで管理）
    for (let index = 0; index < imageCount; index++) {
      const switchTime = index * durationTime;
      const prevIdx = (index - 1 + RIGHT_TEXTS.length) % RIGHT_TEXTS.length;
      const currIdx = index % RIGHT_TEXTS.length;
      tl.to(
        textEls[prevIdx],
        { opacity: 0, duration: textFadeDuration, ease: "power2.inOut" },
        switchTime
      );
      tl.to(
        textEls[currIdx],
        { opacity: 1, duration: textFadeDuration, ease: "power2.inOut" },
        switchTime
      );
    }
  }

  function infoAnimation(tl, imageCount) {
    if (!infoRef.current || imageMetas.length === 0) return;

    const dateEl = infoRef.current.querySelector(".load-page__date");
    const sourceValueEl = infoRef.current.querySelector(".load-page__source-value");

    if (!dateEl || !sourceValueEl) return;

    // 初期状態: 最初の画像のメタデータを表示
    const firstMeta = imageMetas[0];
    dateEl.textContent = firstMeta.postedOn?.trim() || "17/2/26";
    sourceValueEl.textContent = firstMeta.shotOn?.trim() || "iPhone 17 Pro";

    // 画像が切り替わるタイミングでメタデータも切り替え（durationTimeで管理）
    for (let index = 0; index < imageCount; index++) {
      const switchTime = index * durationTime;
      const meta = imageMetas[index % imageMetas.length];

      tl.call(
        () => {
          setCurrentIndex(index % imageMetas.length);
          // フェードアウト → テキスト変更 → フェードイン（値の部分だけ）
          gsap.to([dateEl, sourceValueEl], {
            opacity: 0,
            duration: infoFadeDuration,
            ease: "power2.inOut",
            onComplete: () => {
              dateEl.textContent = meta.postedOn?.trim() || "17/2/26";
              sourceValueEl.textContent = meta.shotOn?.trim() || "iPhone 17 Pro";
              gsap.to([dateEl, sourceValueEl], {
                opacity: 1,
                duration: infoFadeInDuration,
                ease: "power2.inOut",
              });
            },
          });
        },
        null,
        switchTime
      );
    }
  }

  // Tutorial 037風: 時間経過で画像をフェードイン/アウト + テキスト同期 + メタデータ同期
  useEffect(() => {
    if (imageUrls.length === 0 || !imagesRef.current) return;

    const imageElements = imagesRef.current.querySelectorAll(".load-page__image-wrapper");
    if (imageElements.length === 0) return;

    const tl = gsap.timeline({ repeat: -1 });
    timelineRef.current = tl;

    imageAnimation(tl);
    textAnimation(tl, imageElements.length);
    infoAnimation(tl, imageElements.length);

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [imageUrls.length, imageMetas.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const minDisplayTime = 3000; // 最低3秒
    const checkAndHide = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
        // barba の once 相当: ロード画面用 leave
        runLoadPageLeave(container).then(() => {
          setIsVisible(false);
          if (onComplete) onComplete();
        });
      }, remaining);
    };

    // ページ読み込み完了を待つ
    if (document.readyState === "complete") {
      checkAndHide();
    } else {
      window.addEventListener("load", checkAndHide);
      return () => window.removeEventListener("load", checkAndHide);
    }
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="load-page">
      <div className="load-page__content">
        {/* 左: FUMILIFE */}
        <div className="load-page__left">FUMILIFE</div>

        {/* 中央: 画像またはプレースホルダー（Tutorial 037風） */}
        <div className="load-page__center">
          <div className="load-page__placeholder" ref={imagesRef}>
            {imageUrls.length > 0 ? (
              imageUrls.map((imgUrl, index) => (
                <div key={index} className="load-page__image-wrapper">
                  <img src={imgUrl} alt="" className="load-page__image" />
                </div>
              ))
            ) : (
              <div className="load-page__image-wrapper">
                <div className="load-page__image-placeholder" />
              </div>
            )}
          </div>
          <div ref={infoRef} className="load-page__info">
            <div className="load-page__date">
              {imageMetas[0]?.postedOn?.trim() || "17/2/26"}
            </div>
            <div className="load-page__source">
              Shot on <span className="load-page__source-value">{imageMetas[0]?.shotOn?.trim() || "iPhone 17 Pro"}</span>
            </div>
          </div>
        </div>

        {/* 右: 画像切り替えに同期してテキストアニメーション */}
        <div ref={rightTextsRef} className="load-page__right-container">
          {RIGHT_TEXTS.map((line) => (
            <div key={line} className="load-page__right">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
