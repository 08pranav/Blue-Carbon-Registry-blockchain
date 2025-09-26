import HeroSection from "@/components/HeroSection";
import DataUploadForm from "@/components/DataUploadForm";
import RegistryDashboard from "@/components/RegistryDashboard";
import CarbonCreditsTracker from "@/components/CarbonCreditsTracker";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <RegistryDashboard />
      <DataUploadForm />
      <CarbonCreditsTracker />
    </div>
  );
};

export default Index;