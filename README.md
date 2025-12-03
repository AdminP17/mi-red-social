# Red Social

A full-featured, modern social media application built with **React**, **Tailwind CSS**, and **AWS Amplify**. This project demonstrates a scalable serverless architecture with real-time capabilities, including a social feed, user profiles, messaging, and notifications.

## 🚀 Features

### 👤 User Experience
- **Authentication**: Secure Sign Up, Sign In, and Forgot Password flows powered by AWS Cognito.
- **User Profiles**: Customizable profiles with avatars, cover images, and bios.
- **Dark Mode**: Fully responsive dark theme support for all interfaces.

### 📱 Social Interactions
- **Dynamic Feed**: Create and view posts with rich text and image support.
- **Engagement**: Like and comment on posts in real-time.
- **Social Graph**: Follow and unfollow users to curate your feed.
- **Search**: Find other users to connect with.

### 💬 Communication
- **Real-time Chat**: Private messaging system between users.
- **Notifications**: Instant alerts for new followers, likes, and comments.

## 🛠️ Tech Stack

### Frontend
- **React** (v18): Component-based UI library.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **AWS Amplify UI**: Pre-built UI components for authentication and interactions.

### Backend (Serverless)
- **AWS Amplify**: Development platform for building secure, scalable mobile and web apps.
- **AWS AppSync**: Managed GraphQL service for the API.
- **Amazon DynamoDB**: NoSQL database for data persistence.
- **Amazon Cognito**: Identity management for authentication.
- **Amazon S3**: Object storage for user uploaded media (images).

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or later)
- [npm](https://www.npmjs.com/) (v6.x or later)
- [Amplify CLI](https://docs.amplify.aws/cli/start/install) (`npm install -g @aws-amplify/cli`)
- An active [AWS Account](https://aws.amazon.com/)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/red-social.git
   cd red-social
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize Amplify**
   Pull the backend configuration from AWS (if you have the Amplify App ID) or initialize a new environment.
   ```bash
   amplify pull
   # OR
   amplify init
   ```

4. **Run the application**
   Start the local development server.
   ```bash
   npm start
   ```
   The app will run at `http://localhost:3000`.

## 📂 Project Structure

```
red-social/
├── amplify/              # AWS Amplify backend configuration (Auth, API, Storage)
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components (Feed, Sidebar, Chat, etc.)
│   ├── context/          # React Context for global state management
│   ├── graphql/          # Auto-generated GraphQL queries, mutations, and subscriptions
│   ├── services/         # Helper services and utilities
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## 📜 Scripts

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production to the `build` folder.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
