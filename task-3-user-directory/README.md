# Task 3: User Directory with a Real API

## Description
A browser-based User Directory that loads users and their posts
from the JSONPlaceholder public API.

## Features
- Fetch users and posts using async/await
- Load both API endpoints in parallel with Promise.all
- Calculate post counts using reduce
- Search by user name or email
- Debounced search with a 300ms delay
- Sort by name or post count
- View each user's post titles
- Loading, error, empty, and retry states
- Retry failed requests up to three attempts
- Responsive layout for mobile and desktop

## Technologies
- HTML
- CSS
- JavaScript ES Modules
- Fetch API
- JSONPlaceholder API

## API Endpoints
- https://jsonplaceholder.typicode.com/users
- https://jsonplaceholder.typicode.com/posts

## How to Run
Open the project using a local development server.

## Expected Result
- 10 users
- 100 posts
- 10 posts per user