import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface HeroSectionProps {
  maragaImage?: string;
}

const HeroSection = ({ maragaImage }: HeroSectionProps) => {
  return (
    <section className="gradient-hero py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-primary-foreground">
            <div className="inline-block px-3 py-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full text-sm mb-6">
              Presidential Candidate 2027
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-2">
              Reset.
            </h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-2">
              Restore.
            </h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight text-accent mb-6">
              Rebuild.
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg">
              Join David Maraga's vision for a better Kenya. Together, we can restore integrity, 
              rebuild our institutions, and reset our nation's course toward prosperity and justice.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="btn-movement bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8">
                <Link to="/join">Join the Movement</Link>
              </Button>
              <Button asChild size="lg" className="btn-donate rounded-full px-8">
                <Link to="/donate">Contribute Now</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Candidate Card */}
          <div className="flex justify-center md:justify-end">
            <div className="bg-card rounded-2xl shadow-elevated overflow-hidden max-w-sm">
              {/* Image Placeholder - Green gradient with initials */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center relative">
                {maragaImage ? (
                  <img 
                    src={maragaImage} 
                    alt="David Maraga" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-heading font-bold text-primary/30">DM</div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-6 bg-primary text-primary-foreground">
                <h3 className="text-xl font-bold mb-1">David Maraga</h3>
                <p className="text-primary-foreground/80 text-sm">
                  Former Chief Justice of Kenya
                </p>
                <p className="text-primary-foreground/80 text-sm">
                  Presidential Candidate, 2027
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
