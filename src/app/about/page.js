import AboutCanvas from '../../components/AboutCanvas';
import '../globals.css';
import '../2D.css';

export default function About() {
    return (
        <main>
            <AboutCanvas>
                <div id="hero-section">
                    <h1 className="hero-text">FUMI</h1>
                </div>
            </AboutCanvas>
        </main>
    );
}
