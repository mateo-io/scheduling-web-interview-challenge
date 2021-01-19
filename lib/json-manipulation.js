/**
 * Code used to format the data (already in JSON format) to an easier structure
 * to process in a programming environment.
 *
 * "Undefined" converted to null
 * "Company X" entries converted into an array with key "companies"
 * All keys converted to lowercase
 * AM/PM key renamed to "timePeriod"
 *
 */

const fs = require('fs')
const path = require('path')
const jsonDataArray = require('./sample_scheduling_data.json')


const modifiedDataArray = []

jsonDataArray.map((scheduleItem) => {
  const keys = Object.keys(scheduleItem)
  const modifiedScheduleItem = {'name': null, 'day': null, 'timePeriod': null, companies: []}

  keys.forEach((key) => {
    const value = scheduleItem[key]

    if(key === 'Name') {
      modifiedScheduleItem['name'] = value
    }

    if(key === 'Day') {
      let calculatedValue = value
      if(value.trim() == 'Undefined') {
        calculatedValue = null
      }
      modifiedScheduleItem['day'] = calculatedValue
    }

    if(key === 'AMPM') {
      let calculatedValue = value

      if(value.trim() == 'Undefined') {
        calculatedValue = null
      }
      modifiedScheduleItem['timePeriod'] = calculatedValue
    }

    if(key.indexOf('Company') > -1) {
      if(!!value) {
      modifiedScheduleItem['companies'].push(value)
      }
    }
  })


  modifiedDataArray.push(modifiedScheduleItem)
})


let data = JSON.stringify(modifiedDataArray);
const pathToWrite = path.join(__dirname, '../src/mentor_schedule_data.json')
fs.writeFileSync(pathToWrite, data);



