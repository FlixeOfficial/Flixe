import React, { useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Label from "../ui/input-label";
import { Label } from "@/components/ui/label";
import {
    CollectibleOptions,
    DurationOptions,
    FormDataProp,
    ListingOptions,
} from "@/types";
import { Input } from "@/components/ui/input";
import { useFormStore } from "@/store/formStore";

const VideoAccess = () => {
    const { setFormData, formData } = useFormStore();
const setListingOption = (option: ListingOptions) => {
    setFormData.setSaleType(option);
};

const setDurationOption = (option: DurationOptions) => {
    setFormData.setSaleDuration(option);
};

const setCollectibleOption = (option: CollectibleOptions) => {
    setFormData.setCollectibleCount(option);
};


    const optionsClass = (selected: boolean) =>
        `p-2 rounded-2xl border h-10 sm:h-12 flex items-center justify-center text-center ${
            selected
                ? "border-main-accent bg-main-accent bg-opacity-20"
                : "dark:border-gray-600 bg-light-dark"
        } cursor-pointer hover:border-main-accent transition-colors saleDuration-200 ease-in-out`;

    return (
        <div className="mt-8">
            {/* <div className="mb-8">
                <Label title="Who can buy this video ?" />
                <div className="mt-4 lg:col-span-2 grid gap-12 lg:grid-cols-2">
                    {(["Anyone", "Subscribers"] as BuyOptions[]).map(
                        (option) => (
                            <div
                                key={option}
                                onClick={() => setBuyOption(option)}
                                className={optionsClass(
                                    formData.whoCanBuy === option
                                )}
                            >
                                {option}
                            </div>
                        )
                    )}
                </div>
            </div> */}
            <div className="mb-8">
                <Label title="Set the Sales type" />
                <div className="mt-4 lg:col-span-2 grid gap-12 lg:grid-cols-2">
                    {(["Fixed", "Auction"] as ListingOptions[]).map(
                        (option) => (
                            <div
                                key={option}
                                onClick={() => setListingOption(option)}
                                className={optionsClass(
                                    formData.saleType === option
                                )}
                            >
                                {option}
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className="rounded-2xl p-4 bg-light-dark">
                {formData.saleType === "Fixed" ? (
                    <div className="flex flex-col space-y-8 transition-colors saleDuration-200 ease-in-out">
                        <div className="lg:col-span-2 grid gap-12 lg:grid-cols-2">
                            {/* Price */}
                            <div>
                                <Label title="Price" />
                                <Input
                                    type="text"
                                    value={formData.price}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setFormData.setPrice(e.target.value)}
                                    placeholder="Enter your price"
                                />
                            </div>
                        </div>
                        <div>
                            <Label title="What is the sales duration ?" />
                            <div className="mt-4 lg:col-span-2 grid gap-12 lg:grid-cols-2 text-center">
                                {(
                                    ["Set limit", "No time limit"] as (
                                        | "Set limit"
                                        | "No time limit"
                                    )[]
                                ).map((option) => (
                                    <div
                                        key={option}
                                        onClick={() =>
                                            setDurationOption(
                                                option === "No time limit"
                                                    ? "No time limit"
                                                    : new Date()
                                            )
                                        }
                                        className={optionsClass(
                                            (typeof formData.saleDuration ===
                                            "string"
                                                ? "No time limit"
                                                : "Set limit") === option
                                        )}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            {typeof formData.saleDuration === "object" && (
                                <h3>Date Picker</h3>
                                // <DatePicker
                                //     selected={formData.saleDuration}
                                //     onChange={(date: Date) =>
                                //         setDurationOption(date)
                                //     }
                                //     showTimeSelect
                                //     timeFormat="HH:mm"
                                //     timeIntervals={15}
                                //     timeCaption="time"
                                //     dateFormat="MMMM d, yyyy h:mm aa"
                                //     minDate={new Date()}
                                //     className="mt-4 border rounded-2xl h-10 sm:h-12 p-2 dark:border-gray-600 bg-light-dark saleDuration-200 ease-in-out"
                                // />
                            )}
                        </div>
                        <div>
                            <Label title="Would you like to limit the count ?" />
                            <div className="mt-4 lg:col-span-2 grid gap-12 lg:grid-cols-2 text-center">
                                {(
                                    ["Set limit", "Unlimited collects"] as (
                                        | "Set limit"
                                        | "Unlimited collects"
                                    )[]
                                ).map((option) => (
                                    <div
                                        key={option}
                                        onClick={() =>
                                            setCollectibleOption(
                                                option === "Unlimited collects"
                                                    ? "Unlimited collects"
                                                    : 1
                                            )
                                        }
                                        className={optionsClass(
                                            (typeof formData.collectibleCount ===
                                            "string"
                                                ? "Unlimited collects"
                                                : "Set limit") === option
                                        )}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            {typeof formData.collectibleCount === "number" && (
                                <Input
                                    type="number"
                                    value={formData.collectibleCount}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const inputValue = parseInt(
                                            e.target.value,
                                            10
                                        );
                                        if (inputValue > 0) {
                                            setCollectibleOption(inputValue);
                                        }
                                    }}
                                    className="mt-4 border rounded-2xl h-10 sm:h-12 p-2 dark:border-gray-600 bg-light-dark saleDuration-200 ease-in-out"
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-8 transition-colors saleDuration-200 ease-in-out">
                        <div className="lg:col-span-2 grid gap-12 lg:grid-cols-2">
                            {/* Initial Price */}
                            <div>
                                <Label
                                    title="Initial Price"
                                    htmlFor="initBit"
                                />
                                <Input
                                    type="text"
                                    id="initBit"
                                    value={
                                        formData.auctionDetails?.initialPrice
                                    }
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        setFormData.setAuctionDetails({
                                            ...formData.auctionDetails,
                                            initialPrice: e.target.value,
                                        })
                                    }
                                    placeholder="Enter your price"
                                />
                            </div>
                            {/* Minimum Bid */}
                            <div>
                                <Label title="Minimum Bid" htmlFor="minBit" />
                                <Input
                                    type="text"
                                    id="minBit"
                                    value={formData.auctionDetails?.minimumBid}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        setFormData.setAuctionDetails({
                                            ...formData.auctionDetails,
                                            minimumBid: e.target.value,
                                        })
                                    }
                                    placeholder="Enter your price"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-2 grid gap-12 lg:grid-cols-2">
                            <div>
                                <Label title="Start Time" htmlFor="startTime" />
                                <h3>Date Picker</h3>
                                {/* <DatePicker
                                    selected={
                                        formData.auctionDetails?.startTime
                                    }
                                    onChange={(date: Date) =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            auctionDetails: {
                                                ...prevState.auctionDetails,
                                                startTime: date,
                                            },
                                        }))
                                    }
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="time"
                                    dateFormat="MMMM d, h:mm aa"
                                    minDate={new Date()}
                                    className="w-full border rounded-2xl h-10 sm:h-12 p-2 dark:border-gray-600 bg-light-dark saleDuration-200 ease-in-out"
                                /> */}
                            </div>
                            <div>
                                <Label title="End Time" htmlFor="endTime" />
                                <h3>Date Picker</h3>
                                {/* <DatePicker
                                    selected={formData.auctionDetails?.endTime}
                                    onChange={(date: Date) =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            auctionDetails: {
                                                ...prevState.auctionDetails,
                                                endTime: date,
                                            },
                                        }))
                                    }
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="time"
                                    dateFormat="MMMM d, h:mm aa"
                                    minDate={new Date()}
                                    className="w-full border rounded-2xl h-10 sm:h-12 p-2 dark:border-gray-600 bg-light-dark saleDuration-200 ease-in-out"
                                /> */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoAccess;
