import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Users,
  Users2,
  Monitor,
  Home,
  LogOut
} from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/groups", label: "Grupos", icon: Users2 },
  { href: "/devices", label: "Dispositivos", icon: Monitor },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          AD Manager
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  location === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}