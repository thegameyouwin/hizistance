import { Youtube, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const YouTubeSection = () => {
  const videos = [
    {
      id: 1,
      title: "UGJA Party Young Aspirants Convention in Kakamega County",
      description: "The youth took to the stage for a vibrant and groundbreaking youth convention.",
      date: "October 2, 2024",
      thumbnail: null,
    },
    {
      id: 2,
      title: "The Clarion Caravan is coming to your county",
      description: "Join us as we bring the message of hope and change across Kenya.",
      date: "September 2024",
      thumbnail: null,
    },
    {
      id: 3,
      title: "UGJA Party Young Aspirants Convention Media Address",
      description: "Key takeaways from the historic UGJA Youth Wing gathering.",
      date: "October 4, 2024",
      thumbnail: null,
    },
  ];

  return (
    <section className="py-16 md:py-24 gradient-hero">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full mb-4">
            <Youtube className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">Video Updates</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            From Our YouTube Channel
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Stay connected with our latest speeches, policy discussions, and campaign 
            updates directly from the field.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="bg-card rounded-xl overflow-hidden shadow-card group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/50 relative flex items-center justify-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-2">{video.date}</p>
                <h4 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {video.description}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline"
                >
                  Watch on YouTube
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8"
          >
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Youtube className="w-5 h-5" />
              Subscribe to our channel
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
