"use client";

import * as z from "zod";
import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Link2, Play, Pause } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { pinJSONToPinata } from "@/service/pinataService";
import AdwareInteraction from "@/contracts/interaction/AdwareInteraction";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  slots: z
    .string()
    .refine((value) => !isNaN(parseInt(value)) && parseInt(value) > 0, {
      message: "Slots should be more than 0",
      path: ["slots"],
    }),
  title: z.string().min(1, {
    message: "Title is required",
  }),
  video: z
    .custom<File>(
      (file) => {
        console.log("Validating file:", file);
        return file instanceof File;
      },
      {
        message: "Video is required",
      }
    )
    .refine(
      (file) => {
        const isValidSize = file.size <= 32 * 1024 * 1024;
        console.log("Checking file size:", isValidSize);
        return isValidSize;
      },
      {
        message: `The video must be a maximum of 32MB.`,
      }
    ),
  button: z.string().min(1),
  url: z.string().min(1),
});

export default function VideoAd() {
  const adwareInteraction = AdwareInteraction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slots: undefined,
      title: "",
      video: undefined,
      button: "",
      url: "",
    },
  });

  const { isSubmitting, isValid, errors } = form.formState;
  const [slotPrice, setSlotPrice] = useState(0);
  const { reset } = form;
  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { slots, title, video, button, url } = values;
    // Ensure the file exists and is a File instance
    if (video && video instanceof File) {
      try {
        const [res] = await uploadFiles({
          files: [values.video],
          endpoint: "adVideo",
        });
        const args = {
          ...{ slots, title, button, url },
          imageUrl: res.url,
        };
        console.log("args: ", args);
        const web3StorageResponse = await pinJSONToPinata(
          args,
          "adDetailsURL.json"
        );
        const adDetailsURL = `${web3StorageResponse}`;
        console.log("adDetailsURL: ", adDetailsURL);
        const hash = await adwareInteraction.buyVideoAdSlots(
          Number(slots),
          adDetailsURL
        );
        console.log("hash", hash);
        reset();
        toast({
          title: "Ad Created Successfully",
          description: "Your Ad has been created successfully",
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error",
          description: "Error uploading file",
          variant: "destructive",
        });
      }
    } else {
      console.error("No file or invalid file provided");
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((error) => {
      console.error("Error attempting to play the video: ", error);
      setIsPlaying(false);
    });

    const handlePlayPause = () => setIsPlaying(!video.paused);

    video.addEventListener("play", handlePlayPause);
    video.addEventListener("pause", handlePlayPause);

    return () => {
      video.removeEventListener("play", handlePlayPause);
      video.removeEventListener("pause", handlePlayPause);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    const fetchSlotPrice = async () => {
      try {
        let bit = await adwareInteraction.videoAdSpotPrice();
        setSlotPrice(Number(bit));
      } catch (err) { }
    };

    fetchSlotPrice();
  }, [adwareInteraction]);

  return (
    <div className="pt-6">
      <Form {...form}>
        <form
          id="hook-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-8"
        >
          {/* Video Preview */}
          <div className="border rounded-md p-4 font-medium flex flex-col gap-8 relative">
            <div className="absolute top-[50%] -left-3 z-10 rounded-t-sm tracking-widest transform translate-y-full -translate-x-1/4 text-primary px-3 rotate-90 backdrop-blur-md bg-opacity-20 bg-blue-100 border-blue-100">
              Preview
            </div>

            <div className="group hover:shadow-sm w-full rounded-3xl bg-card cursor-pointer hover:bg-card">
              <div className="relative">
                {form.watch("video") ? (
                  <video
                    ref={videoRef}
                    src={URL.createObjectURL(form.watch("video"))}
                    className="rounded-sm overflow-hidden m-auto z-10 max-h-[90vh] w-auto flex items-center justify-center"
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noplaybackrate"
                    onClick={togglePlayPause}
                    autoPlay
                  // poster={formData.thumbnailUrl}
                  // controls
                  />
                ) : (
                  <div className="relative w-full bg-gray-200 dark:bg-card aspect-w-3 aspect-h-1 rounded-sm">
                    <div className="absolute inset-0 flex justify-center items-center">
                      <p className="text-4xl font-bold text-center text-primary/10 tracking-widest">
                        Select the Video for the Ad
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden group-hover:flex flex-row justify-between absolute bottom-0 inset-x-0">
                <div className="bg-background/20 backdrop-blur-xl px-4 py-2 m-8 h-12 rounded-2xl flex items-center justify-center">
                  <h4 className="text-lg font-semibold text-primary ">
                    {form.watch("title") || "Give a title to your Ad"}
                  </h4>
                </div>

                <div className="flex justify-between flex-wrap space-y-2 px-4 py-2 m-8 h-12 rounded-2xl">
                  <div className="flex flex-col items-start">
                    <Button
                      type="submit"
                      className="max-w-sm m-auto bg-muted/40 text-primary border hover:bg-black/20 border-black/20 backdrop-blur-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = form.watch("url");
                        window.open(url, "_blank");
                      }}
                    >
                      <Link2 className="h-5 w-5" />
                      {form.watch("button") ? `  ${form.watch("button")}` : ""}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="border rounded-md p-4 font-medium flex flex-col gap-8 w-1/2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary/70">
                      Video Ad Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-card"
                        placeholder="Give a title to your Ad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.title && <span>{errors.title.message}</span>}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary/70">Video Ad</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        multiple={false}
                        className="bg-card"
                        // Spread all properties except 'value'
                        {...{ ...field, value: undefined }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    {/* <FormDescription>
                      Select an video under 10MB
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="slots"
                  render={({ field }) => (
                    <FormItem className="flex flex-row gap-3 items-center justify-between rounded-lg border p-4 bg-card w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-primary/90 text-base">
                          Video Slots Count
                        </FormLabel>
                        <FormDescription className="whitespace-nowrap">
                          Per Slot cost is {slotPrice} TFUEL
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          type="text"
                          pattern="^[0-9]*$"
                          placeholder="Price"
                          value={
                            field.value == null ? "0" : field.value.toString()
                          }
                          className="max-w-[40%] font-bold text-[#6ca987] text-lg"
                          onChange={(e) => {
                            const validInteger = /^[0-9]*$/;
                            if (
                              e.target.value === "" ||
                              validInteger.test(e.target.value)
                            ) {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className=" w-1/2 flex flex-col gap-8 justify-start">
              <div className="border bg-background rounded-md p-4 flex flex-col gap-8">
                <FormField
                  control={form.control}
                  name="button"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary/70 font-medium">
                        Action Button Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-card"
                          placeholder="Give a name to the action button"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary/70 font-medium">
                        Action URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-card"
                          placeholder="Set the action button URL"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="max-w-[90%] m-auto" />
                <div className="rounded-md p-1 w-full flex gap-8 justify-center border bg-card">
                  <Button
                    name="reset"
                    type="reset"
                    disabled={isSubmitting}
                    onClick={() => reset()}
                    className="max-w-sm bg-transparent text-primary/60 hover:bg-trasparent hover:text-primary text-md font-bold"
                  >
                    Reset
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="max-w-sm bg-background border text-primary/80 hover:bg-muted text-md font-semibold"
                  >
                    {!isSubmitting ? "Buy Slots" : "Loaging..."}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {Object.entries(errors).map(([key, error]) => (
          <p key={key} className="text-red-500 text-sm mt-2">
            {key.charAt(0).toUpperCase() + key.slice(1)}: {error?.message}
          </p>
        ))}
      </Form>
    </div>
  );
}
