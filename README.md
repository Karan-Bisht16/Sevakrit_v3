# Sevakrit

Sevakrit is a platform designed to tackle resource wastage by enabling individuals and communities to share surplus goods such as food, clothes, books, and toys with NGOs. The platform aims to bridge the gap between potential donors and NGOs, facilitating the donation process in a secure and efficient manner.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Idea/Approach](#ideaapproach)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Libraries and Tools](#libraries-and-tools)

## Problem Statement

**Tackling wasted resources**: There is a significant amount of surplus goods that go to waste, which could otherwise be put to good use by those in need. The challenge is to connect potential donors with NGOs that are actively involved in social welfare activities, thereby ensuring that surplus goods are distributed to those who need them the most.

## Idea/Approach

Sevakrit establishes a network chain process for individuals and communities to share their surplus goods with NGOs. The platform allows users to donate goods, and registered NGOs are notified based on their proximity to the donation location. The goal is to create a seamless connection between donors and NGOs, ensuring that goods are efficiently transferred to those who need them.

## Features

1. **Donation Process**:

   - Users can fill out a donation form with details such as the donor's name, date of donation, mobile number, type of donation (clothes, books, toys, food), and pickup address.
   - The pickup address can be either the user's current location or a specific location, determined using reverse geolocation.

2. **NGO Notification**:

   - Upon form submission, nearby registered NGOs are notified via email. The proximity of NGOs is determined based on the range specified during their registration.

3. **Donation Visibility**:

   - Users can choose the visibility of their donation:
     - **Private**: Visible only to verified NGOs.
     - **Protected**: Visible to verified NGOs and registered users.
     - **Public**: Visible to anyone, even users who are not logged in.

4. **Admin Role**:

   - Admins verify NGOs based on documentation and manage user activities to avoid invalid donations. Admins also moderate feedback to ensure appropriate language is used.

5. **Feedback System**:
   - Users can leave feedback about their experience with the donation process, providing insights that can help improve the platform.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment:** Vercel

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Karan-Bisht16/Sevakrit_v3
   cd Sevakrit_v3
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add:

   ```env
   MONGODB_URI = your_mongodb_uri
   SessionSecret = your_session_secret
   RapidAPI_Key = your_rapidapi_key
   RapidAPI_Host = your_rapidapi_host
   DevSquadEmail = your_email
   EmailPassword = your_email_password
   GoogleEmailAppName = your_google_app_name
   ```

4. Run the application:
   ```bash
   node index.js
   ```

## Usage

- **Donation**: Users can navigate to the donation page, fill out the form, and submit their donation.
- **NGO Registration**: NGOs can register on the platform and get verified by the admin to start receiving notifications about nearby donations.
- **Admin**: Admins manage NGO verifications, user activities, and feedback moderation.

## Libraries and Tools

- [**bcrypt**](https://www.npmjs.com/package/bcrypt): Used to hash passwords.
- [**Leaflet.js**](https://leafletjs.com/reference.html): Open-source JavaScript library used to implement interactive maps
- [**OpenStreetMap API**](https://www.openstreetmap.org): A free world map available under an open license
- [**Trueway Matrix API**](https://rapidapi.com/trueway/api/trueway-matrix): Used to calculate distances and durations for a set of origins and destinations
- [**nodemailer**](https://nodemailer.com/): Used to send emails for node.js applications
- [**connect-flash**](https://www.npmjs.com/package/connect-flash): Used to implement flash messages
- [**node-cron**](https://www.npmjs.com/package/node-cron): Used as a task scheduler to delete outdated donations
