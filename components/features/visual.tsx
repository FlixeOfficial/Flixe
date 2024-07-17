import { cn } from "@/lib/utils";
import { useFeatureStore } from "./store";
import { motion } from "framer-motion";

export type TabKeys = keyof typeof tabData;

interface Props {
  id: TabKeys; // This ensures that id can only be one of the keys in tabData
}

type VisualProps = {
  children: React.ReactNode;
} & Props;

const Visual = ({ children, id }: VisualProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 flex items-center justify-center opacity-0",
        `visual-${id}`
      )}
    >
      <div className="max-w-6xl px-4">{children}</div>
    </div>
  );
};

const tabData = {
  post: {
    title: "Post",
    description:
      "Showcase and Promote: Buzz is where filmmakers and artists connect to share, promote, and collaborate. Whether you’re showcasing your acting, music, dance, or film projects, Buzz is your social space on Flixe. Create and join communities to discuss, share, and find collaborators for your next big project.",
  },
  project: {
    title: "Project",
    description:
      "Create and Manage: The Project Hub is your central space for all filmmaking needs. From creating movies and series to adding cast and crew, managing budgets, and handling sales, everything you need to bring your project to life is right here.",
  },
  cines: {
    title: "Cines",
    description:
      "Watch and Explore: Enter the world of movies and series on Flixe. Whether you're into action-packed blockbusters or quiet indie films, our 'Cines' section has it all. Watch for free with ads, pay for premium access, or rent movies to enjoy. It’s your cinema, on your terms.",
  },
  fundz: {
    title: "Fundz",
    description:
      "Support and Launch Projects: 'Fundz' helps turn creative ideas into reality. If you’re an artist, you can get funding for your next project by showcasing your proposal here. Supporters can browse through different projects and contribute funds to the ones they believe in.",
  },
  adware: {
    title: "Adware",
    description:
      "Advertise and Earn: Use the 'Adware' tab to gain visibility for your work or discover others’. Bid for billboard space, place video ads before content, or boost your project’s reach. This section is all about helping you find your audience on Flixe.",
  },
  flixpass: {
    title: "Flix Pass",
    description:
      "Choose How You View: Flixe offers different viewing options to suit your needs. Choose from basic access with ads, premium for an ad-free experience, or add a rental pass to access even more content. Simple options, tailored for you.",
  },
};

export const OtherVisual = ({ id }: Props) => {
  return (
    <Visual id={id}>
      <div className="tab-content max-w-md -ml-[30rem] mt-30">
        <h1 className="text-2xl pb-5">{tabData[id].title}</h1>
        <p>{tabData[id].description}</p>
      </div>
    </Visual>
  );
};
