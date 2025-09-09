import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function Footer() {
  const { settings } = useSettings();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    console.log("Newsletter subscription:", email);
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4" data-testid="text-footer-title">{settings.storeName}</h3>
            <p className="text-primary-foreground/80 mb-4">
              Premium eyewear crafted with precision and style for the modern individual.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200" data-testid="link-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200" data-testid="link-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200" data-testid="link-twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-prescription-frames">
                  Prescription Frames
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-sunglasses-footer">
                  Sunglasses
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-reading-glasses">
                  Reading Glasses
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-collections-footer">
                  Collections
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-size-guide">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-virtual-try-on-footer">
                  Virtual Try-On
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-returns">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors duration-200" data-testid="link-contact">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-primary-foreground/80 mb-4">
              Stay updated with our latest collections and offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-primary-foreground text-foreground border-primary-foreground focus:ring-accent"
                required
                data-testid="input-newsletter-email"
              />
              <Button
                type="submit"
                className="ml-2 bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-subscribe"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60" data-testid="text-copyright">
            &copy; 2023 {settings.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
