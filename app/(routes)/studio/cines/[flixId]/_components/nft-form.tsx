"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormDescription,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { pinJSONToPinata } from "@/service/pinataService";
import MarketplaceInteraction from "@/contracts/interaction/MarketplaceInteraction";

interface NftFormProps {
  initialData: {
    isNFT?: boolean;
  };
  flixId: string;
  isComplete: boolean;
}

const formSchema = z.object({
  isNFT: z.coerce.boolean(),
});

export const NftForm = ({ initialData, flixId, isComplete }: NftFormProps) => {
  const { toast } = useToast();

  const nftMarketplace = MarketplaceInteraction();

  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isNFT: initialData?.isNFT || undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let flixDataUrl;
    let flixNftId: number | undefined;

    try {
      const completeData = await axios.patch(`/api/flixs/${flixId}`, {
        NFTDATA: true,
      });
      const web3StorageResponse = await pinJSONToPinata(
        completeData.data.flixData,
        "flixdata.json"
      );
      flixDataUrl = `${web3StorageResponse}`;
      console.log(`flixData: ${completeData.data.flixData}`);
      console.log(`flixDataUrl: ${flixDataUrl}`);
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while taking complete data.",
      });
    }

    if (!flixDataUrl || flixDataUrl.trim() === "") {
      throw new Error("flixDataUrl is not defined, null, or empty.");
    }

    try {
      ;
      flixNftId = await nftMarketplace.mintNFT(flixDataUrl, false);
      console.log(flixNftId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Failed to create NFT.",
        description: error.message || "Failed to create NFT.",
      });
      throw new Error("Failed to create nft");
    }

    if (!flixNftId) {
      throw new Error("flixNftId is not defined, null, or empty.");
    }

    try {
      await axios.patch(`/api/flixs/${flixId}`, {
        ...values,
        flixDataUrl,
        flixNftId,
      });
      toast({
        title: "Flix updated",
        description: "The flix has been successfully updated.",
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  return (
    <div className="mt-6 border bg-background rounded-md p-4">
      {!initialData?.isNFT && (
        <div className="flex items-center justify-between font-semibold text-lg">
          Mark as Flix NFT
          <Button onClick={toggleEdit} variant="ghost" disabled={!isComplete}>
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Mark as NFT
              </>
            )}
          </Button>
        </div>
      )}
      {!isEditing && (
        <div
          className={`space-y-4 ${!initialData?.isNFT ? "mt-4" : ""
            } bg-card p-4 rounded-lg border`}
        >
          {/* Mark as Flix NFT */}
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              {initialData?.isNFT && (
                <h2 className="text-base">Mark as Flix NFT</h2>
              )}
              <span className="flex flex-row items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                {isComplete
                  ? "Enabling this is irreversible and prevent editing Flix and it's Episodes."
                  : "Fill all the required fields to Mark it as an NFT"}
              </span>
            </div>
            {initialData?.isNFT && (
              <Switch id="isNFT" checked={initialData?.isNFT} disabled={true} />
            )}
          </div>
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Mark as Flix NFT Switch */}
            <FormField
              control={form.control}
              name="isNFT"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
                  <div className="space-y-0.5">
                    {/* <FormLabel className="text-base">
                      Mark as Flix NFT
                    </FormLabel> */}
                    <FormDescription>
                      <span className="flex flex-row items-center text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                        Enabling this is irreversible and prevent editing Flix
                        and its Episodes.
                      </span>
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="isNFT"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2 justify-end">
              <Button
                disabled={isSubmitting || !form.watch("isNFT")}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
