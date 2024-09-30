function optimizeBookings(bookings: number[][]): number[][] {    // If the bookings list is empty, returns an empty list
    if(bookings.length === 0){
        return [];
    }

    // Sorting bookings by start times
    bookings.sort((a, b)=>a[0]-b[0]);

    // Initializing an array to hold the optimized bookings
    const optimized: number[][]=[];

    // Starting with the first booking
    let currentBooking=bookings[0];

    for(let i=1;i<bookings.length;i++){
        const nextBooking=bookings[i];

        // Checking for overlap or consecutive bookings
        if(currentBooking[1]>=nextBooking[0]){
            // Merging the bookings by updating the end time
            currentBooking[1]=Math.max(currentBooking[1],nextBooking[1]);
        } else{
            // No overlap, adding the current booking to the optimized list
            optimized.push(currentBooking);
            currentBooking=nextBooking; // Move to the next booking
        }
    }
    // Adding the last booking to the optimized list
    optimized.push(currentBooking);
    return optimized;
}

// Test cases
const testCases=[
    [[9, 12],[11, 13],[14, 17],[16, 18]], // 1-Overlapping bookings
    [[9, 10],[11, 12],[13, 14]],           // 2-Non-overlapping bookings
    [[9, 10],[10, 11],[11, 12]],           // 3-Consecutive bookings
    [[9, 12],[12, 13],[14, 17]],           // 4-Non-overlapping with a gap
    [],                                       // 5-Empty list
];
testCases.forEach((testCase, index) => {
    console.log(`Test Case ${index + 1}:`, optimizeBookings(testCase));
});
//6-1000 input Test case
function generateBookings(numBookings: number): number[][] {
    const bookings: number[][] = [];
    const startTimes: number[] = [];

    // Generating random start times
    for(let i=0;i<numBookings;i++){
        const start=Math.floor(Math.random() * 24);
        const end=start + Math.floor(Math.random() * 4) + 1; 
        bookings.push([start, end]);
        startTimes.push(start);
    }
    for(let i=0;i<100;i++){ 
        const start =Math.floor(Math.random() * 24);
        const end =start+Math.floor(Math.random() * 4) + 1;
        bookings.push([start, end]);
    }
    for(let i=0;i<100;i++){
        const start=Math.floor(Math.random() * 24);
        const end=start+1; 
        bookings.push([start, end]);
    }

    return bookings;
}

//Printing the output
const bookings=generateBookings(1000);
const optimizedBookings=optimizeBookings(bookings);

console.log("Optimized Bookings:",optimizedBookings);
