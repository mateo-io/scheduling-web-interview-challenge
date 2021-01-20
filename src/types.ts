export type RawMentor = {
  name: string
  day: string | null
  timePeriod: "AM" | "PM" | null
  companies: string[]
}

export type Mentor = {
  name: string
  day: string | null
  availableSlots: number[]
  confirmedMeetings: string[]
  pendingMeetings: string[]
}

export type CompanyMeeting = {
  mentorName: string
  day: string
  timeSlotIndex: number // 1-24 number, 1 representing the first slot of the day and 24 the last one
  time: string
}

export type Company = {
  name: string
  confirmedMeetings: CompanyMeeting[]
}
