"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Briefcase,
  Users,
  Rocket,
  Layers,
  FileText,
  BookOpen,
  Search,
  BarChart2,
  Target,
  TrendingUp,
  Zap,
  Monitor,
  Globe,
  Edit3,
  Database,
  Heart,
  Award,
  ThumbsUp,
  Shield,
  Mic,
  Mail,
  Bot,
  Settings,
  Workflow,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  ShoppingCart,
  CreditCard,
  BarChart3,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Type definitions
interface SubMenuItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

interface DropdownItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  submenu?: SubMenuItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  description?: string;
  dropdown?: DropdownItem[];
}

const navigation: NavigationItem[] = [
  { name: "Solutions", href: "/solutions" },
  {
    name: "Services",
    href: "#",
    dropdown: [
      {
        name: "Voice AI Agents",
        href: "/services/voice-ai-agents",
        icon: Mic,
        description: "Intelligent voice assistants for customer service and support.",
        submenu: [
          {
            name: "Customer Support AI",
            href: "/services/customer-support-ai",
            icon: Phone,
            description: "24/7 AI-powered customer support via phone.",
          },
          {
            name: "Appointment Scheduling",
            href: "/services/appointment-scheduling",
            icon: Calendar,
            description: "Automated appointment booking and reminders.",
          },
          {
            name: "Order Processing",
            href: "/services/order-processing",
            icon: ShoppingCart,
            description: "Voice-activated order taking and processing.",
          },
        ],
      },
      {
        name: "Email Automation",
        href: "/services/email-automation",
        icon: Mail,
        description: "Automate your email workflows and communications.",
        submenu: [
          {
            name: "Email Campaigns",
            href: "/services/email-campaigns",
            icon: Mail,
            description: "Automated marketing and promotional emails.",
          },
          {
            name: "Customer Follow-ups",
            href: "/services/customer-follow-ups",
            icon: MessageSquare,
            description: "Automated follow-up sequences for leads.",
          },
          {
            name: "Order Confirmations",
            href: "/services/order-confirmations",
            icon: CreditCard,
            description: "Automated order and payment confirmations.",
          },
          {
            name: "Reminder Systems",
            href: "/services/reminder-systems",
            icon: Clock,
            description: "Automated appointment and deadline reminders.",
          },
        ],
      },
      {
        name: "Business Automation",
        href: "/services/business-automation",
        icon: Workflow,
        description: "Complete automation solutions for small businesses.",
        submenu: [
          {
            name: "Workflow Automation",
            href: "/services/workflow-automation",
            icon: Workflow,
            description: "Streamline your business processes.",
          },
          {
            name: "Data Management",
            href: "/services/data-management",
            icon: Database,
            description: "Automated data collection and organization.",
          },
          {
            name: "Reporting & Analytics",
            href: "/services/reporting-analytics",
            icon: BarChart3,
            description: "Automated reports and business insights.",
          },
        ],
      },
    ],
  },
  {
    name: "Contact",
    href: "/contact",
    icon: ThumbsUp,
    description: "Get in touch with our team.",
  },
];

export default function Header({ isLight }: { isLight?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Check if user is logged in
  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMouseEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  // Function to calculate total items including submenus
  const calculateTotalItems = (dropdown: DropdownItem[]) => {
    return dropdown.reduce((total, item) => {
      return total + 1 + (item.submenu ? item.submenu.length : 0);
    }, 0);
  };

  // Function to calculate dynamic grid layout
  const calculateGridLayout = (items: number) => {
    if (items <= 3) {
      return "grid-cols-1";
    } else if (items <= 6) {
      return "grid-cols-2";
    } else if (items <= 12) {
      return "grid-cols-3";
    }
    return "grid-cols-3";
  };

  // Function to calculate dropdown width
  const calculateDropdownWidth = (items: number) => {
    if (items <= 3) {
      return "min-w-[300px]";
    } else if (items <= 6) {
      return "min-w-[600px]";
    } else if (items <= 12) {
      return "min-w-[800px]";
    }
    return "min-w-[1000px]";
  };

  return (
    <header
      className={`absolute text-foreground top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent ${
        scrolled ? "" : ""
      }`}
    >
      <div className=" main-section mx-auto">
        <nav
          className={`${
            scrolled ? "" : ""
          } py-4  rounded-lg transition-all duration-300`}
          aria-label="Global"
        >
          <div className="flex items-center justify-between bg-background lg:bg-transparent px-6 py-4 lg:px-0 lg:py-0 rounded-full shadow lg:shadow-none ">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <p className="text-4xl font-bold font-aileron">Veer</p>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground" aria-hidden="true" />
                ) : (
                  <Menu
                    className="h-6 w-6 text-foreground"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            <div className="hidden lg:flex lg:gap-x-8 bg-background px-10 py-2.5 font-poppins rounded-full">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() =>
                    item.dropdown && handleMouseEnter(item.name)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {item.dropdown ? (
                    <>
                      <button className="flex items-center gap-1 text-[16px] text-foreground leading-6 cursor-pointer">
                        {item.name}
                        <ChevronDown
                          className={`h-4 w-4 text-foreground transition-transform duration-200 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Invisible bridge to maintain hover state */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2  right-0 top-full h-8 ${calculateDropdownWidth(
                          calculateTotalItems(item.dropdown)
                        )} ${
                          activeDropdown === item.name ? "block" : "hidden"
                        }`}
                      />

                      {/* Multi-level Dropdown Menu */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 top-10 mt-4 w-full ${calculateDropdownWidth(
                          calculateTotalItems(item.dropdown)
                        )} rounded-lg bg-background px-6 py-4 shadow-2xl ring-1 transition-all duration-300 origin-top-left 
                                            ${
                                              activeDropdown === item.name
                                                ? "opacity-100 scale-100"
                                                : "opacity-0 scale-95 pointer-events-none"
                                            }`}
                      >
                        <div className="relative">
                          <div
                            className={`grid ${calculateGridLayout(
                              calculateTotalItems(item.dropdown)
                            )} z-[100] w-full`}
                          >
                            {item.dropdown.map((subItem, index) => (
                              <div key={subItem.name} className="space-y-1">
                                {/* Main submenu item */}
                                <Link
                                  href={subItem.href}
                                  target={
                                    subItem.name == "Careers"
                                      ? "_blank"
                                      : "_self"
                                  }
                                  className="group hover:bg-foreground/5 p-3 w-full flex items-center gap-3  transition-colors"
                                >
                                  <span className="text-xl text-primary">
                                    <subItem.icon className="w-6 h-6" />
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-[16px] text-foreground font-bold underline">
                                      {subItem.name}
                                    </span>
                                  </div>
                                </Link>

                                {/* Further submenu items */}
                                {subItem.submenu && (
                                  <div className="space-y-1">
                                    {subItem.submenu.map(
                                      (subSubItem: SubMenuItem) => (
                                        <Link
                                          key={subSubItem.name}
                                          href={subSubItem.href}
                                          target={
                                            subSubItem.name == "Careers"
                                              ? "_blank"
                                              : "_self"
                                          }
                                          className="group hover:bg-foreground/5 p-3 w-full flex items-center gap-3  transition-colors"
                                        >
                                          <span className="text-xl text-primary">
                                            <subSubItem.icon className="w-6 h-6" />
                                          </span>
                                          <div className="flex flex-col">
                                            <span className="text-[16px] text-foreground font-medium">
                                              {subSubItem.name}
                                            </span>
                                          </div>
                                        </Link>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[16px] text-foreground lora-medium  cursor-pointer"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={`border py-[8px] px-[18px] text-[16px] lg:text-[16px] text-background transition-colors duration-200 rounded-[14px] font-medium bg-primary hover:bg-primary/90 flex items-center gap-2`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className={`border py-[8px] px-[18px] text-[16px] lg:text-[16px] text-background transition-colors duration-200 rounded-[14px] font-medium bg-primary hover:bg-primary/90`}
                >
                  Get in Touch
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu - Full Screen */}
      <div
        className={`lg:hidden fixed inset-0 bg-background z-[150] transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-[100dvh] overflow-auto px-6 pt-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-end mb-4 px-6 py-4 rounded-full">
            <button
              type="button"
              className="rounded-md text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6 text-foreground" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className=" bg-foreground/10 border-b border-background/10 last:border-b-0 px-6 py-3 rounded-md"
                >
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.name ? null : item.name
                          )
                        }
                        className="flex w-full items-center justify-between text-xl font-medium text-foreground "
                      >
                        {item.name}
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      <div
                        className={`space-y-2 overflow-hidden transition-all duration-300 ${
                          activeDropdown === item.name
                            ? "max-h-[800px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {item.dropdown.map((subItem) => (
                          <div
                            key={subItem.name}
                            className="space-y-2 first:pt-4"
                          >
                            {/* Main submenu item */}
                            <Link
                              href={subItem.href}
                              target={
                                subItem.name == "Careers" ? "_blank" : "_self"
                              }
                              className="block py-3 text-base font-bold underline"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl text-secondary">
                                  <subItem.icon className="w-5 h-5" />
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-foreground">
                                    {subItem.name}
                                  </span>
                                </div>
                              </div>
                            </Link>

                            {/* Further submenu items */}
                            {subItem.submenu && (
                              <div className="space-y-1">
                                {subItem.submenu.map(
                                  (subSubItem: SubMenuItem) => (
                                    <Link
                                      key={subSubItem.name}
                                      href={subSubItem.href}
                                      target={
                                        subSubItem.name == "Careers"
                                          ? "_blank"
                                          : "_self"
                                      }
                                      className="block py-3 text-base font-medium"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl text-secondary">
                                          <subSubItem.icon className="w-5 h-5" />
                                        </span>
                                        <div className="flex flex-col">
                                          <span className="text-foreground">
                                            {subSubItem.name}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-xl font-medium text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 py-6">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="block w-full text-center text-base font-medium shadow-sm rounded-[14px] text-background bg-primary py-[16px] px-[16px] text-[14px] lora-medium  hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className="block w-full text-center text-base font-medium shadow-sm rounded-[14px] text-background bg-primary py-[16px] px-[16px] text-[14px] lora-medium  hover:bg-primary/90 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get in Touch
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
