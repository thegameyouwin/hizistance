import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import ThankYouVolunteer from "./ThankYouVolunteer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VoterDriveSectionProps {
  showThankYou?: boolean;
}

// Kenyan Counties (All 47)
const kenyanCounties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo/Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
  "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

// Kenyan Constituencies by County (Sample - you can expand)
const constituenciesByCounty: Record<string, string[]> = {
  "Mombasa": ["Changamwe", "Jomvu", "Kisauni", "Nyali", "Likoni", "Mvita"],
  "Nairobi City": [
    "Westlands", "Dagoretti North", "Dagoretti South", "Langata", "Kibra",
    "Roysambu", "Kasarani", "Ruaraka", "Embakasi South", "Embakasi North",
    "Embakasi Central", "Embakasi East", "Embakasi West", "Makadara",
    "Kamukunji", "Starehe", "Mathare"
  ],
  "Kiambu": [
    "Gatundu South", "Gatundu North", "Juja", "Thika Town", "Ruiru",
    "Githunguri", "Kiambaa", "Kiambu Town", "Kabete", "Kikuyu", "Limuru", "Lari"
  ],
  "Nakuru": [
    "Bahati", "Gilgil", "Kuresoi North", "Kuresoi South", "Molo",
    "Naivasha", "Nakuru Town East", "Nakuru Town West", "Njoro", "Rongai", "Subukia"
  ],
  "Kisumu": [
    "Kisumu East", "Kisumu West", "Kisumu Central", "Seme", "Nyando",
    "Muhoroni", "Nyakach"
  ],
  "Machakos": [
    "Kathiani", "Kibwezi East", "Kibwezi West", "Machakos Town",
    "Masinga", "Matungulu", "Mavoko", "Mwala", "Yatta"
  ],
  "Kajiado": [
    "Kajiado Central", "Kajiado East", "Kajiado North", "Kajiado South", "Kajiado West"
  ],
  "Meru": [
    "Buuri", "Central Imenti", "Igembe Central", "Igembe North",
    "Igembe South", "North Imenti", "South Imenti", "Tigania East", "Tigania West"
  ],
  "Kakamega": [
    "Butere", "Kakamega Central", "Kakamega East", "Kakamega North",
    "Kakamega South", "Khwisero", "Lugari", "Likuyani", "Malava",
    "Matungu", "Mumias East", "Mumias West", "Navakholo"
  ]
};

// Wards by Constituency (Sample)
const wardsByConstituency: Record<string, string[]> = {
  // Mombasa Constituencies
  "Changamwe": ["Port Reitz", "Kipevu", "Airport", "Changamwe", "Chaani"],
  "Jomvu": ["Jomvu Kuu", "Miritini", "Mikindani"],
  "Kisauni": ["Mjambere", "Junda", "Bamburi", "Mwakirunge", "Mtopanga", "Magogoni", "Shanzu"],
  "Nyali": ["Frere Town", "Ziwa la Ng'ombe", "Mkomani", "Kongowea", "Kadzandani"],
  
  // Nairobi Constituencies
  "Westlands": ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"],
  "Dagoretti North": ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"],
  "Langata": ["Karen", "Nairobi West", "Mugumo-ini", "South C", "Nyayo Highrise"],
  
  // Kiambu Constituencies
  "Githunguri": ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"],
  "Kikuyu": ["Kinoo", "Kikuyu", "Karai", "Nachu"],
  "Limuru": ["Limuru Central", "Ndeiya", "Limuru East", "Ngecha Tigoni"],
};

// Polling Stations by Ward (Sample)
const pollingStationsByWard: Record<string, string[]> = {
  // Changamwe Wards
  "Port Reitz": ["Port Reitz Primary School", "Mikindani Secondary School", "Port Reitz Hospital"],
  "Kipevu": ["Kipevu Primary School", "Kipevu Secondary School", "Magongo Health Centre"],
  "Airport": ["Moi International Airport Hall", "Airport View Primary", "Freight Terminal"],
  
  // Westlands Wards
  "Kitisuru": ["Kitisuru Primary School", "Kitisuru Social Hall", "Kitisuru Chief's Office"],
  "Parklands/Highridge": ["Parklands Baptist Church", "Aga Khan Primary", "Hillcrest Secondary"],
  "Karura": ["Karura Forest Station", "Muthaiga Police Station", "Karura Social Hall"],
  
  // Githunguri Wards
  "Githunguri": ["Githunguri Primary School", "Githunguri Secondary", "Githunguri Health Centre"],
  "Githiga": ["Githiga Primary", "Githiga Secondary", "Githiga Market"],
};

const VoterDriveSection = ({ showThankYou: initialShowThankYou = false }: VoterDriveSectionProps) => {
  const [showThankYou, setShowThankYou] = useState(initialShowThankYou);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Get constituencies for selected county
  const getConstituenciesForCounty = (county: string) => {
    return constituenciesByCounty[county] || [];
  };

  // Get wards for selected constituency
  const getWardsForConstituency = (constituency: string) => {
    return wardsByConstituency[constituency] || [];
  };

  // Get polling stations for selected ward
  const getPollingStationsForWard = (ward: string) => {
    return pollingStationsByWard[ward] || [];
  };

  const interests = [
    "Fund Raising / Donating",
    "Civic Education",
    "Community Organization",
    "Issue Based Organizing",
    "Digital Organizing",
    "Volunteer Recruitment & Training",
    "Voter Registration",
    "Election Monitoring",
    "Youth Mobilization",
    "Women Empowerment"
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleCountyChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      county: value,
      constituency: "",
      ward: "",
      pollingStation: ""
    }));
  };

  const handleConstituencyChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      constituency: value,
      ward: "",
      pollingStation: ""
    }));
  };

  const handleWardChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      ward: value,
      pollingStation: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    if (!fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in your name, email, and phone number");
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.county || !formData.constituency) {
      toast.error("Please select your county and constituency");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from("volunteers")
        .insert({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          county: formData.county,
          constituency: formData.constituency,
          ward: formData.ward || null,
          polling_station: formData.pollingStation || null,
          interests: formData.interests,
          additional_info: formData.additionalInfo || null,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error("Error submitting volunteer form:", error);
        toast.error("Failed to submit. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Thank you for volunteering! We'll contact you soon.");
      setShowThankYou(true);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        county: "",
        constituency: "",
        ward: "",
        pollingStation: "",
        interests: [],
        additionalInfo: "",
      });
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return <ThankYouVolunteer />;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
            <span className="text-sm font-medium text-emerald-700">Get Involved</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Join Voter Drive Movement
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Be part of the change Kenya needs. Your voice and action can help Reset, 
            Restore, and Rebuild our nation for a better tomorrow.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
                <span className="text-2xl">🗳️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Voter Drive Registration
              </h3>
              <p className="text-gray-600">
                Fill out the form below to join thousands of Kenyans working to bring 
                positive change to our country.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Enter first name"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Enter last name"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📱 Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="+254 7XX XXX XXX"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ✉️ Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your.email@example.com"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  📍 Location Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County *
                    </label>
                    <Select 
                      value={formData.county} 
                      onValueChange={handleCountyChange}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {kenyanCounties.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency *
                    </label>
                    <Select 
                      value={formData.constituency} 
                      onValueChange={handleConstituencyChange}
                      disabled={!formData.county}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.county 
                            ? "Select county first" 
                            : `Select constituency in ${formData.county}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getConstituenciesForCounty(formData.county).map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward
                    </label>
                    <Select 
                      value={formData.ward} 
                      onValueChange={handleWardChange}
                      disabled={!formData.constituency}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.constituency 
                            ? "Select constituency first" 
                            : `Select ward in ${formData.constituency}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getWardsForConstituency(formData.constituency).map((ward) => (
                          <SelectItem key={ward} value={ward}>
                            {ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polling Station
                    </label>
                    <Select 
                      value={formData.pollingStation} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pollingStation: value }))}
                      disabled={!formData.ward}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.ward 
                            ? "Select ward first" 
                            : `Select polling station in ${formData.ward}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getPollingStationsForWard(formData.ward).map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Voter Drive Interests */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  🗳️ Voter Drive Interests
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {interests.map((interest) => (
                    <label 
                      key={interest}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-emerald-50/50 transition-colors group"
                    >
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {interest}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  💬 Additional Information
                </h4>
                <label className="block text-sm text-gray-600 mb-2">
                  Tell us more about yourself (optional)
                </label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Share any additional information, skills, or experience that might be relevant to your volunteer work..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox required className="mt-1" />
                  <div className="text-sm text-gray-600">
                    I agree to the terms and conditions of volunteering. I understand that my information 
                    will be used for voter mobilization purposes only and I consent to receiving 
                    communication about voter drive activities.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Join the Voter Drive Movement 🚀"
                )}
              </Button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Your information is secure and will only be used for voter mobilization purposes. 
                We respect your privacy and will never share your data without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoterDriveSection;
