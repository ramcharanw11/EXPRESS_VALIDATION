📝 Express Form Validation App (CRUD Without Database)

This project is a beginner-friendly Express.js backend application that demonstrates how to implement form validation and complete CRUD operations without using any database.
Instead of a traditional DB, all user data is stored and managed using local JSON files, making it easier to understand how data persistence works internally.

Additionally, the application keeps track of the currently logged-in user in a separate JSON file, which helps developers monitor authentication flow during testing and debugging.

This project is mainly built for learning purposes to strengthen concepts like:
	•	Request handling in Express
	•	Server-side validation
	•	File system based data storage
	•	Authentication flow without external services

⸻

🛠 Tech Stack
	•	Node.js — JavaScript runtime environment
	•	Express.js — Backend web framework
	•	HTML & CSS — Frontend form UI
	•	JSON Files — Used as local storage (via Node.js File System)

⸻

📁 Data Storage Structure

All application data is stored using JSON files instead of a database:
	•	users.json
Stores all registered users and supports Create, Read, Update, and Delete operations.
	•	loggedInUser.json
Stores details of the currently authenticated user for developer-side verification and debugging.

⚠️ Note: This storage method is only for learning and testing purposes and is not recommended for real-world applications.

⸻

🎯 Project Objective

The goal of this project is to help students and beginners:
	•	Understand backend validation logic
	•	Practice CRUD operations without DB complexity
	•	Learn Express routing and middleware concepts
	•	Simulate authentication behavior
	•	Build confidence before moving to MongoDB or SQL