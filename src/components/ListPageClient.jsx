"use client";

import { useState, useEffect } from "react";
import "../app/list/list.css";

/**
 * Listページ: 右側にアイテムリスト、中央に選択中の動画を表示（Figmaデザイン準拠）。
 */
export default function ListPageClient({ videos = [] }) {
  const videoList = Array.isArray(videos) ? videos : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVideo = videoList[selectedIndex] || null;

  // 日付フォーマット（例: "17/2/26"）
  const formatDate = (dateString) => {
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
  };

  useEffect(() => {
    if (videoList.length > 0 && selectedIndex >= videoList.length) {
      setSelectedIndex(0);
    }
  }, [videoList.length, selectedIndex]);

  if (videoList.length === 0) {
    return (
      <main className="list-page">
        <div className="list-page__empty">
          <p>動画がありません（Prismic の mov を確認してください）</p>
        </div>
      </main>
    );
  }

  return (
    <main className="list-page">
      <div className="list-page__container">
        {/* 中央: 選択中の動画表示 */}
        <div className="list-page__main">
          {selectedVideo && (
            <>
              <div className="list-page__video-wrapper">
                <video
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

        {/* 右側: アイテムリスト */}
        <div className="list-page__sidebar">
          <div className="list-page__list">
            {videoList.map((video, idx) => (
              <button
                key={video.id}
                type="button"
                className={`list-page__item ${idx === selectedIndex ? "list-page__item--active" : ""}`}
                onClick={() => setSelectedIndex(idx)}
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

        <div className="list-page_line"></div>
      </div>
    </main>
  );
}
