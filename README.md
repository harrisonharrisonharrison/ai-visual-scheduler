
<img width="403" height="874" alt="image" src="https://github.com/user-attachments/assets/0320ab68-f2b0-46a3-8db0-66b380a0351f" />

## Overview

After taking a picture of an activity, the app uses OpenAI to parse the image, categorizes the event, and automatically stores it into your Google Calendar with custom color-coding.

## Features

Uses OpenAI to extract event details (summary, description, start/end times) from uploaded images.
Automatically maps activities (e.g., gym, cooking, guitar) to specific Google Calendar color IDs using custom synonym matching.

## Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, Vite PWA Plugin

Backend: AWS SAM, AWS Lambda (Node.js), API Gateway, Amazon S3

Integrations: OpenAI API, Google Calendar API (OAuth2)

Hosting: Vercel (Frontend), AWS CloudFormation (Backend)

## Local Setup

1. Clone and Install
Pull down the repository and install dependencies for both the frontend and backend directories using your preferred package manager.

2. Configure Environment Variables
Store your Google OAuth2 credentials and OpenAI API key in AWS Systems Manager (SSM) as expected by the SAM template.

3. Deploy Backend
Navigate to the backend directory and use the AWS SAM CLI to build and deploy your serverless stack:
`sam build && sam deploy`

4. Run Frontend
Update the API base URL in your frontend code to match your new AWS API Gateway endpoint, then start the Vite development server:
`npm run dev`
