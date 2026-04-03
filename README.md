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


## To Run:
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
