"use client";

import { useEffect, useState, useRef } from "react";
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
  const containerRef = useRef(null);
  const imagesRef = useRef(null);
  const rightTextsRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const timelineRef = useRef(null);

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

      const fadeInTime = index * 1.0;
      const fadeOutTime = fadeInTime + 0.8;

      tl.to(
        wrapper,
        {
          maskImage: "linear-gradient(transparent -25%, #000 0%, #000 100%)",
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
        },
        fadeInTime
      ).to(
        wrapper,
        {
          duration: 0.8,
          ease: "power2.inOut",
        },
        fadeOutTime
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

    // 画像が切り替わるタイミングでテキストも切り替え
    for (let index = 0; index < imageCount; index++) {
      const fadeInTime = index * 1.0;
      const prevIdx = (index - 1 + RIGHT_TEXTS.length) % RIGHT_TEXTS.length;
      const currIdx = index % RIGHT_TEXTS.length;
      tl.to(
        textEls[prevIdx],
        { opacity: 0, duration: 0.25, ease: "power2.inOut" },
        fadeInTime
      );
      tl.to(
        textEls[currIdx],
        { opacity: 1, duration: 0.4, ease: "power2.inOut" },
        fadeInTime + 0.1
      );
    }
  }

  // Tutorial 037風: 時間経過で画像をフェードイン/アウト + テキスト同期
  useEffect(() => {
    if (images.length === 0 || !imagesRef.current) return;

    const imageElements = imagesRef.current.querySelectorAll(".load-page__image-wrapper");
    if (imageElements.length === 0) return;

    const tl = gsap.timeline({ repeat: -1 });
    timelineRef.current = tl;

    imageAnimation(tl);
    textAnimation(tl, imageElements.length);

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [images.length]);

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
      // checkAndHide();
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
            {images.length > 0 ? (
              images.map((imgUrl, index) => (
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
          <div className="load-page__info">
            <div className="load-page__date">17/2/26</div>
            <div className="load-page__source">Shot on iPhone 17 Pro</div>
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
