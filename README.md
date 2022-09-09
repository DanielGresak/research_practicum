# ResearchPracticum

### Introduction
This was the project submitted for me and my teams research practicum. This project was completed by 4 team members. We used Gitlab as our remote version control tool but I decided to also include this in my Github account so potential hiring personel can view my work in one place. The live version is currently available [here](https://www.transporttelepathy.online/)


### Project Specification
Bus companies produce schedules which contain generic travel times. For example, in the Dublin Bus
Schedule, the estimated travel time from Dun Laoghaire to the Phoenix Park is 61 minutes (LINK) Of
course, there are many variables which determine how long the actual journey will take. Traffic
conditions which are affected by the time of day, the day of the week, the month of the year and the
weather play an important role in determining how long the journey will take. These factors along with
the dynamic nature of the events on the road network make it difficult to efficiently plan trips on public
transport modes which interact with other traffic.
This project involves analysing historic Dublin Bus data and weather data in order to create dynamic
travel time estimates. Based on data analysis of historic Dublin Bus data, a system which when
presented with any bus route, departure time, the day of the week, current weather condition,
produces an accurate estimate of travel time for the complete route and sections of the route.
Users should be able to interact with the system via a web-based interface which is optimised for
mobile devices. When presented with any bus route, an origin stop and a destination stop, a time, a
day of the week, current weather, the system should produce and display via the interface an accurate
estimate of travel time for the selected journey.

### Application Features

The application core features include being able to input a origin and destination, as well as a time/date. It then uses Google Maps API to show 3 or 4 different bus routes between these locations at that time. The app will also use our Random Forest Models to predict how long each journey should take.

Other features include:

- CO2 calculator which estimates how much CO2 a user would save by taking public transport as opposed to driving between the same two locations
- Email notifications for users who register an account with us, when their bus is due (time customisable by user and they have the option to turn this off.
- Cost calculator which will estimate the cost of the trip

We use Django sessions to save the users total CO2 saved and their cost bracket but the user can also make an account which will save this information.

### CI/CD
We used Gitlab CI/CD with a gitlab runner which automated testing upon certain commits and deployment. This also included PEP8 compliance testing for all branches. 


