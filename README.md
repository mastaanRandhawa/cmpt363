# CMPT363 - Group6

**Dr. Parmit Chilana | Simon Fraser University | Spring 2026**

*Tasha Gandevia, Azhy Hama Gharib, Mastaan Singh Randhawa*

## Problem Statement

*From Project Part 2*

Studies suggest that adults with Attention-Deficit Hyperactivity Disorder (ADHD) are persistently impacted by executive function deficits in time management, task organization, and planning (Roselló et al., 2020; Rincón et al., 2024); these deficits account for roughly two-thirds of the elevated burnout experienced by employees with ADHD (Turjeman-Levi et al., 2024), and pharmacological treatment combined with psychosocial intervention strategies is recommended to address them (Rincón et al., 2024). Among psychosocial strategies, digital interventions grounded in cognitive-behavioural approaches have shown promise in improving organization, time management, and planning in adults with ADHD (Guy-Evans, 2026). In particular, emerging research exploring the use of artificial intelligence shows potential for addressing executive function deficits for users dealing with ADHD symptoms (Beg & Verma, 2024), with some users already adapting AI tools for task organization and daily productivity assistance (Carik et al., 2025). 

Leveraging the outlined research findings, we propose an AI-powered task management app targeting users experiencing ADHD symptoms who would benefit from task breakdown, time management, organization, and planning. The interface would present AI-generated task suggestions with transparent reasoning, including task urgency, deadlines, user scheduling conflicts, and workload balance. Users would have autonomy to adjust the level of AI involvement, including the ability to review, modify, or dismiss recommendations and turn off features, to support collaborative interaction and Cognitive Behavioural Therapy (CBT) skill development, such as self-monitoring and structured planning (Guy-Evans, 2026). Our design approach will incorporate step-by-step task breakdowns, smart reminders, and progress tracking to directly address the executive function deficits identified in the literature, with additional user pain points to be identified through targeted user interviews and usability testing. 


## To Run:

**Getting the Database seeded with existing tasks for demo**
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

(*from within* `/backend/`)
```bash
npm run start
```

**Start frontend**

(*in* `/root/`)
```bash
npm run dev
```


http://localhost:5173


Note: 
- You need to enter your Gemini API key in the `/backend/.env`
- 