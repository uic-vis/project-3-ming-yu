<style>
    img {
        max-width: 60%;
        max-height: 100%;
    }
</style>

# Project 3
Webpage: [https://mliew2.github.io/](https://mliew2.github.io/)
## Dataset
- [Traffic Crashes - Vehicles](https://data.cityofchicago.org/Transportation/Traffic-Crashes-Vehicles/68nd-jvt3) - Dataset source, March-September 2022
- [Traffic Crashes - Crashes](https://data.cityofchicago.org/Transportation/Traffic-Crashes-Crashes/85ca-t3if) - Related dataset, March-September 2022
- [SR1050 Instruction Manual](https://idot.illinois.gov/Assets/uploads/files/Transportation-System/Manuals-Guides-&-Handbooks/Safety/Illinois%20Traffic%20Crash%20Report%20SR%201050%20Instruction%20Manual%202019.pdf) - Explains what some of the data elements represents

This dataset contains about 1.33 million records and 72 attributes (columns) such as crash date, vehicle info(brand, model, year, registration), unit type(bike, self-driving), etc. Each record is a vehicle (referred to as units in the data) that was involved in a traffic crash collected by the Chicago Police Department.

The main attributes that were explored in this project are:
- UNIT_TYPE
- UNIT_NO
- CRASH_TYPE
- INJURIES_TOTAL
- OCCUPANT_CNT
- Injury type, which are different attributes in the Traffic Crashes - Crashes table:
    - INJURIES_FATAL
    - INJURIES_INCAPACITATING
    - INJURIES_NON_INCAPACITATING
    - INJURIES_REPORTED_NOT_EVIDENT
    - INJURIES_NO_INDICATION
    - INJURIES_UNKNOWN
- CRASH_DATE
- LATITUDE
- LONGITUDE


## Questions
### Question 1
**Domain Question:** What vehicles causes the most accidents?<br />
**Data Question:** What is the distribution of unit no for each unit type?<br />
**Attributes:** UNIT_NO, UNIT_TYPE, (total number of accidents reported)<br />
We want to know which vehicles causes the most accidents. The most unit type that causes the most accidents will most likely be vehicles with drivers, but it would be helpful to check what other types of vehicles causes more accident, such as driverless and bicycles.
### Question 2
**Domain Question:** How safe is it to bike in Chicago?<br />
**Data Question:** What percentage of accidents involving bicycles resulted in an injury?<br />
**Attributes:** UNIT_TYPE, CRASH_TYPE, (total number of accidents reported)<br />
Instead of just creating a visualization for bicycles, we can use a selector from the visualization for question 1 and show for each unit type.


## Visualization
>The main vehicle in fault, the vehicle that caused the accident, is listed as UNIT_NO=1.


![](/images/q1-q2-driver.png)<br />
![](/images/q1-q2-driverless.png)<br />
![](/images/q1-q2-bicycle.png)<br />
![](/images/q1-q2-parked.png)<br />

## Findings
For question 1, as expected, the vehicle type that caused the most amount of accidents are vehicles with drivers, totaling to roughly 63,000 in the six month period. It is surprising, however, that the second most common type is parked vehicles, followed by bicycles.<br />
For question 2, as seen in the visualization, almost 3 quarters of accidents involving bicycles resulted in some form of injury.

## Questions
### Question 3
**Domain Question:** Do more peoeple get injured when there are more occupants in the vehicles?<br />
**Data Question:** How does occupant count relate to total injuries and what is the distribution for each point?<br />
**Attributes:** INJURIES_TOTAL, OCCUPANT_CNT, (total number of accidents reported)<br />
We want to know if more people are involved in the accident would result in more injuries. This can help us determine the safety of vehicles that can carry a lot of passengers, like buses.
### Question 4
**Domain Question:** How severe is the injury of the people involved in accidents?<br />
**Data Question:** What is the distribution of the different injury types?<br />
**Attributes:** INJURIES_FATAL, INJURIES_INCAPACITATING, INJURIES_NON_INCAPACITATING, INJURIES_REPORTED_NOT_EVIDENT, INJURIES_NO_INDICATION<br />
By linking it with the visualization from question 3, we can see the most common type of injury suffered, especially accidents reported with a higher total injuries.

## Visualization
![](/images/q3-q4.png)<br />
![](/images/q3-q4-injury-1.png)<br />
![](/images/q3-q4-injury-2.png)<br />
![](/images/q3-q4-injury-more.png)<br />

## Findings
For question 3, most accidents reported did not result in injuries and more occupants did not necessarily mean there were more injuries reported.<br />
For question 4, as we can see in the visualization, when more than 1 injury is reported, the majority of them are listed as "No Indication," meaning that there might be suspected injury but it was not apparent. As the total number of injury increased, the majority shifted to "Non-incapacitating," so even if there were injuries, it was a light injury in most cases.


## Questions
### Question 5
**Domain Question:** Which months are there more accidents?<br />
**Data Question:** What is the distribution of the accidents per month?<br />
**Attributes:** CRASH_DATE, (total number of accidents reported)<br />
The main motivation is to find out how road activity changes over the seasons and how different events may affect the number of accidents occuring. My hypothesis is that most accidents would occur as we start to go into Summer as people are more likely to be going out when it is warmer.
### Question 6
**Domain Question:** Which day do most accidents occur?<br />
**Data Question:** What is the distribution of the accidents at over each month?<br />
**Attributes:** CRASH_DATE, (total number of accidents reported)<br />
The motivation is the same as the previous question but we look more into the details by checking the distribution per day over a whole month, and by linking it with the previous visualization, we can change the visualization to display the data over the month selected. We would expect more accidents to occur on the weekends as that is when people have more time to drive out to go somewhere.

## Visualization
![](/images/q5-q6-march.png)<br />
![](/images/q5-q6-may.png)<br />
![](/images/q5-q6-may-2.png)<br />
![](/images/q5-q6-june.png)<br />
![](/images/q5-q6-june-2.png)<br />

## Findings
For question 5, as expected, the number of accidents sees a significant increase as we move from April into May, because that is when it starts to get warmer as we transition into Summer. However, for question 6, it is interesting as most accidents seems to occur on Fridays, and not the weekends. One idea that could have been explored with this visualization is to cross-reference with any events, holidays or celebration that might have taken place on days with a particularly high number of accidents reported and check if there is any correlation.


## Questions
### Question 7
**Domain Question:** Where do accidents occur more frequently in Chicago?<br />
**Data Question:** What is the spatial distribution of all accidents?<br />
**Attributes:** LATITUDE, LONGITUDE<br />
By looking at where accidents occur, we could understand the road activity of different parts of the city and it could provide useful information for different uses, such as planning where to build new roads. We expect that most of the accidents would occur in the city and decreases as we get further away.

## Visualization
![](/images/map.png)<br />
![](/images/map-zoomed.png)<br />
![](/images/map-zoomed-more.png)<br />

## Findings
As expected, most of the accidents occur in Downtown Chicago and the neighborhoods around that area. This is not surprising as it is probably the most busy part of the city.