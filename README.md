## Issue Assignment Self Service Bot

## Description:

The goal is to create a self-service issue assignment bot for GitHub contributors who are not yet part of the organisation but would like to work on issues marked for external handling. The bot should be able to check if the user is part of the organisation, examine if the pre-conditions for self-assignment are met (configurable labels or rules about number of issues already assigned/PRs opened), and assign the issue.

![Screenshot from 2024-10-30 09-01-21](https://github.com/user-attachments/assets/8582594f-7891-44cd-b5ae-36a06c4669aa)


This design represents the basic skeleton of what is needed to be achieved to have a basic Custom-GitHub Bot.

- New contributor comments on a issue with /assign    @username 
- Workflow design gets triggered and calls our deployed API endpoint. 
- The Bot will parse the maintainers.yaml file with specific rules and guidelines
- Bot assigns him the issue and set custom labels depending on different use cases

## Working of Bot

We propose the development and deployment of KDB-Bot, an innovative GitHub automation bot designed to enhance the efficiency of issue and pull request management within our Keptn repository. KDB-Bot, developed using the cutting-edge capabilities of Next.js 14 and deployed on the Vercel platform, is engineered to respond dynamically to specific commands made by contributors in issue comments. 

Specifically, when a contributor issues /assign @username or /unassign @username commands, KDB-Bot will be triggered via a GitHub Actions workflow to either assign the mentioned user to the issue or remove them from it, respectively. Additionally, this bot will intelligently handle labels by adding relevant ones upon assignment or removing them when unassigned, thus ensuring a clean and organised issue tracker.

The bot's backend, written in Next.js 14, leverages serverless functions for optimal scalability and performance, ensuring that the automated tasks are executed swiftly and efficiently. By hosting on Vercel, we guarantee high availability and reliability, allowing KDB-Bot to seamlessly integrate into our project's GitHub workflow without any disruptions. This bot aims to streamline the assignment process, reduce manual overhead for project maintainers, and enhance the overall collaboration experience for contributors. Furthermore, KDB-Bot's deployment strategy and infrastructure are designed with security and scalability in mind, ensuring that it can grow alongside our project's needs and maintain a secure environment for managing our repository's issues and pull requests.

![Screenshot from 2024-10-30 09-47-05](https://github.com/user-attachments/assets/2358f6f1-c53e-49e8-b025-ad1c6e86c4e0)

