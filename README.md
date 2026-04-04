## Dr. Parmit Chilana | Simon Fraser University | Spring 2026 | Group 6
### Tasha Gandevia · Azhy Hama Gharib · Mastaan Singh Randhawa

# RoboPlan: An AI Task Assistant for ADHD-Friendly Productivity

> A low-friction, transparent, and flexible task planning app designed for adults with ADHD.

## Overview

RoboPlan is an AI-powered mobile productivity app built to address the unique cognitive challenges faced by adults with ADHD — including difficulty with task initiation, prioritization, and time estimation. Unlike rigid, conventional productivity tools, RoboPlan is designed around how ADHD brains actually work.

## Problem

Most productivity tools are opaque, inflexible, and cognitively overwhelming for users with ADHD. Key pain points include:
- Difficulty starting and prioritizing tasks
- Cognitive overload from large or unclear task lists
- Task anxiety leading to avoidance
- Lack of transparency and control over AI-driven suggestions

## Research

Our methods were based on three important pillars:
- Existing research and studies surrounding individuals with ADHD
- Semi-structured interviews conducted with four adults with ADHD (diagnosed or self-diagnosed), exploring task planning workflows, pain points, and attitudes toward AI tools.
- Two cognitive walkthroughs of the iterative prototype by two group members who have been diagnosed with ADHD

## Design Principles

| Principle | Description |
|---|---|
| **Transparency** | Users always know what the AI is doing and why |
| **Low Effort** | Every interaction is fast and requires minimal decision-making |
| **Flexibility** | AI involvement is adjustable, not fixed |


## Core Features

- **Smart Prioritization**: Robo surfaces one task at a time based on priority, due date, and calendar
- **AI Task Breakdown**: Generates editable subtasks tailored to user input
- **Transparent AI**: Users can tap to see why Robo made a suggestion
- **Built-in Timer**" Focus mode lives inside the app to prevent tab-switching
- **Collaborative AI**: Subtasks are visually marked as AI-generated
- **XP & Gamification**: Earn points and level up Robo to stay motivated
- **Contextual Reminders**: Gentle, location-aware nudges to keep users on track
- **User-Controlled AI Levels**: Choose between collaborative, supportive, or off

## Design Impact

RoboPlan doesn't just help users get things done — it helps them **get better at getting things done** by reducing cognitive load, minimizing planning friction, and building executive functioning skills through CBT-based gamification.

## More Info

### "How is this different from a to-do list?"
Robo learns from your behaviour — what subtasks you keep, remove, or add — and improves suggestions over time. The streak and XP system isn't cosmetic; it gates real features. And the AI recommendation actively factors in your mood, time of day, and urgency — not just due dates.

### "What AI is powering this?"
Google Gemini (via the Gemini API) handles the task breakdown, recommendations, and chat. The system prompt is task-aware — Robo always has your current task list in context, so advice is grounded in what you're actually working on.

### "How does the streak work?"
Complete at least one task per day and your streak grows. Each streak day adds 0.1× to your combo multiplier — a 5-day streak means XP rewards are 1.5× what they'd normally be. Miss a day and you reset to 1.0×.

### "Can I trust the AI with sensitive notes?"
Yes — tasks with **Private Notes** enabled have their notes excluded from the AI context entirely. The demo includes a *Therapy Session Prep* task that demonstrates this.


## Demo
### To Run:
*Note* This requires both private database and API variables that are not provided in this repo.

**Getting the Database seeded with existing tasks for demo**

*In Terminal 1*
```bash
cd backend
```
```bash
npm run db:generate
```
```bash
npm run db:push
```
```bash
npx prisma db seed
```
**Run database**
```bash
npm run start
```

**Start frontend**

*In Terminal 2*
```bash
npm run dev
```
*In web-browser*
```
http://localhost:5173
```

### What the Seed Looks Like
| |                                       |
|---|---------------------------------------|
| **User** | demo                                  |
| **Level** | 3 (375 / 500 XP — halfway to Level 4) |
| **Streak** | 5 days                                |
| **Mood** | Good 😊 (set today)                   |
| **Notifications** | 1 unread ("Task completed 🎉")        |

### Suggested Walkthrough

#### New Task (Full AI Flow)
| Field | Value                                                                                         |
|---|-----------------------------------------------------------------------------------------------|
| Name | `Prepare CMPT276 Presentation`                                                                |
| Due | 5 days from today                                                                             |
| Priority | High                                                                                          |
| Effort | 3                                                                                             |
| Notes | `10-minute presentation on usability findings. Needs slides, speaker notes, and a live demo.` |
| AI Instructions | `Focus on slide structure and rehearsal steps. Keep it under 6 subtasks.`                     |
| Manual subtask to add | `Rehearse with teammates`                                                                     |

#### New Task (Simple, No AI)
| Field | Value |
|---|---|
| Name | `Email group about meeting time` |
| Due | Tomorrow |
| Priority | Med |
| Effort | 1 |

#### Chat Prompts
| Purpose | Message |
|---|---|
| On-topic help | `I'm really struggling to start the essay. Any advice?` |
| Prioritisation | `What should I tackle first today?` |
| Off-topic redirect demo | `What's a good recipe for pasta?` |
| Subtask help | `Can you help me break down the midterm studying?` |

#### Search / Filter Demos
| Action | Input |
|---|---|
| Search | `CMPT` |
| Filter by today | Tap **TODAY** pill |
| Filter by priority | Tap **HIGH** pill |
| See history | Tap **COMPLETED** pill |
