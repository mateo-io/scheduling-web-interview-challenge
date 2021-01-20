import React from "react"
import styled from "@emotion/styled"

// helpers
import getSchedule from "./schedule_allocation_worker"

// constants and types
import * as colors from "./colors"
import { Mentor, Company, CompanyMeeting } from "./types"

type AppProps = {}
type AppState = {
  companies: Company[]
  availableMentors: Mentor[]
  unavailableMentors: Mentor[]
  displayMode: "mentors" | "companies"
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    // TODO -> unavailable mentors are not used but could be used to prompt the program manager to remind them
    this.state = {
      companies: [],
      availableMentors: [],
      unavailableMentors: [],
      displayMode: "mentors",
    }
  }

  componentDidMount = () => {}

  getData = () => {
    const { companies, availableMentors, unavailableMentors } = getSchedule()
    this.setState({ companies, availableMentors, unavailableMentors })
  }

  renderCompanies = () => {
    const Wrapper = styled("div")``

    const CompanyWrapper = styled("div")`
      background: ${colors.secondaryColor};
      color: ${colors.primaryColor};
      min-height: 340px;
      width: 420px;
      margin: 48px auto;
      position: relative;
      padding-bottom: 50px;
    `

    const CompanyTitle = styled("div")`
      font-size: 24px;
      text-transform: uppercase;
      color: white;
      background: black;
      padding: 12px;
      border: 1px solid white;
      border-bottom: 0;
    `

    const MeetingText = styled("p")`
      margin: 10px;
      font-size: 18px;
    `

    const BottomDiv = styled("div")`
      position: absolute;
      bottom: 0;
      width: 420px;
      text-align: center;
    `

    const Button = styled("button")`
      font-size: 18px;
      border: 0;
      background: ${colors.terciaryColor};
      color: white;
      margin: 12px;
      border-radius: 4px;
      padding: 6px 20px;
      font-family: sans-serif;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }
    `

    return (
      <Wrapper>
        {this.renderButtons()}
        {this.state.companies.map((company: Company) => {
          const { name } = company

          return (
            <CompanyWrapper>
              <CompanyTitle>{name}</CompanyTitle>
              <div>
                {company.confirmedMeetings.map((meeting) => {
                  return (
                    <MeetingText>
                      <span>
                        {meeting.mentorName} - {meeting.day},
                      </span>{" "}
                      <b>{meeting.time}</b>
                    </MeetingText>
                  )
                })}
              </div>
              <BottomDiv>
                <Button
                  onClick={() =>
                    alert(
                      "Sorry this functionality is not available in the current price range.\n\nPlease tell HR to upgrade your plan ;)"
                    )
                  }
                >
                  Send invites
                </Button>
              </BottomDiv>
            </CompanyWrapper>
          )
        })}
      </Wrapper>
    )
  }

  renderMentors = () => {
    const Wrapper = styled("div")``

    const MentorWrapper = styled("div")`
      background: ${colors.secondaryColor};
      color: ${colors.primaryColor};
      min-height: 340px;
      width: 420px;
      margin: 48px auto;
      position: relative;
    `

    const MentorTitle = styled("div")`
      font-size: 24px;
      text-transform: uppercase;
      color: white;
      background: black;
      padding: 12px;
      border: 1px solid white;
      border-bottom: 0;
    `

    const MeetingText = styled("p")`
      margin: 10px;
      font-size: 18px;
    `

    const BottomDiv = styled("div")`
      position: absolute;
      bottom: 0;
      width: 420px;
      text-align: center;
    `

    const Button = styled("button")`
      font-size: 18px;
      border: 0;
      background: ${colors.terciaryColor};
      color: white;
      margin: 12px;
      border-radius: 4px;
      padding: 6px 20px;
      font-family: sans-serif;
      cursor: pointer;
    `

    const allMeetingsRaw = this.state.companies.map((v: Company) =>
      v.confirmedMeetings.map((meeting: CompanyMeeting) => ({
        ...meeting,
        companyName: v.name,
      }))
    )
    // flatten the array
    const allMeetings = allMeetingsRaw.reduce((a, b) => a.concat(b), [])

    return (
      <Wrapper>
        {this.renderButtons()}
        {this.state.availableMentors.map((mentor: Mentor) => {
          const { name, day } = mentor

          const meetingsWithDate = allMeetings.filter(
            (meeting) => meeting.mentorName === name
          )
          return (
            <MentorWrapper>
              <MentorTitle>
                {name} - {day}
              </MentorTitle>
              <div>
                {meetingsWithDate.map((meeting) => {
                  return (
                    <MeetingText>
                      {meeting.companyName} - <b>{meeting.time}</b>
                    </MeetingText>
                  )
                })}
              </div>
              <BottomDiv>
                <Button
                  onClick={() =>
                    alert(
                      "Sorry this functionality is not available in the current price range.\n\nPlease tell HR to upgrade your plan ;)"
                    )
                  }
                >
                  Send invites
                </Button>
              </BottomDiv>
            </MentorWrapper>
          )
        })}
      </Wrapper>
    )
  }

  renderActionPage = () => {
    const ActionButton = styled("button")`
      color: ${colors.secondaryColor};
      background: transparent;
      border: 0;
      padding: 8px;
      font-weight: 400;
      font-size: 20px;
      border-radius: 4px;
      margin-top: 24px;
      cursor: pointer;
      font-weight: 600;
      background: grey;

      &:hover {
        background: ${colors.secondaryColor};
        color: ${colors.terciaryColor};
      }
    `

    return (
      <React.Fragment>
        <Subtitle>
          Coding test for techstars where the objective is to solve the timeslot
          allocation problem.
        </Subtitle>
        <Subtitle>
          For this one I've used a greedy algorithm, going over the Mentors who
          had the most companies booked first.
        </Subtitle>
        <ActionButton onClick={() => this.getData()}>
          Allocate meetings
        </ActionButton>
      </React.Fragment>
    )
  }

  renderButtons = () => {
    const ActionButton = styled("button")`
      font-size: 18px;
      border: 0;
      background: ${(props: { isActive: boolean }) =>
        props.isActive ? colors.terciaryColor : colors.primaryColor};
      color: white;
      margin: 12px;
      border-radius: 4px;
      padding: 6px 20px;
      font-family: sans-serif;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    `

    const Flex = styled("div")`
      display: flex;
      justify-content: center;
    `

    const Span = styled("span")`
      font-size: 29px;
      font-weight: 600;
      margin: 12px 32px;
    `

    return (
      <Flex>
        <ActionButton
          isActive={this.state.displayMode === "mentors"}
          onClick={() => this.setState({ displayMode: "mentors" })}
        >
          MENTORS
        </ActionButton>
        <Span>/</Span>
        <ActionButton
          isActive={this.state.displayMode === "companies"}
          onClick={() => this.setState({ displayMode: "companies" })}
        >
          COMPANIES
        </ActionButton>
      </Flex>
    )
  }

  renderContent = () => {
    if (this.state.displayMode === "mentors") {
      return this.renderMentors()
    } else {
      return this.renderCompanies()
    }
  }

  render() {
    const { availableMentors } = this.state

    return (
      <Wrapper>
        <ContentWrapper>
          <Title>Meeting Scheduler Test</Title>
          {availableMentors.length === 0
            ? this.renderActionPage()
            : this.renderContent()}
        </ContentWrapper>
      </Wrapper>
    )
  }
}

const Wrapper = styled("div")`
  height: 100%;
  width: 100%;
  background: ${colors.primaryColor};
  color: ${colors.secondaryColor};
  overflow-y: scroll;
`

const Title = styled("h1")`
  margin-top: 0;
  padding-top: 2em;
  padding-bottom: 3em;
`

const Subtitle = styled("p")`
  font-size: 18px;
  line-height: 12px;
`

const ContentWrapper = styled("div")`
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
`
