import { Youtube, ExternalLink, Calendar, Play } from "lucide-react";
import { Button } from "./ui/button";

const YouTubeSection = () => {
  const videos = [
    {
      id: 1,
      title: "UGJA Party Young Aspirants Convention in Kakamega County",
      description: "The youth took to the stage for a vibrant and groundbreaking youth convention.",
      date: "October 2, 2024",
      youtubeId: "D-nmIF1JcL4",
      thumbnail: "https://img.youtube.com/vi/D-nmIF1JcL4/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=D-nmIF1JcL4"
    },
    {
      id: 2,
      title: "The Clarion Caravan is coming to your county",
      description: "Join us as we bring the message of hope and change across Kenya.",
      date: "September 2024",
      youtubeId: "JS6rAgjfezA",
      thumbnail: "https://img.youtube.com/vi/JS6rAgjfezA/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=JS6rAgjfezA"
    },
    {
      id: 3,
      title: "UGJA Party Young Aspirants Convention Media Address",
      description: "Key takeaways from the historic UGJA Youth Wing gathering.",
      date: "October 4, 2024",
      youtubeId: "ZCCvKoanKIg",
      thumbnail: "https://img.youtube.com/vi/ZCCvKoanKIg/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=ZCCvKoanKIg"
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
              className="bg-card rounded-xl overflow-hidden shadow-card group cursor-pointer hover:shadow-card-hover transition-shadow duration-300"
            >
              {/* Thumbnail with Play Button */}
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-accent/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  YouTube
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{video.date}</span>
                </div>
                <h4 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {video.description}
                </p>
                <a 
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Watch on YouTube
                  <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
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
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 group"
          >
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Youtube className="w-5 h-5" />
              Subscribe to our channel
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </Button>
          <p className="text-primary-foreground/60 text-sm mt-3">
            Join over 10,000 subscribers for the latest updates
          </p>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
