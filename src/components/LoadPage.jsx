"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import "../app/load.css";

/**
 * ロードページ（Figmaデザイン準拠）
 * Tutorial 037風のグラデーションマスクを使ったフェーディングトランジション
 * 時間経過で画像が切り替わる（スクロールではなく）
 */
export default function LoadPage({ images = [], onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);
  const imagesRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const timelineRef = useRef(null);

  // Tutorial 037風: 時間経過で画像をフェードイン/アウト（グラデーションマスク）
  useEffect(() => {
    if (images.length === 0 || !imagesRef.current) return;

    const imageElements = imagesRef.current.querySelectorAll(".load-page__image-wrapper");
    if (imageElements.length === 0) return;

    // タイムラインを作成
    const tl = gsap.timeline({ repeat: -1 }); // 無限ループ
    timelineRef.current = tl;

    imageElements.forEach((wrapper, index) => {
      const img = wrapper.querySelector(".load-page__image");
      if (!img) return;

      // 最初の画像は即座に表示
      if (index === 0) {
        gsap.set(wrapper, { opacity: 1 });
      } else {
        gsap.set(wrapper, { opacity: 0 });
      }

      // 各画像のフェードイン/アウト（1秒ごと）
      const fadeInTime = index * 1.0; // 1秒間隔
      const fadeOutTime = fadeInTime + 0.8; // 0.8秒表示後フェードアウト

      tl.to(
        wrapper,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
        },
        fadeInTime
      )
        .to(
          wrapper,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
          },
          fadeOutTime
        );
    });

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
        // タイムラインを停止
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
        // 上に上がるアニメーション（barba.js風）
        gsap.to(container, {
          y: "-100%",
          duration: 1.2,
          ease: "power4.inOut",
          onComplete: () => {
            setIsVisible(false);
            if (onComplete) onComplete();
          },
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

        {/* 右: WHO IS FUMI */}
        <div className="load-page__right">WHO IS FUMI</div>
      </div>
    </div>
  );
}
