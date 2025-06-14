import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Users, Trophy, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Master Technical Skills with{" "}
              <span className="text-primary">SkillSage</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The enterprise-grade platform for technical assessment, skill development, and interview preparation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
                onClick={handleGetStarted}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillSage?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Code2 className="w-8 h-8 text-primary" />,
                title: "Real-world Challenges",
                description: "Practice with industry-standard coding challenges and problems."
              },
              {
                icon: <Users className="w-8 h-8 text-primary" />,
                title: "Enterprise Ready",
                description: "Built for companies to assess and hire top technical talent."
              },
              {
                icon: <Trophy className="w-8 h-8 text-primary" />,
                title: "Skill Assessment",
                description: "Comprehensive evaluation of technical skills and problem-solving abilities."
              },
              {
                icon: <Brain className="w-8 h-8 text-primary" />,
                title: "Smart Analytics",
                description: "Detailed insights into performance and skill development."
              },
              {
                icon: <Zap className="w-8 h-8 text-primary" />,
                title: "Live Interviews",
                description: "Conduct technical interviews with integrated coding environment."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up as a candidate or enterprise user"
              },
              {
                step: "02",
                title: "Choose Path",
                description: "Select from various skill tracks and challenges"
              },
              {
                step: "03",
                title: "Start Learning",
                description: "Begin your journey to technical excellence"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Technical Skills?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-foreground">
            Join thousands of developers and companies using SkillSage for technical excellence.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="gap-2 bg-white text-primary hover:bg-white/90"
            onClick={handleGetStarted}
          >
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkillSage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 