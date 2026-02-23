import AboutCanvas from '@/components/AboutCanvas';
import AboutPageClient from '@/components/AboutPageClient';
import '../globals.css';

export default function About() {
    return (
        <AboutCanvas>
            <AboutPageClient />
        </AboutCanvas>
    );
}
