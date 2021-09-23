# Login

- Edit Project Admin Google Sheet to add to list of admin and allowed users
- User must be a cedarville student
- Permissions:
  - admin: do any actions
  - edit: edit Events and other objects
  - view: just look at site
 - Login will last for 1 hour and auto log out the user
  
 # Navigation
 
 Click on the Smart Events logo to go back to dashboard
 
 Menu Button (Hamburger Button)
 
 - Attractions
 - Giveaway
 - Twilio Account Info
 - Logout
  
 # Dashboard
 
 Lists all of the Events and their number of engagements
 
 Click on an event to view its info
 
 Click the Add Event button at the bottom to add events 
 
 # Event Page
 
 - Refresh button: reload all engagement counts
 - Download: Download a CSV of engagements Messages and Phonenumbers
 - Edit Button: Pencil Icon
 - Engagement:
   - Title: Engagment Filter (Either match word or REGEX)
   - Text: The message the user receives (Supports Multi line)
   - People Icon: Number of engagements
   - Time: Time that the engagement will accept messages
   - Click on engagement to edit it
 - Add/Edit Engagement
   - Keyword: The filter for the engagement (match word or REGEX)
   - Message: The text sent to the user
   - Image URL: Public Image (URL or Google Drive)
   - Start Time
   - End Time
   - Trash Can: Delete Engagement
 - Giveaway (See Giveaway section)
 
 # Attractions
 
 Lists each event and the Attractions underneath that event. These Attractions will be displayed in the Virtual Queues App
 
 Attractions with Ticket slots will show their availible ticket percentage
 
 Hidden Attractions will show a crossed out eye icon next to their name to indicate they are not visible to the public
 
 Add an attraction by clicking the Add Attraction button
 
 Required Fields
 - Event Name
 - Name
 - Description: the public's visible description of the event. (This supports multiline formatting)
 - About: the Smart Events Admin Dashboard visible description
 - Image URL: Either a remote URL or a Google Drive image file
 - Start Time
 - End Time
 - Location: this shows up with a map icon on the VQ Attraction
   - Set this to "N/A" if the event does not have a location and the map icon will be hidden on VQ
 
 # Attraction Page
 
 - Attraction Visibility: A crossed out eye will show next to attraction name if event is hidden on VQ
 - Edit Button: Pencil Icon
    - Same as add attraction button but also has a visiblity switch on the top right to turn the event on and off for the public
    - Delete Attraction: Trash can button
 - View Image Button: Show image that is displayed in the VQ app attraction
 - Slots
    - Click the slot to edit it
       - Label: Name of slot (Not public the time is all the public sees)
       - Ticket Capacity: Maximum allowed tickets for that time 
       - Hide Time: Time that the slot is hidden (Commonly the start time of the event or attraction slot)
    - Tickets: The amount of claimed tickets vs. max tickets
    - Scanned: Scanned vs. Unscanned Tickets
    - If the slot is visible a yellow eye will show on the slot
    
 # Giveaway
 
 - Select Event: The event that you want to run a give away for
 - Engagement(s): Select which events you want to grab student ids from
 - Qualification Engagement: If selected this will check the list of student ids and make sure they have also checked into this engagement as well (can be empty)
 - Blacklist: Searchable list of student ids you do not want to include in the giveaway (ex. your student id)
 - People Icon: Number of unique entries
 - Pick Winner: Randomly select a winner from the list
 - Refresh: Reload entries
 
 If the student has won their entry will be removed from the pool.
 
 Winner List:
 - Checkbox: A way to track if text has been sent
 - Message/Phone number: message reqveiced and number to text
 - Time: Time the winner was picked
 - Text Bubble: Send a text to the winner
 - Delete: Delete winner and add users entry back to pool
