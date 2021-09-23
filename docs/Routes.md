# Routes

- /signin: User Login Page (Public)
- /dashboard: Event List Dashboard (Private)
- /event/[:event_id]: The info page of event with event id parameter  
- /giveaway: Giveaway page (Private)
- /attractions: Virtual Queues Attraction list (Private)
- /attraction/[:attraction_id)]: Attraction Info Page with attraction_id parameter (Private)

Private Pages require user login and will auto route to login if no credentials are available 
