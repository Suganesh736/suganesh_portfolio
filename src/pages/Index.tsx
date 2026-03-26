import { AdminProvider } from "@/context/AdminContext";
import PasswordDialog from "@/components/PasswordDialog";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import InternshipSection from "@/components/InternshipSection";
import MarksheetSection from "@/components/MarksheetSection";
import DownloadSection from "@/components/DownloadSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => (
  <AdminProvider>
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <InternshipSection />
      <MarksheetSection />
      <DownloadSection />
      <ContactSection />
      <Footer />
      <PasswordDialog />
    </div>
  </AdminProvider>
);

export default Index;
