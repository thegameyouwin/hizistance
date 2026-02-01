import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";

const VoterDriveSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    county: "",
    constituency: "",
    ward: "",
    pollingStation: "",
    interests: [] as string[],
    additionalInfo: "",
  });

  const interests = [
    "Fund Raising / Donating",
    "Civic Education",
    "Community Organization",
    "Issue Based Organizing",
    "Digital Organizing",
    "Volunteer Recruitment & Training",
  ];

  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", 
    "Kajiado", "Uasin Gishu", "Nyeri", "Kakamega"
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for joining!",
      description: "We'll be in touch soon with volunteer opportunities.",
    });
  };

  return (
    <section className="py-16 md:py-24 gradient-hero">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-primary-foreground/10 rounded-full mb-4">
            <span className="text-sm font-medium text-primary-foreground">Get Involved</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Join Voter Drive
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Be part of the change Kenya needs. Your voice and action can help Reset, 
            Restore, and Rebuild our nation.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl shadow-elevated p-6 md:p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                Voter Drive
              </h3>
              <p className="text-muted-foreground">
                Fill out the form below to join thousands of Kenyans working to bring 
                positive change to our country.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    📱 Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ✉️ Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  📍 Location Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      County *
                    </label>
                    <Select 
                      value={formData.county} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, county: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((county) => (
                          <SelectItem key={county} value={county.toLowerCase()}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Constituency *
                    </label>
                    <Select 
                      value={formData.constituency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, constituency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select constituency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="constituency1">Constituency 1</SelectItem>
                        <SelectItem value="constituency2">Constituency 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ward *
                    </label>
                    <Select 
                      value={formData.ward} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ward1">Ward 1</SelectItem>
                        <SelectItem value="ward2">Ward 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Polling Station
                    </label>
                    <Select 
                      value={formData.pollingStation} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pollingStation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a polling station" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="station1">Polling Station 1</SelectItem>
                        <SelectItem value="station2">Polling Station 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Voter Drive Interests */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  🗳️ Voter Drive Interests
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {interests.map((interest) => (
                    <label 
                      key={interest}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      />
                      <span className="text-sm text-foreground">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  💬 Additional Information
                </h4>
                <label className="block text-sm text-muted-foreground mb-2">
                  Tell us more about yourself (optional)
                </label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Share any additional information, skills, or experience that might be relevant to your volunteer work..."
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full gradient-cta text-white font-semibold rounded-lg py-6"
              >
                Join the Voter Drive 🇰🇪
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoterDriveSection;
