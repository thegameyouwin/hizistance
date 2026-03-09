import { Construction, Clock } from "lucide-react";
import maragaLogo from "@/assets/maraga-logo.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[hsl(215,50%,12%)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <img src={maragaLogo} alt="Maraga 2027" className="h-16 mx-auto" />

        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/20 flex items-center justify-center mx-auto">
            <Construction className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Site Under Maintenance
          </h1>

          <p className="text-white/60 text-lg leading-relaxed">
            We're currently performing scheduled maintenance to improve your experience.
            Please check back shortly.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
          <Clock className="w-4 h-4" />
          <span>We'll be back soon</span>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/30 text-xs">
            Maraga 2027 Campaign • Reset. Restore. Rebuild.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
