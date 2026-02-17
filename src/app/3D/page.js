import ThreeCanvas from '../../components/ThreeCanvas';
import TransitionLink from '../../components/TransitionLink';
import '../globals.css';
import '../2D.css';

export default function ThreeDPage() {
    return (
        <main>

            <ThreeCanvas>
                <section>
                    <div className="corner-element title">
                        <div className="switch">
                            <TransitionLink href="/" className="btn-2D">2D</TransitionLink>
                            <TransitionLink href="/3D" className="btn-3D">3D</TransitionLink>
                        </div>
                        <TransitionLink href="/about">RYOTAROABE</TransitionLink>
                    </div>

                    <div className="corner-element sns">
                        <ul className="sns-list">
                            <li><a href="https://www.instagram.com/ryo_taro.__" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li><a href="https://www.youtube.com/@ryo_taro_07" target="_blank" rel="noopener noreferrer">Youtube</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">X</a></li>
                        </ul>
                    </div>

                    <div className="corner-element info">
                        <span className="year">2026</span>
                        <div className="concept">
                            <div>concept</div>
                            <div>description</div>
                        </div>
                    </div>
                </section>

                <h1 className="text active">WATER</h1>
                <h1 className="text">DRAGON</h1>
                <h1 className="text">MACHINE</h1>

                <div className="explore-container">
                    <div className="explore-wrapper">
                        <h2 className="explore">EXPLORE</h2>
                    </div>
                    <div className="arrow-wrapper">
                        <svg className="arrow" width="22" height="24" viewBox="0 0 22 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4821 0V23M10.4821 23L0.0703125 12.7197M10.4821 23L21.0703 13.7652" />
                        </svg>
                    </div>
                </div>

                <section id="img-explore">
                    <div id="img-viewer" className="img-viewer hidden">
                        <div id="waterImage" className="img-wrapper">
                            <div className="images-slider">
                                <img className="viewer-content" src="/pdfs/water.jpg" alt="Water Details" />
                                <img className="viewer-content" src="/pdfs/water2.jpg" alt="Water Details" />
                            </div>
                        </div>
                        <div id="dragonImage" className="img-wrapper">
                            <div className="images-slider">
                                <img className="viewer-content" src="/pdfs/dragon.jpg" alt="Dragon Details" />
                            </div>
                        </div>
                        <div id="machineImage" className="img-wrapper">
                            <div className="images-slider">
                                <img className="viewer-content" src="/pdfs/machine.jpg" alt="Machine Details" />
                            </div>
                        </div>
                    </div>

                    <div className="page-indicator">
                        <span id="current-page">1</span>
                    </div>

                    <div className="progress">
                        <div className="progress-bar"></div>
                    </div>

                    <div className="overview">
                        <div className="overview-line"></div>
                        <div id="waterOverview" className="overview-content">
                            <img className="overview-img" src="/pdfs/water.jpg" alt="Water Details" />
                            <img className="overview-img" src="/pdfs/water2.jpg" alt="Water Details" />
                        </div>
                        <div id="dragonOverview" className="overview-content">
                            <img className="overview-img" src="/pdfs/dragon.jpg" alt="Dragon Details" />
                        </div>
                        <div id="machineOverview" className="overview-content">
                            <img className="overview-img" src="/pdfs/machine.jpg" alt="Machine Details" />
                        </div>
                    </div>
                </section>
            </ThreeCanvas>
        </main>
    );
}
