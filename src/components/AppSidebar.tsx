
import { BarChart, Search, Code, ActivitySquare, FlaskConical, StarIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const marketingTools = [
  { title: "Dashboard", icon: BarChart, url: "/" },
  { title: "Keyword Research", icon: Search, url: "/keywords" },
];

const developerTools = [
  { title: "Developer Tools", icon: Code, url: "/dev-tools" },
];

const comingSoonTools = [
  { 
    title: "In-App Events Intelligence", 
    icon: ActivitySquare, 
    url: "/app-events-ai",
    description: "AI-powered insights for your app's events and user journey"
  },
  { 
    title: "CRO Testing Strategy Hub", 
    icon: FlaskConical, 
    url: "/cro-testing-ai",
    description: "A/B testing analysis and optimization strategy powered by AI"
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Marketing Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketingTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Developer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developerTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-amber-500" />
            <span>Coming Soon</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3"
                      title={item.description}
                    >
                      <item.icon className="h-5 w-5 text-indigo-400" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
