import { cn } from "@/lib/utils";
import { useFeatureStore } from "./store";
import { motion } from "framer-motion";
import Image from "next/image";

type FeatureCardProps = {
  gradient: string;
  children: React.ReactNode;
} & CardProps;

type CardProps = {
  id: string;
};

const FeatureCard = ({ gradient, children, id }: FeatureCardProps) => {
  const inViewFeature = useFeatureStore((state) => state.inViewFeature);
  const setFullscreenFeature = useFeatureStore(
    (state) => state.setFullscreenFeature
  );

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full rounded-2xl transition-opacity",
        inViewFeature === id
          ? "active-card opacity-100"
          : "pointer-events-none opacity-0"
      )}
    >
      <div
        className={cn(
          "gradient absolute inset-0 origin-bottom-left rounded-2xl bg-gradient-to-br",
          gradient
        )}
      />
      {children}
      <div>
        <h1>{id}</h1>

        <button
          onClick={() => setFullscreenFeature(id)}
          className="show-me-btn absolute bottom-6 right-6 rounded-xl bg-black px-4 py-2 text-white shadow-lg"
        >
          Show 
        </button>
      </div>
    </div>
  );
};

export const Cines = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#f7f0ff] to-[#a78afe]">
      <Image
        src="/details/cines.jpeg"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};

export const Post = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#f5fbff] to-[#addeff]">
      <Image
        src="/details/post.png"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};

export const Fundz = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#f5fff7] to-[#adf8ff]">
      <Image
        src="/details/fundz.jpeg"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};

export const Project = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#f7fff5] to-[#adffd8]">
      <Image
        src="/details/project.png"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};

export const Adware = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#fff7f5] to-[#ffd8ad]">
      <Image
        src="/details/adware.png"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};

export const flixpass = ({ id }: CardProps) => {
  return (
    <FeatureCard id={id} gradient="from-[#fef5ff] to-[#ffade1]">
      <Image
        src="/details/subscription.png"
        alt="Preview"
        layout="responsive"
        width={1000}
        height={375}
        objectFit="contain"
        objectPosition="center"
      />
    </FeatureCard>
  );
};
