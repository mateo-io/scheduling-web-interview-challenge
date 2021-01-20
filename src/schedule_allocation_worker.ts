import { RawMentor, Mentor, Company, CompanyMeeting } from "./types"

const rawMentorData: RawMentor[] = require("./mentor_schedule_data.json")

/**
 * Assumptions
 *
 * I assume each day period (AM/PM) will span 4 hours (8-12) for AM and (13-17) for PM
 * I also assume there are no time constraints for any of the startups
 */

/**
 * We need a reliable form to know that a company is not assigned a slot they don't have
 * available (already assigned to another mentor). In order to do this we split the morning
 * and the evening into an indexed timeslots of 20 minutes and add them to an array.
 *
 * AM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 * PM = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
 *
 * Each time we book one of these slots for either a Mentor or a Startup we remove the
 * key from both the Mentor and the Company.
 *
 * Booking the 8:00 slot (first) would mean taking out the key number 1
 * Booking the 16:40 slot (last) would mean taking out the key number 24
 * Booking the 8:40 slot would mean taking out the key number (3)
 *
 *
 * This is a simple heurisitc to avoid doing date time operations in the program.
 * We must take into account that this only works if TIME_SLOT_MINUTES % MEETING_TIME_MINUTES == 0
 */

const getFormattedMentorData = (): Mentor[] =>
  rawMentorData.map(
    (mentor: RawMentor): Mentor => {
      const { name, day, timePeriod, companies } = mentor

      const availableSlots = []

      // we don't need to execute this if the Mentor hasn't specified a time period available
      if (!!timePeriod) {
        for (let i = 1; i < 13; i++) {
          const index = timePeriod === "AM" ? i : i + 12
          availableSlots.push(index)
        }
      }

      return {
        name,
        day,
        availableSlots,
        pendingMeetings: companies,
        confirmedMeetings: [],
      }
    }
  )

const getFormattedCompanyData = (): Company[] => {
  const companyNames: string[] = []

  rawMentorData.forEach((mentor: RawMentor): void => {
    const { companies } = mentor

    companies.forEach((companyName: string) => {
      if (companyNames.indexOf(companyName) === -1) {
        companyNames.push(companyName)
      }
    })
  })

  const companies = companyNames.map(
    (companyName: string): Company => {
      return { name: companyName, confirmedMeetings: [] }
    }
  )

  return companies
}

const isCompanyAvailable = (
  company: Company,
  day: string,
  timeSlotIndex: number
) => {
  const { confirmedMeetings } = company
  const bookedDays = confirmedMeetings.filter(
    (meeting: CompanyMeeting) => meeting.day === day
  )

  const doesDayExist = bookedDays.length > 0

  const isTimeSlotBooked =
    bookedDays.filter(
      (companyMeeting: CompanyMeeting) =>
        companyMeeting.timeSlotIndex === timeSlotIndex
    ).length > 0

  // if we don't have a single booking for this day then the company is available
  if (!doesDayExist) {
    return true
  }

  if (isTimeSlotBooked) {
    return false
  }

  // there are meetings booked for the day but not for this timeslot
  return true
}

const confirmAllMeetingsWereBooked = (
  availableMentors: Mentor[],
  companies: Company[]
) => {
  const pendingMeetings = availableMentors
    .map((m: Mentor) => m.pendingMeetings.length)
    .reduce((m: number, m2: number) => m + m2, 0)
  const bookedMeetings = availableMentors
    .map((m: Mentor) => m.confirmedMeetings.length)
    .reduce((m: number, m2: number) => m + m2, 0)

  companies.forEach((company: Company) => {
    console.log(`\n`)
    company.confirmedMeetings.forEach((companyMeeting: CompanyMeeting) => {
      console.log(
        `${company.name} meeting with ${companyMeeting.mentorName} on ${companyMeeting.day} at ${companyMeeting.timeSlotIndex}`
      )
    })
  })

  if (pendingMeetings === 0) {
    console.log(`all meetings ${bookedMeetings} were booked successfully! \n`)
    return true
  } else {
    console.error(`ERROR - there were ${pendingMeetings} meetings left to book`)
    return false
    /**
     * In another scenario we would do an extra step here to account for this meetings
     * for now with the sample data this never happens so I won't explore the matter further.
     */
  }
}

const getSchedule = () => {
  const mentors = getFormattedMentorData()
  let companies = getFormattedCompanyData()

  // we only do operations with Mentors who have specified a day and time where they are available
  let availableMentors = mentors.filter(
    (mentor: Mentor) => mentor.availableSlots.length > 0
  )

  // we book the Mentors with the most companies first
  availableMentors.sort((a: Mentor, b: Mentor) => {
    const aLen = a.pendingMeetings.length
    const bLen = b.pendingMeetings.length

    return bLen - aLen
  })

  availableMentors = availableMentors.map((mentor: Mentor) => {
    const { pendingMeetings, confirmedMeetings, day, name } = mentor

    let { availableSlots } = mentor

    pendingMeetings.forEach((companyName: string) => {
      // go over each slot available for the meeting
      availableSlots.some((slot: number) => {
        const companyObject = Object.assign(
          {},
          companies.find((company: Company) => companyName === company.name)
        )

        // this never happens - it's just here in order to avoid undefined type warnings
        if (!companyObject || !day) {
          console.log(`this never happens`)
          return companyName
        }

        let dayString = day as string

        if (isCompanyAvailable(companyObject, dayString, slot)) {
          // mentor confirmed meetings
          confirmedMeetings.push(companyName)

          // if this logic got more complex I'd move it to its own function
          const startHour = slot < 12 ? 8 : 13
          const absoluteOffset = slot > 12 ? slot - 12 : slot
          const offsetInMinutes = (absoluteOffset - 1) * 20
          const hoursOffset =
            offsetInMinutes >= 60 ? Math.floor(offsetInMinutes / 60) : 0
          const minutesOffset = offsetInMinutes % 60
          const paddedMinutesOffset =
            String(minutesOffset).length === 1
              ? `0${minutesOffset}`
              : minutesOffset
          const time = `${startHour + hoursOffset}:${paddedMinutesOffset}`

          const companyMeeting: CompanyMeeting = {
            mentorName: name,
            day: dayString,
            timeSlotIndex: slot,
            time,
          }
          const updatedConfirmedMeetings = [
            ...companyObject.confirmedMeetings,
            companyMeeting,
          ]

          const updatedCompanyObject = {
            ...companyObject,
            confirmedMeetings: updatedConfirmedMeetings,
          }

          // replace company in the global array
          if (companyObject) {
            companies = companies.map((company: Company) =>
              company.name === updatedCompanyObject.name
                ? updatedCompanyObject
                : company
            )
          }

          // remove the slot from available slots
          availableSlots = availableSlots.filter((v: number) => v !== slot)

          return true
        }
        return false
      })
    })
    return { ...mentor, availableSlots }
  })

  // remove pending meetings from Mentors array
  availableMentors = availableMentors.map((mentor: Mentor) => {
    const updatedPendingMeetings: string[] = []

    mentor.pendingMeetings.forEach((companyName: string) => {
      if (mentor.confirmedMeetings.indexOf(companyName) === -1) {
        // if we can't find a confirmation for the meeting we add it again
        updatedPendingMeetings.push(companyName)
      }
    })
    return { ...mentor, pendingMeetings: updatedPendingMeetings }
  })

  const areAllMeetingsBooked = confirmAllMeetingsWereBooked(
    availableMentors,
    companies
  )
  // unavailable is perhaps not the best term since they are willing they
  // just have not expressed their available time slots yet.
  const unavailableMentors = mentors.filter(
    (mentor: Mentor) => mentor.day == null
  )

  if (areAllMeetingsBooked) {
    return { companies, availableMentors, unavailableMentors }
  } else {
    throw new Error(
      `Greedy algorithm couldn't book the meetings. Please update the data.`
    )
  }
}

export default getSchedule
