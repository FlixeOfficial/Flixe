type SelectedDateTime = {
    calendar: {
        identifier: string;
    };
    era: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
};

function getTimeDifferenceInSec(selectedDateTime: SelectedDateTime | null): number {
    if (selectedDateTime !== null) {
        const targetDate = new Date(
            selectedDateTime.year,
            selectedDateTime.month - 1, // JavaScript months are 0-indexed
            selectedDateTime.day,
            selectedDateTime.hour,
            selectedDateTime.minute,
            selectedDateTime.second,
            selectedDateTime.millisecond
        );

        const currentDate = new Date();

        // Calculate difference in milliseconds
        const differenceInMillis = targetDate.getTime() - currentDate.getTime();

        // Convert to integer seconds
        return Math.round(differenceInMillis / 1000);
    }

    return 0; // Default value if selectedDateTime is null
}

export default getTimeDifferenceInSec;