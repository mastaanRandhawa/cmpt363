
## Figma Walkthrough

### "Preview" flow

#### Consistent component:
NavBar
- `Home` goes to this page
- `Tasks` shows main task page
- `Robo` shows Robo page
- `Calendar` goes to calendar view
- `More` opens an overlay to allow User to select other pages (Notifications, Settings, etc)

#### Home screen:
Header:
- `Notification Icon` active when unread notifications; hidden otherwise
	- navigation: notifications page
- `Robo Badge` informs User of current level and status of companion
	- navigation: robo page
Content:
- `Streak Banner` appears to encourage User to complete tasks
	- interaction: hides for remainder of the day
- `v` in section headers
	- interaction: minimizes section (`>` swaps to allows maximizing)
- `Recommended Now` section provides AI generated task suggestion
	- interaction: `Dismiss` removes the task suggestion from home
		- `Generate Suggested Task` allows User to get a suggestion again
	- interaction: `Breakdown` takes the User to task details and breakdown view of task
	- interaction: `Start` takes User to timer page
- `Focus Tasks` are key tasks: high priority, geolocation optional
	- interaction: `Checkbox` marks the task complete
		- `Checkbox` on completed task allows User to revert and show task as to do

#### Task screen:
Header:
- `+` icon
	- Create a new task
Content:
- `Search Bar`
	- intention: allow User to search by key words or priority or effort level
		- (faked: autofills text)
- `Filter`
	- interaction: allows User to filter tasks quickly
- `Task Cards`
	- `Checkbox`
		- interaction: mark task as complete or incomplete
	- interaction: view task details

#### Detail screen:
Header:
- `<`
	- interaction: goes back to task screen
Content:
- Task info
	- Shows User title, due date, priority, effort level info for specific task
- `Notes or Context` 
	- User fills this in when creating a task (or can edit and update when the task already exists)
	- Useful for storing information related to task to keep it handy when needed
- `Subtasks`
	- Lists both User created (purple) and AI created (blue) subtasks
	- `Subtask Card`
		- step to complete
		- interaction: `x` allows removing a subtask
		- interaction: `edit` icon allows User to change subtask
		- interaction: `+ Add Subtask` button allows adding more subtasks
		- intention: User can reorder tasks by tap and holding a card
- `Delete Task`
	- interaction: opens overlay to confirm User wants to delete the task
	- navigation: upon confirmation, takes User to confirmation page
- `Start Task` 
	- navigation: takes User to timer

#### Create screen:
Header:
- `<` 
	- navigates back to main task screen
		- opens overlay to confirm navigation will discard any info added into task so far
Content:
- `Task Name` input
	- interaction: User input
- `Date` input
	- interaction: User input
	- `Add Time` toggle allows time specific due date
- `Priority` and `Effort Level` chips
	- interaction: quick input for task
- `Notes or Context`
	- interaction: User text input
- `AI Suggestions`
	- interaction: toggle can remove AI involvement in making subtasks etc
- *Prototype Note*
	- tapping content area will transition to Error page
	- tapping Error page content will transition to Filled page
- `Create Task` button
	- interaction: saves the task
	- navigation: takes User to AI "Thinking" page

#### AI Thinking screen:
Header:
- `<` 
	- navigates back to main task screen
		- opens overlay to confirm navigation will discard any info added into task so far
Content:
- informs User loading process is active
- intention: auto-navigates to subtask page when ready
	- interaction: general click will progress to subtask page

#### Subtask screen:
Header:
- `<` 
	- navigates back to main task screen
		- opens overlay to confirm navigation will discard any info added into task so far
Content:
- `AI Suggestions`
	- interaction: toggle can remove AI involvement in making subtasks etc
- `Subtasks`
	- Lists both User created (purple) and AI created (blue) subtasks
	- `Subtask Card`
		- step to complete
		- interaction: `x` allows removing a subtask
		- interaction: `edit` icon allows User to change subtask
		- interaction: `+ Add Subtask` button allows adding more subtasks
		- intention: User can reorder tasks by tap and holding a card
- `Create Task` button
	- interaction: saves task
	- navigation: takes User to confirmation screen

#### Confirmation screen:
Header:
- `<` 
	- navigates back to main task screen
Content:
- `View Task` button
	- navigation: task details
- `Start Task` button
	- navigation: timer page

#### Robo screen:
Header:
- `Chat`
	- navigation: chat page
Content:
- `Today's Mood` selection
	- User can select current mood
- `v` in section header will minimize sections

#### Chat screen:
Header:
- `<`
	- navigation: back to Robo page
Content:
- `Chat input`
	- intention: User asks questions
	- interaction: autofill chat
- `Send Message` icon
	- intention: once User has an input in the text, it will be active

#### Calendar screen:
No header
Content:
- not functioning - placeholder

#### Timer screen:
Header:
- `<` 
	- navigation: goes back to task details page
##### *Idle Page*
Content:
- `Play Icon`
	- intention: starts timer
	- interaction: moves to `Running` page
##### *Running Page*
Content:
- `Restart Icon`
	- intention: restarts timer
		- completed steps stay completed
	- interaction: reverts to `Idle` page
- `Puase Icon`
	- intention: User can pause a timer
	- interaction: moves to `Paused` page
##### *Paused Page*
Content:
- `Play Icon` 
	- intention: continue timer from previous state
	- interaction: reverts to `Running` page
##### *Break Page*
Content:
- same icons and results as above
*Complete Page*
- `X` 
	- interaction: moves to task detail page
	- does NOT mark task as complete

#### Settings screen:
Header:
- `<` 
	- navigation: returns to home screen

#### Notification Settings screen:
Header:
- `<`
	- navigation: returns to home screen

#### Notification screen:
Header:
- `<` 
	- navigation: returns to home screen
