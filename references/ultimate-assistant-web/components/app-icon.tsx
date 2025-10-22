import {
  Calendar,
  Mail,
  MessageCircle,
  Hash,
  CheckSquare,
  Cloud,
  Bell,
  Video,
  Activity,
  Kanban,
  Github,
  GraduationCap,
  MapPin,
  Users,
  Zap,
  Star,
  Trophy,
  Target,
  Sparkles,
  Brain,
  Rocket,
  Globe,
  Music,
  Film,
  Palette,
  Coffee,
  Laptop,
  Smartphone,
  BookOpen,
  Headphones,
  ListTodo,
  MessagesSquare,
  BellRing,
  Stethoscope,
  Users2,
  Gamepad2,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppIconProps {
  app: string;
  className?: string;
  size?: number;
}

export default function AppIcon({ app, className, size = 16 }: AppIconProps) {
  const getIcon = (): JSX.Element => {
    switch (app.toLowerCase()) {
      case "calendar":
        return <Calendar size={size} data-oid="a:sdray" />;
      case "email":
        return <Mail size={size} data-oid="w67-5f8" />;
      case "whatsapp":
        return <MessageCircle size={size} data-oid="lxy20yp" />;
      case "slack":
        return <Hash size={size} data-oid="6s91dls" />;
      case "task":
        return <CheckSquare size={size} data-oid="mokqg6q" />;
      case "weather":
        return <Cloud size={size} data-oid="v0-f6au" />;
      case "notification":
        return <Bell size={size} data-oid="pti8jzf" />;
      case "zoom":
        return <Video size={size} data-oid="o3u1rx:" />;
      case "fitbit":
        return <Activity size={size} data-oid="daph_tb" />;
      case "jira":
        return <Kanban size={size} data-oid="08y.isb" />;
      case "github":
        return <Github size={size} data-oid="76p5om7" />;
      case "coursera":
        return <GraduationCap size={size} data-oid="33mm:o1" />;
      case "localevents":
        return <MapPin size={size} data-oid="85::att" />;
      case "social":
        return <Users size={size} data-oid="wbzg_u8" />;
      case "ai":
        return <Brain size={size} />;
      case "music":
        return <Music size={size} />;
      case "movie":
        return <Film size={size} />;
      case "art":
        return <Palette size={size} />;
      case "productivity":
        return <Zap size={size} />;
      case "achievement":
        return <Trophy size={size} />;
      case "goal":
        return <Target size={size} />;
      case "trending":
        return <Sparkles size={size} />;
      case "launch":
        return <Rocket size={size} />;
      case "global":
        return <Globe size={size} />;
      case "break":
        return <Coffee size={size} />;
      case "desktop":
        return <Laptop size={size} />;
      case "mobile":
        return <Smartphone size={size} />;
      case "reading":
        return <BookOpen size={size} />;
      case "audio":
        return <Headphones size={size} />;
      case "favorite":
        return <Star size={size} />;
      case "tasks":
        return <ListTodo size={size} />;
      case "messengers":
        return <MessagesSquare size={size} />;
      case "alerts":
        return <BellRing size={size} />;
      case "health":
        return <Stethoscope size={size} />;
      case "learn":
        return <GraduationCap size={size} />;
      case "entertainment":
        return <Gamepad2 size={size} />;
      default:
        return <Layout size={size} data-oid="wr4f3rl" />;
    }
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      data-oid="r5g.xa_"
    >
      {getIcon()}
    </div>
  );
}
