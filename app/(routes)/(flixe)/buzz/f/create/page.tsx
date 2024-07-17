"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToasts();
  const { toast } = useToast();

  const { mutate: createCommunity, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };

      const { data } = await axios.post("/api/subreddit", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreddit already exists.",
            description: "Please choose a different name.",
            variant: "destructive",
          });
        }

        if (err.response?.status === 422) {
          return toast({
            title: "Invalid subreddit name.",
            description: "Please choose a name between 3 and 21 letters.",
            variant: "destructive",
          });
        }

        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error.",
        description: "Could not create subreddit.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      router.push(`/buzz/f/${data}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/\s/.test(value)) {
      setInput(value);
    }
  };

  return (
    <div className="container flex items-center justify-center h-full max-w-3xl mx-auto pt-[15%]">
      <div className="relative bg-card w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Create a Community</h1>
        </div>

        <hr className="bg-red-500 h-px" />

        <div>
          <p className="text-xl font-medium">Name</p>
          <p className="text-md pb-2">
            Community names including capitalization cannot be changed.
          </p>
          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              f/
            </p>
            <Input
              value={input}
              onChange={handleInputChange}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            disabled={isPending}
            variant="subtle"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            disabled={input.length === 0}
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;