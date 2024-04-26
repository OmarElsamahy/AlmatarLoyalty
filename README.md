# Almatar Loyalty

This is a Node.js Express API used to send loyalties from one user to another Using PostgreSQL

## Table of Contents
1. [Getting Started](#getting-started)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Contributing](#contributing)
8. [License](#license)

## Getting Started
Follow these steps to set up and run the application on your local environment.

## Prerequisites
Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14 or later is recommended)
- [NPM](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/)

## Installation
1. Clone the repository:
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject

## Environment Variables
2. Install dependencies:
    npm install
3. Set up the database:
    Create a PostgreSQL database (e.g., yourprojectdb).
    Configure your database connection in src/config/database.js or through environment variables (see below).
4. Setup Environment files 

## Running The Application
- You could use npm start -> to run using PM2 process manager
- npm dev -> to run using nodemon

## Testing
npm test

## Contributing

Contributions are welcome! Please follow these guidelines:

Fork the repository and create a new branch for your changes.
Ensure your code adheres to the project's style guidelines.
Add tests to cover your changes.
Open a pull request, providing a clear description of the changes.

## License

This project is licensed under the MIT License.


### Key Points to Consider
- **Getting Started**: Explain how to set up the project for development or production.
- **Environment Variables**: Detail the required environment variables and how to set them up.
- **Installation and Prerequisites**: Describe the installation process and any prerequisites.
- **Running the Application**: Provide clear instructions for running the application.
- **Testing**: Include instructions for running tests and what to expect.
- **Contributing**: Explain how others can contribute and what you expect from contributions.
- **License**: Specify the license for your project. 
