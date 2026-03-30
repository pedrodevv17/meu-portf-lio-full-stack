import { Header } from "@/components/portfolio/header"
import { HeroSection } from "@/components/portfolio/hero-section"
import { AboutSection } from "@/components/portfolio/about-section"
import { TechnologiesSection } from "@/components/portfolio/technologies-section"
import { ProjectsSection } from "@/components/portfolio/projects-section"
import { ContactSection } from "@/components/portfolio/contact-section"
import { Footer } from "@/components/portfolio/footer"

export default function Portfolio() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <TechnologiesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
