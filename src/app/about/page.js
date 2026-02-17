import AboutCanvas from '../../components/AboutCanvas';
import '../globals.css';
import '../2D.css';

export default function About() {
    return (
        <main>
            <AboutCanvas>
                <section>
                    <div className="corner-element title">
                        <div className="switch">
                            <a href="/" className="btn-2D">2D</a>
                            <a href="/3D" className="btn-3D">3D</a>
                        </div>
                        <a href="/about">RYOTAROABE</a>
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

                <div id="hero-section">
                    <h1 className="hero-text">RYOTAROABE</h1>
                </div>
            </AboutCanvas>
        </main>
    );
}
