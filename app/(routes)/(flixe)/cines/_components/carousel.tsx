"use client";

import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, type PanInfo } from "framer-motion";
import { AlertTriangle, MoveLeft, MoveRight } from "lucide-react";
import ClientButton from "@/components/button-redirect";
import Image from "next/image";
import AdwareInteraction from "@/contracts/interaction/AdwareInteraction";
import { fetchIPFSJson } from "@/service/pinataService";
import { Banner } from "@/components/banner";
import { fromWei } from 'web3-utils';

const START_INDEX = 1;
const DRAG_THRESHOLD = 150;
const FALLBACK_WIDTH = 509;
const slideIntervals = [10000, 8000, 6000];
const CURSOR_SIZE = 80;

interface Campaign {
  bidderAddress: string;
  bidAmount: string;
  adDetailsURL: string;
  button: string;
  imageUrl: string;
  price: string;
  title: string;
  url: string;
}

export default function Carousel() {
  const adwareInteraction = AdwareInteraction();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const fetchTopBids = async () => {
      try {
        // Fetch the bids as before
        const bids = await Promise.all(
          [2, 0, 1].map((index) => adwareInteraction.yesterdayBids(index))
        );

        // Fetch campaign data for each bid and merge it
        const bidsWithCampaignData = await Promise.all(
          bids.map(async (bid) => {
            const campaign = await fetchIPFSJson(bid.adDetailsURL);

            // Convert bid amount from wei to TFUEL
            const bidAmountInTFUEL = fromWei(
              bid.bidAmount
              , 'ether');

            // Return a new object that combines the bid with the campaign data
            return {
              ...bid,
              bidAmount: bidAmountInTFUEL,
              ...campaign,
            };
          })
        );

        setCampaigns(bidsWithCampaignData); // Update your state with the new data
      } catch (err) {
        console.error(err);
      }
    };

    fetchTopBids();
  }, [adwareInteraction]);

  const containerRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [activeSlide, setActiveSlide] = useState(START_INDEX);
  const canScrollPrev = activeSlide > 0;
  const canScrollNext = activeSlide < campaigns.length - 1;
  const offsetX = useMotionValue(0);
  const animatedX = useSpring(offsetX, {
    damping: 20,
    stiffness: 150,
  });

  const [isDragging, setIsDragging] = useState(false);
  function handleDragSnap(
    _: MouseEvent,
    { offset: { x: dragOffset } }: PanInfo
  ) {
    //reset drag state
    setIsDragging(false);
    containerRef.current?.removeAttribute("data-dragging");

    //stop drag animation (rest velocity)
    animatedX.stop();

    const currentOffset = offsetX.get();

    //snap back if not dragged far enough or if at the start/end of the list
    if (
      Math.abs(dragOffset) < DRAG_THRESHOLD ||
      (!canScrollPrev && dragOffset > 0) ||
      (!canScrollNext && dragOffset < 0)
    ) {
      animatedX.set(currentOffset);
      return;
    }

    let offsetWidth = 0;
    /*
      - start searching from currently active slide in the direction of the drag
      - check if the drag offset is greater than the width of the current item
      - if it is, add/subtract the width of the next/prev item to the offsetWidth
      - if it isn't, snap to the next/prev item
    */
    for (
      let i = activeSlide;
      dragOffset > 0 ? i >= 0 : i < itemsRef.current.length;
      dragOffset > 0 ? i-- : i++
    ) {
      const item = itemsRef.current[i];
      if (item === null) continue;
      const itemOffset = item.offsetWidth;

      const prevItemWidth =
        itemsRef.current[i - 1]?.offsetWidth ?? FALLBACK_WIDTH;
      const nextItemWidth =
        itemsRef.current[i + 1]?.offsetWidth ?? FALLBACK_WIDTH;

      if (
        (dragOffset > 0 && //dragging left
          dragOffset > offsetWidth + itemOffset && //dragged past item
          i > 1) || //not the first/second item
        (dragOffset < 0 && //dragging right
          dragOffset < offsetWidth + -itemOffset && //dragged past item
          i < itemsRef.current.length - 2) //not the last/second to last item
      ) {
        dragOffset > 0
          ? (offsetWidth += prevItemWidth)
          : (offsetWidth -= nextItemWidth);
        continue;
      }

      if (dragOffset > 0) {
        //prev
        offsetX.set(currentOffset + offsetWidth + prevItemWidth);
        setActiveSlide(i - 1);
      } else {
        //next
        offsetX.set(currentOffset + offsetWidth - nextItemWidth);
        setActiveSlide(i + 1);
      }
      break;
    }
  }

  function scrollPrev() {
    let newActiveSlide = activeSlide - 1;
    let newOffset = offsetX.get();

    if (newActiveSlide < 0) {
      // If it's the first slide, jump to the last slide
      newActiveSlide = campaigns.length - 1;
      newOffset = -itemsRef.current
        .slice(0, -1)
        .reduce((total, item) => total + (item?.offsetWidth ?? 0), 0);
    } else {
      // Normal behavior
      const prevWidth = itemsRef.current[newActiveSlide]?.offsetWidth ?? 0;
      newOffset += prevWidth;
    }

    offsetX.set(newOffset);
    setActiveSlide(newActiveSlide);
  }

  function scrollNext() {
    let newActiveSlide = activeSlide + 1;
    let newOffset = offsetX.get();

    if (newActiveSlide >= campaigns.length) {
      // If it's the last slide, jump back to the first slide
      newActiveSlide = 0;
      newOffset = 0; // Reset to start
    } else {
      // Normal behavior
      const nextWidth = itemsRef.current[newActiveSlide]?.offsetWidth ?? 0;
      newOffset -= nextWidth;
    }

    offsetX.set(newOffset);
    setActiveSlide(newActiveSlide);
  }

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function navButtonHover({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
    const parent = currentTarget.offsetParent;
    if (!parent) return;
    const { left: parentLeft, top: parentTop } = parent.getBoundingClientRect();

    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const offsetFromCenterX = clientX - centerX;
    const offsetFromCenterY = clientY - centerY;

    mouseX.set(left - parentLeft + offsetFromCenterX / 4);
    mouseY.set(top - parentTop + offsetFromCenterY / 4);
  }

  function disableDragClick(e: ReactMouseEvent<HTMLAnchorElement>) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  useEffect(() => {
    // Function to handle the slide rotation
    const rotateSlide = async () => {
      const carouselElements = campaigns.length;
      if (carouselElements === 1) {
        // With only one element, neither prev nor next scroll is needed
      } else if (carouselElements === 2) {
        activeSlide === 0 ? scrollNext() : scrollPrev();
      } else if (carouselElements === 3) {
        if (activeSlide === 1) {
          scrollNext();
        } else if (activeSlide === 0) {
          scrollNext();
        } else {
          scrollPrev();
          scrollPrev();
          setActiveSlide(0);
        }
      }
    };

    // If there are no campaigns, don't do anything
    if (!campaigns.length) return;

    // Set the initial timeout for the first slide
    let timeoutId = setTimeout(rotateSlide, slideIntervals[activeSlide]);

    // Cleanup the timeout when unmounting or when activeSlide changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeSlide, campaigns.length, itemsRef, offsetX, slideIntervals]);

  return campaigns && campaigns.length !== 0 ? (
    <div className="group w-full pt-6">
      <div className="relative overflow-hidden">
        <motion.ul
          ref={containerRef}
          className="flex justify-center cursor-none items-center"
          style={{
            x: animatedX,
          }}
          drag="x"
          dragConstraints={{
            left: -(FALLBACK_WIDTH * (campaigns.length - 1)),
            right: FALLBACK_WIDTH,
          }}
          onMouseMove={({ currentTarget, clientX, clientY }) => {
            const parent = currentTarget.offsetParent;
            if (!parent) return;
            const { left, top } = parent.getBoundingClientRect();
            mouseX.set(clientX - left - CURSOR_SIZE / 2);
            mouseY.set(clientY - top - CURSOR_SIZE / 2);
          }}
          onDragStart={() => {
            containerRef.current?.setAttribute("data-dragging", "true");
            setIsDragging(true);
          }}
          onDragEnd={handleDragSnap}
        >
          {campaigns.map((campaign, index) => {
            const active = index === activeSlide;
            return (
              <motion.li
                layout
                key={campaign.title}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                className={`relative shrink-0 select-none px-3 transition-opacity duration-300 ${!active ? "opacity-30" : ""
                  }`}
                transition={{
                  ease: "easeInOut",
                  duration: 0.4,
                }}
                style={{
                  flexBasis: active ? "90%" : "75%",
                }}
              >
                <Link
                  href={campaign.url}
                  className="block"
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onClick={disableDragClick}
                >
                  <div className="border rounded-md p-2 font-medium flex flex-col gap-8 relative m-auto">
                    {/* This 'group' class now applies to the children of this div only */}
                    <div className="group w-full rounded-3xl bg-card cursor-pointer hover:bg-card">
                      <div className="relative">
                        {campaign.imageUrl && (
                          <div className="aspect-w-6 aspect-h-2 w-full">
                            <Image
                              src={campaign.imageUrl}
                              alt={`Selected thumbnail`}
                              className={`object-cover rounded-sm`}
                              style={{ pointerEvents: "none" }}
                              layout="fill"
                            />
                          </div>
                        )}
                      </div>
                      {/* Hover effects are now scoped to this card only */}
                      <div className="hidden group-hover:flex flex-row justify-between absolute bottom-0 inset-x-0">
                        <div className="bg-background/20 backdrop-blur-xl px-4 py-2 m-8 h-12 rounded-2xl flex items-center justify-center">
                          <h4 className="text-lg font-semibold text-primary">
                            {campaign.title || "Give a title to your billboard"}
                          </h4>
                        </div>

                        {/* The button will also show on hover inside this group */}
                        <div className="flex justify-between flex-wrap space-y-2 px-4 py-2 m-8 h-12 rounded-2xl">
                          <div className="flex flex-col items-start">
                            <ClientButton
                              url={campaign.url}
                              buttonLabel={campaign.button}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
        <button
          type="button"
          className="group absolute left-[3%] top-1/3 z-20 grid aspect-square place-content-center rounded-full transition-colors"
          style={{
            width: CURSOR_SIZE,
            height: CURSOR_SIZE,
            transform: "translateY(50%)",
          }}
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          onMouseMove={(e) => navButtonHover(e)}
        >
          <span className="sr-only">Previous Guide</span>
          <MoveLeft className="h-10 w-10 stroke-[1.5] transition-colors text-primary/30 group-enabled:group-hover:text-primary/70 group-disabled:opacity-50" />
        </button>
        <button
          type="button"
          className="group absolute right-[3%] top-1/3 z-20 grid aspect-square place-content-center rounded-full transition-colors"
          style={{
            width: CURSOR_SIZE,
            height: CURSOR_SIZE,
            transform: "translateY(50%)",
          }}
          onClick={scrollNext}
          disabled={!canScrollNext}
          onMouseMove={(e) => navButtonHover(e)}
        >
          <span className="sr-only">Next Guide</span>
          <MoveRight className="h-10 w-10 stroke-[1.5] transition-colors text-primary/30 group-enabled:group-hover:text-primary/70 group-disabled:opacity-50" />
        </button>
      </div>
    </div>
  ) : (
    <Banner
      variant="warning-dark"
        label="Participate in our daily billboards auction to get your Ad featured here!"
    />
    // <span className="flex flex-row items-center text-sm text-muted-foreground">
    //   <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
    //   Participate in our daily auction to get your ad featured on our
    //   billboards!
    // </span>
  );
}
