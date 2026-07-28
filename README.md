# Bengaluru Road Watch

Build a mobile and web application called "Pothole Bengaluru" that enables citizens of Bengaluru to report potholes directly to municipal authorities and track their resolution.

Core Features

1. User Authentication

Sign up and login using email, phone number, or Google account.

Guest reporting option available.

2. Report a Pothole

Users should be able to:

Upload one or more images of the pothole.

Capture images directly from the camera.

Enter a detailed description of the issue.

Specify pothole severity (Minor, Moderate, Severe, Dangerous).

Automatically capture GPS coordinates.

Select the exact road/location on an interactive map.

Add road name, landmark, ward number, and area.

3. Smart AI Analysis

Use computer vision to estimate pothole size and severity from uploaded images.

Detect duplicate reports nearby.

Generate a priority score based on severity, traffic density, and number of citizen reports.

4. Interactive Map

Display all reported potholes on a Bengaluru map.

Color-code markers:

Red = Critical

Orange = High Priority

Yellow = Moderate

Green = Resolved

Allow filtering by area, ward, status, and severity.

5. Complaint Tracking

Each report receives:

Unique complaint ID.

Status updates:

Submitted

Under Review

Assigned

Repair In Progress

Resolved

Timeline showing actions taken.

6. Community Verification

Citizens can upvote or confirm existing pothole reports.

Add additional photos and comments.

Report if a pothole has worsened or reappeared.

7. Authority Dashboard

Municipal officers can:

View reports by ward and zone.

Sort by priority score.

Assign repair teams.

Update repair status.

Upload repair completion photos.

Generate analytics and reports.

8. Notifications

Push notifications for status changes.

Email/SMS updates.

Alerts when potholes near a user's area are reported or resolved.

9. Analytics Dashboard

Display:

Total potholes reported.

Resolved vs unresolved cases.

Average resolution time.

Most affected roads and wards.

Heatmap of pothole density across Bengaluru.

UI/UX Requirements

Modern, clean design inspired by civic-tech applications.

Mobile-first responsive interface.

Dark and light mode support.

Simple one-tap reporting workflow.

Interactive Bengaluru city map as the homepage.

Technology Stack

Frontend: React + Next.js

Backend: Node.js + Express

Database: PostgreSQL

Maps: Google Maps API or OpenStreetMap

Storage: Cloudinary/AWS S3

AI: Image recognition model for pothole detection and severity classification

Authentication: Firebase Auth

Additional Features

Multilingual support (English, Kannada, Hindi).

Leaderboard for active community contributors.

Public transparency dashboard.

Open API for integration with BBMP systems.

Emergency reporting mode for extremely dangerous road conditions.

The application should prioritize ease of reporting, transparency, accountability, and rapid pothole resolution while creating a crowdsourced road-maintenance ecosystem for Bengaluru.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fixmybengaluru.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8d2a0812-59c5-410a-b586-2e66019590bf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
