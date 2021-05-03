# Meeting Scheduler Test

In this project we get a CSV file with some Mentors and some companies the want to mentor, along with their time constraints, the companies don't have any time constraints.

I converted the CSV file to a JSON array using an online tool and then used the file `lib/json-manipulation.js` to convert it to a format I was more comfortable with handling.

## Algorithm core

The heavy lifting of the app is done by the file `src/schedule_allocation_worker.ts`.

I've used a greedy algorithm that starts with the Mentors who have the most bookings. The dataset was small enough that I didn't need any fancy optimizations to get it to work, in case of a tighter schedule we'd need to have a better algorithm, for now this is good enough.

## Technology used

This was created using `create-react-app` with TypeScript. The techonologies I'm most comfortable with and also some very useful ones for displaying data and doing data manipulation.


[Demo](https://pensive-swartz-af9540.netlify.app/)
