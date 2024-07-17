import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillboardAd from "./billboard-ad";
import { Separator } from "@/components/ui/separator";
import VideoAd from "./video-ad";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-row">
      <Tabs defaultValue="video" className="flex w-full">
        <div className="relative flex min-h-screen pr-8">
          <div className="sticky top-[6rem] border overflow-auto bg-card shadow rounded-lg max-h-96 w-64">
            <TabsList className="flex flex-col w-full bg-transparent space-y-2 -p-2">
              <h2 className="text-lg font-semibold py-2 text-foreground/30 bg-background w-full text-center">
                Ad Management
              </h2>
              <div className="flex flex-col space-y-1 w-full p-2">
                <TabsTrigger
                  value="video"
                  className="w-full justify-start px-4 py-3 hover:bg-muted/20 border border-card data-[state=active]:border-border data-[state=active]:bg-primary/5 data-[state=active]:font-bold font:semibold"
                >
                  Video Adware
                </TabsTrigger>
                <TabsTrigger
                  value="billboard"
                  className="w-full justify-start px-4 py-3 hover:bg-muted/20 border border-card data-[state=active]:border-border data-[state=active]:bg-primary/5 data-[state=active]:font-bold font-semibold"
                >
                  Billboard Adware
                </TabsTrigger>
                <TabsTrigger
                  value="dynamic"
                  className="w-full justify-start px-4 py-3 hover:bg-muted/20 border border-card data-[state=active]:border-border data-[state=active]:bg-primary/5 data-[state=active]:font-bold font-semibold"
                  disabled
                >
                  Boost
                </TabsTrigger>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col space-y-1 w-full p-2">
                <TabsTrigger
                  value="myad"
                  className="w-full justify-start px-4 py-3 hover:bg-muted border border-card data-[state=active]:border-border font-bold"
                  disabled
                >
                  My Advers
                </TabsTrigger>
              </div>
              {/* <h2 className="text-lg absolute bottom-0 font-semibold py-2 text-foreground/30 bg-background w-full text-center">
                View Adwares
              </h2> */}
            </TabsList>
          </div>
        </div>

        <div className="flex-grow overflow-hidden mt-6">
          <TabsContent value="video" className="border-none p-0">
            <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2 -mt-2">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-wider">
                  Setup{" "}
                  <span className="font-bold text-[#8b7ad0]">Video Adware</span>
                </h1>
              </div>
            </div>
            <VideoAd />
          </TabsContent>
          <TabsContent
            value="billboard"
            className="flex flex-col h-full border-none p-0"
          >
            <div className="flex items-center justify-between bg-card border rounded-md px-4 py-2 -mt-2">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-wider">
                  Setup{" "}
                  <span className="font-bold text-[#8b7ad0]">
                    BillBoard Adware
                  </span>
                </h1>
              </div>
            </div>
            <BillboardAd />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
