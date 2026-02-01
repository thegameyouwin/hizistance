import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const CriticalIssuesSection = () => {
  const featuredStatement = {
    date: "13 December 2024",
    tag: "Official Statement",
    title: "Kenya Is Not on the Road to Singapore. Pretending Otherwise Is Dangerous",
    excerpt: "We are not poor because we lack money. We are poor because we have embraced an extractive system that is designed to serve those in power before it serves citizens.",
    link: "#"
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-4">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-secondary-foreground">Latest Update</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Our Voice on Critical Issues
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest positions on the issues that matter most to Kenyans.
          </p>
        </div>

        {/* Featured Statement Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Tag and Date */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {featuredStatement.tag}
                </span>
                <span className="text-sm text-muted-foreground">
                  {featuredStatement.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-heading font-bold text-primary mb-4">
                {featuredStatement.title}
              </h3>

              {/* Excerpt */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {featuredStatement.excerpt}
              </p>

              {/* CTA */}
              <Button 
                asChild 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full"
              >
                <Link to={featuredStatement.link} className="flex items-center gap-2">
                  Read Complete Statement
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CriticalIssuesSection;
